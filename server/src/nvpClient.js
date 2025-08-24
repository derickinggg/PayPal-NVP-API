const axios = require('axios');
const config = require('./config');
const { addLog } = require('./logging');

function parseNvp(body) {
	const obj = {};
	body.split('&').forEach((pair) => {
		const [k, v] = pair.split('=');
		if (k) obj[decodeURIComponent(k)] = decodeURIComponent(v || '');
	});
	return obj;
}

function toFormUrlEncoded(params) {
	const usp = new URLSearchParams();
	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null) usp.append(key, String(value));
	});
	return usp.toString();
}

async function callNvp(method, params, credentials, envOverride) {
	const endpoint = config.getNvpEndpoint(envOverride);
	const version = config.nvpVersion;
	const payload = {
		METHOD: method,
		VERSION: version,
		USER: credentials.username,
		PWD: credentials.password,
		SIGNATURE: credentials.signature,
		...params
	};
	const body = toFormUrlEncoded(payload);

	addLog({
		source: 'nvp',
		type: 'request',
		method,
		endpoint,
		params: { ...params },
	});

	const res = await axios.post(endpoint, body, {
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		timeout: 30000
	});

	const text = typeof res.data === 'string' ? res.data : String(res.data);
	const parsed = parseNvp(text);

	addLog({ source: 'nvp', type: 'response', method, status: res.status, data: parsed });

	return parsed;
}

module.exports = { callNvp, parseNvp, toFormUrlEncoded };