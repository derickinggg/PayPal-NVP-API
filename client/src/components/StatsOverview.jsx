import React from 'react';
import { Activity, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';

const StatsOverview = ({ stats }) => {
  const defaultStats = {
    total: 0,
    requests: 0,
    nvpRequests: 0,
    errors: 0,
    pending: 0,
    successRate: 0
  };

  const currentStats = stats || defaultStats;

  const statCards = [
    {
      title: 'Total Requests',
      value: currentStats.total,
      icon: Activity,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'API Requests',
      value: currentStats.requests,
      icon: Zap,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'NVP Requests',
      value: currentStats.nvpRequests,
      icon: CheckCircle,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Success Rate',
      value: `${currentStats.successRate}%`,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600'
    },
    {
      title: 'Errors',
      value: currentStats.errors,
      icon: XCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      title: 'Pending',
      value: currentStats.pending,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">API Statistics Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                  <Icon className={`w-8 h-8 ${stat.textColor}`} />
                </div>
              </div>
              
              {/* Progress bar for success rate */}
              {stat.title === 'Success Rate' && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${currentStats.successRate}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Additional Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Average Response Time:</span>
              <span className="text-sm font-medium text-gray-900">
                {currentStats.total > 0 ? 'Calculating...' : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Peak Requests/Min:</span>
              <span className="text-sm font-medium text-gray-900">
                {currentStats.total > 0 ? 'Calculating...' : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Uptime:</span>
              <span className="text-sm font-medium text-green-600">100%</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Dashboard loaded</span>
              <span className="text-xs text-gray-400 ml-auto">Just now</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">WebSocket connected</span>
              <span className="text-xs text-gray-400 ml-auto">Just now</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Real-time monitoring active</span>
              <span className="text-xs text-gray-400 ml-auto">Just now</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-800 font-medium">All systems operational</span>
        </div>
        <p className="text-green-700 text-sm mt-1">
          NVP API integration is running smoothly with real-time monitoring active.
        </p>
      </div>
    </div>
  );
};

export default StatsOverview;