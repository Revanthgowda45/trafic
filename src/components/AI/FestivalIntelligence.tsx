import React from 'react';
import { Calendar, TrendingUp, Users, MapPin, Sparkles, Heart } from 'lucide-react';
import { useAIStore } from '../../store/aiStore';
import { format } from 'date-fns';

const FestivalIntelligence: React.FC = () => {
  const { festivals, activeFestivals } = useAIStore();

  const getFestivalIcon = (type: string) => {
    switch (type) {
      case 'religious':
        return '🕉️';
      case 'cultural':
        return '🎭';
      case 'sports':
        return '🏏';
      case 'shopping':
        return '🛍️';
      default:
        return '🎉';
    }
  };

  const getCrowdColor = (level: string) => {
    switch (level) {
      case 'extreme':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-green-600 bg-green-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Sparkles className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Festival & Event Crowd Intelligence</h3>
            <p className="text-sm text-gray-600">AI-powered cultural event traffic prediction</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-orange-600">
          <Heart className="w-4 h-4" />
          <span className="text-sm font-medium">Cultural AI Active</span>
        </div>
      </div>

      {activeFestivals.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            <span className="font-medium text-orange-900">Active Festival Alert</span>
          </div>
          <p className="text-sm text-orange-700">
            {activeFestivals.length} festival(s) affecting traffic patterns. Special routing and timing adjustments are active.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {festivals.slice(0, 4).map((festival) => (
          <div key={festival.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getFestivalIcon(festival.type)}</span>
                <div>
                  <h4 className="font-medium text-gray-900">{festival.name}</h4>
                  <p className="text-xs text-gray-600">{format(festival.date, 'MMM dd, yyyy')}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getCrowdColor(festival.crowdPrediction)}`}>
                {festival.crowdPrediction.replace('_', ' ')}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Traffic Increase</span>
                <span className="font-semibold text-red-600">+{festival.expectedTrafficIncrease}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Special Routes</span>
                <span className="font-semibold text-blue-600">{festival.specialRoutes.length}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Festivals Tracked</p>
              <p className="text-2xl font-bold text-purple-700">500+</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-xs text-purple-600 mt-2">Indian cultural events</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Prediction Accuracy</p>
              <p className="text-2xl font-bold text-blue-700">92.5%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-xs text-blue-600 mt-2">Crowd prediction rate</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Traffic Optimization</p>
              <p className="text-2xl font-bold text-green-700">65%</p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-xs text-green-600 mt-2">Congestion reduction</p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">AI Data Sources</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">📱 Social Media Analysis</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Twitter/X trend monitoring</li>
              <li>• Instagram event hashtags</li>
              <li>• Facebook event RSVPs</li>
              <li>• Google search patterns</li>
            </ul>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">🗓️ Cultural Intelligence</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Regional festival calendars</li>
              <li>• Religious observances</li>
              <li>• Cricket match schedules</li>
              <li>• Shopping season patterns</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Sparkles className="w-5 h-5 text-orange-600" />
          <span className="font-medium text-gray-900">World's First Cultural Traffic AI</span>
        </div>
        <p className="text-sm text-gray-700">
          Revolutionary system that understands Indian cultural patterns. Analyzes social media trends, Google searches, 
          and local calendars to predict traffic surges for 500+ festivals including Diwali, Kali Puja, cricket matches, 
          and regional celebrations. Creates dynamic alternate routes automatically.
        </p>
      </div>
    </div>
  );
};

export default FestivalIntelligence;
