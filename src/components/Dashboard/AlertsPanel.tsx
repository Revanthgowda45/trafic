import React from 'react';
import { AlertTriangle, Clock, CheckCircle, X, Bell, Car, Zap } from 'lucide-react';
import { useRealTimeTraffic } from '../../hooks/useRealTimeTraffic';

export default function AlertsPanel() {
  const { alerts, acknowledgeAlert } = useRealTimeTraffic();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'emergency': return Zap;
      case 'congestion': return Car;
      case 'incident': return AlertTriangle;
      case 'system-error': return X;
      default: return Bell;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-200 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-200 text-orange-800';
      case 'medium': return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-blue-100 border-blue-200 text-blue-800';
      default: return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);
  const acknowledgedAlerts = alerts.filter(alert => alert.acknowledged);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - alertTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h ago`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">System Alerts</h2>
          <div className="flex items-center space-x-2">
            {unacknowledgedAlerts.length > 0 && (
              <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                {unacknowledgedAlerts.length} active
              </div>
            )}
            <Bell className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-2">All Clear</h3>
            <p className="text-sm text-gray-600">No active alerts at this time</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {/* Unacknowledged Alerts */}
            {unacknowledgedAlerts.map((alert) => {
              const AlertIcon = getAlertIcon(alert.type);
              
              return (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-4 ${getAlertColor(alert.severity)} transition-all hover:shadow-sm`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <AlertIcon className="w-5 h-5 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getSeverityBadgeColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                          <span className="text-xs text-gray-600 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTimeAgo(alert.timestamp)}
                          </span>
                        </div>
                        <p className="font-medium mb-1">{alert.message}</p>
                        {alert.intersectionId && (
                          <p className="text-xs opacity-75">
                            Intersection ID: {alert.intersectionId}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="ml-4 p-1 hover:bg-white/50 rounded transition-colors"
                      title="Acknowledge alert"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Acknowledged Alerts */}
            {acknowledgedAlerts.length > 0 && (
              <>
                {unacknowledgedAlerts.length > 0 && (
                  <div className="border-t border-gray-200 my-4 pt-3">
                    <h4 className="text-sm font-medium text-gray-600 mb-3">Recently Acknowledged</h4>
                  </div>
                )}
                
                {acknowledgedAlerts.slice(0, 3).map((alert) => {
                  const AlertIcon = getAlertIcon(alert.type);
                  
                  return (
                    <div
                      key={alert.id}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50 opacity-60"
                    >
                      <div className="flex items-start space-x-3">
                        <AlertIcon className="w-5 h-5 mt-1 text-gray-400 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-gray-500">Acknowledged</span>
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTimeAgo(alert.timestamp)}
                            </span>
                          </div>
                          <p className="font-medium text-gray-700 mb-1">{alert.message}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex space-x-2">
          <button className="flex-1 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
            View All Alerts
          </button>
          <button className="flex-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 hover:bg-blue-100 transition-colors">
            Alert Settings
          </button>
        </div>
      </div>
    </div>
  );
}