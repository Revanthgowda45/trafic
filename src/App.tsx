import { useState } from 'react';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import BreakthroughAnalytics from './components/AI/BreakthroughAnalytics';
import EmotionDetection from './components/AI/EmotionDetection';
import WeatherFusion from './components/AI/WeatherFusion';
import FestivalIntelligence from './components/AI/FestivalIntelligence';
import EmergencyDetection from './components/AI/EmergencyDetection';
import CitizenComplaints from './components/AI/CitizenComplaints';
import AccessibilityAI from './components/AI/AccessibilityAI';
import SchoolZoneProtection from './components/AI/SchoolZoneProtection';
import CarbonCreditRewards from './components/AI/CarbonCreditRewards';
import VideoDetection from './components/AI/VideoDetection';
import FourLaneAnalyzer from './components/AI/FourLaneAnalyzer';
import { AIAnalysisDashboard } from './components/AIAnalysisDashboard';
import TrafficMap from './components/TrafficMap';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Live Traffic Map */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TrafficMap height="500px" showControls={true} />
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🚨 Live Alerts</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <div>
                        <p className="text-sm font-medium text-red-900">High congestion at Vani Vihar Square</p>
                        <p className="text-xs text-red-600">2 min ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <div>
                        <p className="text-sm font-medium text-yellow-900">Emergency vehicle detected</p>
                        <p className="text-xs text-yellow-600">5 min ago</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 System Overview</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Intersections</span>
                      <span className="font-bold text-blue-600">156</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Active Signals</span>
                      <span className="font-bold text-green-600">154</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Emergency Active</span>
                      <span className="font-bold text-red-600">2</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">AI Efficiency</span>
                      <span className="font-bold text-purple-600">+24.3%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Avg Wait Time</span>
                      <span className="font-bold text-orange-600">42s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );


      case 'ai-analysis':
        return (
          <div className="space-y-6">
            <div>
              <AIAnalysisDashboard selectedIntersection="1" />
            </div>
          </div>
        );
      


      case 'video-detection':
        return (
          <div className="space-y-6">
            <VideoDetection />
          </div>
        );

      case 'four-direction-analyzer':
        // Rendered in persistent container below to preserve state across tab switches
        return null;

      case 'intersections':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Intersection Management</h2>
              <p className="text-gray-600">Monitor and control traffic intersections across the city</p>
            </div>
            <TrafficMap height="600px" showControls={true} />
          </div>
        );
      
      case 'performance':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Performance Analytics</h2>
              <p className="text-gray-600">AI optimization results and system performance metrics</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Performance Metrics</h3>
              <p className="text-gray-600">Detailed performance analytics will be available here.</p>
            </div>
          </div>
        );
      
      case 'ai-analytics':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Analytics Dashboard</h2>
              <p className="text-gray-600">YOLOv11x detection, reinforcement learning, and predictive analytics</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="text-6xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Analytics Dashboard</h3>
              <p className="text-gray-600">Advanced AI analytics and insights will be available here.</p>
            </div>
          </div>
        );


      case 'breakthrough-analytics':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">🚀 Breakthrough AI Analytics</h2>
              <p className="text-gray-600">World-first multi-modal traffic intelligence system performance</p>
            </div>
            <BreakthroughAnalytics />
          </div>
        );

      case 'emotion-detection':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">🧠 Traffic Emotion Detection</h2>
              <p className="text-gray-600">AI-powered driver behavior analysis and road rage prevention</p>
            </div>
            <EmotionDetection />
          </div>
        );

      case 'weather-fusion':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">⚡ Weather-Traffic Fusion</h2>
              <p className="text-gray-600">Quantum-speed weather-predictive traffic control system</p>
            </div>
            <WeatherFusion />
          </div>
        );

      case 'festival-intelligence':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 Festival Intelligence</h2>
              <p className="text-gray-600">AI-powered cultural event and crowd prediction system</p>
            </div>
            <FestivalIntelligence />
          </div>
        );

      case 'emergency-detection':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">🔊 Emergency Detection</h2>
              <p className="text-gray-600">Sound-vision fusion for emergency vehicle identification</p>
            </div>
            <EmergencyDetection />
          </div>
        );

      case 'citizen-complaints':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">📱 Citizen Engagement</h2>
              <p className="text-gray-600">WhatsApp integration and gamified traffic participation</p>
            </div>
            <CitizenComplaints />
          </div>
        );

      case 'school-zones':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">🎓 School Zone Protection</h2>
              <p className="text-gray-600">AI-powered child safety and time-warp protection system</p>
            </div>
            <SchoolZoneProtection />
          </div>
        );

      case 'carbon-credits':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">🌱 Carbon Credit Rewards</h2>
              <p className="text-gray-600">Blockchain-based eco-friendly driving incentive system</p>
            </div>
            <CarbonCreditRewards />
          </div>
        );

      case 'accessibility':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">♿ Accessibility AI</h2>
              <p className="text-gray-600">Elderly and disabled priority recognition system</p>
            </div>
            <AccessibilityAI />
          </div>
        );
      
      case 'emergency':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Emergency Vehicle Management</h2>
              <p className="text-gray-600">Priority routing and signal optimization for emergency vehicles</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="text-6xl mb-4">🚨</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Emergency Mode</h3>
              <p className="text-gray-600">Emergency vehicle management controls will be available here.</p>
            </div>
          </div>
        );
      
      case 'alerts':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">System Alerts</h2>
              <p className="text-gray-600">Monitor system alerts and incidents</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="text-6xl mb-4">🚨</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Alerts Panel</h3>
              <p className="text-gray-600">System alerts and incident monitoring will be available here.</p>
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">System Settings</h2>
              <p className="text-gray-600">Configure system parameters and preferences</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="text-6xl mb-4">⚙️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Settings Panel</h3>
              <p className="text-gray-600">System configuration and administrative controls will be available here.</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 p-6 lg:p-8">
          {/* Debug indicator - remove this later */}
          <div className="lg:hidden fixed top-4 right-4 z-50 bg-blue-500 text-white px-3 py-1 rounded text-sm">
            Sidebar: {sidebarOpen ? 'Open' : 'Closed'} | Click ☰ to toggle
          </div>
          
          <div className="max-w-7xl mx-auto">
            {/* Keep FourLaneAnalyzer persistently mounted so page/tab switching does not close it or wipe out state */}
            <div className={activeTab === 'four-direction-analyzer' ? 'block' : 'hidden'}>
              <FourLaneAnalyzer />
            </div>
            {activeTab !== 'four-direction-analyzer' && renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;