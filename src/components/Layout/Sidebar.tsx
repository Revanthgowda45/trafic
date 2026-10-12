import React from 'react';
import { 
  BarChart3, 
  MapPin, 
  Zap, 
  Brain, 
  AlertTriangle, 
  Settings,
  Home,
  X,
  Heart,
  Cloud,
  Calendar,
  Volume2,
  MessageSquare,
  GraduationCap,
  Leaf,
  Accessibility,
  TrendingUp,
  Sparkles,
  Shield,
  Users,
  Camera,
  Target
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

interface NavigationItem {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  badge?: string;
  color?: string;
  isNew?: boolean;
}

const navigationSections: NavigationSection[] = [
  {
    title: "Overview",
    items: [
      { id: 'dashboard', name: 'Dashboard', icon: Home, color: 'blue' },
      { id: 'ai-analysis', name: 'AI Analysis Hub', icon: Brain, color: 'purple', isNew: true, badge: '🧠' },
      { id: 'video-detection', name: 'Video Detection', icon: Camera, color: 'purple', isNew: true, badge: '🎥' },
      { id: 'four-direction-analyzer', name: '4-Lane Monitor', icon: Target, color: 'orange', isNew: true, badge: '🚦' },
      { id: 'breakthrough-analytics', name: 'Breakthrough Analytics', icon: TrendingUp, color: 'purple', isNew: true, badge: '🚀' }
    ]
  },
  {
    title: "AI Breakthrough Features",
    items: [
      { id: 'emotion-detection', name: 'Emotion Detection', icon: Heart, color: 'pink', badge: '🧠' },
      { id: 'weather-fusion', name: 'Weather Fusion', icon: Cloud, color: 'blue', badge: '⚡' },
      { id: 'festival-intelligence', name: 'Festival Intelligence', icon: Calendar, color: 'orange', badge: '🎉' },
      { id: 'emergency-detection', name: 'Emergency Detection', icon: Volume2, color: 'red', badge: '🔊' },
      { id: 'citizen-complaints', name: 'Citizen Engagement', icon: MessageSquare, color: 'green', badge: '📱' },
      { id: 'school-zones', name: 'School Zones', icon: GraduationCap, color: 'yellow', badge: '🎓' },
      { id: 'carbon-credits', name: 'Carbon Credits', icon: Leaf, color: 'green', badge: '🌱' },
      { id: 'accessibility', name: 'Accessibility AI', icon: Accessibility, color: 'purple', badge: '♿' }
    ]
  },
  {
    title: "Traffic Management",
    items: [
      { id: 'intersections', name: 'Intersections', icon: MapPin, color: 'indigo' },
      { id: 'performance', name: 'Performance', icon: BarChart3, color: 'cyan' },
      { id: 'ai-analytics', name: 'AI Analytics', icon: Brain, color: 'violet' }
    ]
  },
  {
    title: "System Controls",
    items: [
      { id: 'emergency', name: 'Emergency Mode', icon: Zap, color: 'red' },
      { id: 'alerts', name: 'Alerts', icon: AlertTriangle, color: 'amber' },
      { id: 'settings', name: 'Settings', icon: Settings, color: 'gray' }
    ]
  }
];

const getColorClasses = (color: string, isActive: boolean) => {
  const colors = {
    blue: isActive ? 'bg-blue-50 text-blue-700 border-blue-500' : 'hover:bg-blue-50 hover:text-blue-700',
    purple: isActive ? 'bg-purple-50 text-purple-700 border-purple-500' : 'hover:bg-purple-50 hover:text-purple-700',
    pink: isActive ? 'bg-pink-50 text-pink-700 border-pink-500' : 'hover:bg-pink-50 hover:text-pink-700',
    red: isActive ? 'bg-red-50 text-red-700 border-red-500' : 'hover:bg-red-50 hover:text-red-700',
    orange: isActive ? 'bg-orange-50 text-orange-700 border-orange-500' : 'hover:bg-orange-50 hover:text-orange-700',
    green: isActive ? 'bg-green-50 text-green-700 border-green-500' : 'hover:bg-green-50 hover:text-green-700',
    yellow: isActive ? 'bg-yellow-50 text-yellow-700 border-yellow-500' : 'hover:bg-yellow-50 hover:text-yellow-700',
    indigo: isActive ? 'bg-indigo-50 text-indigo-700 border-indigo-500' : 'hover:bg-indigo-50 hover:text-indigo-700',
    cyan: isActive ? 'bg-cyan-50 text-cyan-700 border-cyan-500' : 'hover:bg-cyan-50 hover:text-cyan-700',
    teal: isActive ? 'bg-teal-50 text-teal-700 border-teal-500' : 'hover:bg-teal-50 hover:text-teal-700',
    violet: isActive ? 'bg-violet-50 text-violet-700 border-violet-500' : 'hover:bg-violet-50 hover:text-violet-700',
    amber: isActive ? 'bg-amber-50 text-amber-700 border-amber-500' : 'hover:bg-amber-50 hover:text-amber-700',
    gray: isActive ? 'bg-gray-50 text-gray-700 border-gray-500' : 'hover:bg-gray-50 hover:text-gray-700'
  };
  return colors[color as keyof typeof colors] || colors.gray;
};

const getIconColorClasses = (color: string, isActive: boolean) => {
  const colors = {
    blue: isActive ? 'text-blue-600' : 'text-blue-500',
    purple: isActive ? 'text-purple-600' : 'text-purple-500',
    pink: isActive ? 'text-pink-600' : 'text-pink-500',
    red: isActive ? 'text-red-600' : 'text-red-500',
    orange: isActive ? 'text-orange-600' : 'text-orange-500',
    green: isActive ? 'text-green-600' : 'text-green-500',
    yellow: isActive ? 'text-yellow-600' : 'text-yellow-500',
    indigo: isActive ? 'text-indigo-600' : 'text-indigo-500',
    cyan: isActive ? 'text-cyan-600' : 'text-cyan-500',
    teal: isActive ? 'text-teal-600' : 'text-teal-500',
    violet: isActive ? 'text-violet-600' : 'text-violet-500',
    amber: isActive ? 'text-amber-600' : 'text-amber-500',
    gray: isActive ? 'text-gray-600' : 'text-gray-500'
  };
  return colors[color as keyof typeof colors] || colors.gray;
};

export default function Sidebar({ activeTab, onTabChange, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 z-50 h-screen w-64 bg-white border-r border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col
        lg:translate-x-0 lg:static lg:inset-0 lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header - Perfect Size */}
        <div className="flex-shrink-0 flex items-center justify-between px-3.5 py-2.5 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">AI Traffic</h2>
              <p className="text-xs text-gray-500">Smart India 2025</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-md transition-colors lg:hidden">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation - Perfect Size */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 py-3">
          {navigationSections.map((section, sectionIndex) => (
            <div key={section.title} className={`px-3 ${sectionIndex > 0 ? 'mt-5' : ''}`}>
              <div className="flex items-center space-x-1.5 mb-2.5">
                <div className="h-px bg-gradient-to-r from-gray-300 to-transparent flex-1" />
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1.5 bg-white">
                  {section.title}
                </h3>
                <div className="h-px bg-gradient-to-l from-gray-300 to-transparent flex-1" />
              </div>
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onTabChange(item.id);
                        onClose();
                      }}
                      className={`
                        group w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 relative overflow-hidden
                        ${isActive 
                          ? `${getColorClasses(item.color || 'gray', true)} shadow-sm transform scale-[1.005] border-l-2` 
                          : `text-gray-600 hover:scale-[1.002] ${getColorClasses(item.color || 'gray', false)}`
                        }
                      `}
                    >
                      {/* Background gradient for active items */}
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent opacity-50" />
                      )}
                      
                      <div className="flex items-center space-x-2 relative z-10">
                        <div className={`
                          p-1 rounded-sm transition-all duration-200
                          ${isActive 
                            ? 'bg-white/70 shadow-sm' 
                            : 'group-hover:bg-white/50'
                          }
                        `}>
                          <item.icon className={`w-3.5 h-3.5 ${getIconColorClasses(item.color || 'gray', isActive)}`} />
                        </div>
                        <span className="truncate font-medium text-sm">{item.name}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1.5 relative z-10">
                        {item.badge && (
                          <span className="text-lg drop-shadow-sm">{item.badge}</span>
                        )}
                        {item.isNew && (
                          <div className="relative">
                            <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" />
                            <div className="absolute inset-0 w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* System Status Footer - Perfect Size */}
        <div className="flex-shrink-0 p-3 border-t border-gray-200">
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-2.5 border border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-gray-900">System Status</span>
              </div>
              <Shield className="w-3 h-3 text-emerald-600" />
            </div>
            
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              <div className="text-center">
                <div className="text-xs text-gray-600">Uptime</div>
                <div className="font-bold text-emerald-700 text-sm">99.97%</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600">AI Accuracy</div>
                <div className="font-bold text-purple-700 text-sm">99.8%</div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Intersections</span>
                <span className="font-semibold text-blue-700">154/156</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div className="bg-gradient-to-r from-blue-500 to-green-500 h-1 rounded-full" style={{width: '98.7%'}}></div>
              </div>
              <div className="flex items-center justify-between text-xs pt-0.5">
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-600">Citizens</span>
                </div>
                <span className="font-semibold text-indigo-700">15,247</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}