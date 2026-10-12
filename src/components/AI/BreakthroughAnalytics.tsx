import React from 'react';
import { Zap, Brain, Users, Target } from 'lucide-react';
import { useAIStore } from '../../store/aiStore';
import { SimpleLineChart, SimplePieChart } from '../Charts/SimpleCharts';

const BreakthroughAnalytics: React.FC = () => {
  const { systemMetrics } = useAIStore();

  const breakthroughMetrics = [
    { name: 'Commute Reduction', value: 15.2, target: 10, color: '#10B981', icon: '🚗' },
    { name: 'Emergency Response', value: 25.0, target: 20, color: '#EF4444', icon: '🚨' },
    { name: 'Road Rage Reduction', value: 45.0, target: 30, color: '#8B5CF6', icon: '😌' },
    { name: 'Weather Accidents', value: 30.0, target: 25, color: '#3B82F6', icon: '🌧️' },
    { name: 'Cost Savings', value: 80.0, target: 70, color: '#F59E0B', icon: '💰' },
    { name: 'AI Accuracy', value: 99.8, target: 95, color: '#06B6D4', icon: '🎯' }
  ];

  const monthlyPerformance = [
    { month: 'Jan', commute: 8.5, emergency: 15.2, rage: 25.0, weather: 18.5 },
    { month: 'Feb', commute: 10.2, emergency: 18.5, rage: 32.0, weather: 22.0 },
    { month: 'Mar', commute: 12.8, emergency: 21.0, rage: 38.5, weather: 26.5 },
    { month: 'Apr', commute: 14.5, emergency: 23.5, rage: 42.0, weather: 28.0 },
    { month: 'May', commute: 15.2, emergency: 25.0, rage: 45.0, weather: 30.0 }
  ];

  const aiFeatureUsage = [
    { name: 'Emotion Detection', value: 35, color: '#8B5CF6' },
    { name: 'Weather Fusion', value: 25, color: '#3B82F6' },
    { name: 'Emergency Audio', value: 20, color: '#EF4444' },
    { name: 'Festival Intelligence', value: 12, color: '#F59E0B' },
    { name: 'Accessibility AI', value: 8, color: '#10B981' }
  ];


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">🚀 Breakthrough AI Analytics</h2>
            <p className="text-purple-100">World's First Multi-Modal Traffic Intelligence System</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{systemMetrics.aiAccuracy}%</div>
            <div className="text-sm text-purple-200">Overall AI Accuracy</div>
          </div>
        </div>
      </div>

      {/* Key Breakthrough Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {breakthroughMetrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{metric.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{metric.name}</h3>
                  <p className="text-sm text-gray-600">Target: {metric.target}%</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold" style={{ color: metric.color }}>
                  {metric.value}%
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  metric.value >= metric.target ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {metric.value >= metric.target ? '✅ Achieved' : '🎯 In Progress'}
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min((metric.value / metric.target) * 100, 100)}%`,
                  backgroundColor: metric.color 
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>{metric.target}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Monthly Performance Trends</h3>
          <SimpleLineChart data={monthlyPerformance} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI Feature Usage Distribution</h3>
          <SimplePieChart data={aiFeatureUsage} />
        </div>
      </div>

      {/* World-First Achievements */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">🌟 World-First Breakthrough Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-900">Emotion Detection</span>
            </div>
            <p className="text-2xl font-bold text-purple-700">45%</p>
            <p className="text-xs text-purple-600">Road rage reduction through behavioral AI</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Sound-Vision Fusion</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">99.8%</p>
            <p className="text-xs text-blue-600">Emergency detection accuracy</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">Citizen Integration</span>
            </div>
            <p className="text-2xl font-bold text-green-700">15,247</p>
            <p className="text-xs text-green-600">Active WhatsApp participants</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-900">Cultural Intelligence</span>
            </div>
            <p className="text-2xl font-bold text-orange-700">500+</p>
            <p className="text-xs text-orange-600">Indian festivals tracked</p>
          </div>
        </div>
      </div>

      {/* Economic Impact */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">💰 Economic Impact Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">₹2,000Cr</div>
            <div className="text-sm text-green-700 font-medium">Annual Fuel Savings</div>
            <div className="text-xs text-green-600 mt-1">Across major Indian cities</div>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">₹5,000Cr</div>
            <div className="text-sm text-blue-700 font-medium">Productivity Gains</div>
            <div className="text-xs text-blue-600 mt-1">From reduced commute times</div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">₹1,500Cr</div>
            <div className="text-sm text-purple-700 font-medium">Accident Prevention</div>
            <div className="text-xs text-purple-600 mt-1">Healthcare cost avoidance</div>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-3xl font-bold text-orange-600">80%</div>
            <div className="text-sm text-orange-700 font-medium">Cost Reduction</div>
            <div className="text-xs text-orange-600 mt-1">vs traditional systems</div>
          </div>
        </div>
      </div>

      {/* Real-time System Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">⚡ Real-time System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">🤖 AI Systems</h4>
            <div className="space-y-2">
              {[
                { name: 'YOLOv8 Detection', status: 'active', accuracy: '95.2%' },
                { name: 'Audio Processing', status: 'active', accuracy: '99.8%' },
                { name: 'Behavioral AI', status: 'active', accuracy: '92.5%' },
                { name: 'Weather Integration', status: 'active', accuracy: '96.1%' }
              ].map((system, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-gray-700">{system.name}</span>
                  </div>
                  <span className="text-xs text-green-600 font-medium">{system.accuracy}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">🌐 Integrations</h4>
            <div className="space-y-2">
              {[
                { name: 'WhatsApp API', status: 'connected' },
                { name: 'IMD Weather', status: 'connected' },
                { name: 'Social Media', status: 'connected' },
                { name: 'Blockchain', status: 'connected' }
              ].map((integration, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-sm text-gray-700">{integration.name}</span>
                  </div>
                  <span className="text-xs text-blue-600 font-medium">Online</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">📊 Performance</h4>
            <div className="space-y-2">
              <div className="p-2 bg-green-50 rounded">
                <div className="text-sm font-medium text-green-900">System Uptime</div>
                <div className="text-lg font-bold text-green-700">99.97%</div>
              </div>
              <div className="p-2 bg-blue-50 rounded">
                <div className="text-sm font-medium text-blue-900">Response Time</div>
                <div className="text-lg font-bold text-blue-700">&lt; 100ms</div>
              </div>
              <div className="p-2 bg-purple-50 rounded">
                <div className="text-sm font-medium text-purple-900">Data Processing</div>
                <div className="text-lg font-bold text-purple-700">Real-time</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakthroughAnalytics;
