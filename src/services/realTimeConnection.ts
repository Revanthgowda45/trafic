/**
 * Perfect Real-Time Connection Manager
 * Smart India Hackathon 2025 - AI Traffic Optimizer
 * Optimized WebSocket connection with auto-reconnection and real-time detection
 */

import io, { Socket } from 'socket.io-client';

export interface DetectionData {
  stream_id: string;
  timestamp: number;
  frame_data: string;
  detection_data: {
    total_detections: number;
    detections_by_class: Record<string, number>;
    fps: number;
    processing_time: number;
    area_analysis: Record<string, any>;
    detections: Array<{
      class_name: string;
      confidence: number;
      bbox: [number, number, number, number];
      center: [number, number];
    }>;
  };
}

export interface DetectionArea {
  area_id: number;
  name: string;
  polygon: Array<[number, number]>;
  active: boolean;
  color: string;
}

export interface ConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  error: string | null;
  latency: number;
}

export class RealTimeConnectionManager {
  private socket: Socket | null = null;
  private serverUrl: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private pingInterval: number | null = null;
  private lastPingTime = 0;
  private latency = 0;

  // Event callbacks
  private onConnectionChange: ((status: ConnectionStatus) => void) | null = null;
  private onDetectionUpdate: ((data: DetectionData) => void) | null = null;
  private onStreamStatusChange: ((streamId: string, status: string) => void) | null = null;
  private onAreaUpdate: ((areas: DetectionArea[]) => void) | null = null;
  private onSystemStats: ((stats: any) => void) | null = null;

  constructor(serverUrl: string = 'http://localhost:3001') {
    this.serverUrl = serverUrl;
  }

