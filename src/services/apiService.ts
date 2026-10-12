import io, { Socket } from 'socket.io-client';

const API_BASE_URL = 'http://localhost:3001/api';
const SOCKET_URL = 'http://localhost:3001';

class APIService {
  private socket: Socket | null = null;

  // Initialize WebSocket connection
  initializeSocket() {
    this.socket = io(SOCKET_URL);
    
    this.socket.on('connect', () => {
      console.log('🔗 Connected to AI Traffic Backend');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from AI Traffic Backend');
    });

    return this.socket;
  }

  // Traffic Data APIs
  async getIntersections() {
    try {
      const response = await fetch(`${API_BASE_URL}/traffic/intersections`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching intersections:', error);
      return [];
    }
  }

  async getTrafficPrediction(intersectionId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/traffic/prediction/${intersectionId}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching traffic prediction:', error);
      return null;
    }
  }

  // AI Feature APIs
  async getEmotionDetection() {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/emotion-detection`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching emotion detection:', error);
      return null;
    }
  }

  async getWeatherFusion() {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/weather-fusion`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching weather fusion:', error);
      return null;
    }
  }

  async getEmergencyDetection() {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/emergency-detection`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching emergency detection:', error);
      return null;
    }
  }

  async getFestivalIntelligence() {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/festival-intelligence`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching festival intelligence:', error);
      return null;
    }
  }

  async getSystemMetrics() {
    try {
      const response = await fetch(`${API_BASE_URL}/system/metrics`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      return null;
    }
  }

  // Real-time event listeners
  onTrafficUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('traffic_update', callback);
    }
  }

  onEmotionUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('ai_emotion_update', callback);
    }
  }

  onEmergencyUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('emergency_update', callback);
    }
  }

  // Cleanup
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const apiService = new APIService();
