import React from 'react';
import { GraduationCap, Clock, Shield, Users, MapPin, AlertTriangle } from 'lucide-react';
import { useAIStore } from '../../store/aiStore';

const SchoolZoneProtection: React.FC = () => {
  const { schoolZones } = useAIStore();

  const getSafetyColor = (level: string) => {
    switch (level) {
      case 'high_alert':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'caution':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getSafetyIcon = (level: string) => {
    switch (level) {
      case 'high_alert':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'caution':
        return <Shield className="w-5 h-5 text-orange-500" />;
      default:
        return <Shield className="w-5 h-5 text-green-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <GraduationCap className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">School Zone Time-Warp Protection</h3>
            <p className="text-sm text-gray-600">AI-powered child safety and dynamic speed enforcement</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-yellow-600">
          <Shield className="w-4 h-4" />
          <span className="text-sm font-medium">Child Safety Active</span>
        </div>
      </div>

      {/* Safety Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Protected Schools</p>
              <p className="text-2xl font-bold text-blue-700">{schoolZones.length}</p>
            </div>
            <GraduationCap className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-xs text-blue-600 mt-2">Across Bhubaneswar</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Children Detected</p>
              <p className="text-2xl font-bold text-green-700">
                {schoolZones.reduce((sum, zone) => sum + zone.childrenDetected, 0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-xs text-green-600 mt-2">Currently in zones</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Safety Incidents</p>
              <p className="text-2xl font-bold text-purple-700">0</p>
            </div>
            <Shield className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-xs text-purple-600 mt-2">This month</p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Speed Violations</p>
              <p className="text-2xl font-bold text-orange-700">23</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-xs text-orange-600 mt-2">Prevented today</p>
        </div>
      </div>

      {/* School Zones List */}
      <div className="space-y-4 mb-6">
        <h4 className="font-semibold text-gray-900">Active School Zones</h4>
        {schoolZones.map((zone) => (
          <div key={zone.id} className={`border rounded-lg p-4 ${getSafetyColor(zone.safetyLevel)}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <GraduationCap className="w-6 h-6 text-yellow-600" />
                <div>
                  <h5 className="font-medium text-gray-900">{zone.name}</h5>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <MapPin className="w-3 h-3" />
                    <span>Lat: {zone.location.lat}, Lng: {zone.location.lng}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getSafetyIcon(zone.safetyLevel)}
                <span className="text-sm font-medium capitalize">
                  {zone.safetyLevel.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white bg-opacity-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Active Hours</span>
                </div>
                <p className="text-sm text-gray-700">
                  {zone.activeHours.start} - {zone.activeHours.end}
                </p>
                <div className={`mt-2 px-2 py-1 rounded text-xs font-medium ${
                  zone.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {zone.isActive ? 'ACTIVE NOW' : 'INACTIVE'}
                </div>
              </div>

              <div className="bg-white bg-opacity-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Users className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Children Present</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{zone.childrenDetected}</p>
                <p className="text-xs text-gray-600">AI detected count</p>
              </div>

              <div className="bg-white bg-opacity-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Shield className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Protection Level</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-3 h-3 rounded-full ${
                    zone.safetyLevel === 'normal' ? 'bg-green-400' : 
                    zone.safetyLevel === 'caution' ? 'bg-orange-400' : 'bg-red-400'
                  }`} />
                  <span className="text-sm font-medium capitalize">
                    {zone.safetyLevel.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-2">🤖 AI Detection Features</h5>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• School uniform recognition</li>
            <li>• Child height/size detection</li>
            <li>• Backpack and school bag identification</li>
            <li>• Group behavior analysis</li>
            <li>• Parent-child pair recognition</li>
          </ul>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-2">🚦 Smart Responses</h5>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Extended crossing times (2x normal)</li>
            <li>• Dynamic speed limit enforcement</li>
            <li>• Vehicle speed warnings</li>
            <li>• Parent WhatsApp notifications</li>
            <li>• Emergency protocol activation</li>
          </ul>
        </div>
      </div>

      {/* Parent Integration */}
      <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
        <div className="flex items-center space-x-2 mb-3">
          <Users className="w-5 h-5 text-yellow-600" />
          <span className="font-medium text-gray-900">Parent WhatsApp Integration</span>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="text-sm">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                AI
              </div>
              <span className="font-medium">School Zone Alert</span>
              <span className="text-xs text-gray-500">3:15 PM</span>
            </div>
            <div className="bg-blue-100 rounded-lg p-2 ml-10">
              <p className="text-sm">
                "🚸 Heavy traffic detected near DAV School. Your child's crossing time extended to 45 seconds. 
                Estimated safe crossing window: 3:20-3:25 PM"
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-gradient-to-r from-yellow-50 to-green-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <GraduationCap className="w-5 h-5 text-yellow-600" />
          <span className="font-medium text-gray-900">World's First School Zone Time-Warp AI</span>
        </div>
        <p className="text-sm text-gray-700">
          Revolutionary geofenced school zone protection with dynamic speed limit enforcement through smart signals. 
          Time-aware system with different patterns for school vs non-school hours. Child Safety AI extends pedestrian 
          crossing times when school children are detected, with WhatsApp alerts to parent groups.
        </p>
      </div>
    </div>
  );
};

export default SchoolZoneProtection;
