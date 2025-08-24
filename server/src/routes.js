const express = require('express');
const rateLimit = require('express-rate-limit');
const { callNvp } = require('./nvpClient');
const { addLog, getLogs, sseStreamHandler } = require('./logging');

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

module.exports = router;