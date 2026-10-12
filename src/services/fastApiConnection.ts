/**
 * FastAPI Backend Connection Manager
 * Smart India Hackathon 2025 - AI Traffic Optimizer
 * WebSocket connection to FastAPI YOLOv8 backend
 */

export interface FastAPIDetection {
  id: number;
  class_id: number;
  class_name: string;
  confidence: number;
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  center: {
    x: number;
    y: number;
  };
  area: number;
  timestamp: string;
}

export interface FastAPIAnalysis {
  timestamp: string;
  total_vehicles: number;
  vehicle_counts: Record<string, number>;
  density: number;
  congestion_level: 'low' | 'medium' | 'high' | 'critical';
  average_vehicle_area: number;
  frame_analysis: {
    cars: number;
    motorcycles: number;
    buses: number;
    trucks: number;
    bicycles: number;
    pedestrians: number;
  };
}

export interface FastAPIAreaAnalysis {
  area_name: string;
  timestamp: string;
  total_vehicles: number;
  vehicle_counts: Record<string, number>;
  density: number;
  congestion_level: string;
  flow_rate: number;
  area_pixels: number;
  detections: FastAPIDetection[];
  breakdown: {
    cars: number;
    motorcycles: number;
    buses: number;
    trucks: number;
    bicycles: number;
    pedestrians: number;
  };
}

export interface FastAPIConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  error: string | null;
  latency: number;
}

export class FastAPIConnectionManager {
  private ws: WebSocket | null = null;
  private baseUrl: string;
  private wsUrl: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private pingInterval: number | null = null;
  private lastPingTime = 0;
  
  // Event callbacks
  private onDetectionCallback: ((detections: FastAPIDetection[], analysis: FastAPIAnalysis) => void) | null = null;
  private onAreaAnalysisCallback: ((areas: FastAPIAreaAnalysis[]) => void) | null = null;
  private onConnectionStatusCallback: ((status: FastAPIConnectionStatus) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
    this.wsUrl = baseUrl.replace('http', 'ws') + '/ws/live-detection';
  }

  // Connection management
  async connect(): Promise<boolean> {
    try {
      if (this.ws?.readyState === WebSocket.OPEN) {
        return true;
      }

      this.ws = new WebSocket(this.wsUrl);
      
      this.ws.onopen = () => {
        console.log('FastAPI WebSocket connected');
        this.reconnectAttempts = 0;
        this.startPing();
        this.notifyConnectionStatus({
          connected: true,
          reconnecting: false,
          error: null,
          latency: 0
        });
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data));
      };

      this.ws.onclose = () => {
        console.log('FastAPI WebSocket disconnected');
        this.stopPing();
        this.notifyConnectionStatus({
          connected: false,
          reconnecting: false,
          error: 'Connection closed',
          latency: 0
        });
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('FastAPI WebSocket error:', error);
        this.notifyError('WebSocket connection error');
      };

      return new Promise((resolve) => {
        const timeout = setTimeout(() => resolve(false), 5000);
        this.ws!.onopen = () => {
          clearTimeout(timeout);
          this.reconnectAttempts = 0;
          this.startPing();
          this.notifyConnectionStatus({
            connected: true,
            reconnecting: false,
            error: null,
            latency: 0
          });
          resolve(true);
        };
      });

    } catch (error) {
      console.error('Failed to connect to FastAPI backend:', error);
      this.notifyError(`Connection failed: ${error}`);
      return false;
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.stopPing();
  }

  // API methods
  async uploadImage(file: File): Promise<{ detections: FastAPIDetection[], analysis: FastAPIAnalysis } | null> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}/api/upload-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        detections: result.detections,
        analysis: result.analysis
      };

    } catch (error) {
      console.error('Error uploading image:', error);
      this.notifyError(`Upload failed: ${error}`);
      return null;
    }
  }

  async analyzeAreas(imageData: string, areas: Array<Array<[number, number]>>): Promise<FastAPIAreaAnalysis[] | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analyze-areas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
          areas: areas
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.areas;

    } catch (error) {
      console.error('Error analyzing areas:', error);
      this.notifyError(`Area analysis failed: ${error}`);
      return null;
    }
  }

  async getSystemStats(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stats`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting system stats:', error);
      return null;
    }
  }

  async getConfig(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/config`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting config:', error);
      return null;
    }
  }

  async updateConfig(config: any): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating config:', error);
      return false;
    }
  }

  // Live detection methods
  startLiveDetection(config: any = {}): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'start_detection',
        config: config
      }));
    }
  }

  stopLiveDetection(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'stop_detection'
      }));
    }
  }

  sendFrame(frameData: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'frame_data',
        data: frameData
      }));
    }
  }

  // Event handlers
  onDetection(callback: (detections: FastAPIDetection[], analysis: FastAPIAnalysis) => void): void {
    this.onDetectionCallback = callback;
  }

  onAreaAnalysis(callback: (areas: FastAPIAreaAnalysis[]) => void): void {
    this.onAreaAnalysisCallback = callback;
  }

  onConnectionStatus(callback: (status: FastAPIConnectionStatus) => void): void {
    this.onConnectionStatusCallback = callback;
  }

  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  // Private methods
  private handleMessage(message: any): void {
    switch (message.type) {
      case 'detection_results':
        if (this.onDetectionCallback && message.data) {
          this.onDetectionCallback(message.data.detections, message.data.analysis);
        }
        break;
      
      case 'area_analysis':
        if (this.onAreaAnalysisCallback && message.data) {
          this.onAreaAnalysisCallback(message.data.areas);
        }
        break;
      
      case 'connection_established':
        console.log('FastAPI connection established:', message.message);
        break;
      
      case 'detection_started':
        console.log('Live detection started:', message.message);
        break;
      
      case 'detection_stopped':
        console.log('Live detection stopped:', message.message);
        break;
      
      case 'error':
        console.error('FastAPI error:', message.message);
        this.notifyError(message.message);
        break;
      
      case 'system_stats':
        console.log('System stats:', message.data);
        break;
      
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      this.notifyConnectionStatus({
        connected: false,
        reconnecting: true,
        error: `Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
        latency: 0
      });
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      this.notifyConnectionStatus({
        connected: false,
        reconnecting: false,
        error: 'Max reconnection attempts reached',
        latency: 0
      });
    }
  }

  private startPing(): void {
    this.pingInterval = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.lastPingTime = Date.now();
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private notifyConnectionStatus(status: FastAPIConnectionStatus): void {
    if (this.onConnectionStatusCallback) {
      this.onConnectionStatusCallback(status);
    }
  }

  private notifyError(error: string): void {
    if (this.onErrorCallback) {
      this.onErrorCallback(error);
    }
  }

  // Utility methods
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }
}

// Export singleton instance
export const fastApiConnection = new FastAPIConnectionManager();
