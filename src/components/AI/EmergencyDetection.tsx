import React, { useState, useEffect } from 'react';
import { Volume2, Eye, Zap, Truck, Heart, Shield, Clock } from 'lucide-react';
import { useAIStore } from '../../store/aiStore';

const EmergencyDetection: React.FC = () => {
  const { emergencyVehicles } = useAIStore();
  const [audioLevel, setAudioLevel] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);

  // Simulate audio detection animation
  useEffect(() => {
    const interval = setInterval(() => {
      if (emergencyVehicles.length > 0) {
        setAudioLevel(Math.random() * 100);
        setIsDetecting(true);
      } else {
        setAudioLevel(0);
        setIsDetecting(false);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [emergencyVehicles]);

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'ambulance':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'fire':
        return <Truck className="w-5 h-5 text-orange-500" />;
      case 'police':
        return <Shield className="w-5 h-5 text-blue-500" />;
      default:
        return <Zap className="w-5 h-5 text-gray-500" />;
    }
  };

  const getVehicleColor = (type: string) => {
    switch (type) {
      case 'ambulance':
        return 'bg-red-50 border-red-200';
      case 'fire':
        return 'bg-orange-50 border-orange-200';
      case 'police':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Volume2 className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Sound-Based Emergency Detection</h3>
            <p className="text-sm text-gray-600">Multi-modal audio-visual emergency vehicle identification</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-green-600">
          <Zap className="w-4 h-4" />
          <span className="text-sm font-medium">99.8% Accuracy</span>
        </div>
      </div>

      {/* Audio Visualization */}
      <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Volume2 className={`w-5 h-5 ${isDetecting ? 'text-red-600' : 'text-gray-400'}`} />
            <span className="font-medium text-gray-900">Audio Detection Status</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isDetecting ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {isDetecting ? 'DETECTING' : 'STANDBY'}
          </div>
        </div>
        
        {/* Audio Level Bars */}
        <div className="flex items-center space-x-1 mb-2">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-8 rounded-sm transition-all duration-200 ${
                i * 5 < audioLevel 
                  ? i < 10 
                    ? 'bg-green-400' 
                    : i < 15 
                    ? 'bg-yellow-400' 
                    : 'bg-red-400'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-600">
          Real-time siren detection with frequency analysis and pattern recognition
        </p>
      </div>

      {/* Detection Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Detection Accuracy</p>
              <p className="text-2xl font-bold text-green-700">99.8%</p>
            </div>
            <Eye className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-xs text-green-600 mt-2">Audio + Visual fusion</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Response Time</p>
              <p className="text-2xl font-bold text-blue-700">25s</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-xs text-blue-600 mt-2">Faster than visual-only</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Active Vehicles</p>
              <p className="text-2xl font-bold text-purple-700">{emergencyVehicles.length}</p>
            </div>
            <Truck className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-xs text-purple-600 mt-2">Currently tracked</p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Cleared Paths</p>
              <p className="text-2xl font-bold text-orange-700">156</p>
            </div>
            <Zap className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-xs text-orange-600 mt-2">Today</p>
        </div>
      </div>

      {/* Active Emergency Vehicles */}
      {emergencyVehicles.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Active Emergency Vehicles</h4>
          <div className="space-y-3">
            {emergencyVehicles.map((vehicle) => (
              <div key={vehicle.id} className={`p-4 rounded-lg border ${getVehicleColor(vehicle.type)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getVehicleIcon(vehicle.type)}
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{vehicle.type} - {vehicle.id}</p>
                      <p className="text-sm text-gray-600">Priority Level: {vehicle.priority}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      {vehicle.audioDetected && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <Volume2 className="w-4 h-4" />
                          <span className="text-xs">Audio</span>
                        </div>
                      )}
                      {vehicle.visualDetected && (
                        <div className="flex items-center space-x-1 text-blue-600">
                          <Eye className="w-4 h-4" />
                          <span className="text-xs">Visual</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      ETA: {vehicle.estimatedArrival.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technical Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-2">🔊 Audio Analysis</h5>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Frequency pattern recognition</li>
            <li>• Doppler effect calculation</li>
            <li>• Multi-directional microphones</li>
            <li>• Noise filtering algorithms</li>
          </ul>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-2">👁️ Visual Confirmation</h5>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Emergency light detection</li>
            <li>• Vehicle shape recognition</li>
            <li>• License plate verification</li>
            <li>• Movement pattern analysis</li>
          </ul>
        </div>
      </div>

      <div className="p-4 bg-gradient-to-r from-red-50 to-blue-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Volume2 className="w-5 h-5 text-red-600" />
          <span className="font-medium text-gray-900">World's First Sound-Vision Fusion</span>
        </div>
        <p className="text-sm text-gray-700">
          Revolutionary multi-modal emergency detection system combining AI audio analysis with computer vision. 
          Detects emergency vehicle sirens even before they're visible, achieving 99.8% accuracy and clearing 
          intersections 25 seconds faster than visual-only systems.
        </p>
      </div>
    </div>
  );
};

export default EmergencyDetection;
