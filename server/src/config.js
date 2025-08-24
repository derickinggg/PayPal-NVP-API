const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const env = process.env;

const paypalEnv = (env.PAYPAL_ENV || 'sandbox').toLowerCase() === 'live' ? 'live' : 'sandbox';

const nvpEndpoints = {
	// Classic NVP API endpoints
	sandbox: env.NVP_SANDBOX_URL || 'https://api-3t.sandbox.paypal.com/nvp',
	live: env.NVP_LIVE_URL || 'https://api-3t.paypal.com/nvp'
};

const ipnEndpoints = {
	// PayPal IPN verification endpoints
	sandbox: env.IPN_SANDBOX_URL || 'https://ipnpb.sandbox.paypal.com/cgi-bin/webscr',
	live: env.IPN_LIVE_URL || 'https://ipnpb.paypal.com/cgi-bin/webscr'
};

module.exports = {
	nodeEnv: env.NODE_ENV || 'development',
	port: parseInt(env.PORT || '4000', 10),
	httpsEnabled: String(env.HTTPS || '').toLowerCase() === 'true',
	sslKeyPath: env.SSL_KEY_PATH || '',
	sslCertPath: env.SSL_CERT_PATH || '',
	sessionSecret: env.SESSION_SECRET || 'change-me-and-keep-long-for-dev-only',
	clientOrigin: env.CLIENT_ORIGIN || 'http://localhost:5173',
	logBufferSize: parseInt(env.LOG_BUFFER_SIZE || '300', 10),
	paypalEnv,
	nvpVersion: env.PAYPAL_NVP_VERSION || '204.0',
	nvpEndpoints,
	ipnEndpoints,
	getNvpEndpoint(envOverride) {
		const target = (envOverride || paypalEnv).toLowerCase() === 'live' ? 'live' : 'sandbox';
		return nvpEndpoints[target];
	},
	getIpnEndpoint(envOverride) {
		const target = (envOverride || paypalEnv).toLowerCase() === 'live' ? 'live' : 'sandbox';
		return ipnEndpoints[target];
	}
};