/**
 * FastAPI Connection Hook
 * Smart India Hackathon 2025 - AI Traffic Optimizer
 * React hook for FastAPI YOLOv8 backend integration
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  fastApiConnection, 
  FastAPIDetection, 
  FastAPIAnalysis, 
  FastAPIAreaAnalysis, 
  FastAPIConnectionStatus 
} from '../services/fastApiConnection';

export interface FastAPIStats {
  totalVehicles: number;
  vehiclesByType: Record<string, number>;
  congestionLevel: string;
  density: number;
  processingTime: number;
  lastUpdate: string;
}

export interface UseFastAPIConnectionReturn {
  // Connection state
  connectionStatus: FastAPIConnectionStatus;
  isConnected: boolean;
  
  // Detection data
  currentDetections: FastAPIDetection[];
  currentAnalysis: FastAPIAnalysis | null;
  areaAnalyses: FastAPIAreaAnalysis[];
  stats: FastAPIStats;
  
  // Control functions
  connect: () => Promise<boolean>;
  disconnect: () => void;
  uploadImage: (file: File) => Promise<boolean>;
  analyzeAreas: (imageData: string, areas: Array<Array<[number, number]>>) => Promise<boolean>;
  startLiveDetection: (config?: any) => void;
  stopLiveDetection: () => void;
  sendFrame: (frameData: string) => void;
  
  // Configuration
  getConfig: () => Promise<any>;
  updateConfig: (config: any) => Promise<boolean>;
  getSystemStats: () => Promise<any>;
  
  // Utilities
  resetData: () => void;
  error: string | null;
}

export const useFastAPIConnection = (): UseFastAPIConnectionReturn => {
  // State management
  const [connectionStatus, setConnectionStatus] = useState<FastAPIConnectionStatus>({
    connected: false,
    reconnecting: false,
    error: null,
    latency: 0
  });
  
  const [currentDetections, setCurrentDetections] = useState<FastAPIDetection[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<FastAPIAnalysis | null>(null);
  const [areaAnalyses, setAreaAnalyses] = useState<FastAPIAreaAnalysis[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [stats, setStats] = useState<FastAPIStats>({
    totalVehicles: 0,
    vehiclesByType: {},
    congestionLevel: 'low',
    density: 0,
    processingTime: 0,
    lastUpdate: new Date().toISOString()
  });

  // Refs for cleanup
  const mounted = useRef(true);

  // Initialize connection and event handlers
  useEffect(() => {
    // Set up event handlers
    fastApiConnection.onConnectionStatus((status) => {
      if (mounted.current) {
        setConnectionStatus(status);
        if (status.error) {
          setError(status.error);
        }
      }
    });

    fastApiConnection.onDetection((detections, analysis) => {
      if (mounted.current) {
        setCurrentDetections(detections);
        setCurrentAnalysis(analysis);
        
        // Update stats
        setStats({
          totalVehicles: analysis.total_vehicles,
          vehiclesByType: analysis.vehicle_counts,
          congestionLevel: analysis.congestion_level,
          density: analysis.density,
          processingTime: 0, // Will be updated from system stats
          lastUpdate: analysis.timestamp
        });
        
        setError(null);
      }
    });

    fastApiConnection.onAreaAnalysis((areas) => {
      if (mounted.current) {
        setAreaAnalyses(areas);
      }
    });

    fastApiConnection.onError((errorMessage) => {
      if (mounted.current) {
        setError(errorMessage);
      }
    });

    // Cleanup on unmount
    return () => {
      mounted.current = false;
    };
  }, []);

  // Connection functions
  const connect = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const success = await fastApiConnection.connect();
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection failed';
      setError(errorMessage);
      return false;
    }
  }, []);

  const disconnect = useCallback((): void => {
    fastApiConnection.disconnect();
    setCurrentDetections([]);
    setCurrentAnalysis(null);
    setAreaAnalyses([]);
    setError(null);
  }, []);

  // Image analysis functions
  const uploadImage = useCallback(async (file: File): Promise<boolean> => {
    try {
      setError(null);
      const result = await fastApiConnection.uploadImage(file);
      
      if (result) {
        setCurrentDetections(result.detections);
        setCurrentAnalysis(result.analysis);
        
        setStats({
          totalVehicles: result.analysis.total_vehicles,
          vehiclesByType: result.analysis.vehicle_counts,
          congestionLevel: result.analysis.congestion_level,
          density: result.analysis.density,
          processingTime: 0,
          lastUpdate: result.analysis.timestamp
        });
        
        return true;
      }
      
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      return false;
    }
  }, []);

  const analyzeAreas = useCallback(async (
    imageData: string, 
    areas: Array<Array<[number, number]>>
  ): Promise<boolean> => {
    try {
      setError(null);
      const result = await fastApiConnection.analyzeAreas(imageData, areas);
      
      if (result) {
        setAreaAnalyses(result);
        
        // Calculate total stats from all areas
        const totalVehicles = result.reduce((sum, area) => sum + area.total_vehicles, 0);
        const vehiclesByType: Record<string, number> = {};
        
        result.forEach(area => {
          Object.entries(area.vehicle_counts).forEach(([type, count]) => {
            vehiclesByType[type] = (vehiclesByType[type] || 0) + count;
          });
        });
        
        setStats({
          totalVehicles,
          vehiclesByType,
          congestionLevel: result[0]?.congestion_level || 'low',
          density: result.reduce((sum, area) => sum + area.density, 0) / result.length,
          processingTime: 0,
          lastUpdate: new Date().toISOString()
        });
        
        return true;
      }
      
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Area analysis failed';
      setError(errorMessage);
      return false;
    }
  }, []);

  // Live detection functions
  const startLiveDetection = useCallback((config: any = {}): void => {
    fastApiConnection.startLiveDetection(config);
  }, []);

  const stopLiveDetection = useCallback((): void => {
    fastApiConnection.stopLiveDetection();
  }, []);

  const sendFrame = useCallback((frameData: string): void => {
    fastApiConnection.sendFrame(frameData);
  }, []);

  // Configuration functions
  const getConfig = useCallback(async (): Promise<any> => {
    return await fastApiConnection.getConfig();
  }, []);

  const updateConfig = useCallback(async (config: any): Promise<boolean> => {
    return await fastApiConnection.updateConfig(config);
  }, []);

  const getSystemStats = useCallback(async (): Promise<any> => {
    return await fastApiConnection.getSystemStats();
  }, []);

  // Utility functions
  const resetData = useCallback((): void => {
    setCurrentDetections([]);
    setCurrentAnalysis(null);
    setAreaAnalyses([]);
    setError(null);
    setStats({
      totalVehicles: 0,
      vehiclesByType: {},
      congestionLevel: 'low',
      density: 0,
      processingTime: 0,
      lastUpdate: new Date().toISOString()
    });
  }, []);

  // Computed values
  const isConnected = connectionStatus.connected;

  return {
    // Connection state
    connectionStatus,
    isConnected,
    
    // Detection data
    currentDetections,
    currentAnalysis,
    areaAnalyses,
    stats,
    
    // Control functions
    connect,
    disconnect,
    uploadImage,
    analyzeAreas,
    startLiveDetection,
    stopLiveDetection,
    sendFrame,
    
    // Configuration
    getConfig,
    updateConfig,
    getSystemStats,
    
    // Utilities
    resetData,
    error
  };
};
