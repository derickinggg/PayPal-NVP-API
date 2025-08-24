import React, { useState } from 'react';
import { Search, Calendar, Filter, Download } from 'lucide-react';

const TransactionSearch = ({ onSearch }) => {
  const [searchParams, setSearchParams] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0],
    transactionId: '',
    email: '',
    status: '',
    amount: ''
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('/api/nvp/transaction-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: searchParams.startDate,
          endDate: searchParams.endDate,
          searchParams: {
            ...(searchParams.transactionId && { TRANSACTIONID: searchParams.transactionId }),
            ...(searchParams.email && { EMAIL: searchParams.email }),
            ...(searchParams.status && { PAYMENTSTATUS: searchParams.status }),
            ...(searchParams.amount && { AMT: searchParams.amount })
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(data);
        if (onSearch) {
          onSearch(data.parsedData || []);
        }
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (error) {
      setError('Network error occurred');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportResults = () => {
    if (!results || !results.parsedData) return;
    
    const csvContent = convertToCSV(results.parsedData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${searchParams.startDate}_${searchParams.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const convertToCSV = (data) => {
    if (!data || typeof data !== 'object') return '';
    
    // Handle different response formats
    let transactions = [];
    if (Array.isArray(data)) {
      transactions = data;
    } else if (data.L_TRANSACTIONID0) {
      // Handle NVP response format
      const count = parseInt(data.L_NUMBER0) || 0;
      for (let i = 0; i < count; i++) {
        const transaction = {};
        Object.keys(data).forEach(key => {
          if (key.endsWith(i.toString())) {
            const baseKey = key.slice(0, -1);
            transaction[baseKey] = data[key];
          }
        });
        if (Object.keys(transaction).length > 0) {
          transactions.push(transaction);
        }
      }
    }

    if (transactions.length === 0) return 'No transactions found';

    const headers = Object.keys(transactions[0]);
    const csvRows = [headers.join(',')];
    
    transactions.forEach(transaction => {
      const values = headers.map(header => {
        const value = transaction[header] || '';
        return `"${value.toString().replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  };

  const getStatusOptions = () => [
    { value: '', label: 'All Statuses' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Failed', label: 'Failed' },
    { value: 'Denied', label: 'Denied' },
    { value: 'Expired', label: 'Expired' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Transaction Search</h2>
        
        <form onSubmit={handleSearch} className="space-y-6">
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={searchParams.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={searchParams.endDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Search Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction ID
              </label>
              <input
                type="text"
                name="transactionId"
                value={searchParams.transactionId}
                onChange={handleInputChange}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={searchParams.email}
                onChange={handleInputChange}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={searchParams.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {getStatusOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                value={searchParams.amount}
                onChange={handleInputChange}
                placeholder="Optional"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Search className="w-5 h-5" />
              <span>{loading ? 'Searching...' : 'Search Transactions'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {results && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Search Results</h3>
            {results.parsedData && Object.keys(results.parsedData).length > 0 && (
              <button
                onClick={exportResults}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {results.success ? (
              <div>
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800">
                    <strong>Success!</strong> Search completed successfully.
                  </p>
                  {results.parsedData?.L_NUMBER0 && (
                    <p className="text-green-700 mt-1">
                      Found {results.parsedData.L_NUMBER0} transactions
                    </p>
                  )}
                </div>

                {/* Raw Response Data */}
                <details className="border border-gray-200 rounded-lg">
                  <summary className="px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100">
                    <span className="font-medium">View Raw Response Data</span>
                  </summary>
                  <div className="p-4 bg-gray-50">
                    <pre className="text-sm text-gray-700 overflow-x-auto">
                      {JSON.stringify(results.parsedData, null, 2)}
                    </pre>
                  </div>
                </details>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">
                  <strong>Error:</strong> {results.error || 'Search failed'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionSearch;