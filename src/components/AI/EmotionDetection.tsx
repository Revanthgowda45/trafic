import React from 'react';
import { Brain, AlertTriangle, TrendingDown, Eye } from 'lucide-react';
import { useAIStore } from '../../store/aiStore';

const EmotionDetection: React.FC = () => {
  const { emotionData } = useAIStore();
  const currentData = emotionData[0]; // Using first intersection for demo

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Traffic Emotion Detection</h3>
            <p className="text-sm text-gray-600">Real-time driver behavior analysis</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-green-600">
          <TrendingDown className="w-4 h-4" />
          <span className="text-sm font-medium">45% Rage Reduction</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Aggressive Drivers</p>
              <p className="text-2xl font-bold text-red-700">{currentData.aggressiveDrivers}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-xs text-red-600 mt-2">Currently detected</p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Road Rage Incidents</p>
              <p className="text-2xl font-bold text-orange-700">{currentData.roadRageIncidents}</p>
            </div>
            <Eye className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-xs text-orange-600 mt-2">Last 24 hours</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Prevention Rate</p>
              <p className="text-2xl font-bold text-green-700">{currentData.rageReductionPercentage}%</p>
            </div>
            <Brain className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-xs text-green-600 mt-2">AI intervention success</p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">How It Works</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">🔍 Detection Methods</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Windshield reflection analysis</li>
              <li>• Aggressive lane change patterns</li>
              <li>• Facial expression recognition</li>
              <li>• Vehicle behavior analysis</li>
            </ul>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">🚦 AI Response</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Extended green lights for aggressive drivers</li>
              <li>• Prevent dangerous lane changes</li>
              <li>• Smooth traffic flow optimization</li>
              <li>• Real-time behavioral feedback</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-purple-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <span className="font-medium text-purple-900">World's First Traffic Emotion AI</span>
        </div>
        <p className="text-sm text-purple-700">
          Revolutionary technology that reduces road rage incidents by 45% through behavioral psychology 
          and computer vision integration. Automatically adjusts signal timing to prevent aggressive driving situations.
        </p>
      </div>
    </div>
  );
};

export default EmotionDetection;
