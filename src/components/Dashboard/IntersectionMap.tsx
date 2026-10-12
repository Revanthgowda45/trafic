import React, { useState } from 'react';
import { MapPin, Camera, Settings, Zap, Clock, Activity } from 'lucide-react';
import { useRealTimeTraffic } from '../../hooks/useRealTimeTraffic';

export default function IntersectionMap() {
  const { intersections, optimizeIntersection } = useRealTimeTraffic();
  const [selectedIntersection, setSelectedIntersection] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'maintenance': return 'bg-amber-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrafficLevel = (vehicleCount: number) => {
    if (vehicleCount > 80) return { level: 'Heavy', color: 'text-red-600', bg: 'bg-red-50' };
    if (vehicleCount > 50) return { level: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { level: 'Light', color: 'text-green-600', bg: 'bg-green-50' };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Traffic Intersection Overview</h2>
        <p className="text-sm text-gray-600 mt-1">Real-time monitoring of {intersections.length} intersections</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map View */}
          <div className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 h-96 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <div className="relative z-10">
              <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Bhubaneswar Traffic Network
              </h3>
              
              {/* Simulated map with intersections */}
              <div className="space-y-4">
                {intersections.map((intersection, index) => {
                  const traffic = getTrafficLevel(intersection.currentMetrics.vehicleCount);
                  const isSelected = selectedIntersection === intersection.id;
                  
                  return (
                    <div
                      key={intersection.id}
                      className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
                        isSelected ? 'bg-blue-100 border-2 border-blue-300' : 'bg-white/70 hover:bg-white'
                      }`}
                      onClick={() => setSelectedIntersection(intersection.id)}
                    >
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(intersection.status)} mr-3`}></div>
                        <div>
                          <h4 className="font-medium text-gray-900">{intersection.name}</h4>
                          <p className="text-sm text-gray-600">
                            {intersection.currentMetrics.vehicleCount} vehicles
                          </p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${traffic.bg} ${traffic.color}`}>
                        {traffic.level}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Intersection Details */}
          <div className="space-y-4">
            {selectedIntersection ? (
              (() => {
                const intersection = intersections.find(i => i.id === selectedIntersection);
                if (!intersection) return null;

                return (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">{intersection.name}</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(intersection.status)} mr-2`}></div>
                          <span className="text-sm font-medium capitalize">{intersection.status}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Vehicles</span>
                        <span className="text-sm font-medium">{intersection.currentMetrics.vehicleCount}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Wait Time</span>
                        <span className="text-sm font-medium">{intersection.currentMetrics.waitTime}s</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Throughput</span>
                        <span className="text-sm font-medium">{intersection.currentMetrics.throughput}/hr</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Flow Rate</span>
                        <span className="text-sm font-medium">{intersection.currentMetrics.flowRate}/hr</span>
                      </div>

                      <div className="pt-3 border-t border-gray-200">
                        <button
                          onClick={() => optimizeIntersection(intersection.id)}
                          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Optimize Signals
                        </button>
                      </div>

                      <div className="flex space-x-2">
                        <button className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors flex items-center justify-center">
                          <Camera className="w-4 h-4 mr-1" />
                          View Camera
                        </button>
                        <button className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors flex items-center justify-center">
                          <Settings className="w-4 h-4 mr-1" />
                          Settings
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">Select an Intersection</h3>
                <p className="text-sm text-gray-600">Click on any intersection to view detailed information and controls</p>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-green-600" />
                System Performance
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Improvement</span>
                  <span className="text-sm font-bold text-green-600">+12.1%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">AI Accuracy</span>
                  <span className="text-sm font-bold text-blue-600">95.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="text-sm font-bold text-purple-600">187ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}