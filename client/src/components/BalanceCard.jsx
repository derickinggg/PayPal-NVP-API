import React, { useState, useEffect } from 'react';
import { DollarSign, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

const BalanceCard = ({ balance, loading: initialLoading }) => {
  const [loading, setLoading] = useState(initialLoading);
  const [balanceData, setBalanceData] = useState(balance);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    setBalanceData(balance);
    if (balance) {
      setLastUpdated(new Date());
    }
  }, [balance]);

  const refreshBalance = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/nvp/balance');
      if (response.ok) {
        const data = await response.json();
        setBalanceData(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error refreshing balance:', error);
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
    switch (status) {
      case 'Completed':
        return 'text-green-600';
      case 'Pending':
        return 'text-yellow-600';
      case 'Failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'Pending':
        return <RefreshCw className="w-4 h-4 text-yellow-600" />;
      case 'Failed':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Account Balance</h2>
        <button
          onClick={refreshBalance}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : balanceData ? (
        <div className="space-y-4">
          {/* Main Balance Display */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-8 h-8 text-green-600 mr-2" />
              <span className="text-3xl font-bold text-gray-900">
                {formatCurrency(balanceData.parsedData?.BALANCE || balanceData.parsedData?.L_AMT0 || '0')}
              </span>
            </div>
            <p className="text-sm text-gray-500">Available Balance</p>
          </div>

          {/* Balance Details */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Balance Details</h3>
            <div className="space-y-2">
              {balanceData.parsedData?.BALANCE && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Balance:</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(balanceData.parsedData.BALANCE)}
                  </span>
                </div>
              )}
              
              {balanceData.parsedData?.PENDINGBALANCE && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pending Balance:</span>
                  <span className="text-sm font-medium text-yellow-600">
                    {formatCurrency(balanceData.parsedData.PENDINGBALANCE)}
                  </span>
                </div>
              )}

              {balanceData.parsedData?.HOLDBALANCE && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hold Balance:</span>
                  <span className="text-sm font-medium text-orange-600">
                    {formatCurrency(balanceData.parsedData.HOLDBALANCE)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* API Response Status */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Status:</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(balanceData.parsedData?.ACK || 'Unknown')}
                <span className={`text-sm font-medium ${getStatusColor(balanceData.parsedData?.ACK || 'Unknown')}`}>
                  {balanceData.parsedData?.ACK || 'Unknown'}
                </span>
              </div>
            </div>
            
            {balanceData.parsedData?.CORRELATIONID && (
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-600">Correlation ID:</span>
                <span className="text-sm font-mono text-gray-500">
                  {balanceData.parsedData.CORRELATIONID}
                </span>
              </div>
            )}
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 text-center">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No balance data available</p>
          <button
            onClick={refreshBalance}
            className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
          >
            Refresh Balance
          </button>
        </div>
      )}

      {/* Error Display */}
      {balanceData && !balanceData.success && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            Error: {balanceData.error || 'Unknown error occurred'}
          </p>
        </div>
      )}
    </div>
  );
};

export default BalanceCard;