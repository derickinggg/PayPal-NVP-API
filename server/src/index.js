const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
require('express-async-errors');
const { getIronSession } = require('iron-session');

const config = require('./config');
const routes = require('./routes');
const ipnRouter = require('./ipn');
const { addLog } = require('./logging');
const nvpRoutes = require('./routes/nvpRoutes');
const loggingService = require('./services/loggingService');
const WebSocketService = require('./services/websocketService');

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(cors({
	origin: config.clientOrigin,
	credentials: true,
	exposedHeaders: ['x-request-id']
}));

app.use(morgan('combined'));

// Attach iron-session to req
app.use((req, res, next) => {
	getIronSession(req, res, {
		cookieName: 'pp_nvp_session',
		password: config.sessionSecret,
		cookieOptions: {
			secure: config.httpsEnabled || config.nodeEnv === 'production',
			sameSite: 'lax',
			path: '/',
		},
	})
		.then((session) => {
			req.session = session;
			next();
		})
		.catch(next);
});

// Logging middleware for API requests
app.use('/api', (req, res, next) => {
  const startTime = Date.now();
  const logId = loggingService.logApiRequest(req.method, req.path, req.body, req.headers);
  
  // Override res.json to capture response
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - startTime;
    loggingService.logApiResponse(logId, data, duration);
    return originalJson.call(this, data);
  };
  
  next();
});

app.use('/api', routes);
app.use('/api', ipnRouter);
app.use('/api/nvp', nvpRoutes);

// Error handler
app.use((err, req, res, next) => {
	const status = err.status || 500;
	addLog({ source: 'server', type: 'error', status, message: err.message });
	res.status(status).json({ error: err.message || 'Internal Server Error' });
});

function start() {
	const port = config.port;
	let server;
	
	if (config.httpsEnabled) {
		const key = fs.readFileSync(path.resolve(config.sslKeyPath));
		const cert = fs.readFileSync(path.resolve(config.sslCertPath));
		server = https.createServer({ key, cert }, app);
		server.listen(port, () => {
			console.log(`HTTPS server listening on https://localhost:${port}`);
		});
	} else {
		server = http.createServer(app);
		server.listen(port, () => {
			console.log(`HTTP server listening on http://localhost:${port}`);
		});
	}
	
	// Initialize WebSocket service
	const wsService = new WebSocketService(server);
	console.log('WebSocket service initialized');
}

if (require.main === module) {
	start();
}

module.exports = app;