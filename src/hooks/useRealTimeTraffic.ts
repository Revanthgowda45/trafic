import { useState, useEffect } from 'react';
import { TrafficIntersection, TrafficMetrics, SystemAlert } from '../types/traffic.types';

// Simulated real-time data for demonstration
export function useRealTimeTraffic() {
  const [intersections, setIntersections] = useState<TrafficIntersection[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial data load
    const initialIntersections: TrafficIntersection[] = [
      {
        id: '1',
        name: 'Master Canteen Square',
        location: { lat: 20.2961, lng: 85.8245 },
        status: 'active',
        cameraUrls: ['camera-1.jpg'],
        signalConfig: {
          phases: [
            { id: '1', name: 'North-South', duration: 45, minDuration: 30, maxDuration: 60, direction: 'north-south' },
            { id: '2', name: 'East-West', duration: 55, minDuration: 40, maxDuration: 70, direction: 'east-west' }
          ],
          cycleTime: 100,
          adaptiveMode: true,
          emergencyOverride: false
        },
        currentMetrics: generateMetrics(),
        lastOptimized: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Kalpana Square',
        location: { lat: 20.3019, lng: 85.8237 },
        status: 'active',
        cameraUrls: ['camera-2.jpg'],
        signalConfig: {
          phases: [
            { id: '1', name: 'North-South', duration: 50, minDuration: 35, maxDuration: 65, direction: 'north-south' },
            { id: '2', name: 'East-West', duration: 60, minDuration: 45, maxDuration: 75, direction: 'east-west' }
          ],
          cycleTime: 110,
          adaptiveMode: true,
          emergencyOverride: false
        },
        currentMetrics: generateMetrics(),
        lastOptimized: new Date(Date.now() - 300000).toISOString()
      },
      {
        id: '3',
        name: 'Rajmahal Square',
        location: { lat: 20.2969, lng: 85.8172 },
        status: 'active',
        cameraUrls: ['camera-3.jpg'],
        signalConfig: {
          phases: [
            { id: '1', name: 'North-South', duration: 40, minDuration: 25, maxDuration: 55, direction: 'north-south' },
            { id: '2', name: 'East-West', duration: 65, minDuration: 50, maxDuration: 80, direction: 'east-west' }
          ],
          cycleTime: 105,
          adaptiveMode: true,
          emergencyOverride: false
        },
        currentMetrics: generateMetrics(),
        lastOptimized: new Date(Date.now() - 600000).toISOString()
      }
    ];

    const initialAlerts: SystemAlert[] = [
      {
        id: '1',
        type: 'congestion',
        severity: 'medium',
        message: 'Heavy traffic detected at Kalpana Square',
        intersectionId: '2',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        acknowledged: false
      },
      {
        id: '2',
        type: 'emergency',
        severity: 'high',
        message: 'Emergency vehicle approaching Master Canteen Square',
        intersectionId: '1',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        acknowledged: false
      }
    ];

    setIntersections(initialIntersections);
    setAlerts(initialAlerts);
    setIsLoading(false);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setIntersections(prev => prev.map(intersection => ({
        ...intersection,
        currentMetrics: generateMetrics()
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const optimizeIntersection = (intersectionId: string) => {
    setIntersections(prev => prev.map(intersection => 
      intersection.id === intersectionId 
        ? { 
            ...intersection, 
            lastOptimized: new Date().toISOString(),
            currentMetrics: {
              ...intersection.currentMetrics,
              waitTime: Math.max(10, intersection.currentMetrics.waitTime - 15),
              throughput: intersection.currentMetrics.throughput + 50
            }
          }
        : intersection
    ));
  };

  return {
    intersections,
    alerts,
    isLoading,
    acknowledgeAlert,
    optimizeIntersection
  };
}

function generateMetrics(): TrafficMetrics {
  const baseVehicleCount = Math.floor(Math.random() * 80) + 40;
  
  return {
    timestamp: new Date().toISOString(),
    vehicleCount: baseVehicleCount,
    vehicleTypes: {
      cars: Math.floor(baseVehicleCount * 0.65),
      trucks: Math.floor(baseVehicleCount * 0.15),
      buses: Math.floor(baseVehicleCount * 0.08),
      motorcycles: Math.floor(baseVehicleCount * 0.10),
      emergency: Math.floor(Math.random() * 2)
    },
    averageSpeed: Math.floor(Math.random() * 20) + 25,
    queueLength: Math.floor(Math.random() * 40) + 30,
    flowRate: Math.floor(Math.random() * 500) + 1800,
    density: Math.floor(Math.random() * 30) + 20,
    waitTime: Math.floor(Math.random() * 60) + 45,
    throughput: Math.floor(Math.random() * 300) + 2000
  };
}