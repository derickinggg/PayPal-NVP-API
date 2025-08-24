const WebSocket = require('ws');

class LoggingService {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // Keep last 1000 logs
    this.subscribers = new Set();
  }

  addLog(logEntry) {
    const timestamp = new Date().toISOString();
    const log = {
      id: this.generateId(),
      timestamp,
      ...logEntry
    };

    this.logs.push(log);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Notify all subscribers
    this.notifySubscribers(log);
    
    return log;
  }

  logApiRequest(method, endpoint, params, headers = {}) {
    return this.addLog({
      type: 'API_REQUEST',
      method,
      endpoint,
      params,
      headers,
      status: 'pending'
    });
  }

  logApiResponse(logId, response, duration) {
    const logIndex = this.logs.findIndex(log => log.id === logId);
    if (logIndex !== -1) {
      this.logs[logIndex] = {
        ...this.logs[logIndex],
        response,
        duration,
        status: 'completed',
        completedAt: new Date().toISOString()
      };
      
      // Notify subscribers of the update
      this.notifySubscribers(this.logs[logIndex]);
    }
  }

  logApiError(logId, error) {
    const logIndex = this.logs.findIndex(log => log.id === logId);
    if (logIndex !== -1) {
      this.logs[logIndex] = {
        ...this.logs[logIndex],
        error: error.message || error,
        status: 'error',
        completedAt: new Date().toISOString()
      };
      
      // Notify subscribers of the update
      this.notifySubscribers(this.logs[logIndex]);
    }
  }

  logNvpRequest(method, params, response, duration) {
    return this.addLog({
      type: 'NVP_REQUEST',
      method,
      params,
      response,
      duration,
      status: 'completed',
      completedAt: new Date().toISOString()
    });
  }

  logNvpError(method, params, error) {
    return this.addLog({
      type: 'NVP_ERROR',
      method,
      params,
      error: error.message || error,
      status: 'error',
      completedAt: new Date().toISOString()
    });
  }

  getLogs(limit = 100, type = null) {
    let filteredLogs = this.logs;
    
    if (type) {
      filteredLogs = this.logs.filter(log => log.type === type);
    }
    
    return filteredLogs.slice(-limit).reverse();
  }

  getLogsByDateRange(startDate, endDate, type = null) {
    let filteredLogs = this.logs;
    
    if (type) {
      filteredLogs = this.logs.filter(log => log.type === type);
    }
    
    return filteredLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= new Date(startDate) && logDate <= new Date(endDate);
    }).reverse();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers(log) {
    this.subscribers.forEach(callback => {
      try {
        callback(log);
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    });
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getStats() {
    const total = this.logs.length;
    const requests = this.logs.filter(log => log.type === 'API_REQUEST').length;
    const nvpRequests = this.logs.filter(log => log.type === 'NVP_REQUEST').length;
    const errors = this.logs.filter(log => log.status === 'error').length;
    const pending = this.logs.filter(log => log.status === 'pending').length;

    return {
      total,
      requests,
      nvpRequests,
      errors,
      pending,
      successRate: total > 0 ? ((total - errors) / total * 100).toFixed(2) : 0
    };
  }
}

module.exports = new LoggingService();