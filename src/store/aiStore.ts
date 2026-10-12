import { create } from 'zustand';

export interface EmotionDetection {
  intersectionId: string;
  aggressiveDrivers: number;
  roadRageIncidents: number;
  lastUpdate: Date;
  rageReductionPercentage: number;
}

export interface WeatherTrafficData {
  currentWeather: string;
  temperature: number;
  humidity: number;
  visibility: number;
  weatherImpactLevel: 'low' | 'medium' | 'high';
  monsoonMode: boolean;
  accidentReduction: number;
}

export interface FestivalEvent {
  id: string;
  name: string;
  date: Date;
  type: 'religious' | 'cultural' | 'sports' | 'shopping';
  expectedTrafficIncrease: number;
  specialRoutes: string[];
  crowdPrediction: 'low' | 'medium' | 'high' | 'extreme';
}

export interface EmergencyVehicle {
  id: string;
  type: 'ambulance' | 'fire' | 'police';
  location: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  priority: number;
  estimatedArrival: Date;
  audioDetected: boolean;
  visualDetected: boolean;
}

export interface CitizenComplaint {
  id: string;
  location: string;
  issue: string;
  timestamp: Date;
  status: 'pending' | 'processing' | 'resolved';
  reporterPoints: number;
  category: 'congestion' | 'signal_malfunction' | 'accident' | 'other';
}

export interface SchoolZone {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  activeHours: { start: string; end: string };
  isActive: boolean;
  childrenDetected: number;
  safetyLevel: 'normal' | 'caution' | 'high_alert';
}

export interface CarbonCredit {
  userId: string;
  credits: number;
  routesFollowed: number;
  co2Saved: number;
  rank: number;
  totalUsers: number;
}

export interface AccessibilityData {
  elderlyDetected: number;
  disabledDetected: number;
  extendedCrossings: number;
  averageExtensionTime: number;
}

interface AIStore {
  // Emotion Detection
  emotionData: EmotionDetection[];
  updateEmotionData: (data: EmotionDetection) => void;

  // Weather-Traffic Fusion
  weatherData: WeatherTrafficData;
  updateWeatherData: (data: WeatherTrafficData) => void;

  // Festival Intelligence
  festivals: FestivalEvent[];
  activeFestivals: FestivalEvent[];
  updateFestivals: (festivals: FestivalEvent[]) => void;

  // Emergency Detection
  emergencyVehicles: EmergencyVehicle[];
  addEmergencyVehicle: (vehicle: EmergencyVehicle) => void;
  removeEmergencyVehicle: (id: string) => void;

  // Citizen Complaints
  complaints: CitizenComplaint[];
  addComplaint: (complaint: CitizenComplaint) => void;
  updateComplaintStatus: (id: string, status: CitizenComplaint['status']) => void;

  // School Zones
  schoolZones: SchoolZone[];
  updateSchoolZone: (zone: SchoolZone) => void;

  // Carbon Credits
  carbonCredits: CarbonCredit[];
  updateCarbonCredits: (credits: CarbonCredit[]) => void;

  // Accessibility
  accessibilityData: AccessibilityData;
  updateAccessibilityData: (data: AccessibilityData) => void;

  // System Performance
  systemMetrics: {
    commuteReduction: number;
    emergencyResponseImprovement: number;
    costSavings: number;
    citizenSatisfaction: number;
    aiAccuracy: number;
  };
  updateSystemMetrics: (metrics: any) => void;
}

export const useAIStore = create<AIStore>((set) => ({
  // Initial state
  emotionData: [
    {
      intersectionId: 'INT001',
      aggressiveDrivers: 12,
      roadRageIncidents: 3,
      lastUpdate: new Date(),
      rageReductionPercentage: 45
    }
  ],

  weatherData: {
    currentWeather: 'Partly Cloudy',
    temperature: 28,
    humidity: 75,
    visibility: 8.5,
    weatherImpactLevel: 'low',
    monsoonMode: false,
    accidentReduction: 30
  },

  festivals: [
    {
      id: 'F001',
      name: 'Diwali Shopping Rush',
      date: new Date('2025-10-20'),
      type: 'shopping',
      expectedTrafficIncrease: 85,
      specialRoutes: ['Route A', 'Route B'],
      crowdPrediction: 'extreme'
    },
    {
      id: 'F002',
      name: 'Kali Puja',
      date: new Date('2025-11-01'),
      type: 'religious',
      expectedTrafficIncrease: 60,
      specialRoutes: ['Route C'],
      crowdPrediction: 'high'
    }
  ],

  activeFestivals: [],

  emergencyVehicles: [],

  complaints: [
    {
      id: 'C001',
      location: 'Master Canteen Square',
      issue: 'Signal timing too short during peak hours',
      timestamp: new Date(),
      status: 'processing',
      reporterPoints: 150,
      category: 'congestion'
    }
  ],

  schoolZones: [
    {
      id: 'SZ001',
      name: 'DAV Public School Zone',
      location: { lat: 20.2961, lng: 85.8245 },
      activeHours: { start: '07:00', end: '17:00' },
      isActive: true,
      childrenDetected: 8,
      safetyLevel: 'normal'
    }
  ],

  carbonCredits: [
    {
      userId: 'U001',
      credits: 1250,
      routesFollowed: 45,
      co2Saved: 125.5,
      rank: 1,
      totalUsers: 15000
    }
  ],

  accessibilityData: {
    elderlyDetected: 25,
    disabledDetected: 8,
    extendedCrossings: 33,
    averageExtensionTime: 15.5
  },

  systemMetrics: {
    commuteReduction: 15.2,
    emergencyResponseImprovement: 25.0,
    costSavings: 80.0,
    citizenSatisfaction: 92.5,
    aiAccuracy: 99.8
  },

  // Actions
  updateEmotionData: (data) =>
    set((state) => ({
      emotionData: state.emotionData.map((item) =>
        item.intersectionId === data.intersectionId ? data : item
      )
    })),

  updateWeatherData: (data) =>
    set(() => ({ weatherData: data })),

  updateFestivals: (festivals) =>
    set(() => ({ 
      festivals,
      activeFestivals: festivals.filter(f => 
        Math.abs(f.date.getTime() - new Date().getTime()) < 7 * 24 * 60 * 60 * 1000
      )
    })),

  addEmergencyVehicle: (vehicle) =>
    set((state) => ({
      emergencyVehicles: [...state.emergencyVehicles, vehicle]
    })),

  removeEmergencyVehicle: (id) =>
    set((state) => ({
      emergencyVehicles: state.emergencyVehicles.filter(v => v.id !== id)
    })),

  addComplaint: (complaint) =>
    set((state) => ({
      complaints: [...state.complaints, complaint]
    })),

  updateComplaintStatus: (id, status) =>
    set((state) => ({
      complaints: state.complaints.map(c =>
        c.id === id ? { ...c, status } : c
      )
    })),

  updateSchoolZone: (zone) =>
    set((state) => ({
      schoolZones: state.schoolZones.map(z =>
        z.id === zone.id ? zone : z
      )
    })),

  updateCarbonCredits: (credits) =>
    set(() => ({ carbonCredits: credits })),

  updateAccessibilityData: (data) =>
    set(() => ({ accessibilityData: data })),

  updateSystemMetrics: (metrics) =>
    set(() => ({ systemMetrics: metrics }))
}));
