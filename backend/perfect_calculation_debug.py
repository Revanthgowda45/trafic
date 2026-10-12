"""
Perfect Calculation Troubleshooting System
Smart India Hackathon 2025 - AI Traffic Optimizer
Advanced debugging for detection and area filtering issues
"""

import cv2
import numpy as np
from typing import List, Dict, Any, Tuple
import logging
from datetime import datetime
import json
import os

logger = logging.getLogger(__name__)

class PerfectCalculationDebugger:
    """Advanced debugging system for traffic detection calculations"""
    
    def __init__(self, debug_output_dir: str = "debug_output"):
        self.debug_output_dir = debug_output_dir
        self.debug_session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Create debug output directory
        os.makedirs(debug_output_dir, exist_ok=True)
        
        # Debug counters
        self.debug_frame_count = 0
        self.total_raw_detections = 0
        self.total_area_detections = 0
        
        logger.info(f"🔧 Perfect Calculation Debugger initialized - Session: {self.debug_session_id}")
    
    def debug_detection_pipeline(self, 
                                raw_detections: List[Dict], 
                                image: np.ndarray,
                                area_points: List[Tuple[int, int]],
                                lane_name: str) -> Dict[str, Any]:
        """
        Comprehensive debugging of the detection pipeline
        
        Args:
            raw_detections: Raw YOLO detections
            image: Input image
            area_points: Area polygon points
            lane_name: Lane identifier
            
        Returns:
            Detailed debug information
        """
        self.debug_frame_count += 1
        debug_info = {
            'session_id': self.debug_session_id,
            'frame_count': self.debug_frame_count,
            'lane_name': lane_name,
            'timestamp': datetime.now().isoformat(),
            'image_shape': image.shape,
            'raw_detections_count': len(raw_detections),
            'area_points_count': len(area_points),
            'issues_found': [],
            'recommendations': []
        }
        
        try:
            # 1. Validate raw detections
            logger.info(f"🔍 DEBUG: {lane_name} - Analyzing {len(raw_detections)} raw detections")
            
            valid_detections = []
            invalid_detections = []
            
            for i, detection in enumerate(raw_detections):
                validation_result = self._validate_detection(detection, i, image.shape)
                if validation_result['valid']:
                    valid_detections.append(detection)
                else:
                    invalid_detections.append({
                        'detection': detection,
                        'issues': validation_result['issues']
                    })
            
            debug_info['valid_detections'] = len(valid_detections)
            debug_info['invalid_detections'] = len(invalid_detections)
            debug_info['invalid_detection_details'] = invalid_detections
            
            # 2. Validate area polygon
            area_validation = self._validate_area_polygon(area_points, image.shape)
            debug_info['area_validation'] = area_validation
            
            if not area_validation['valid']:
                debug_info['issues_found'].extend(area_validation['issues'])
                debug_info['recommendations'].extend(area_validation['recommendations'])
            
            # 3. Test area filtering with detailed logging
            area_filtering_result = self._debug_area_filtering(
                valid_detections, image, area_points, lane_name
            )
            debug_info.update(area_filtering_result)
            
            # 4. Generate debug visualization
            debug_image = self._create_debug_visualization(
                image, valid_detections, area_points, area_filtering_result, lane_name
            )
            
            # Save debug image
            debug_image_path = os.path.join(
                self.debug_output_dir, 
                f"debug_{self.debug_session_id}_{lane_name}_frame_{self.debug_frame_count}.jpg"
            )
            cv2.imwrite(debug_image_path, debug_image)
            debug_info['debug_image_path'] = debug_image_path
            
            # 5. Calculate perfect timing
            perfect_timing = self._calculate_perfect_timing(
                area_filtering_result['area_detections'], lane_name
            )
            debug_info['perfect_timing'] = perfect_timing
            
            # 6. Generate final recommendations
            final_recommendations = self._generate_final_recommendations(debug_info)
            debug_info['final_recommendations'] = final_recommendations
            
            # Save debug report
            self._save_debug_report(debug_info, lane_name)
            
            # Log summary
            self._log_debug_summary(debug_info)
            
            return debug_info
            
        except Exception as e:
            logger.error(f"🚨 DEBUG ERROR in {lane_name}: {str(e)}")
            debug_info['debug_error'] = str(e)
            return debug_info
    
    def _validate_detection(self, detection: Dict, index: int, image_shape: Tuple) -> Dict:
        """Validate a single detection"""
        validation = {'valid': True, 'issues': []}
        
        try:
            # Check required fields
            required_fields = ['center', 'class_name', 'confidence']
            for field in required_fields:
                if field not in detection:
                    validation['valid'] = False
                    validation['issues'].append(f"Missing required field: {field}")
            
            if 'center' in detection:
                center = detection['center']
                if isinstance(center, dict):
                    x = center.get('x', -1)
                    y = center.get('y', -1)
                else:
                    validation['valid'] = False
                    validation['issues'].append("Center is not a dictionary")
                    return validation
                
                # Check if center is within image bounds
                height, width = image_shape[:2]
                if not (0 <= x < width):
                    validation['valid'] = False
                    validation['issues'].append(f"Center X ({x}) out of image bounds (0-{width})")
                
                if not (0 <= y < height):
                    validation['valid'] = False
                    validation['issues'].append(f"Center Y ({y}) out of image bounds (0-{height})")
            
            # Check confidence
            if 'confidence' in detection:
                conf = detection['confidence']
                if not isinstance(conf, (int, float)) or conf < 0 or conf > 1:
                    validation['issues'].append(f"Invalid confidence value: {conf}")
            
        except Exception as e:
            validation['valid'] = False
            validation['issues'].append(f"Validation error: {str(e)}")
        
        return validation
    
    def _validate_area_polygon(self, area_points: List[Tuple], image_shape: Tuple) -> Dict:
        """Validate area polygon"""
        validation = {
            'valid': True, 
            'issues': [], 
            'recommendations': [],
            'area_pixels': 0,
            'polygon_bounds': None
        }
        
        try:
            if len(area_points) < 3:
                validation['valid'] = False
                validation['issues'].append(f"Polygon has only {len(area_points)} points (minimum 3 required)")
                validation['recommendations'].append("Define at least 3 points for the detection area")
                return validation
            
            # Check if points are within image bounds
            height, width = image_shape[:2]
            out_of_bounds_points = []
            
            for i, (x, y) in enumerate(area_points):
                if not (0 <= x < width) or not (0 <= y < height):
                    out_of_bounds_points.append(f"Point {i}: ({x}, {y})")
            
            if out_of_bounds_points:
                validation['issues'].append(f"Points out of bounds: {', '.join(out_of_bounds_points)}")
                validation['recommendations'].append("Ensure all polygon points are within image dimensions")
            
            # Calculate polygon area
            try:
                mask = np.zeros((height, width), dtype=np.uint8)
                area_array = np.array(area_points, dtype=np.int32)
                cv2.fillPoly(mask, [area_array], 255)
                area_pixels = cv2.countNonZero(mask)
                validation['area_pixels'] = area_pixels
                
                if area_pixels == 0:
                    validation['valid'] = False
                    validation['issues'].append("Polygon area is 0 pixels")
                    validation['recommendations'].append("Check polygon point order and ensure it forms a valid shape")
                elif area_pixels < 1000:
                    validation['issues'].append(f"Very small polygon area: {area_pixels} pixels")
                    validation['recommendations'].append("Consider using a larger detection area for better accuracy")
                
                # Calculate bounding box
                x_coords = [p[0] for p in area_points]
                y_coords = [p[1] for p in area_points]
                validation['polygon_bounds'] = {
                    'min_x': min(x_coords),
                    'max_x': max(x_coords),
                    'min_y': min(y_coords),
                    'max_y': max(y_coords),
                    'width': max(x_coords) - min(x_coords),
                    'height': max(y_coords) - min(y_coords)
                }
                
            except Exception as e:
                validation['valid'] = False
                validation['issues'].append(f"Error calculating polygon area: {str(e)}")
        
        except Exception as e:
            validation['valid'] = False
            validation['issues'].append(f"Polygon validation error: {str(e)}")
        
        return validation
    
    def _debug_area_filtering(self, detections: List[Dict], image: np.ndarray, 
                             area_points: List[Tuple], lane_name: str) -> Dict:
        """Debug the area filtering process in detail"""
        result = {
            'area_detections': [],
            'outside_detections': [],
            'filtering_details': [],
            'mask_created': False,
            'mask_error': None
        }
        
        try:
            # Create area mask
            height, width = image.shape[:2]
            mask = np.zeros((height, width), dtype=np.uint8)
            area_array = np.array(area_points, dtype=np.int32)
            cv2.fillPoly(mask, [area_array], 255)
            result['mask_created'] = True
            
            logger.info(f"🔍 DEBUG: {lane_name} - Created mask for area with {len(area_points)} points")
            logger.info(f"🔍 DEBUG: {lane_name} - Mask shape: {mask.shape}, Non-zero pixels: {cv2.countNonZero(mask)}")
            
            # Test each detection
            for i, detection in enumerate(detections):
                try:
                    center = detection.get('center', {})
                    center_x = int(center.get('x', -1))
                    center_y = int(center.get('y', -1))
                    class_name = detection.get('class_name', 'unknown')
                    confidence = detection.get('confidence', 0)
                    
                    # Check bounds
                    within_bounds = (0 <= center_y < height and 0 <= center_x < width)
                    
                    # Check mask
                    inside_area = False
                    mask_value = 0
                    if within_bounds:
                        mask_value = mask[center_y, center_x]
                        inside_area = mask_value > 0
                    
                    filtering_detail = {
                        'detection_index': i,
                        'class_name': class_name,
                        'confidence': round(confidence, 3),
                        'center': {'x': center_x, 'y': center_y},
                        'within_bounds': within_bounds,
                        'mask_value': int(mask_value),
                        'inside_area': inside_area
                    }
                    
                    result['filtering_details'].append(filtering_detail)
                    
                    if inside_area:
                        result['area_detections'].append(detection)
                        logger.info(f"✅ DEBUG: {lane_name} - Detection {i} ({class_name}) INSIDE area at ({center_x}, {center_y})")
                    else:
                        result['outside_detections'].append(detection)
                        reason = "out of bounds" if not within_bounds else f"mask value {mask_value}"
                        logger.info(f"❌ DEBUG: {lane_name} - Detection {i} ({class_name}) OUTSIDE area at ({center_x}, {center_y}) - {reason}")
                
                except Exception as e:
                    logger.error(f"🚨 DEBUG: {lane_name} - Error processing detection {i}: {str(e)}")
                    filtering_detail = {
                        'detection_index': i,
                        'error': str(e)
                    }
                    result['filtering_details'].append(filtering_detail)
            
            logger.info(f"🔍 DEBUG: {lane_name} - Area filtering complete: {len(result['area_detections'])} inside, {len(result['outside_detections'])} outside")
            
        except Exception as e:
            result['mask_error'] = str(e)
            logger.error(f"🚨 DEBUG: {lane_name} - Area filtering error: {str(e)}")
        
        return result
    
    def _create_debug_visualization(self, image: np.ndarray, detections: List[Dict], 
                                   area_points: List[Tuple], filtering_result: Dict, 
                                   lane_name: str) -> np.ndarray:
        """Create comprehensive debug visualization"""
        debug_image = image.copy()
        
        try:
            # Draw area polygon
            if len(area_points) >= 3:
                area_array = np.array(area_points, dtype=np.int32)
                cv2.polylines(debug_image, [area_array], True, (0, 255, 255), 3)  # Yellow polygon
                cv2.fillPoly(debug_image, [area_array], (0, 255, 255, 50))  # Semi-transparent fill
            
            # Draw all detections
            for i, detection in enumerate(detections):
                center = detection.get('center', {})
                x = int(center.get('x', -1))
                y = int(center.get('y', -1))
                class_name = detection.get('class_name', 'unknown')
                confidence = detection.get('confidence', 0)
                
                # Check if this detection is inside the area
                is_inside = any(
                    det.get('center', {}).get('x') == center.get('x') and 
                    det.get('center', {}).get('y') == center.get('y')
                    for det in filtering_result.get('area_detections', [])
                )
                
                # Color coding: Green for inside area, Red for outside
                color = (0, 255, 0) if is_inside else (0, 0, 255)
                
                # Draw detection point
                cv2.circle(debug_image, (x, y), 8, color, -1)
                cv2.circle(debug_image, (x, y), 12, (255, 255, 255), 2)
                
                # Draw label
                label = f"{i}: {class_name} ({confidence:.2f})"
                label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)[0]
                cv2.rectangle(debug_image, (x - 5, y - 25), (x + label_size[0] + 5, y - 5), (0, 0, 0), -1)
                cv2.putText(debug_image, label, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            
            # Add summary text
            summary_text = [
                f"Lane: {lane_name}",
                f"Raw Detections: {len(detections)}",
                f"Inside Area: {len(filtering_result.get('area_detections', []))}",
                f"Outside Area: {len(filtering_result.get('outside_detections', []))}",
                f"Area Points: {len(area_points)}"
            ]
            
            for i, text in enumerate(summary_text):
                cv2.putText(debug_image, text, (10, 30 + i * 25), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                cv2.putText(debug_image, text, (10, 30 + i * 25), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 1)
        
        except Exception as e:
            logger.error(f"🚨 DEBUG: Error creating visualization: {str(e)}")
        
        return debug_image
    
    def _calculate_perfect_timing(self, area_detections: List[Dict], lane_name: str) -> Dict:
        """Calculate perfect timing based on area detections"""
        timing_info = {
            'vehicle_count': len(area_detections),
            'vehicle_breakdown': {},
            'total_weight': 0.0,
            'calculated_time': 0,
            'base_time': 5,
            'multiplier': 3.0
        }
        
        # Vehicle weights (same as in main system)
        vehicle_weights = {
            'car': 1.0,
            'motorbike': 0.8,
            'motorcycle': 0.8,
            'three_wheelers': 1.5,
            'pickup': 2.0,
            'auto_rickshaw': 1.5,
            'minivan': 2.0,
            'bus': 2.0,
            'bicycle': 1.6,
            'truck': 2.5,
            'van': 1.1,
            'ambulance': 1.1,
            'person': 0.5
        }
        
        try:
            # Count vehicle types
            vehicle_counts = {}
            for detection in area_detections:
                class_name = detection.get('class_name', 'unknown').lower()
                vehicle_counts[class_name] = vehicle_counts.get(class_name, 0) + 1
            
            timing_info['vehicle_breakdown'] = vehicle_counts
            
            # Calculate total weight
            total_weight = 0.0
            for vehicle_type, count in vehicle_counts.items():
                weight = vehicle_weights.get(vehicle_type, 1.0)
                total_weight += count * weight
                logger.info(f"🧮 DEBUG: {lane_name} - {vehicle_type}: {count} × {weight} = {count * weight}")
            
            timing_info['total_weight'] = total_weight
            
            # Calculate time
            if total_weight > 0:
                calculated_time = int(total_weight * timing_info['multiplier'])
                timing_info['calculated_time'] = max(calculated_time, timing_info['base_time'])
            else:
                timing_info['calculated_time'] = timing_info['base_time']
            
            logger.info(f"🧮 DEBUG: {lane_name} - Perfect timing calculation:")
            logger.info(f"🧮 DEBUG: {lane_name} - Vehicle count: {timing_info['vehicle_count']}")
            logger.info(f"🧮 DEBUG: {lane_name} - Total weight: {total_weight}")
            logger.info(f"🧮 DEBUG: {lane_name} - Calculated time: {timing_info['calculated_time']}s")
        
        except Exception as e:
            logger.error(f"🚨 DEBUG: {lane_name} - Timing calculation error: {str(e)}")
            timing_info['error'] = str(e)
        
        return timing_info
    
    def _generate_final_recommendations(self, debug_info: Dict) -> List[str]:
        """Generate actionable recommendations based on debug analysis"""
        recommendations = []
        
        try:
            # Check for area filtering issues
            raw_count = debug_info.get('raw_detections_count', 0)
            area_count = len(debug_info.get('area_detections', []))
            
            if raw_count > 0 and area_count == 0:
                recommendations.append("🚨 CRITICAL: All detections are outside the defined area. Check area polygon coordinates.")
                recommendations.append("💡 SOLUTION: Verify that area points are correctly defined and within image bounds.")
            
            elif raw_count > area_count * 2:
                recommendations.append("⚠️ WARNING: Many detections are outside the area. Consider expanding the detection zone.")
            
            # Check area validation issues
            area_validation = debug_info.get('area_validation', {})
            if not area_validation.get('valid', True):
                recommendations.append("🚨 AREA ISSUE: Detection area polygon has validation errors.")
                recommendations.extend([f"   - {issue}" for issue in area_validation.get('issues', [])])
            
            # Check for invalid detections
            invalid_count = debug_info.get('invalid_detections', 0)
            if invalid_count > 0:
                recommendations.append(f"⚠️ DATA QUALITY: {invalid_count} invalid detections found. Check YOLO model output format.")
            
            # Performance recommendations
            area_pixels = area_validation.get('area_pixels', 0)
            if area_pixels > 0 and area_pixels < 1000:
                recommendations.append("📏 PERFORMANCE: Detection area is very small. Consider using a larger area for better accuracy.")
            
            if not recommendations:
                recommendations.append("✅ PERFECT: No issues detected in the calculation pipeline!")
        
        except Exception as e:
            recommendations.append(f"🚨 ERROR: Failed to generate recommendations: {str(e)}")
        
        return recommendations
    
    def _save_debug_report(self, debug_info: Dict, lane_name: str):
        """Save detailed debug report to file"""
        try:
            report_path = os.path.join(
                self.debug_output_dir,
                f"debug_report_{self.debug_session_id}_{lane_name}_frame_{self.debug_frame_count}.json"
            )
            
            with open(report_path, 'w') as f:
                json.dump(debug_info, f, indent=2, default=str)
            
            logger.info(f"💾 DEBUG: Report saved to {report_path}")
        
        except Exception as e:
            logger.error(f"🚨 DEBUG: Failed to save report: {str(e)}")
    
    def _log_debug_summary(self, debug_info: Dict):
        """Log comprehensive debug summary"""
        lane_name = debug_info.get('lane_name', 'Unknown')
        
        logger.info(f"")
        logger.info(f"🔧 ===== PERFECT CALCULATION DEBUG SUMMARY =====")
        logger.info(f"🔧 Lane: {lane_name}")
        logger.info(f"🔧 Session: {debug_info.get('session_id', 'Unknown')}")
        logger.info(f"🔧 Frame: {debug_info.get('frame_count', 0)}")
        logger.info(f"🔧 ===============================================")
        logger.info(f"📊 Raw Detections: {debug_info.get('raw_detections_count', 0)}")
        logger.info(f"📊 Valid Detections: {debug_info.get('valid_detections', 0)}")
        logger.info(f"📊 Invalid Detections: {debug_info.get('invalid_detections', 0)}")
        logger.info(f"📊 Area Detections: {len(debug_info.get('area_detections', []))}")
        logger.info(f"📊 Outside Detections: {len(debug_info.get('outside_detections', []))}")
        
        # Area validation
        area_validation = debug_info.get('area_validation', {})
        logger.info(f"🎯 Area Valid: {area_validation.get('valid', 'Unknown')}")
        logger.info(f"🎯 Area Pixels: {area_validation.get('area_pixels', 0)}")
        
        # Perfect timing
        perfect_timing = debug_info.get('perfect_timing', {})
        logger.info(f"⏱️ Vehicle Count: {perfect_timing.get('vehicle_count', 0)}")
        logger.info(f"⏱️ Total Weight: {perfect_timing.get('total_weight', 0)}")
        logger.info(f"⏱️ Calculated Time: {perfect_timing.get('calculated_time', 0)}s")
        
        # Issues and recommendations
        issues = debug_info.get('issues_found', [])
        if issues:
            logger.info(f"🚨 Issues Found: {len(issues)}")
            for issue in issues:
                logger.info(f"   - {issue}")
        
        recommendations = debug_info.get('final_recommendations', [])
        if recommendations:
            logger.info(f"💡 Recommendations:")
            for rec in recommendations:
                logger.info(f"   {rec}")
        
        logger.info(f"🔧 ===============================================")
        logger.info(f"")

# Global debugger instance
perfect_debugger = PerfectCalculationDebugger()

def debug_detection_calculation(raw_detections: List[Dict], 
                              image: np.ndarray,
                              area_points: List[Tuple[int, int]],
                              lane_name: str) -> Dict[str, Any]:
    """
    Main debugging function to be called from main.py
    
    Args:
        raw_detections: Raw YOLO detections
        image: Input image
        area_points: Area polygon points
        lane_name: Lane identifier
        
    Returns:
        Debug analysis results
    """
    return perfect_debugger.debug_detection_pipeline(
        raw_detections, image, area_points, lane_name
    )
