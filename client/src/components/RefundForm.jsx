import React, { useState } from 'react';
import { RotateCcw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const RefundForm = () => {
  const [formData, setFormData] = useState({
    transactionId: '',
    refundType: 'Full',
    amount: '',
    note: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.transactionId.trim()) {
      setError('Transaction ID is required');
      return;
    }

    if (formData.refundType === 'Partial' && !formData.amount) {
      setError('Amount is required for partial refunds');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/nvp/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: formData.transactionId,
          amount: formData.refundType === 'Partial' ? formData.amount : null,
          note: formData.note
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
        // Reset form on success
        setFormData({
          transactionId: '',
          refundType: 'Full',
          amount: '',
          note: ''
        });
      } else {
        setError(data.error || 'Refund failed');
      }
    } catch (error) {
      setError('Network error occurred');
      console.error('Refund error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0.00';
    const num = parseFloat(amount);
    return num.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <RotateCcw className="w-6 h-6 mr-3" />
          Process Refund
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transaction ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction ID *
            </label>
            <input
              type="text"
              name="transactionId"
              value={formData.transactionId}
              onChange={handleInputChange}
              placeholder="Enter the transaction ID to refund"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This is the original transaction ID that you want to refund
            </p>
          </div>

          {/* Refund Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refund Type *
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="refundType"
                  value="Full"
                  checked={formData.refundType === 'Full'}
                  onChange={handleInputChange}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Full Refund</span>
                <span className="text-xs text-gray-500 ml-2">(Refund the entire transaction amount)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="refundType"
                  value="Partial"
                  checked={formData.refundType === 'Partial'}
                  onChange={handleInputChange}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Partial Refund</span>
                <span className="text-xs text-gray-500 ml-2">(Refund a specific amount)</span>
              </label>
            </div>
          </div>

          {/* Amount (for partial refunds) */}
          {formData.refundType === 'Partial' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refund Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter the amount you want to refund (must be less than or equal to the original transaction amount)
              </p>
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refund Note
            </label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              placeholder="Optional: Add a note explaining the reason for the refund"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              This note will be visible to the customer and in your transaction history
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <RotateCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Processing Refund...' : 'Process Refund'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <XCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Refund Failed</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Result */}
      {result && result.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <h3 className="text-xl font-medium text-green-800">Refund Processed Successfully!</h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h4 className="font-medium text-green-800 mb-3">Refund Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Refund ID:</span>
                    <span className="text-sm font-mono text-gray-900">
                      {result.parsedData?.REFUNDTRANSACTIONID || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(result.parsedData?.ACK)}`}>
                      {getStatusIcon(result.parsedData?.ACK)}
                      <span className="ml-1">{result.parsedData?.ACK || 'Unknown'}</span>
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Correlation ID:</span>
                    <span className="text-sm font-mono text-gray-500">
                      {result.parsedData?.CORRELATIONID || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Timestamp:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(result.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Raw Response Data */}
            <details className="border border-green-200 rounded-lg">
              <summary className="px-4 py-3 bg-green-50 cursor-pointer hover:bg-green-100">
                <span className="font-medium text-green-800">View Raw Response Data</span>
              </summary>
              <div className="p-4 bg-green-50">
                <pre className="text-sm text-green-700 overflow-x-auto">
                  {JSON.stringify(result.parsedData, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        </div>
      )}

      {/* Important Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-yellow-600" />
          <h3 className="text-lg font-medium text-yellow-800">Important Information</h3>
        </div>
        <div className="space-y-3 text-sm text-yellow-700">
          <p>• Refunds can only be processed on completed transactions</p>
          <p>• Full refunds will refund the entire transaction amount</p>
          <p>• Partial refunds must be less than or equal to the original transaction amount</p>
          <p>• Refund processing may take 3-5 business days to appear in the customer's account</p>
          <p>• All refunds are logged and can be tracked in the logs section</p>
        </div>
      </div>
    </div>
  );
};

export default RefundForm;