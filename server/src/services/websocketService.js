const WebSocket = require('ws');
const loggingService = require('./loggingService');

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Set();
    this.setupWebSocket();
    this.setupLoggingSubscription();
  }

  setupWebSocket() {
    this.wss.on('connection', (ws) => {
      console.log('New WebSocket connection established');
      this.clients.add(ws);

      // Send initial data
      this.sendToClient(ws, {
        type: 'CONNECTION_ESTABLISHED',
        timestamp: new Date().toISOString(),
        message: 'Connected to NVP Dashboard'
      });

      // Send current stats
      this.sendToClient(ws, {
        type: 'STATS_UPDATE',
        data: loggingService.getStats()
      });

      // Send recent logs
      this.sendToClient(ws, {
        type: 'LOGS_UPDATE',
        data: loggingService.getLogs(50)
      });

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(ws, data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });
  }

  setupLoggingSubscription() {
    loggingService.subscribe((log) => {
      this.broadcast({
        type: 'NEW_LOG',
        data: log
      });
    });
  }

  handleMessage(ws, data) {
    switch (data.type) {
      case 'GET_LOGS':
        this.sendToClient(ws, {
          type: 'LOGS_UPDATE',
          data: loggingService.getLogs(data.limit || 100, data.filter)
        });
        break;
      
      case 'GET_STATS':
        this.sendToClient(ws, {
          type: 'STATS_UPDATE',
          data: loggingService.getStats()
        });
        break;
      
      case 'GET_LOGS_BY_DATE':
        const { startDate, endDate, filter } = data;
        this.sendToClient(ws, {
          type: 'LOGS_UPDATE',
          data: loggingService.getLogsByDateRange(startDate, endDate, filter)
        });
        break;
      
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }

  sendToClient(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(data));
      } catch (error) {
        console.error('Error sending message to client:', error);
      }
    }
  }

  broadcast(data) {
    this.clients.forEach((client) => {
      this.sendToClient(client, data);
    });
  }

  broadcastToAll(data) {
    this.broadcast(data);
  }

  getConnectedClientsCount() {
    return this.clients.size;
  }
}

module.exports = WebSocketService;