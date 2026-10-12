import React, { useState } from 'react';
import { MessageSquare, Award, MapPin, Clock, CheckCircle, AlertCircle, Phone } from 'lucide-react';
import { useAIStore } from '../../store/aiStore';

const CitizenComplaints: React.FC = () => {
  const { complaints, addComplaint, updateComplaintStatus } = useAIStore();
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'text-green-600 bg-green-50';
      case 'processing':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-orange-600 bg-orange-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'congestion':
        return '🚗';
      case 'signal_malfunction':
        return '🚦';
      case 'accident':
        return '⚠️';
      default:
        return '📝';
    }
  };

  const handleResolveComplaint = (id: string) => {
    updateComplaintStatus(id, 'resolved');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <MessageSquare className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Citizen Complaint-to-Action Loop</h3>
            <p className="text-sm text-gray-600">WhatsApp/SMS integration with gamified participation</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-green-600">
          <Phone className="w-4 h-4" />
          <span className="text-sm font-medium">WhatsApp Active</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Complaints</p>
              <p className="text-2xl font-bold text-blue-700">{complaints.length}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-xs text-blue-600 mt-2">Last 30 days</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Resolved</p>
              <p className="text-2xl font-bold text-green-700">
                {complaints.filter(c => c.status === 'resolved').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-xs text-green-600 mt-2">92% resolution rate</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Avg Response</p>
              <p className="text-2xl font-bold text-purple-700">4.2h</p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-xs text-purple-600 mt-2">AI-powered triage</p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Active Citizens</p>
              <p className="text-2xl font-bold text-orange-700">15,247</p>
            </div>
            <Award className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-xs text-orange-600 mt-2">Traffic heroes</p>
        </div>
      </div>

      {/* WhatsApp Integration Demo */}
      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
        <div className="flex items-center space-x-2 mb-3">
          <Phone className="w-5 h-5 text-green-600" />
          <span className="font-medium text-gray-900">WhatsApp Integration</span>
        </div>
        <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
          <div className="text-sm">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                C
              </div>
              <span className="font-medium">Citizen Report</span>
              <span className="text-xs text-gray-500">2:30 PM</span>
            </div>
            <div className="bg-green-100 rounded-lg p-2 ml-10">
              <p className="text-sm">"Traffic signal at Master Canteen is not working properly. Very long wait times! 📍 Location shared"</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="text-sm">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                AI
              </div>
              <span className="font-medium">AI Traffic System</span>
              <span className="text-xs text-gray-500">2:32 PM</span>
            </div>
            <div className="bg-blue-100 rounded-lg p-2 ml-10">
              <p className="text-sm">"Thank you! Issue logged #TC001. Signal timing adjusted. You earned 50 Traffic Hero points! 🏆 Total: 1,250 points"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Recent Complaints</h4>
        {complaints.map((complaint) => (
          <div key={complaint.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getCategoryIcon(complaint.category)}</span>
                <div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{complaint.location}</span>
                  </div>
                  <p className="text-sm text-gray-600">{complaint.issue}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                  {complaint.status.replace('_', ' ')}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {complaint.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Award className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-600">{complaint.reporterPoints} points</span>
                </div>
                <span className="text-sm text-gray-500 capitalize">
                  {complaint.category.replace('_', ' ')}
                </span>
              </div>
              {complaint.status === 'processing' && (
                <button
                  onClick={() => handleResolveComplaint(complaint.id)}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                >
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Gamification Features */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-2">🏆 Traffic Hero Leaderboard</h5>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>🥇 Rajesh Kumar</span>
              <span className="font-semibold">2,450 points</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>🥈 Priya Sharma</span>
              <span className="font-semibold">2,180 points</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>🥉 Amit Patel</span>
              <span className="font-semibold">1,920 points</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-2">💰 Reward System</h5>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 50 points per accurate report</li>
            <li>• 100 points for photo evidence</li>
            <li>• 200 points for video evidence</li>
            <li>• Redeem for public transport credits</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <MessageSquare className="w-5 h-5 text-green-600" />
          <span className="font-medium text-gray-900">Revolutionary Citizen Engagement</span>
        </div>
        <p className="text-sm text-gray-700">
          World's first citizen-integrated traffic management system with WhatsApp/SMS integration. 
          NLP algorithms analyze complaint patterns and automatically adjust signals. Gamification 
          system rewards accurate reports with points redeemable for public transport credits.
        </p>
      </div>
    </div>
  );
};

export default CitizenComplaints;
