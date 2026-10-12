import React from 'react';
import { Heart, Clock, Eye, Users, Accessibility, Timer, TrendingUp } from 'lucide-react';
import { useAIStore } from '../../store/aiStore';

const AccessibilityAI: React.FC = () => {
  const { accessibilityData } = useAIStore();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-pink-100 rounded-lg">
            <Heart className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Elderly & Disabled Priority Recognition</h3>
            <p className="text-sm text-gray-600">Inclusive AI designed for Indian accessibility needs</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-pink-600">
          <Accessibility className="w-4 h-4" />
          <span className="text-sm font-medium">Inclusive AI Active</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Elderly Detected</p>
              <p className="text-2xl font-bold text-blue-700">{accessibilityData.elderlyDetected}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-xs text-blue-600 mt-2">Today</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Disabled Detected</p>
              <p className="text-2xl font-bold text-purple-700">{accessibilityData.disabledDetected}</p>
            </div>
            <Accessibility className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-xs text-purple-600 mt-2">Today</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Extended Crossings</p>
              <p className="text-2xl font-bold text-green-700">{accessibilityData.extendedCrossings}</p>
            </div>
            <Clock className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-xs text-green-600 mt-2">Auto-extensions</p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Avg Extension</p>
              <p className="text-2xl font-bold text-orange-700">{accessibilityData.averageExtensionTime}s</p>
            </div>
            <Timer className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-xs text-orange-600 mt-2">Additional time</p>
        </div>
      </div>

      {/* AI Detection Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">🤖 AI Detection Methods</h4>
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h5 className="font-medium text-blue-900 mb-2">👴 Elderly Recognition</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Gait pattern analysis</li>
                <li>• Walking speed detection</li>
                <li>• Posture recognition</li>
                <li>• Walking aid identification</li>
                <li>• Age estimation algorithms</li>
              </ul>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h5 className="font-medium text-purple-900 mb-2">♿ Disability Detection</h5>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Wheelchair recognition</li>
                <li>• Walking stick detection</li>
                <li>• Mobility aid identification</li>
                <li>• Guide dog recognition</li>
                <li>• Movement pattern analysis</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">🚦 Smart Responses</h4>
          <div className="space-y-3">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h5 className="font-medium text-green-900 mb-2">⏰ Automatic Extensions</h5>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Doubles crossing time automatically</li>
                <li>• Gradual signal changes</li>
                <li>• Audio assistance signals</li>
                <li>• Priority green phases</li>
                <li>• Emergency override capability</li>
              </ul>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <h5 className="font-medium text-orange-900 mb-2">🧠 Smart Learning</h5>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Regular user recognition</li>
                <li>• Pattern learning</li>
                <li>• Predictive adjustments</li>
                <li>• Personalized timing</li>
                <li>• Route optimization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Activity */}
      <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
        <h4 className="font-semibold text-gray-900 mb-3">🔴 Live Accessibility Events</h4>
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium text-gray-900">Elderly person detected at Master Canteen Square</p>
                  <p className="text-sm text-gray-600">Crossing time extended to 45 seconds</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">2 min ago</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium text-gray-900">Wheelchair user approaching Kalpana Square</p>
                  <p className="text-sm text-gray-600">Pre-adjusting signal timing</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">5 min ago</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium text-gray-900">Regular user "Mr. Sharma" recognized</p>
                  <p className="text-sm text-gray-600">Applied learned crossing pattern</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">8 min ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Indian Context Features */}
      <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
        <h4 className="font-semibold text-gray-900 mb-3">🇮🇳 Indian Accessibility Context</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-3">
            <h5 className="font-medium text-gray-900 mb-2">Cultural Sensitivity</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Respects traditional walking aids</li>
              <li>• Recognizes cultural clothing patterns</li>
              <li>• Understands family group dynamics</li>
              <li>• Adapts to regional mobility patterns</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-3">
            <h5 className="font-medium text-gray-900 mb-2">Local Adaptations</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Monsoon accessibility considerations</li>
              <li>• Festival crowd accommodations</li>
              <li>• Multi-generational family support</li>
              <li>• Regional language audio cues</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Detection Accuracy</p>
              <p className="text-2xl font-bold text-green-700">96.8%</p>
            </div>
            <Eye className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-xs text-green-600 mt-2">AI recognition rate</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Safety Incidents</p>
              <p className="text-2xl font-bold text-blue-700">0</p>
            </div>
            <Heart className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-xs text-blue-600 mt-2">This month</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">User Satisfaction</p>
              <p className="text-2xl font-bold text-purple-700">98.5%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-xs text-purple-600 mt-2">Accessibility rating</p>
        </div>
      </div>

      <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Heart className="w-5 h-5 text-pink-600" />
          <span className="font-medium text-gray-900">World's First Inclusive Traffic AI</span>
        </div>
        <p className="text-sm text-gray-700">
          Revolutionary computer vision system that detects elderly pedestrians, wheelchairs, and walking aids. 
          Automatically doubles crossing time for detected individuals and remembers regular users for predictive 
          adjustments. First traffic system designed specifically with Indian accessibility needs and cultural 
          sensitivity in mind.
        </p>
      </div>
    </div>
  );
};

export default AccessibilityAI;
