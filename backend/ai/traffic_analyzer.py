"""
Traffic Analysis Engine
Advanced traffic flow analysis and congestion detection
"""

import cv2
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
import logging
from datetime import datetime, timedelta
from collections import defaultdict, deque
import math

logger = logging.getLogger(__name__)

class TrafficAnalyzer:
    """Advanced traffic analysis for monitoring and congestion detection"""
    
    def __init__(self):
        self.total_detections = 0
        self.start_time = datetime.now()
        
        # Vehicle tracking
        self.vehicle_tracks = {}
        self.next_track_id = 0
        self.max_track_age = 30  # frames
        
        # Traffic metrics
        self.area_statistics = defaultdict(lambda: {
            'vehicle_count': 0,
            'vehicle_types': defaultdict(int),
            'density': 0.0,
            'congestion_level': 'low',
            'average_speed': 0.0,
            'flow_rate': 0.0,
            'history': deque(maxlen=100)
        })
        
        # Congestion thresholds
        self.congestion_thresholds = {
            'low': 5,
            'medium': 15,
            'high': 25,
            'critical': 40
        }
        
        logger.info("TrafficAnalyzer initialized")
    
    def analyze_frame(self, detections: List[Dict[str, Any]], 
                     image: np.ndarray) -> Dict[str, Any]:
        """
        Analyze a single frame for traffic metrics
        
        Args:
            detections: List of vehicle detections
            image: Input image frame
            
        Returns:
            Analysis results dictionary
        """
        try:
            self.total_detections += len(detections)
            
            # Basic statistics
            vehicle_counts = defaultdict(int)
            total_vehicles = len(detections)
            
            # Count vehicle types
            for detection in detections:
                vehicle_type = detection.get('class_name', 'unknown')
                vehicle_counts[vehicle_type] += 1
            
            # Calculate density (vehicles per square meter)
            image_area = image.shape[0] * image.shape[1]
            density = total_vehicles / (image_area / 1000000)  # per square meter
            
            # Determine congestion level
            congestion_level = self._calculate_congestion_level(total_vehicles)
            
            # Calculate average vehicle size (proxy for distance/perspective)
            avg_vehicle_area = 0
            if detections:
                total_area = sum(det.get('area', 0) for det in detections)
                avg_vehicle_area = total_area / len(detections)
            
            analysis = {
                'timestamp': datetime.now().isoformat(),
                'total_vehicles': total_vehicles,
                'vehicle_counts': dict(vehicle_counts),
                'density': round(density, 3),
                'congestion_level': congestion_level,
                'average_vehicle_area': round(avg_vehicle_area, 2),
                'frame_analysis': {
                    'cars': vehicle_counts.get('car', 0),
                    'motorcycles': vehicle_counts.get('motorcycle', 0),
                    'buses': vehicle_counts.get('bus', 0),
                    'trucks': vehicle_counts.get('truck', 0),
                    'bicycles': vehicle_counts.get('bicycle', 0),
                    'pedestrians': vehicle_counts.get('person', 0)
                }
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing frame: {str(e)}")
            return {
                'timestamp': datetime.now().isoformat(),
                'error': str(e),
                'total_vehicles': 0,
                'congestion_level': 'unknown'
            }
    
    def analyze_area(self, detections: List[Dict[str, Any]], 
                    image: np.ndarray, area_points: List[Tuple[int, int]], 
                    area_name: str) -> Dict[str, Any]:
        """
        Analyze traffic in a specific area
        
        Args:
            detections: All detections in the frame
            image: Input image
            area_points: Polygon points defining the area
            area_name: Name/ID of the area
            
        Returns:
            Area-specific analysis
        """
        try:
            # Create mask for the area
            mask = np.zeros(image.shape[:2], dtype=np.uint8)
            area_array = np.array(area_points, dtype=np.int32)
            cv2.fillPoly(mask, [area_array], 255)
            
            # Calculate area size in pixels
            area_pixels = cv2.countNonZero(mask)
            
            # Filter detections within this area
            area_detections = []
            for detection in detections:
                center_x = int(detection["center"]["x"])
                center_y = int(detection["center"]["y"])
                
                if (0 <= center_y < mask.shape[0] and 
                    0 <= center_x < mask.shape[1] and 
                    mask[center_y, center_x] > 0):
                    area_detections.append(detection)
            
            # Count vehicles by type
            vehicle_counts = defaultdict(int)
            for detection in area_detections:
                vehicle_type = detection.get('class_name', 'unknown')
                vehicle_counts[vehicle_type] += 1
            
            # Calculate metrics
            total_vehicles = len(area_detections)
            density = total_vehicles / (area_pixels / 10000) if area_pixels > 0 else 0
            congestion_level = self._calculate_congestion_level(total_vehicles)
            
            # Update area statistics
            area_stats = self.area_statistics[area_name]
            area_stats['vehicle_count'] = total_vehicles
            area_stats['vehicle_types'] = dict(vehicle_counts)
            area_stats['density'] = density
            area_stats['congestion_level'] = congestion_level
            area_stats['history'].append({
                'timestamp': datetime.now().isoformat(),
                'count': total_vehicles,
                'density': density
            })
            
            # Calculate flow rate (vehicles per minute)
            flow_rate = self._calculate_flow_rate(area_name)
            area_stats['flow_rate'] = flow_rate
            
            analysis = {
                'area_name': area_name,
                'timestamp': datetime.now().isoformat(),
                'total_vehicles': total_vehicles,
                'vehicle_counts': dict(vehicle_counts),
                'density': round(density, 3),
                'congestion_level': congestion_level,
                'flow_rate': round(flow_rate, 2),
                'area_pixels': area_pixels,
                'detections': area_detections,
                'breakdown': {
                    'cars': vehicle_counts.get('car', 0),
                    'motorcycles': vehicle_counts.get('motorcycle', 0),
                    'buses': vehicle_counts.get('bus', 0),
                    'trucks': vehicle_counts.get('truck', 0),
                    'bicycles': vehicle_counts.get('bicycle', 0),
                    'pedestrians': vehicle_counts.get('person', 0)
                }
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing area {area_name}: {str(e)}")
            return {
                'area_name': area_name,
                'timestamp': datetime.now().isoformat(),
                'error': str(e),
                'total_vehicles': 0,
                'congestion_level': 'unknown'
            }
    
    def _calculate_congestion_level(self, vehicle_count: int) -> str:
        """Calculate congestion level based on vehicle count"""
        if vehicle_count >= self.congestion_thresholds['critical']:
            return 'critical'
        elif vehicle_count >= self.congestion_thresholds['high']:
            return 'high'
        elif vehicle_count >= self.congestion_thresholds['medium']:
            return 'medium'
        else:
            return 'low'
    
    def _calculate_flow_rate(self, area_name: str) -> float:
        """Calculate traffic flow rate for an area"""
        try:
            history = self.area_statistics[area_name]['history']
            if len(history) < 2:
                return 0.0
            
            # Calculate flow rate based on recent history
            recent_history = list(history)[-10:]  # Last 10 measurements
            if len(recent_history) < 2:
                return 0.0
            
            # Simple flow rate calculation (vehicles per minute)
            time_span = (datetime.fromisoformat(recent_history[-1]['timestamp']) - 
                        datetime.fromisoformat(recent_history[0]['timestamp'])).total_seconds()
            
            if time_span > 0:
                avg_count = sum(h['count'] for h in recent_history) / len(recent_history)
                flow_rate = (avg_count * 60) / time_span  # vehicles per minute
                return flow_rate
            
            return 0.0
            
        except Exception as e:
            logger.error(f"Error calculating flow rate: {str(e)}")
            return 0.0
    
    def get_area_statistics(self, area_name: str = None) -> Dict[str, Any]:
        """Get statistics for a specific area or all areas"""
        if area_name:
            return dict(self.area_statistics.get(area_name, {}))
        else:
            return {name: dict(stats) for name, stats in self.area_statistics.items()}
    
    def get_total_detections(self) -> int:
        """Get total number of detections processed"""
        return self.total_detections
    
    def get_uptime(self) -> str:
        """Get system uptime"""
        uptime = datetime.now() - self.start_time
        return str(uptime).split('.')[0]  # Remove microseconds
    
    def reset_statistics(self):
        """Reset all statistics"""
        self.total_detections = 0
        self.start_time = datetime.now()
        self.area_statistics.clear()
        self.vehicle_tracks.clear()
        self.next_track_id = 0
        logger.info("Traffic statistics reset")
    
    def generate_traffic_report(self) -> Dict[str, Any]:
        """Generate comprehensive traffic report"""
        try:
            current_time = datetime.now()
            uptime = current_time - self.start_time
            
            # Overall statistics
            total_areas = len(self.area_statistics)
            total_vehicles_current = sum(
                stats['vehicle_count'] for stats in self.area_statistics.values()
            )
            
            # Congestion summary
            congestion_summary = defaultdict(int)
            for stats in self.area_statistics.values():
                congestion_summary[stats['congestion_level']] += 1
            
            # Vehicle type summary
            vehicle_type_summary = defaultdict(int)
            for stats in self.area_statistics.values():
                for vehicle_type, count in stats['vehicle_types'].items():
                    vehicle_type_summary[vehicle_type] += count
            
            report = {
                'generated_at': current_time.isoformat(),
                'system_uptime': str(uptime).split('.')[0],
                'summary': {
                    'total_areas_monitored': total_areas,
                    'current_total_vehicles': total_vehicles_current,
                    'total_detections_processed': self.total_detections
                },
                'congestion_overview': dict(congestion_summary),
                'vehicle_distribution': dict(vehicle_type_summary),
                'area_details': self.get_area_statistics(),
                'recommendations': self._generate_recommendations()
            }
            
            return report
            
        except Exception as e:
            logger.error(f"Error generating traffic report: {str(e)}")
            return {
                'generated_at': datetime.now().isoformat(),
                'error': str(e)
            }
    
    def _generate_recommendations(self) -> List[str]:
        """Generate traffic management recommendations"""
        recommendations = []
        
        try:
            # Analyze congestion levels
            high_congestion_areas = []
            for area_name, stats in self.area_statistics.items():
                if stats['congestion_level'] in ['high', 'critical']:
                    high_congestion_areas.append(area_name)
            
            if high_congestion_areas:
                recommendations.append(
                    f"High congestion detected in areas: {', '.join(high_congestion_areas)}. "
                    "Consider traffic signal optimization or alternative routing."
                )
            
            # Check for uneven distribution
            vehicle_counts = [stats['vehicle_count'] for stats in self.area_statistics.values()]
            if len(vehicle_counts) > 1:
                max_count = max(vehicle_counts)
                min_count = min(vehicle_counts)
                if max_count > min_count * 3:  # Significant imbalance
                    recommendations.append(
                        "Uneven traffic distribution detected. Consider load balancing strategies."
                    )
            
            # Flow rate recommendations
            low_flow_areas = []
            for area_name, stats in self.area_statistics.items():
                if stats['flow_rate'] < 1.0 and stats['vehicle_count'] > 5:
                    low_flow_areas.append(area_name)
            
            if low_flow_areas:
                recommendations.append(
                    f"Low flow rate in areas: {', '.join(low_flow_areas)}. "
                    "Traffic may be stalled or moving slowly."
                )
            
            if not recommendations:
                recommendations.append("Traffic flow appears normal across all monitored areas.")
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}")
            recommendations.append("Unable to generate recommendations due to analysis error.")
        
        return recommendations
