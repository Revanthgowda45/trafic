"""
Enhanced Traffic Analysis Engine with Perfect Area Detection
Advanced traffic flow analysis with improved area filtering
"""

import cv2
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
import logging
from datetime import datetime, timedelta
from collections import defaultdict, deque
import math

logger = logging.getLogger(__name__)

class EnhancedTrafficAnalyzer:
    """Enhanced traffic analysis with perfect area detection"""
    
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
        
        logger.info("Enhanced TrafficAnalyzer initialized with perfect area detection")
    
    def analyze_area_perfect(self, detections: List[Dict[str, Any]], 
                           image: np.ndarray, area_points: List[Tuple[int, int]], 
                           area_name: str) -> Dict[str, Any]:
        """
        Perfect area analysis with enhanced detection filtering
        
        Args:
            detections: All detections in the frame
            image: Input image
            area_points: Polygon points defining the area
            area_name: Name/ID of the area
            
        Returns:
            Enhanced area-specific analysis
        """
        try:
            logger.info(f"🔧 PERFECT ANALYZER: Starting analysis for {area_name}")
            logger.info(f"🔧 PERFECT ANALYZER: Input - {len(detections)} detections, {len(area_points)} area points")
            
            # Validate inputs
            if not detections:
                logger.warning(f"🔧 PERFECT ANALYZER: No detections provided for {area_name}")
                return self._create_empty_analysis(area_name)
            
            if len(area_points) < 3:
                logger.error(f"🔧 PERFECT ANALYZER: Invalid area polygon for {area_name} - only {len(area_points)} points")
                return self._create_empty_analysis(area_name)
            
            # Create enhanced mask for the area
            mask_result = self._create_enhanced_mask(image, area_points, area_name)
            if not mask_result['success']:
                logger.error(f"🔧 PERFECT ANALYZER: Failed to create mask for {area_name}")
                return self._create_empty_analysis(area_name)
            
            mask = mask_result['mask']
            area_pixels = mask_result['area_pixels']
            
            # Enhanced detection filtering with multiple methods
            area_detections = self._filter_detections_enhanced(detections, mask, area_name)
            
            # Count vehicles by type with normalization
            vehicle_counts = self._count_vehicles_enhanced(area_detections, area_name)
            
            # Calculate enhanced metrics
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
            
            # Calculate flow rate
            flow_rate = self._calculate_flow_rate(area_name)
            area_stats['flow_rate'] = flow_rate
            
            # Create comprehensive analysis result
            analysis = {
                'area_name': area_name,
                'timestamp': datetime.now().isoformat(),
                'total_vehicles': total_vehicles,
                'vehicle_counts': dict(vehicle_counts),
                'vehicle_types': dict(vehicle_counts),  # Alias for compatibility
                'density': round(density, 3),
                'congestion_level': congestion_level,
                'flow_rate': round(flow_rate, 2),
                'area_pixels': area_pixels,
                'detections': area_detections,
                'breakdown': {
                    'cars': vehicle_counts.get('car', 0),
                    'motorcycles': vehicle_counts.get('motorcycle', 0) + vehicle_counts.get('motorbike', 0),
                    'buses': vehicle_counts.get('bus', 0),
                    'trucks': vehicle_counts.get('truck', 0),
                    'bicycles': vehicle_counts.get('bicycle', 0),
                    'pedestrians': vehicle_counts.get('person', 0)
                },
                'debug_info': {
                    'mask_created': True,
                    'area_pixels': area_pixels,
                    'filtering_method': 'enhanced_multi_point',
                    'raw_detections': len(detections),
                    'filtered_detections': len(area_detections)
                }
            }
            
            logger.info(f"🔧 PERFECT ANALYZER: {area_name} - Found {total_vehicles} vehicles in area")
            logger.info(f"🔧 PERFECT ANALYZER: {area_name} - Vehicle breakdown: {dict(vehicle_counts)}")
            
            return analysis
            
        except Exception as e:
            logger.error(f"🔧 PERFECT ANALYZER: Error analyzing area {area_name}: {str(e)}")
            return self._create_error_analysis(area_name, str(e))
    
    def _create_enhanced_mask(self, image: np.ndarray, area_points: List[Tuple[int, int]], 
                            area_name: str) -> Dict[str, Any]:
        """Create enhanced area mask with validation"""
        try:
            height, width = image.shape[:2]
            mask = np.zeros((height, width), dtype=np.uint8)
            
            # Validate and fix area points
            validated_points = []
            for i, (x, y) in enumerate(area_points):
                # Clamp points to image bounds
                x = max(0, min(x, width - 1))
                y = max(0, min(y, height - 1))
                validated_points.append((x, y))
                
                if (x, y) != area_points[i]:
                    logger.warning(f"🔧 PERFECT ANALYZER: {area_name} - Point {i} clamped from {area_points[i]} to ({x}, {y})")
            
            # Create polygon mask
            area_array = np.array(validated_points, dtype=np.int32)
            cv2.fillPoly(mask, [area_array], 255)
            
            # Calculate area
            area_pixels = cv2.countNonZero(mask)
            
            if area_pixels == 0:
                logger.error(f"🔧 PERFECT ANALYZER: {area_name} - Polygon area is 0 pixels")
                return {'success': False, 'error': 'Zero area polygon'}
            
            logger.info(f"🔧 PERFECT ANALYZER: {area_name} - Created mask with {area_pixels} pixels")
            
            return {
                'success': True,
                'mask': mask,
                'area_pixels': area_pixels,
                'validated_points': validated_points
            }
            
        except Exception as e:
            logger.error(f"🔧 PERFECT ANALYZER: {area_name} - Mask creation error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _filter_detections_enhanced(self, detections: List[Dict], mask: np.ndarray, 
                                  area_name: str) -> List[Dict]:
        """Enhanced detection filtering with multiple validation methods"""
        area_detections = []
        height, width = mask.shape
        
        logger.info(f"🔧 PERFECT ANALYZER: {area_name} - Filtering {len(detections)} detections")
        
        for i, detection in enumerate(detections):
            try:
                # Method 1: Center point check
                center_inside = self._check_center_in_area(detection, mask, height, width)
                
                # Method 2: Bounding box overlap check
                bbox_overlap = self._check_bbox_overlap(detection, mask, height, width)
                
                # Method 3: Multiple point check (if bbox available)
                multi_point_check = self._check_multiple_points(detection, mask, height, width)
                
                # Decision logic: detection is inside if any method confirms it
                is_inside = center_inside or bbox_overlap or multi_point_check
                
                if is_inside:
                    area_detections.append(detection)
                    class_name = detection.get('class_name', 'unknown')
                    confidence = detection.get('confidence', 0)
                    center = detection.get('center', {})
                    logger.info(f"✅ PERFECT ANALYZER: {area_name} - Detection {i} ({class_name}, {confidence:.2f}) INSIDE area at ({center.get('x', 0)}, {center.get('y', 0)})")
                else:
                    class_name = detection.get('class_name', 'unknown')
                    center = detection.get('center', {})
                    logger.info(f"❌ PERFECT ANALYZER: {area_name} - Detection {i} ({class_name}) OUTSIDE area at ({center.get('x', 0)}, {center.get('y', 0)})")
                
            except Exception as e:
                logger.error(f"🔧 PERFECT ANALYZER: {area_name} - Error filtering detection {i}: {str(e)}")
                continue
        
        logger.info(f"🔧 PERFECT ANALYZER: {area_name} - Filtered result: {len(area_detections)}/{len(detections)} detections inside area")
        return area_detections
    
    def _check_center_in_area(self, detection: Dict, mask: np.ndarray, height: int, width: int) -> bool:
        """Check if detection center is inside area"""
        try:
            center = detection.get('center', {})
            
            # Handle different center formats
            if isinstance(center, dict):
                center_x = int(center.get('x', -1))
                center_y = int(center.get('y', -1))
            elif isinstance(center, (list, tuple)) and len(center) >= 2:
                center_x = int(center[0])
                center_y = int(center[1])
            else:
                return False
            
            # Check bounds
            if not (0 <= center_x < width and 0 <= center_y < height):
                return False
            
            # Check mask
            return mask[center_y, center_x] > 0
            
        except Exception:
            return False
    
    def _check_bbox_overlap(self, detection: Dict, mask: np.ndarray, height: int, width: int) -> bool:
        """Check if bounding box overlaps with area"""
        try:
            # Try to get bounding box from different possible formats
            bbox = None
            
            if 'bbox' in detection:
                bbox = detection['bbox']
            elif 'box' in detection:
                bbox = detection['box']
            elif all(key in detection for key in ['x1', 'y1', 'x2', 'y2']):
                bbox = [detection['x1'], detection['y1'], detection['x2'], detection['y2']]
            
            if bbox is None or len(bbox) < 4:
                return False
            
            x1, y1, x2, y2 = map(int, bbox[:4])
            
            # Ensure proper order
            x1, x2 = min(x1, x2), max(x1, x2)
            y1, y2 = min(y1, y2), max(y1, y2)
            
            # Clamp to image bounds
            x1 = max(0, min(x1, width - 1))
            x2 = max(0, min(x2, width - 1))
            y1 = max(0, min(y1, height - 1))
            y2 = max(0, min(y2, height - 1))
            
            # Check if any part of bbox overlaps with mask
            bbox_region = mask[y1:y2+1, x1:x2+1]
            return np.any(bbox_region > 0)
            
        except Exception:
            return False
    
    def _check_multiple_points(self, detection: Dict, mask: np.ndarray, height: int, width: int) -> bool:
        """Check multiple points around detection for better accuracy"""
        try:
            center = detection.get('center', {})
            if isinstance(center, dict):
                center_x = int(center.get('x', -1))
                center_y = int(center.get('y', -1))
            else:
                return False
            
            if not (0 <= center_x < width and 0 <= center_y < height):
                return False
            
            # Check center and surrounding points
            check_points = [
                (center_x, center_y),  # Center
                (center_x - 5, center_y),  # Left
                (center_x + 5, center_y),  # Right
                (center_x, center_y - 5),  # Top
                (center_x, center_y + 5),  # Bottom
            ]
            
            inside_count = 0
            for x, y in check_points:
                if 0 <= x < width and 0 <= y < height:
                    if mask[y, x] > 0:
                        inside_count += 1
            
            # Consider inside if majority of points are inside
            return inside_count >= 2
            
        except Exception:
            return False
    
    def _count_vehicles_enhanced(self, detections: List[Dict], area_name: str) -> Dict[str, int]:
        """Enhanced vehicle counting with type normalization"""
        vehicle_counts = defaultdict(int)
        
        for detection in detections:
            class_name = detection.get('class_name', 'unknown').lower().strip()
            
            # Normalize vehicle type names
            normalized_name = self._normalize_vehicle_type(class_name)
            vehicle_counts[normalized_name] += 1
        
        logger.info(f"🔧 PERFECT ANALYZER: {area_name} - Vehicle counts: {dict(vehicle_counts)}")
        return vehicle_counts
    
    def _normalize_vehicle_type(self, class_name: str) -> str:
        """Normalize vehicle type names for consistency"""
        class_name = class_name.lower().strip()
        
        # Mapping for common variations
        type_mapping = {
            'motorbike': 'motorcycle',
            'bike': 'motorcycle',
            'scooter': 'motorcycle',
            'auto': 'auto_rickshaw',
            'rickshaw': 'auto_rickshaw',
            'three_wheeler': 'auto_rickshaw',
            'pickup': 'truck',
            'van': 'car',
            'minivan': 'car',
            'suv': 'car',
            'sedan': 'car',
            'hatchback': 'car',
            'pedestrian': 'person',
            'people': 'person',
            'human': 'person'
        }
        
        return type_mapping.get(class_name, class_name)
    
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
            
            recent_history = list(history)[-10:]
            if len(recent_history) < 2:
                return 0.0
            
            time_span = (datetime.fromisoformat(recent_history[-1]['timestamp']) - 
                        datetime.fromisoformat(recent_history[0]['timestamp'])).total_seconds()
            
            if time_span > 0:
                avg_count = sum(h['count'] for h in recent_history) / len(recent_history)
                flow_rate = (avg_count * 60) / time_span
                return flow_rate
            
            return 0.0
            
        except Exception as e:
            logger.error(f"Error calculating flow rate: {str(e)}")
            return 0.0
    
    def _create_empty_analysis(self, area_name: str) -> Dict[str, Any]:
        """Create empty analysis result"""
        return {
            'area_name': area_name,
            'timestamp': datetime.now().isoformat(),
            'total_vehicles': 0,
            'vehicle_counts': {},
            'vehicle_types': {},
            'density': 0.0,
            'congestion_level': 'low',
            'flow_rate': 0.0,
            'area_pixels': 0,
            'detections': [],
            'breakdown': {
                'cars': 0,
                'motorcycles': 0,
                'buses': 0,
                'trucks': 0,
                'bicycles': 0,
                'pedestrians': 0
            },
            'debug_info': {
                'error': 'Empty or invalid input'
            }
        }
    
    def _create_error_analysis(self, area_name: str, error: str) -> Dict[str, Any]:
        """Create error analysis result"""
        return {
            'area_name': area_name,
            'timestamp': datetime.now().isoformat(),
            'error': error,
            'total_vehicles': 0,
            'vehicle_counts': {},
            'vehicle_types': {},
            'congestion_level': 'unknown',
            'debug_info': {
                'error': error
            }
        }
    
    # Compatibility methods for existing code
    def analyze_area(self, detections: List[Dict[str, Any]], 
                    image: np.ndarray, area_points: List[Tuple[int, int]], 
                    area_name: str) -> Dict[str, Any]:
        """Compatibility wrapper for existing code"""
        return self.analyze_area_perfect(detections, image, area_points, area_name)
    
    def get_total_detections(self) -> int:
        """Get total number of detections processed"""
        return self.total_detections
    
    def get_uptime(self) -> str:
        """Get system uptime"""
        uptime = datetime.now() - self.start_time
        return str(uptime).split('.')[0]
