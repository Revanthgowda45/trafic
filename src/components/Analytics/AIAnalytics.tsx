import React, { useState } from 'react';
import { Brain, Camera, Target, Zap, TrendingUp, Clock, Activity } from 'lucide-react';

export default function AIAnalytics() {
  const [selectedMetric, setSelectedMetric] = useState('detection');

  const aiMetrics = {
    detection: {
      title: 'YOLOv8 Detection Performance',
      accuracy: 95.2,
      inferenceTime: 11.2,
      throughput: '89 FPS',
      detections: 247832
    },
    optimization: {
      title: 'Reinforcement Learning Optimization',
      improvement: 12.1,
      episodes: 15643,
      convergence: 'Optimal',
      rewardScore: 847.3
    },
    prediction: {
      title: 'Traffic Flow Prediction',
      accuracy: 91.7,
      horizon: '30 minutes',
      modelType: 'LSTM',
      dataPoints: 2.4
    }
  };

  const detectionStats = [
    { type: 'Cars', count: 1834, percentage: 68, color: 'bg-blue-500' },
    { type: 'Motorcycles', count: 456, percentage: 17, color: 'bg-green-500' },
    { type: 'Trucks', count: 234, percentage: 9, color: 'bg-orange-500' },
    { type: 'Buses', count: 145, percentage: 5, color: 'bg-purple-500' },
    { type: 'Emergency', count: 12, percentage: 1, color: 'bg-red-500' }
  ];

  const optimizationResults = [
    { intersection: 'Master Canteen Square', improvement: 15.2, confidence: 98 },
    { intersection: 'Kalpana Square', improvement: 11.8, confidence: 95 },
    { intersection: 'Rajmahal Square', improvement: 9.4, confidence: 92 },
    { intersection: 'Sishu Bhawan Square', improvement: 13.7, confidence: 97 }
  ];

  return (
    <div className="space-y-6">
      {/* AI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer transition-all ${
            selectedMetric === 'detection' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
          }`}
          onClick={() => setSelectedMetric('detection')}
        >
          <div className="flex items-center justify-between mb-4">
            <Camera className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">95.2%</span>
          </div>
          <h3 className="font-semibold text-gray-900">Computer Vision</h3>
          <p className="text-sm text-gray-600 mt-1">YOLOv8 vehicle detection accuracy</p>
        </div>

        <div 
          className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer transition-all ${
            selectedMetric === 'optimization' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:shadow-md'
          }`}
          onClick={() => setSelectedMetric('optimization')}
        >
          <div className="flex items-center justify-between mb-4">
            <Brain className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-600">12.1%</span>
          </div>
          <h3 className="font-semibold text-gray-900">AI Optimization</h3>
          <p className="text-sm text-gray-600 mt-1">Traffic flow improvement</p>
        </div>

        <div 
          className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer transition-all ${
            selectedMetric === 'prediction' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:shadow-md'
          }`}
          onClick={() => setSelectedMetric('prediction')}
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-600">91.7%</span>
          </div>
          <h3 className="font-semibold text-gray-900">Prediction</h3>
          <p className="text-sm text-gray-600 mt-1">Traffic pattern forecasting</p>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Current Metric Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              {aiMetrics[selectedMetric as keyof typeof aiMetrics].title}
            </h3>
          </div>

          <div className="p-6">
            {selectedMetric === 'detection' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Inference Time</p>
                    <p className="text-2xl font-bold text-blue-600">11.2ms</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Processing Speed</p>
                    <p className="text-2xl font-bold text-green-600">89 FPS</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Vehicle Type Distribution</h4>
                  <div className="space-y-3">
                    {detectionStats.map((stat, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${stat.color} mr-3`}></div>
                          <span className="text-sm font-medium text-gray-700">{stat.type}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600">{stat.count}</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`${stat.color} h-2 rounded-full`}
                              style={{ width: `${stat.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-8">{stat.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedMetric === 'optimization' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Training Episodes</p>
                    <p className="text-2xl font-bold text-green-600">15,643</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Reward Score</p>
                    <p className="text-2xl font-bold text-purple-600">847.3</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Intersection Performance</h4>
                  <div className="space-y-3">
                    {optimizationResults.map((result, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-900">{result.intersection}</span>
                          <span className="text-sm font-bold text-green-600">+{result.improvement}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">AI Confidence</span>
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                              <div 
                                className="bg-blue-500 h-1.5 rounded-full"
                                style={{ width: `${result.confidence}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-700">{result.confidence}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedMetric === 'prediction' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Prediction Horizon</p>
                    <p className="text-2xl font-bold text-purple-600">30 min</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Data Points</p>
                    <p className="text-2xl font-bold text-indigo-600">2.4M</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">LSTM Model Architecture</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>• 3 Hidden Layers (128, 64, 32 neurons)</p>
                    <p>• Dropout: 0.2 for regularization</p>
                    <p>• Adam optimizer with learning rate 0.001</p>
                    <p>• Sequence length: 60 time steps</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Prediction Categories</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Short-term (5-15 min)</span>
                      <span className="text-sm font-bold text-green-600">96.4% accuracy</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Medium-term (15-30 min)</span>
                      <span className="text-sm font-bold text-blue-600">91.7% accuracy</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Long-term (30+ min)</span>
                      <span className="text-sm font-bold text-purple-600">87.2% accuracy</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Real-time Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Real-time AI Performance
            </h3>
          </div>

          <div className="p-6 space-y-6">
            {/* Live Processing Stats */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Processing Pipeline</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">YOLOv8 Detection</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">11.2ms</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">RL Optimization</span>
                  </div>
                  <span className="text-sm font-bold text-blue-600">23.7ms</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">Signal Update</span>
                  </div>
                  <span className="text-sm font-bold text-purple-600">5.1ms</span>
                </div>
              </div>
            </div>

            {/* Model Performance Today */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Today's Performance</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">1.2M</div>
                  <div className="text-xs text-gray-600">Detections</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">847</div>
                  <div className="text-xs text-gray-600">Optimizations</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">99.7%</div>
                  <div className="text-xs text-gray-600">Uptime</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">0.03%</div>
                  <div className="text-xs text-gray-600">Error Rate</div>
                </div>
              </div>
            </div>

            {/* Hardware Utilization */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Hardware Utilization</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">GPU Utilization</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Memory Usage</span>
                    <span className="font-medium">64%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full" style={{ width: '64%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">CPU Usage</span>
                    <span className="font-medium">42%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full" style={{ width: '42%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}