const { v4: uuidv4 } = require('uuid');
const config = require('./config');

const sseClients = new Set();
const logsBuffer = [];

function redactSecrets(value) {
	if (!value) return value;
	const json = JSON.stringify(value);
	return json
		.replace(/(PWD|PASSWORD|PASS|SIGNATURE|USER)=([^&\\"]+)/gi, '$1=[REDACTED]')
		.replace(/("password"\s*:\s*")([^"]+)(")/gi, '$1[REDACTED]$3')
		.replace(/("signature"\s*:\s*")([^"]+)(")/gi, '$1[REDACTED]$3')
		.replace(/("username"\s*:\s*")([^"]+)(")/gi, '$1[REDACTED]$3');
}

function addLog(entry) {
	const enriched = {
		id: uuidv4(),
		ts: new Date().toISOString(),
		...entry
	};
	const safeEntry = JSON.parse(redactSecrets(enriched));
	logsBuffer.push(safeEntry);
	while (logsBuffer.length > config.logBufferSize) {
		logsBuffer.shift();
	}
	broadcastEvent('log', safeEntry);
	return safeEntry;
}

function getLogs() {
	return logsBuffer.slice(-config.logBufferSize);
}

function broadcastEvent(event, data) {
	const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
	sseClients.forEach((res) => {
		try {
			res.write(payload);
		} catch (_) {
			// Drop broken client
			sseClients.delete(res);
		}
	});
}

function sseStreamHandler(req, res) {
	res.setHeader('Content-Type', 'text/event-stream');
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Connection', 'keep-alive');
	res.flushHeaders?.();

	// Send initial backlog
	getLogs().forEach((log) => {
		res.write(`event: log\ndata: ${JSON.stringify(log)}\n\n`);
	});

	// Heartbeat
	const interval = setInterval(() => {
		res.write(': ping\n\n');
	}, 20000);

	sseClients.add(res);
	req.on('close', () => {
		clearInterval(interval);
		sseClients.delete(res);
	});
}

module.exports = { addLog, getLogs, sseStreamHandler, broadcastEvent };