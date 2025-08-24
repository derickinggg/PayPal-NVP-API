const express = require('express');
const axios = require('axios');
const config = require('./config');
const { addLog } = require('./logging');

const router = express.Router();

// We assume parent app uses express.urlencoded for IPN
router.post('/webhooks/ipn', async (req, res) => {
	const envOverride = (req.session?.env || config.paypalEnv);
	const verifyUrl = config.getIpnEndpoint(envOverride);

	const payload = new URLSearchParams({ cmd: '_notify-validate', ...req.body }).toString();

	try {
		const verifyRes = await axios.post(verifyUrl, payload, {
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			timeout: 15000,
		});

		const isVerified = typeof verifyRes.data === 'string' && verifyRes.data.includes('VERIFIED');

		addLog({ source: 'ipn', type: 'verification', verified: isVerified, ipn: req.body, env: envOverride });

		res.status(200).send(isVerified ? 'OK' : 'INVALID');
	} catch (error) {
		addLog({ source: 'ipn', type: 'verification_error', error: String(error), ipn: req.body });
		res.status(500).send('ERROR');
	}
});

module.exports = router;