  /**
   * Connect to the real-time server
   */
  connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.serverUrl, {
          transports: ['websocket', 'polling'],
          upgrade: true,
          rememberUpgrade: true,
          timeout: 5000,
          forceNew: true,
          reconnection: true,
          reconnectionDelay: this.reconnectDelay,
          reconnectionAttempts: this.maxReconnectAttempts,
          autoConnect: true
        });

        // Connection established
        this.socket.on('connect', () => {
          console.log('🚀 Real-time connection established');
          this.reconnectAttempts = 0;
          this.startPingMonitoring();
          this.notifyConnectionChange({
            connected: true,
            reconnecting: false,
            error: null,
            latency: this.latency
          });
          resolve(true);
        });

        // Connection error
        this.socket.on('connect_error', (error) => {
          console.error('❌ Connection error:', error.message);
          this.notifyConnectionChange({
            connected: false,
            reconnecting: this.reconnectAttempts < this.maxReconnectAttempts,
            error: error.message,
            latency: 0
          });
          
          if (this.reconnectAttempts === 0) {
            reject(error);
          }
        });

        // Disconnection
        this.socket.on('disconnect', (reason) => {
          console.warn('⚠️ Disconnected:', reason);
          this.stopPingMonitoring();
          this.notifyConnectionChange({
            connected: false,
            reconnecting: reason === 'io client disconnect' ? false : true,
            error: reason,
            latency: 0
          });
        });

        // Reconnection attempt
        this.socket.on('reconnect_attempt', (attemptNumber) => {
          console.log(`🔄 Reconnection attempt ${attemptNumber}/${this.maxReconnectAttempts}`);
          this.reconnectAttempts = attemptNumber;
          this.notifyConnectionChange({
            connected: false,
            reconnecting: true,
            error: 'Reconnecting...',
            latency: 0
          });
        });

        // Successful reconnection
        this.socket.on('reconnect', (attemptNumber) => {
          console.log(`✅ Reconnected after ${attemptNumber} attempts`);
          this.reconnectAttempts = 0;
          this.startPingMonitoring();
          this.notifyConnectionChange({
            connected: true,
            reconnecting: false,
            error: null,
            latency: this.latency
          });
        });

        // Failed to reconnect
        this.socket.on('reconnect_failed', () => {
          console.error('💥 Failed to reconnect after maximum attempts');
          this.notifyConnectionChange({
            connected: false,
            reconnecting: false,
            error: 'Failed to reconnect',
            latency: 0
          });
        });

        // Welcome message
        this.socket.on('connection_established', (data) => {
          console.log('🎉 Welcome message:', data);
        });

        // Real-time detection updates
        this.socket.on('detection_update', (data: DetectionData) => {
          if (this.onDetectionUpdate) {
            this.onDetectionUpdate(data);
          }
        });

        // Stream status changes
        this.socket.on('stream_started', (data) => {
          console.log('📹 Stream started:', data.stream_id);
          if (this.onStreamStatusChange) {
            this.onStreamStatusChange(data.stream_id, 'started');
          }
        });

        this.socket.on('stream_stopped', (data) => {
          console.log('⏹️ Stream stopped:', data.stream_id);
          if (this.onStreamStatusChange) {
            this.onStreamStatusChange(data.stream_id, 'stopped');
          }
        });

        // Detection area updates
        this.socket.on('detection_area_added', (area) => {
          console.log('🎯 Detection area added:', area);
          if (this.onAreaUpdate) {
            this.onAreaUpdate([area]);
          }
        });

        this.socket.on('detection_area_removed', (data) => {
          console.log('🗑️ Detection area removed:', data.area_id);
        });

        // System statistics
        this.socket.on('system_stats', (stats) => {
          if (this.onSystemStats) {
            this.onSystemStats(stats);
          }
        });

        // Ping/Pong for latency measurement
        this.socket.on('pong', (data) => {
          this.latency = Date.now() - this.lastPingTime;
        });

        // Subscription confirmations
        this.socket.on('subscription_confirmed', (data) => {
          console.log('✅ Subscribed to stream:', data.stream_id);
        });

        this.socket.on('unsubscription_confirmed', (data) => {
          console.log('❌ Unsubscribed from stream:', data.stream_id);
        });

      } catch (error) {
        console.error('💥 Connection setup error:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the server
   */
  disconnect(): void {
    if (this.socket) {
      this.stopPingMonitoring();
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 Disconnected from server');
    }
  }

  /**
   * Subscribe to a video stream for real-time updates
   */
  subscribeToStream(streamId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('subscribe_stream', { stream_id: streamId });
      console.log(`📺 Subscribing to stream: ${streamId}`);
    } else {
      console.warn('⚠️ Cannot subscribe - not connected');
    }
  }

  /**
   * Unsubscribe from a video stream
   */
  unsubscribeFromStream(streamId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('unsubscribe_stream', { stream_id: streamId });
      console.log(`📺 Unsubscribing from stream: ${streamId}`);
    }
  }

  /**
   * Create a new video stream
   */
  async createStream(streamConfig: {
    stream_id: string;
    source: string | number;
    config?: {
      width?: number;
      height?: number;
      fps?: number;
      quality?: number;
      detection_interval?: number;
    };
  }): Promise<boolean> {
    try {
      const response = await fetch(`${this.serverUrl}/api/streams/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(streamConfig)
      });

      const result = await response.json();
      if (result.success) {
        console.log('✅ Stream created:', streamConfig.stream_id);
        return true;
      } else {
        console.error('❌ Failed to create stream:', result.error);
        return false;
      }
    } catch (error) {
      console.error('💥 Stream creation error:', error);
      return false;
    }
  }

  /**
   * Start a video stream
   */
  async startStream(streamId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.serverUrl}/api/streams/${streamId}/start`, {
        method: 'POST'
      });

      const result = await response.json();
      if (result.success) {
        console.log('▶️ Stream started:', streamId);
        return true;
      } else {
        console.error('❌ Failed to start stream:', result.error);
        return false;
      }
    } catch (error) {
      console.error('💥 Stream start error:', error);
      return false;
    }
  }

  /**
   * Stop a video stream
   */
  async stopStream(streamId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.serverUrl}/api/streams/${streamId}/stop`, {
        method: 'POST'
      });

      const result = await response.json();
      if (result.success) {
        console.log('⏹️ Stream stopped:', streamId);
        return true;
      } else {
        console.error('❌ Failed to stop stream:', result.error);
        return false;
      }
    } catch (error) {
      console.error('💥 Stream stop error:', error);
      return false;
    }
  }

  /**
   * Add a detection area
   */
  addDetectionArea(area: DetectionArea): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('add_detection_area', area);
      console.log('🎯 Adding detection area:', area.name);
    } else {
      console.warn('⚠️ Cannot add area - not connected');
    }
  }

  /**
   * Remove a detection area
   */
  async removeDetectionArea(areaId: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.serverUrl}/api/areas/${areaId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.success) {
        console.log('🗑️ Detection area removed:', areaId);
        return true;
      } else {
        console.error('❌ Failed to remove area:', result.error);
        return false;
      }
    } catch (error) {
      console.error('💥 Area removal error:', error);
      return false;
    }
  }

  /**
   * Upload and analyze an image
   */
  async analyzeImage(imageFile: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${this.serverUrl}/api/analyze/image`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        console.log('🖼️ Image analyzed successfully');
        return result;
      } else {
        console.error('❌ Image analysis failed:', result.error);
        return null;
      }
    } catch (error) {
      console.error('💥 Image analysis error:', error);
      return null;
    }
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<any> {
    try {
      const response = await fetch(`${this.serverUrl}/health`);
      return await response.json();
    } catch (error) {
      console.error('💥 Health check error:', error);
      return null;
    }
  }

  /**
   * Start ping monitoring for latency measurement
   */
  private startPingMonitoring(): void {
    this.pingInterval = setInterval(() => {
      if (this.socket && this.socket.connected) {
        this.lastPingTime = Date.now();
        this.socket.emit('ping');
      }
    }, 5000); // Ping every 5 seconds
  }

  /**
   * Stop ping monitoring
   */
  private stopPingMonitoring(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Notify connection status change
   */
  private notifyConnectionChange(status: ConnectionStatus): void {
    if (this.onConnectionChange) {
      this.onConnectionChange(status);
    }
  }

  // Event handler setters
  setOnConnectionChange(callback: (status: ConnectionStatus) => void): void {
    this.onConnectionChange = callback;
  }

  setOnDetectionUpdate(callback: (data: DetectionData) => void): void {
    this.onDetectionUpdate = callback;
  }

  setOnStreamStatusChange(callback: (streamId: string, status: string) => void): void {
    this.onStreamStatusChange = callback;
  }

  setOnAreaUpdate(callback: (areas: DetectionArea[]) => void): void {
    this.onAreaUpdate = callback;
  }

  setOnSystemStats(callback: (stats: any) => void): void {
    this.onSystemStats = callback;
  }

  // Getters
  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  get currentLatency(): number {
    return this.latency;
  }

  get connectionId(): string | undefined {
    return this.socket?.id;
  }
}

// Export singleton instance
export const realTimeConnection = new RealTimeConnectionManager();
