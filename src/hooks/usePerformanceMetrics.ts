import { useState, useEffect } from 'react';
import { PerformanceImprovement } from '../types/traffic.types';

export function usePerformanceMetrics() {
  const [improvements, setImprovements] = useState<PerformanceImprovement[]>([]);
  const [systemStats, setSystemStats] = useState({
    totalIntersections: 156,
    activeIntersections: 154,
    averageResponseTime: 187,
    systemUptime: 99.7,
    totalVehiclesProcessed: 1247832,
    aiAccuracy: 95.2,
    averageInferenceTime: 11.2
  });

  useEffect(() => {
    const performanceData: PerformanceImprovement[] = [
      {
        metric: 'Average Commute Time',
        before: 28.5,
        after: 25.2,
        improvement: 12.1,
        unit: 'minutes'
      },
      {
        metric: 'Intersection Throughput',
        before: 1800,
        after: 2140,
        improvement: 18.9,
        unit: 'vehicles/hour'
      },
      {
        metric: 'Average Queue Length',
        before: 85,
        after: 64,
        improvement: 24.7,
        unit: 'meters'
      },
      {
        metric: 'Fuel Consumption',
        before: 100,
        after: 88.5,
        improvement: 11.5,
        unit: '% baseline'
      },
      {
        metric: 'Emergency Response Time',
        before: 8.5,
        after: 6.2,
        improvement: 27.1,
        unit: 'minutes'
      }
    ];

    setImprovements(performanceData);

    // Simulate real-time stat updates
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        totalVehiclesProcessed: prev.totalVehiclesProcessed + Math.floor(Math.random() * 50) + 10,
        averageResponseTime: 180 + Math.floor(Math.random() * 20),
        aiAccuracy: 94.8 + Math.random() * 0.8
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return { improvements, systemStats };
}