import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Create custom icons for different traffic elements
const defaultIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom icons for different traffic elements
const trafficLightIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10" fill="#22c55e" stroke="#16a34a"/>
      <circle cx="12" cy="12" r="3" fill="white"/>
    </svg>
  `),
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
});

const emergencyIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10" fill="#ef4444" stroke="#dc2626"/>
      <path d="M12 8v4l3 3" stroke="white" stroke-width="2"/>
    </svg>
  `),
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
});

const congestionIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10" fill="#f59e0b" stroke="#d97706"/>
      <path d="M8 12h8" stroke="white" stroke-width="2"/>
      <path d="M12 8v8" stroke="white" stroke-width="2"/>
    </svg>
  `),
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
});

interface TrafficData {
  id: string;
  position: LatLngExpression;
  type: 'intersection' | 'emergency' | 'congestion';
  title: string;
  description: string;
  status: 'normal' | 'warning' | 'critical';
  vehicleCount?: number;
  waitTime?: string;
}

// Sample traffic data for Bhubaneswar (you can replace with real data)
const sampleTrafficData: TrafficData[] = [
  {
    id: '1',
    position: [20.2961, 85.8245], // Bhubaneswar center
    type: 'intersection',
    title: 'Master Canteen Square',
    description: 'Major intersection with moderate traffic',
    status: 'normal',
    vehicleCount: 45,
    waitTime: '32s'
  },
  {
    id: '2',
    position: [20.3019, 85.8449], // Vani Vihar
    type: 'congestion',
    title: 'Vani Vihar Square',
    description: 'High congestion detected',
    status: 'critical',
    vehicleCount: 89,
    waitTime: '2m 15s'
  },
  {
    id: '3',
    position: [20.2700, 85.8400], // Khandagiri
    type: 'intersection',
    title: 'Khandagiri Square',
    description: 'Normal traffic flow',
    status: 'normal',
    vehicleCount: 23,
    waitTime: '28s'
  },
  {
    id: '4',
    position: [20.3200, 85.8100], // Patia
    type: 'emergency',
    title: 'Patia Chowk',
    description: 'Emergency vehicle detected',
    status: 'warning',
    vehicleCount: 67,
    waitTime: '45s'
  },
  {
    id: '5',
    position: [20.2500, 85.8300], // Jaydev Vihar
    type: 'intersection',
    title: 'Jaydev Vihar',
    description: 'Light traffic',
    status: 'normal',
    vehicleCount: 18,
    waitTime: '22s'
  }
];

interface TrafficMapProps {
  height?: string;
  showControls?: boolean;
}

export const TrafficMap: React.FC<TrafficMapProps> = ({ 
  height = '400px', 
  showControls = true 
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'intersection' | 'emergency' | 'congestion'>('all');
  
  // Center the map on Bhubaneswar
  const center: LatLngExpression = [20.2961, 85.8245];
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'intersection':
        return trafficLightIcon;
      case 'emergency':
        return emergencyIcon;
      case 'congestion':
        return congestionIcon;
      default:
        return defaultIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      default:
        return '#22c55e';
    }
  };

  const filteredData = selectedFilter === 'all' 
    ? sampleTrafficData 
    : sampleTrafficData.filter(item => item.type === selectedFilter);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {showControls && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🗺️</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Live Traffic Map</h3>
                <p className="text-sm text-gray-600">Real-time traffic monitoring with OpenStreetMap</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live Updates</span>
            </div>
          </div>
          
          {/* Filter Controls */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: '🌐 All', color: 'bg-gray-100 hover:bg-gray-200 text-gray-700' },
              { key: 'intersection', label: '🚦 Intersections', color: 'bg-green-100 hover:bg-green-200 text-green-700' },
              { key: 'emergency', label: '🚨 Emergency', color: 'bg-red-100 hover:bg-red-200 text-red-700' },
              { key: 'congestion', label: '⚠️ Congestion', color: 'bg-orange-100 hover:bg-orange-200 text-orange-700' }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setSelectedFilter(filter.key as any)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === filter.key 
                    ? filter.color.replace('hover:', '') 
                    : filter.color
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div style={{ height }}>
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
          
          {filteredData.map((item) => (
            <React.Fragment key={item.id}>
              <Marker
                position={item.position}
                icon={getIcon(item.type)}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'critical' ? 'bg-red-100 text-red-800' :
                        item.status === 'warning' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    
                    {item.vehicleCount && (
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Vehicles:</span>
                          <span className="font-medium">{item.vehicleCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Wait Time:</span>
                          <span className="font-medium">{item.waitTime}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
              
              {/* Add traffic flow circles for congestion areas */}
              {item.type === 'congestion' && (
                <Circle
                  center={item.position}
                  radius={200}
                  pathOptions={{
                    color: getStatusColor(item.status),
                    fillColor: getStatusColor(item.status),
                    fillOpacity: 0.2,
                    weight: 2
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </MapContainer>
      </div>
      
      {showControls && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Normal</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600">Warning</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">Critical</span>
              </div>
            </div>
            <span className="text-gray-500">
              Showing {filteredData.length} of {sampleTrafficData.length} locations
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrafficMap;
