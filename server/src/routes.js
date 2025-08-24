const express = require('express');
const rateLimit = require('express-rate-limit');
const { callNvp } = require('./nvpClient');
const { addLog, getLogs, sseStreamHandler } = require('./logging');
const database = require('./database');

const router = express.Router();

// Rate limit NVP calls
const nvpLimiter = rateLimit({ windowMs: 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });

// Session helpers
function getSessionCreds(req) {
	const creds = req.session?.paypalCreds;
	if (!creds || !creds.username || !creds.password || !creds.signature) {
		const error = new Error('Missing PayPal API credentials in session.');
		error.status = 400;
		throw error;
	}
	return creds;
}

router.get('/health', (req, res) => {
	res.json({ ok: true, ts: new Date().toISOString() });
});

router.get('/logs', (req, res) => {
	res.json({ logs: getLogs() });
});

router.get('/logs/stream', sseStreamHandler);

router.post('/session/credentials', async (req, res) => {
	const { username, password, signature, env } = req.body || {};
	if (!username || !password || !signature) {
		return res.status(400).json({ error: 'username, password, and signature are required' });
	}
	req.session.paypalCreds = { username, password, signature };
	if (env) req.session.env = env;
	await req.session.save();
	addLog({ source: 'session', type: 'credentials_set', env: env || null });
	res.json({ ok: true });
});

router.delete('/session/credentials', async (req, res) => {
	try {
		await req.session.destroy();
	} catch {
		delete req.session.paypalCreds;
		delete req.session.env;
	}
	addLog({ source: 'session', type: 'credentials_cleared' });
	res.json({ ok: true });
});

// NVP wrappers
router.post('/nvp/get-balance', nvpLimiter, async (req, res) => {
	const creds = getSessionCreds(req);
	const envOverride = req.session.env;
	const result = await callNvp('GetBalance', { RETURNALLCURRENCIES: 1 }, creds, envOverride);
	res.json(result);
});

router.post('/nvp/transaction-search', nvpLimiter, async (req, res) => {
	const creds = getSessionCreds(req);
	const envOverride = req.session.env;
	const params = req.body || {};
	const result = await callNvp('TransactionSearch', params, creds, envOverride);
	res.json(result);
});

router.post('/nvp/get-transaction-details', nvpLimiter, async (req, res) => {
	const creds = getSessionCreds(req);
	const envOverride = req.session.env;
	const { TRANSACTIONID } = req.body || {};
	if (!TRANSACTIONID) return res.status(400).json({ error: 'TRANSACTIONID is required' });
	const result = await callNvp('GetTransactionDetails', { TRANSACTIONID }, creds, envOverride);
	res.json(result);
});

router.post('/nvp/refund-transaction', nvpLimiter, async (req, res) => {
	const creds = getSessionCreds(req);
	const envOverride = req.session.env;
	const { TRANSACTIONID, REFUNDTYPE = 'Full', AMT, CURRENCYCODE } = req.body || {};
	if (!TRANSACTIONID) return res.status(400).json({ error: 'TRANSACTIONID is required' });
	const params = { TRANSACTIONID, REFUNDTYPE };
	if (REFUNDTYPE === 'Partial') {
		if (!AMT || !CURRENCYCODE) return res.status(400).json({ error: 'AMT and CURRENCYCODE required for Partial' });
		params.AMT = AMT;
		params.CURRENCYCODE = CURRENCYCODE;
	}
	const result = await callNvp('RefundTransaction', params, creds, envOverride);
	res.json(result);
});

// API Key Management Routes
router.get('/api-keys', async (req, res) => {
	try {
		const apiKeys = await database.getApiKeys();
		res.json({ apiKeys });
	} catch (error) {
		addLog({ source: 'api-keys', type: 'error', message: error.message });
		res.status(500).json({ error: 'Failed to retrieve API keys' });
	}
});

router.post('/api-keys', async (req, res) => {
	try {
		const { name, username, password, signature, environment = 'sandbox' } = req.body || {};
		
		if (!name || !username || !password || !signature) {
			return res.status(400).json({ error: 'name, username, password, and signature are required' });
		}

		const apiKey = await database.saveApiKey(name, username, password, signature, environment);
		addLog({ source: 'api-keys', type: 'created', name, username, environment });
		res.json({ apiKey });
	} catch (error) {
		addLog({ source: 'api-keys', type: 'error', message: error.message });
		res.status(500).json({ error: 'Failed to save API key' });
	}
});

router.get('/api-keys/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const apiKey = await database.getDecryptedApiKey(id);
		
		if (!apiKey) {
			return res.status(404).json({ error: 'API key not found' });
		}

		res.json({ apiKey });
	} catch (error) {
		addLog({ source: 'api-keys', type: 'error', message: error.message });
		res.status(500).json({ error: 'Failed to retrieve API key' });
	}
});

router.put('/api-keys/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const { name, username, password, signature, environment } = req.body || {};
		
		if (!name || !username || !signature || !environment) {
			return res.status(400).json({ error: 'name, username, signature, and environment are required' });
		}

		const apiKey = await database.updateApiKey(id, name, username, password, signature, environment);
		
		if (apiKey.changes === 0) {
			return res.status(404).json({ error: 'API key not found' });
		}

		addLog({ source: 'api-keys', type: 'updated', id, name, username, environment });
		res.json({ apiKey });
	} catch (error) {
		addLog({ source: 'api-keys', type: 'error', message: error.message });
		res.status(500).json({ error: 'Failed to update API key' });
	}
});

router.delete('/api-keys/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const result = await database.deleteApiKey(id);
		
		if (!result.deleted) {
			return res.status(404).json({ error: 'API key not found' });
		}

		addLog({ source: 'api-keys', type: 'deleted', id });
		res.json({ ok: true });
	} catch (error) {
		addLog({ source: 'api-keys', type: 'error', message: error.message });
		res.status(500).json({ error: 'Failed to delete API key' });
	}
});

// Route to use a saved API key for NVP calls
router.post('/api-keys/:id/use', async (req, res) => {
	try {
		const { id } = req.params;
		const { password } = req.body || {};
		
		if (!password) {
			return res.status(400).json({ error: 'password is required to use saved API key' });
		}

		const credentials = await database.verifyApiKeyPassword(id, password);
		
		if (!credentials) {
			return res.status(401).json({ error: 'Invalid password for API key' });
		}

		// Store credentials in session
		req.session.paypalCreds = {
			username: credentials.username,
			password: credentials.password,
			signature: credentials.signature
		};
		req.session.env = credentials.environment;
		await req.session.save();

		addLog({ source: 'api-keys', type: 'used', id, environment: credentials.environment });
		res.json({ ok: true, environment: credentials.environment });
	} catch (error) {
		addLog({ source: 'api-keys', type: 'error', message: error.message });
		res.status(500).json({ error: 'Failed to use API key' });
	}
});

module.exports = router;