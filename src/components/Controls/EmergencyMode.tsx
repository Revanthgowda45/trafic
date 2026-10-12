import React, { useState } from 'react';
import { Siren, MapPin, Clock, Route, AlertTriangle, Play, Square } from 'lucide-react';

export default function EmergencyMode() {
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencyVehicles] = useState([
    {
      id: '1',
      type: 'ambulance',
      location: 'Master Canteen Square',
      destination: 'AIIMS Bhubaneswar',
      eta: '4 min',
      status: 'approaching',
      priority: 'critical'
    },
    {
      id: '2',
      type: 'fire',
      location: 'Kalpana Square',
      destination: 'Patia Fire Station',
      eta: '7 min',
      status: 'at-intersection',
      priority: 'high'
    }
  ]);

  const getVehicleIcon = (type: string) => {
    return '🚨'; // Using emoji for simplicity, could be replaced with custom icons
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approaching': return 'text-amber-600 bg-amber-50';
      case 'at-intersection': return 'text-red-600 bg-red-50';
      case 'passed': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Emergency Control Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Siren className="w-6 h-6 mr-2 text-red-600" />
              Emergency Vehicle Priority
            </h2>
            <button
              onClick={() => setEmergencyActive(!emergencyActive)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                emergencyActive
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {emergencyActive ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Activate
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-6">
          {emergencyActive && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <span className="font-medium text-red-800">Emergency Mode Active</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                Traffic signals are being automatically optimized for emergency vehicle passage
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-4">Active Emergency Vehicles</h3>
              <div className="space-y-3">
                {emergencyVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getVehicleIcon(vehicle.type)}</span>
                        <div>
                          <h4 className="font-medium text-gray-900 capitalize">{vehicle.type}</h4>
                          <p className="text-sm text-gray-600">ID: {vehicle.id}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(vehicle.priority)}`}>
                        {vehicle.priority.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Current: {vehicle.location}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Route className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Destination: {vehicle.destination}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">ETA: {vehicle.eta}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                          {vehicle.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex space-x-2">
                      <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        Clear Path
                      </button>
                      <button className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors">
                        Track Route
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-4">Emergency Performance</h3>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">Response Time Improvement</h4>
                  <div className="text-3xl font-bold text-green-600 mb-1">27.1%</div>
                  <p className="text-sm text-green-700">Average emergency response time reduced from 8.5 to 6.2 minutes</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Emergency Detections Today</h4>
                  <div className="text-3xl font-bold text-blue-600 mb-1">47</div>
                  <p className="text-sm text-blue-700">Automatic emergency vehicle detection with 98% accuracy</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800 mb-2">Corridor Clear Time</h4>
                  <div className="text-3xl font-bold text-purple-600 mb-1">18s</div>
                  <p className="text-sm text-purple-700">Average time to clear traffic corridor for emergency vehicles</p>
                </div>
              </div>

              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Emergency Settings</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                    <span className="ml-2 text-sm text-gray-700">Auto-detect emergency vehicles</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                    <span className="ml-2 text-sm text-gray-700">Preemptive signal optimization</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-blue-600" />
                    <span className="ml-2 text-sm text-gray-700">Manual override alerts</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}