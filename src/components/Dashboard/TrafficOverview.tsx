import React from 'react';
import { Activity, MapPin, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { useRealTimeTraffic } from '../../hooks/useRealTimeTraffic';

export default function TrafficOverview() {
  const { intersections, alerts } = useRealTimeTraffic();

  const totalVehicles = intersections.reduce((sum, intersection) => 
    sum + intersection.currentMetrics.vehicleCount, 0
  );

  const averageWaitTime = intersections.reduce((sum, intersection) => 
    sum + intersection.currentMetrics.waitTime, 0
  ) / intersections.length;

  const totalThroughput = intersections.reduce((sum, intersection) => 
    sum + intersection.currentMetrics.throughput, 0
  );

  const activeAlerts = alerts.filter(alert => !alert.acknowledged).length;

  const stats = [
    {
      label: 'Active Intersections',
      value: intersections.filter(i => i.status === 'active').length,
      total: intersections.length,
      icon: MapPin,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Total Vehicles',
      value: totalVehicles,
      change: '+12%',
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Avg Wait Time',
      value: `${Math.round(averageWaitTime)}s`,
      change: '-24%',
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      label: 'Total Throughput',
      value: `${Math.round(totalThroughput / 1000)}K/hr`,
      change: '+19%',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'Active Alerts',
      value: activeAlerts,
      urgent: activeAlerts > 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            {stat.change && (
              <span className={`text-sm font-medium ${
                stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            )}
          </div>
          
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-900">
              {typeof stat.value === 'number' && stat.total ? (
                `${stat.value}/${stat.total}`
              ) : (
                stat.value
              )}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
          </div>

          {stat.urgent && (
            <div className="mt-4 px-2 py-1 bg-red-100 rounded-full">
              <p className="text-xs text-red-800 font-medium">Requires Attention</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}