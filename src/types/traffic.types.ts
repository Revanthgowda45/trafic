export interface TrafficIntersection {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  status: 'active' | 'maintenance' | 'offline';
  cameraUrls: string[];
  signalConfig: SignalConfiguration;
  currentMetrics: TrafficMetrics;
  lastOptimized: string;
}

export interface SignalConfiguration {
  phases: SignalPhase[];
  cycleTime: number;
  adaptiveMode: boolean;
  emergencyOverride: boolean;
}

export interface SignalPhase {
  id: string;
  name: string;
  duration: number;
  minDuration: number;
  maxDuration: number;
  direction: 'north-south' | 'east-west' | 'turn-left' | 'turn-right';
}

export interface TrafficMetrics {
  timestamp: string;
  vehicleCount: number;
  vehicleTypes: VehicleTypeCount;
  averageSpeed: number;
  queueLength: number;
  flowRate: number;
  density: number;
  waitTime: number;
  throughput: number;
}

export interface VehicleTypeCount {
  cars: number;
  trucks: number;
  buses: number;
  motorcycles: number;
  emergency: number;
}

export interface PerformanceImprovement {
  metric: string;
  before: number;
  after: number;
  improvement: number;
  unit: string;
}

export interface AIDetectionResult {
  intersectionId: string;
  timestamp: string;
  detections: Detection[];
  inferenceTime: number;
  accuracy: number;
}

export interface Detection {
  id: string;
  class: string;
  confidence: number;
  bbox: [number, number, number, number];
  tracking_id?: string;
}

export interface EmergencyVehicle {
  id: string;
  type: 'ambulance' | 'fire' | 'police';
  location: {
    lat: number;
    lng: number;
  };
  destination: {
    lat: number;
    lng: number;
  };
  estimatedArrival: string;
  priority: 'high' | 'critical';
  status: 'approaching' | 'at-intersection' | 'passed';
}

export interface SystemAlert {
  id: string;
  type: 'incident' | 'congestion' | 'system-error' | 'emergency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  intersectionId?: string;
  timestamp: string;
  acknowledged: boolean;
}