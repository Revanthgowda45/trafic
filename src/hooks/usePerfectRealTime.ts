/**
 * Perfect Real-Time Hook
 * Smart India Hackathon 2025 - AI Traffic Optimizer
 * Custom React hook for seamless real-time detection with auto-reconnection
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { realTimeConnection, DetectionData, ConnectionStatus } from '../services/realTimeConnection';

export interface RealTimeStats {
  totalVehicles: number;
  vehiclesByType: Record<string, number>;
  fps: number;
  processingTime: number;
  latency: number;
  uptime: number;
}

export interface StreamStatus {
  id: string;
  active: boolean;
  clientCount: number;
  lastActivity: number;
}

export interface UsePerfectRealTimeReturn {
  // Connection state
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  
  // Detection data
  currentFrame: string | null;
  detectionStats: RealTimeStats;
  activeStreams: StreamStatus[];
  
  // Control functions
  connect: () => Promise<boolean>;
  disconnect: () => void;
  createAndStartStream: (streamId: string, source: string | number, config?: any) => Promise<boolean>;
  stopStream: (streamId: string) => Promise<boolean>;
  subscribeToStream: (streamId: string) => void;
  unsubscribeFromStream: (streamId: string) => void;
  
  // Area management
  addDetectionArea: (area: any) => void;
  removeDetectionArea: (areaId: number) => Promise<boolean>;
  
  // Utilities
  resetStats: () => void;
  getSystemHealth: () => Promise<any>;
}

export const usePerfectRealTime = (): UsePerfectRealTimeReturn => {
  // Connection state
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    reconnecting: false,
    error: null,
    latency: 0
  });

  // Detection data state
  const [currentFrame, setCurrentFrame] = useState<string | null>(null);
  const [detectionStats, setDetectionStats] = useState<RealTimeStats>({
    totalVehicles: 0,
    vehiclesByType: {},
    fps: 0,
    processingTime: 0,
    latency: 0,
    uptime: 0
  });
  
  const [activeStreams, setActiveStreams] = useState<StreamStatus[]>([]);
  
  // Refs for cleanup
  const mountedRef = useRef(true);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // Initialize connection and event handlers
  useEffect(() => {
    const initializeRealTime = async () => {
      if (!mountedRef.current) return;

      try {
        // Set up connection status handler
        realTimeConnection.setOnConnectionChange((status) => {
          if (!mountedRef.current) return;
          
          setConnectionStatus(status);
          
          // Auto-reconnect logic
          if (!status.connected && !status.reconnecting && status.error) {
            console.log('🔄 Scheduling auto-reconnect...');
            reconnectTimeoutRef.current = window.setTimeout(() => {
              if (mountedRef.current) {
                connect();
              }
            }, 5000);
          }
        });

        // Set up detection update handler
        realTimeConnection.setOnDetectionUpdate((data: DetectionData) => {
          if (!mountedRef.current) return;
          
          setCurrentFrame(data.frame_data);
          setDetectionStats(prev => ({
            ...prev,
            totalVehicles: data.detection_data.total_detections,
            vehiclesByType: data.detection_data.detections_by_class,
            fps: data.detection_data.fps,
            processingTime: data.detection_data.processing_time,
            latency: connectionStatus.latency
          }));
        });

        // Set up stream status handler
        realTimeConnection.setOnStreamStatusChange((streamId, status) => {
          if (!mountedRef.current) return;
          
          setActiveStreams(prev => 
            prev.map(stream => 
              stream.id === streamId 
                ? { ...stream, active: status === 'started' }
                : stream
            )
          );
        });

        // Set up system stats handler
        realTimeConnection.setOnSystemStats((stats) => {
          if (!mountedRef.current) return;
          
          setDetectionStats(prev => ({
            ...prev,
            uptime: stats.server?.uptime || 0
          }));
          
          if (stats.streams?.details) {
            setActiveStreams(stats.streams.details.map((stream: any) => ({
              id: stream.id,
              active: stream.status === 'active',
              clientCount: stream.client_count,
              lastActivity: stream.last_activity
            })));
          }
        });

        // Initial connection
        await connect();
        
      } catch (error) {
        console.error('❌ Failed to initialize real-time connection:', error);
      }
    };

    initializeRealTime();

    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      realTimeConnection.disconnect();
    };
  }, []);

  // Connection functions
  const connect = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🚀 Connecting to perfect real-time system...');
      const success = await realTimeConnection.connect();
      
      if (success) {
        console.log('✅ Perfect real-time connection established');
        
        // Get initial system health
        const health = await realTimeConnection.getSystemHealth();
        if (health) {
          console.log('📊 System health:', health);
        }
      }
      
      return success;
    } catch (error) {
      console.error('💥 Connection failed:', error);
      return false;
    }
  }, []);

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting from real-time system...');
    realTimeConnection.disconnect();
    
    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Stream management functions
  const createAndStartStream = useCallback(async (
    streamId: string, 
    source: string | number, 
    config?: any
  ): Promise<boolean> => {
    try {
      console.log(`📹 Creating and starting stream: ${streamId}`);
      
      const streamConfig = {
        stream_id: streamId,
        source,
        config: {
          width: 640,
          height: 480,
          fps: 30,
          quality: 85,
          detection_interval: 1,
          ...config
        }
      };

      // Create stream
      const created = await realTimeConnection.createStream(streamConfig);
      if (!created) {
        console.error('❌ Failed to create stream');
        return false;
      }

      // Start stream
      const started = await realTimeConnection.startStream(streamId);
      if (!started) {
        console.error('❌ Failed to start stream');
        return false;
      }

      // Subscribe to updates
      realTimeConnection.subscribeToStream(streamId);
      
      console.log('✅ Stream created, started, and subscribed successfully');
      return true;
      
    } catch (error) {
      console.error('💥 Stream creation/start failed:', error);
      return false;
    }
  }, []);

  const stopStream = useCallback(async (streamId: string): Promise<boolean> => {
    try {
      console.log(`⏹️ Stopping stream: ${streamId}`);
      
      // Unsubscribe first
      realTimeConnection.unsubscribeFromStream(streamId);
      
      // Stop stream
      const stopped = await realTimeConnection.stopStream(streamId);
      
      if (stopped) {
        console.log('✅ Stream stopped successfully');
        
        // Clear current frame if this was the active stream
        setCurrentFrame(null);
        
        // Reset stats
        setDetectionStats(prev => ({
          ...prev,
          totalVehicles: 0,
          vehiclesByType: {},
          fps: 0,
          processingTime: 0
        }));
      }
      
      return stopped;
      
    } catch (error) {
      console.error('💥 Stream stop failed:', error);
      return false;
    }
  }, []);

  const subscribeToStream = useCallback((streamId: string) => {
    console.log(`📺 Subscribing to stream: ${streamId}`);
    realTimeConnection.subscribeToStream(streamId);
  }, []);

  const unsubscribeFromStream = useCallback((streamId: string) => {
    console.log(`📺 Unsubscribing from stream: ${streamId}`);
    realTimeConnection.unsubscribeFromStream(streamId);
  }, []);

  // Area management functions
  const addDetectionArea = useCallback((area: any) => {
    console.log(`🎯 Adding detection area: ${area.name}`);
    realTimeConnection.addDetectionArea(area);
  }, []);

  const removeDetectionArea = useCallback(async (areaId: number): Promise<boolean> => {
    try {
      console.log(`🗑️ Removing detection area: ${areaId}`);
      return await realTimeConnection.removeDetectionArea(areaId);
    } catch (error) {
      console.error('💥 Area removal failed:', error);
      return false;
    }
  }, []);

  // Utility functions
  const resetStats = useCallback(() => {
    setDetectionStats({
      totalVehicles: 0,
      vehiclesByType: {},
      fps: 0,
      processingTime: 0,
      latency: 0,
      uptime: 0
    });
    setCurrentFrame(null);
  }, []);

  const getSystemHealth = useCallback(async () => {
    try {
      return await realTimeConnection.getSystemHealth();
    } catch (error) {
      console.error('💥 Health check failed:', error);
      return null;
    }
  }, []);

  return {
    // Connection state
    connectionStatus,
    isConnected: connectionStatus.connected,
    
    // Detection data
    currentFrame,
    detectionStats,
    activeStreams,
    
    // Control functions
    connect,
    disconnect,
    createAndStartStream,
    stopStream,
    subscribeToStream,
    unsubscribeFromStream,
    
    // Area management
    addDetectionArea,
    removeDetectionArea,
    
    // Utilities
    resetStats,
    getSystemHealth
  };
};
