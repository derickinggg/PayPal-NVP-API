import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, DollarSign, Calendar, User, CreditCard, AlertCircle } from 'lucide-react';

const TransactionDetails = ({ transaction, onBack }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (transaction) {
      fetchTransactionDetails();
    }
  }, [transaction]);

  const fetchTransactionDetails = async () => {
    if (!transaction.TRANSACTIONID && !transaction.L_TRANSACTIONID) {
      setError('No transaction ID available');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const transactionId = transaction.TRANSACTIONID || transaction.L_TRANSACTIONID;
      const response = await fetch(`/api/nvp/transaction/${transactionId}`);
      
      if (response.ok) {
        const data = await response.json();
        setDetails(data);
      } else {
        setError('Failed to fetch transaction details');
      }
    } catch (error) {
      setError('Network error occurred');
      console.error('Error fetching transaction details:', error);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
      case 'denied':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return '✅';
      case 'pending':
        return '⏳';
      case 'failed':
      case 'denied':
        return '❌';
      case 'expired':
        return '⏰';
      default:
        return '❓';
    }
  };

  const renderTransactionInfo = () => {
    if (!details || !details.parsedData) return null;

    const data = details.parsedData;
    
    return (
      <div className="space-y-6">
        {/* Basic Transaction Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Transaction ID:</span>
                <span className="text-sm font-mono text-gray-900">{data.TRANSACTIONID || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Status:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(data.PAYMENTSTATUS)}`}>
                  {getStatusIcon(data.PAYMENTSTATUS)} {data.PAYMENTSTATUS || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Amount:</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatCurrency(data.AMT || data.L_AMT0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Currency:</span>
                <span className="text-sm text-gray-900">{data.CURRENCYCODE || 'USD'}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Date:</span>
                <span className="text-sm text-gray-900">{formatDate(data.ORDERTIME || data.TIMESTAMP)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Type:</span>
                <span className="text-sm text-gray-900">{data.PAYMENTTYPE || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Method:</span>
                <span className="text-sm text-gray-900">{data.PAYMENTMETHOD || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Correlation ID:</span>
                <span className="text-sm font-mono text-gray-500">{data.CORRELATIONID || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payer Information */}
        {(data.PAYERID || data.EMAIL) && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Payer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Payer ID:</span>
                  <span className="text-sm text-gray-900">{data.PAYERID || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Email:</span>
                  <span className="text-sm text-gray-900">{data.EMAIL || 'N/A'}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">First Name:</span>
                  <span className="text-sm text-gray-900">{data.FIRSTNAME || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Last Name:</span>
                  <span className="text-sm text-gray-900">{data.LASTNAME || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Subtotal:</span>
                <span className="text-sm text-gray-900">{formatCurrency(data.SUBTOTAL || data.AMT)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Tax:</span>
                <span className="text-sm text-gray-900">{formatCurrency(data.TAXAMT || '0')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Shipping:</span>
                <span className="text-sm text-gray-900">{formatCurrency(data.SHIPPINGAMT || '0')}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Handling:</span>
                <span className="text-sm text-gray-900">{formatCurrency(data.HANDLINGAMT || '0')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Insurance:</span>
                <span className="text-sm text-gray-900">{formatCurrency(data.INSURANCEAMT || '0')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Total:</span>
                <span className="text-sm font-bold text-gray-900">{formatCurrency(data.AMT)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Raw Response Data */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Raw Response Data
          </h3>
          <details className="border border-gray-200 rounded-lg">
            <summary className="px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100">
              <span className="font-medium">View Complete API Response</span>
            </summary>
            <div className="p-4 bg-gray-50">
              <pre className="text-sm text-gray-700 overflow-x-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Transactions</span>
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-center text-gray-600 mt-4">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Transactions</span>
          </button>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Error Loading Transaction</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Transactions</span>
        </button>
      </div>

      {renderTransactionInfo()}
    </div>
  );
};

export default TransactionDetails;