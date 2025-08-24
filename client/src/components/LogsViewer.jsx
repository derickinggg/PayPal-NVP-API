import React, { useState, useMemo } from 'react';
import { Clock, Filter, Download, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

const LogsViewer = ({ logs }) => {
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showRawData, setShowRawData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesType = !filterType || log.type === filterType;
      const matchesStatus = !filterStatus || log.status === filterStatus;
      const matchesSearch = !searchTerm || 
        JSON.stringify(log).toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [logs, filterType, filterStatus, searchTerm]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'API_REQUEST':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'NVP_REQUEST':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'NVP_ERROR':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'API_REQUEST':
        return '🌐';
      case 'NVP_REQUEST':
        return '💳';
      case 'NVP_ERROR':
        return '❌';
      default:
        return '📝';
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(2)}s`;
  };

  const exportLogs = () => {
    const csvContent = convertLogsToCSV(filteredLogs);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nvp_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const convertLogsToCSV = (logs) => {
    if (logs.length === 0) return 'No logs found';
    
    const headers = ['Timestamp', 'Type', 'Status', 'Method', 'Endpoint', 'Duration', 'Error'];
    const csvRows = [headers.join(',')];
    
    logs.forEach(log => {
      const values = [
        log.timestamp,
        log.type,
        log.status,
        log.method || log.endpoint || 'N/A',
        log.endpoint || log.method || 'N/A',
        formatDuration(log.duration),
        log.error || 'N/A'
      ].map(value => `"${value.toString().replace(/"/g, '""')}"`);
      
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  };

  const clearFilters = () => {
    setFilterType('');
    setFilterStatus('');
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">API Logs</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowRawData(!showRawData)}
              className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              {showRawData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showRawData ? 'Hide Raw' : 'Show Raw'}</span>
            </button>
            <button
              onClick={exportLogs}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="API_REQUEST">API Request</option>
              <option value="NVP_REQUEST">NVP Request</option>
              <option value="NVP_ERROR">NVP Error</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="error">Error</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Logs Count */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Showing {filteredLogs.length} of {logs.length} logs
          </p>
        </div>

        {/* Logs List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No logs found matching the current filters</p>
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <div
                key={log.id || index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Log Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getTypeIcon(log.type)}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(log.type)}`}>
                      {log.type}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}</span>
                  </div>
                </div>

                {/* Log Details */}
                <div className="space-y-2">
                  {log.method && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Method:</span>
                      <span className="text-sm text-gray-600 font-mono">{log.method}</span>
                    </div>
                  )}
                  
                  {log.endpoint && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Endpoint:</span>
                      <span className="text-sm text-gray-600 font-mono">{log.endpoint}</span>
                    </div>
                  )}
                  
                  {log.duration && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Duration:</span>
                      <span className="text-sm text-gray-600">{formatDuration(log.duration)}</span>
                    </div>
                  )}
                  
                  {log.error && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Error:</span>
                      <span className="text-sm text-red-600">{log.error}</span>
                    </div>
                  )}
                </div>

                {/* Raw Data Toggle */}
                {showRawData && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-700">
                      View Raw Data
                    </summary>
                    <div className="mt-2 p-3 bg-gray-50 rounded border">
                      <pre className="text-xs text-gray-700 overflow-x-auto">
                        {JSON.stringify(log, null, 2)}
                      </pre>
                    </div>
                  </details>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsViewer;