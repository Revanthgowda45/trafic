import React, { useState, useRef, useCallback } from 'react';
import { Upload, Camera, Brain, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { aiService, AIAnalysisResult, EmotionDetectionResult } from '../services/aiService';

interface AIAnalysisDashboardProps {
  selectedIntersection?: string;
}

export const AIAnalysisDashboard: React.FC<AIAnalysisDashboardProps> = ({ 
  selectedIntersection = '1' 
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [demoResult, setDemoResult] = useState<EmotionDetectionResult | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Convert image to base64 for preview
      const imageBase64 = await aiService.fileToBase64(file);
      setSelectedImage(imageBase64);

      // Perform AI analysis
      const result = await aiService.analyzeIntersection(file, selectedIntersection);
      setAnalysisResult(result);

    } catch (error) {
      console.error('AI analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedIntersection]);

  const handleDemoScenario = useCallback(async (scenario: 'normal' | 'road_rage' | 'stress' | 'calm') => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await aiService.generateDemoData(scenario);
      setDemoResult(result);
      setSelectedImage(null); // Clear uploaded image
    } catch (error) {
      console.error('Demo generation failed:', error);
      setError(error instanceof Error ? error.message : 'Demo generation failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getAlertLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  const currentResult = analysisResult || demoResult;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Traffic Analysis</h2>
            <p className="text-sm text-gray-600">YOLOv8 + Emotion Detection</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">AI Models Active</span>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Image Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          
          <div className="flex flex-col items-center space-y-4">
            <Upload className="h-12 w-12 text-gray-400" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Upload Traffic Image</h3>
              <p className="text-sm text-gray-600">Real-time AI analysis with YOLOv8 + Emotion Detection</p>
            </div>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Camera className="h-4 w-4" />
              <span>{isAnalyzing ? 'Analyzing...' : 'Select Image'}</span>
            </button>
          </div>
        </div>

        {/* Demo Scenarios */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Demo Scenarios</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'normal', label: '✅ Normal Traffic', color: 'bg-green-600 hover:bg-green-700' },
              { key: 'road_rage', label: '🚨 Road Rage', color: 'bg-red-600 hover:bg-red-700' },
              { key: 'stress', label: '😰 High Stress', color: 'bg-orange-600 hover:bg-orange-700' },
              { key: 'calm', label: '😌 Calm Drivers', color: 'bg-blue-600 hover:bg-blue-700' }
            ].map(scenario => (
              <button
                key={scenario.key}
                onClick={() => handleDemoScenario(scenario.key as any)}
                disabled={isAnalyzing}
                className={`px-3 py-2 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${scenario.color}`}
              >
                {scenario.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isAnalyzing && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <span className="text-gray-600">AI models analyzing...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 font-medium">Analysis Failed</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Results Display */}
      {currentResult && (
        <div className="space-y-6">
          {/* Image Preview */}
          {selectedImage && (
            <div className="flex justify-center">
              <img
                src={selectedImage}
                alt="Analyzed traffic"
                className="max-w-md max-h-64 object-contain rounded-lg border"
              />
            </div>
          )}

          {/* AI Recommendations */}
          {analysisResult?.ai_recommendation && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <span>AI Recommendations</span>
                </h3>
                
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityBadgeColor(analysisResult.ai_recommendation.priority_level)}`}>
                  {analysisResult.ai_recommendation.priority_level.toUpperCase()} PRIORITY
                </div>
              </div>

              <div className="space-y-3">
                {aiService.formatRecommendations(analysisResult.ai_recommendation.recommendations).map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{rec}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Signal Adjustment: <span className="font-medium">{analysisResult.ai_recommendation.signal_adjustment > 0 ? '+' : ''}{analysisResult.ai_recommendation.signal_adjustment}s</span>
                </span>
                <span className="text-gray-600">
                  Confidence: <span className="font-medium">{analysisResult.ai_recommendation.confidence}%</span>
                </span>
              </div>
            </div>
          )}

          {/* Traffic Analysis */}
          {(analysisResult?.traffic_analysis || currentResult?.data) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicle Detection */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                  <span>🚗</span>
                  <span>YOLOv8 Detection</span>
                </h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicles:</span>
                    <span className="font-medium">{analysisResult?.traffic_analysis?.vehicle_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pedestrians:</span>
                    <span className="font-medium">{analysisResult?.traffic_analysis?.pedestrian_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Emergency Vehicles:</span>
                    <span className="font-medium text-red-600">{analysisResult?.traffic_analysis?.emergency_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Speed:</span>
                    <span className="font-medium">{analysisResult?.traffic_analysis?.average_speed || 0} km/h</span>
                  </div>
                </div>
              </div>

              {/* Emotion Analysis */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                  <span>🧠</span>
                  <span>Emotion Analysis</span>
                </h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Road Rage Risk:</span>
                    <span className={`font-medium ${(analysisResult?.emotion_analysis?.overall_analysis?.road_rage_percentage || currentResult?.data?.overall_analysis?.road_rage_percentage || 0) > 30 ? 'text-red-600' : 'text-green-600'}`}>
                      {(analysisResult?.emotion_analysis?.overall_analysis?.road_rage_percentage || currentResult?.data?.overall_analysis?.road_rage_percentage || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stress Level:</span>
                    <span className={`font-medium ${(analysisResult?.emotion_analysis?.overall_analysis?.stress_percentage || currentResult?.data?.overall_analysis?.stress_percentage || 0) > 50 ? 'text-orange-600' : 'text-green-600'}`}>
                      {(analysisResult?.emotion_analysis?.overall_analysis?.stress_percentage || currentResult?.data?.overall_analysis?.stress_percentage || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Safety Score:</span>
                    <span className={`font-medium ${(analysisResult?.emotion_analysis?.overall_analysis?.safety_score || currentResult?.data?.overall_analysis?.safety_score || 50) < 40 ? 'text-red-600' : 'text-green-600'}`}>
                      {(analysisResult?.emotion_analysis?.overall_analysis?.safety_score || currentResult?.data?.overall_analysis?.safety_score || 50)}/100
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Alert Level:</span>
                    <span className={`font-medium ${getAlertLevelColor(analysisResult?.emotion_analysis?.overall_analysis?.alert_level || currentResult?.data?.overall_analysis?.alert_level || 'normal')}`}>
                      {(analysisResult?.emotion_analysis?.overall_analysis?.alert_level || currentResult?.data?.overall_analysis?.alert_level || 'normal').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Model Status */}
          {analysisResult?.model_status && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">AI Model Status</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                {Object.entries(analysisResult.model_status).map(([model, status]) => (
                  <div key={model} className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${status.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="capitalize">{model}</span>
                    <span className="text-gray-600">({status.accuracy}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      {!currentResult && !isAnalyzing && (
        <div className="text-center py-8 text-gray-500">
          <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Upload a traffic image or try a demo scenario to see AI analysis in action</p>
          <p className="text-sm mt-2">Powered by YOLOv8 vehicle detection + emotion recognition AI</p>
        </div>
      )}
    </div>
  );
};
