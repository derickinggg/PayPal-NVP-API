import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Search, 
  FileText, 
  RotateCcw, 
  Activity, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import BalanceCard from './BalanceCard';
import TransactionSearch from './TransactionSearch';
import TransactionDetails from './TransactionDetails';
import RefundForm from './RefundForm';
import LogsViewer from './LogsViewer';
import StatsOverview from './StatsOverview';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    connectWebSocket();
    fetchInitialData();
  }, []);

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);
    
    ws.onopen = () => {
      setWsConnected(true);
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setWsConnected(false);
      console.log('WebSocket disconnected');
      // Reconnect after 5 seconds
      setTimeout(connectWebSocket, 5000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setWsConnected(false);
    };

    return () => {
      ws.close();
    };
  };

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'NEW_LOG':
        setLogs(prev => [data.data, ...prev.slice(0, 999)]);
        break;
      case 'STATS_UPDATE':
        setStats(data.data);
        break;
      case 'LOGS_UPDATE':
        setLogs(data.data);
        break;
      default:
        break;
    }
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [balanceRes, statsRes] = await Promise.all([
        fetch('/api/nvp/balance'),
        fetch('/api/nvp/account-info')
      ]);
      
      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setBalance(balanceData);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionSearch = (searchResults) => {
    setTransactions(searchResults);
    setActiveTab('transactions');
  };

  const handleTransactionSelect = (transaction) => {
    setSelectedTransaction(transaction);
    setActiveTab('details');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'balance', label: 'Balance', icon: DollarSign },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'transactions', label: 'Transactions', icon: FileText },
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'refund', label: 'Refund', icon: RotateCcw },
    { id: 'logs', label: 'Logs', icon: Clock }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <StatsOverview stats={stats} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <BalanceCard balance={balance} loading={loading} />
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('balance')}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Check Balance
                  </button>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Search Transactions
                  </button>
                  <button
                    onClick={() => setActiveTab('logs')}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                  >
                    View Logs
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'balance':
        return <BalanceCard balance={balance} loading={loading} />;
      case 'search':
        return <TransactionSearch onSearch={handleTransactionSearch} />;
      case 'transactions':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Transaction Results</h2>
            <div className="grid gap-4">
              {transactions.map((tx, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md"
                  onClick={() => handleTransactionSelect(tx)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">Transaction ID: {tx.TRANSACTIONID || tx.L_TRANSACTIONID}</p>
                      <p className="text-gray-600">Amount: {tx.AMT || tx.L_AMT}</p>
                      <p className="text-gray-600">Status: {tx.PAYMENTSTATUS || tx.L_PAYMENTSTATUS}</p>
                    </div>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'details':
        return (
          <TransactionDetails 
            transaction={selectedTransaction} 
            onBack={() => setActiveTab('transactions')}
          />
        );
      case 'refund':
        return <RefundForm />;
      case 'logs':
        return <LogsViewer logs={logs} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">NVP API Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${wsConnected ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-600' : 'bg-red-600'}`} />
                <span className="text-sm">
                  {wsConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </main>
    </div>
  );
};

export default Dashboard;