import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { MapPin, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface TrafficIntersection {
  id: string;
  name: string;
  position: LatLngExpression;
  status: 'active' | 'warning' | 'error';
  waitTime: number;
  vehicleCount: number;
  aiOptimization: number;
}

interface EmergencyVehicle {
  id: string;
  type: 'ambulance' | 'fire' | 'police';
  position: LatLngExpression;
  destination: LatLngExpression;
  eta: number;
}

const TrafficMap: React.FC = () => {
  // Bhubaneswar coordinates (Odisha, India)
  const center: LatLngExpression = [20.2961, 85.8245];
  
  const [intersections] = useState<TrafficIntersection[]>([
    {
      id: '1',
      name: 'Master Canteen Square',
      position: [20.2961, 85.8245],
      status: 'active',
      waitTime: 45,
      vehicleCount: 127,
      aiOptimization: 23
    },
    {
      id: '2',
      name: 'Kalpana Square',
      position: [20.3019, 85.8260],
      status: 'warning',
      waitTime: 78,
      vehicleCount: 203,
      aiOptimization: 18
    },
    {
      id: '3',
      name: 'Rajmahal Square',
      position: [20.2906, 85.8313],
      status: 'active',
      waitTime: 32,
      vehicleCount: 89,
      aiOptimization: 31
    },
    {
      id: '4',
      name: 'Vani Vihar Square',
      position: [20.3089, 85.8197],
      status: 'error',
      waitTime: 156,
      vehicleCount: 267,
      aiOptimization: 12
    },
    {
      id: '5',
      name: 'Jaydev Vihar Square',
      position: [20.3142, 85.8089],
      status: 'active',
      waitTime: 28,
      vehicleCount: 156,
      aiOptimization: 35
    }
  ]);

  const [emergencyVehicles] = useState<EmergencyVehicle[]>([
    {
      id: 'amb1',
      type: 'ambulance',
      position: [20.2985, 85.8201],
      destination: [20.3019, 85.8260],
      eta: 4
    },
    {
      id: 'fire1',
      type: 'fire',
      position: [20.2934, 85.8278],
      destination: [20.2906, 85.8313],
      eta: 7
    }
  ]);

  // Custom icons for different intersection statuses
  const getIntersectionIcon = (status: string) => {
    const color = status === 'active' ? '#10B981' : status === 'warning' ? '#F59E0B' : '#EF4444';
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
          <circle cx="12" cy="12" r="4" fill="white"/>
        </svg>
      `)}`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    });
  };

  // Custom icons for emergency vehicles
  const getEmergencyIcon = (type: string) => {
    const color = type === 'ambulance' ? '#EF4444' : type === 'fire' ? '#F97316' : '#3B82F6';
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="8" width="20" height="12" rx="2" fill="${color}" stroke="white" stroke-width="2"/>
          <circle cx="7" cy="18" r="2" fill="white"/>
          <circle cx="17" cy="18" r="2" fill="white"/>
          <rect x="8" y="4" width="8" height="6" rx="1" fill="${color}" stroke="white" stroke-width="1"/>
        </svg>
      `)}`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  };

  return (
    <div className="w-full h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Map Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapPin className="w-6 h-6" />
            <div>
              <h3 className="text-lg font-bold">Live Traffic Map</h3>
              <p className="text-blue-100 text-sm">Bhubaneswar Smart City - Real-time AI Optimization</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live Updates</span>
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full">
              154/156 Active
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-96">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Traffic Intersections */}
          {intersections.map((intersection) => (
            <Marker
              key={intersection.id}
              position={intersection.position}
              icon={getIntersectionIcon(intersection.status)}
            >
              <Popup>
                <div className="p-2 min-w-64">
                  <h4 className="font-bold text-gray-900 mb-2">{intersection.name}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <div className="flex items-center space-x-1">
                        {intersection.status === 'active' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : intersection.status === 'warning' ? (
                          <Clock className="w-4 h-4 text-yellow-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-sm font-medium capitalize">{intersection.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Wait Time:</span>
                      <span className="text-sm font-bold text-blue-600">{intersection.waitTime}s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Vehicles:</span>
                      <span className="text-sm font-bold text-purple-600">{intersection.vehicleCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">AI Optimization:</span>
                      <span className="text-sm font-bold text-green-600">+{intersection.aiOptimization}%</span>
                    </div>
                  </div>
                </div>
              </Popup>
              
              {/* Traffic density circle */}
              <Circle
                center={intersection.position}
                radius={intersection.vehicleCount * 2}
                pathOptions={{
                  color: intersection.status === 'active' ? '#10B981' : intersection.status === 'warning' ? '#F59E0B' : '#EF4444',
                  fillColor: intersection.status === 'active' ? '#10B981' : intersection.status === 'warning' ? '#F59E0B' : '#EF4444',
                  fillOpacity: 0.1,
                  weight: 2
                }}
              />
            </Marker>
          ))}

          {/* Emergency Vehicles */}
          {emergencyVehicles.map((vehicle) => (
            <React.Fragment key={vehicle.id}>
              <Marker
                position={vehicle.position}
                icon={getEmergencyIcon(vehicle.type)}
              >
                <Popup>
                  <div className="p-2">
                    <h4 className="font-bold text-gray-900 mb-2 capitalize">{vehicle.type} Vehicle</h4>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">ETA:</span>
                        <span className="text-sm font-bold text-red-600">{vehicle.eta} min</span>
                      </div>
                      <div className="text-xs text-gray-500">Priority route activated</div>
                    </div>
                  </div>
                </Popup>
              </Marker>
              
              {/* Emergency route */}
              <Polyline
                positions={[vehicle.position, vehicle.destination]}
                pathOptions={{
                  color: '#EF4444',
                  weight: 4,
                  opacity: 0.8,
                  dashArray: '10, 10'
                }}
              />
            </React.Fragment>
          ))}
        </MapContainer>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
          <h4 className="font-semibold text-gray-900 mb-2 text-sm">Legend</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Active Intersection</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>High Traffic</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Congested</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-2 bg-red-500 rounded"></div>
              <span>Emergency Route</span>
            </div>
          </div>
        </div>

        {/* Live Stats Overlay */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-gray-900 text-sm">Live Stats</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Active Signals:</span>
              <span className="font-bold text-green-600">154</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Wait Time:</span>
              <span className="font-bold text-blue-600">42s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Emergency Active:</span>
              <span className="font-bold text-red-600">2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">AI Efficiency:</span>
              <span className="font-bold text-purple-600">+24%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficMap;
