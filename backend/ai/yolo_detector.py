"""
YOLOv8 Detection Engine for Traffic Monitoring
Advanced vehicle detection with tracking and area analysis
"""

import cv2
import numpy as np
from ultralytics import YOLO
import torch
from typing import List, Dict, Any, Tuple, Optional
import logging
import asyncio
from datetime import datetime
import os

logger = logging.getLogger(__name__)

class YOLODetector:
    """Advanced YOLOv8 detector for traffic monitoring"""
    
    def __init__(self, model_path: str = "yolov8s.pt"):  # Use YOLOv8s for better accuracy
        self.model_path = model_path
        self.model = None
        self.is_initialized = False
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Vehicle classes from COCO dataset
        self.vehicle_classes = {
            2: "car",
            3: "motorcycle", 
            5: "bus",
            7: "truck",
            1: "bicycle",
            0: "person"  # pedestrians
        }
        
        # Detection parameters - Optimized for higher accuracy
        self.confidence_threshold = 0.3  # Lower threshold to catch more objects
        self.iou_threshold = 0.5  # Higher threshold for better overlap handling
        self.max_detections = 300  # More detections allowed
        self.agnostic_nms = True  # Better non-maximum suppression
        
        # Performance tracking
        self.detection_count = 0
        self.total_inference_time = 0.0
        
        logger.info(f"YOLODetector initialized with device: {self.device}")
    
    async def initialize(self):
        """Initialize the YOLO model"""
        try:
            # Check if model file exists
            if not os.path.exists(self.model_path):
                # Try to find model in parent directory
                parent_model = os.path.join("..", self.model_path)
                if os.path.exists(parent_model):
                    self.model_path = parent_model
                else:
                    logger.warning(f"Model file not found: {self.model_path}")
                    logger.info("Downloading YOLOv8 model...")
            
            # Load model
            self.model = YOLO(self.model_path)
            self.model.to(self.device)
            
            # Warm up the model
            dummy_image = np.zeros((640, 640, 3), dtype=np.uint8)
            _ = self.model(dummy_image, verbose=False)
            
            self.is_initialized = True
            logger.info(f"YOLOv8 model loaded successfully on {self.device}")
            
        except Exception as e:
            logger.error(f"Failed to initialize YOLO model: {str(e)}")
            raise
    
    def preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """
        Preprocess image for better detection accuracy
        """
        # Ensure image is in RGB format
        if len(image.shape) == 3 and image.shape[2] == 3:
            # Convert BGR to RGB if needed (OpenCV uses BGR by default)
            if image.dtype == np.uint8:
                image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Enhance image quality for better detection
        # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
        if len(image.shape) == 3:
            lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
            lab[:,:,0] = clahe.apply(lab[:,:,0])
            image = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
        
        return image

    async def detect_objects(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """
        Detect objects in an image with enhanced accuracy
        
        Args:
            image: Input image as numpy array
            
        Returns:
            List of detection dictionaries
        """
        if not self.is_initialized:
            await self.initialize()
        
        try:
            start_time = datetime.now()
            
            # Fast image pass directly to YOLO with traffic classes only
            results = self.model(
                image,
                conf=self.confidence_threshold,
                iou=self.iou_threshold,
                max_det=100,
                classes=list(self.vehicle_classes.keys()),
                agnostic_nms=self.agnostic_nms,
                verbose=False,
                half=False,
                augment=False,  # Disabled for maximum real-time FPS
                imgsz=416       # Optimal multiple-of-32 real-time resolution
            )
            
            # Process results
            detections = []
            if results and len(results) > 0:
                result = results[0]
                
                if result.boxes is not None:
                    boxes = result.boxes.xyxy.cpu().numpy()
                    confidences = result.boxes.conf.cpu().numpy()
                    class_ids = result.boxes.cls.cpu().numpy().astype(int)
                    
                    for i, (box, conf, class_id) in enumerate(zip(boxes, confidences, class_ids)):
                        # Filter for vehicle classes with improved confidence thresholds
                        if class_id in self.vehicle_classes:
                            x1, y1, x2, y2 = box
                            
                            # Calculate box dimensions for quality filtering
                            width = x2 - x1
                            height = y2 - y1
                            area = width * height
                            
                            # Filter out very small detections (likely false positives)
                            min_area = 100  # Minimum area threshold
                            if area < min_area:
                                continue
                            
                            # Apply class-specific confidence thresholds for better accuracy
                            class_specific_thresholds = {
                                2: 0.25,  # car - lower threshold (more common)
                                3: 0.35,  # motorcycle - higher threshold (smaller, harder to detect)
                                5: 0.30,  # bus - medium threshold
                                7: 0.30,  # truck - medium threshold
                                1: 0.40,  # bicycle - higher threshold (very small)
                                0: 0.45   # person - highest threshold (most false positives)
                            }
                            
                            min_conf = class_specific_thresholds.get(class_id, self.confidence_threshold)
                            if conf < min_conf:
                                continue
                            
                            detection = {
                                "id": i,
                                "class_id": int(class_id),
                                "class_name": self.vehicle_classes[class_id],
                                "confidence": float(conf),
                                "bbox": {
                                    "x1": float(x1),
                                    "y1": float(y1),
                                    "x2": float(x2),
                                    "y2": float(y2)
                                },
                                "center": {
                                    "x": float((x1 + x2) / 2),
                                    "y": float((y1 + y2) / 2)
                                },
                                "area": float(area),
                                "width": float(width),
                                "height": float(height),
                                "aspect_ratio": float(width / height) if height > 0 else 1.0,
                                "timestamp": datetime.now().isoformat()
                            }
                            detections.append(detection)
            
            # Update performance metrics
            inference_time = (datetime.now() - start_time).total_seconds()
            self.detection_count += 1
            self.total_inference_time += inference_time
            
            logger.debug(f"Detected {len(detections)} objects in {inference_time:.3f}s")
            
            return detections
            
        except Exception as e:
            logger.error(f"Error during object detection: {str(e)}")
            return []
    
    def detect_in_areas(self, image: np.ndarray, areas: List[List[Tuple[int, int]]]) -> Dict[str, List[Dict[str, Any]]]:
        """
        Detect objects within specific areas
        
        Args:
            image: Input image
            areas: List of polygon areas (each area is a list of (x, y) points)
            
        Returns:
            Dictionary mapping area indices to detections
        """
        try:
            # Get all detections
            all_detections = asyncio.run(self.detect_objects(image))
            
            area_detections = {}
            
            for area_idx, area_points in enumerate(areas):
                area_key = f"area_{area_idx}"
                area_detections[area_key] = []
                
                # Create mask for the area
                mask = np.zeros(image.shape[:2], dtype=np.uint8)
                area_array = np.array(area_points, dtype=np.int32)
                cv2.fillPoly(mask, [area_array], 255)
                
                # Filter detections within this area
                for detection in all_detections:
                    center_x = int(detection["center"]["x"])
                    center_y = int(detection["center"]["y"])
                    
                    # Check if detection center is within the area
                    if mask[center_y, center_x] > 0:
                        detection["area_id"] = area_key
                        area_detections[area_key].append(detection)
            
            return area_detections
            
        except Exception as e:
            logger.error(f"Error detecting in areas: {str(e)}")
            return {}
    
    def draw_detections(self, image: np.ndarray, detections: List[Dict[str, Any]], 
                       draw_labels: bool = True, draw_confidence: bool = True) -> np.ndarray:
        """
        Draw detection boxes on image
        
        Args:
            image: Input image
            detections: List of detections
            draw_labels: Whether to draw class labels
            draw_confidence: Whether to draw confidence scores
            
        Returns:
            Image with drawn detections
        """
        result_image = image.copy()
        
        # Color map for different vehicle types
        color_map = {
            "car": (0, 255, 0),        # Green
            "motorcycle": (255, 0, 0),  # Blue
            "bus": (0, 0, 255),        # Red
            "truck": (255, 255, 0),    # Cyan
            "bicycle": (255, 0, 255),  # Magenta
            "person": (0, 255, 255)    # Yellow
        }
        
        for detection in detections:
            bbox = detection["bbox"]
            class_name = detection["class_name"]
            confidence = detection["confidence"]
            
            # Get coordinates
            x1, y1 = int(bbox["x1"]), int(bbox["y1"])
            x2, y2 = int(bbox["x2"]), int(bbox["y2"])
            
            # Get color
            color = color_map.get(class_name, (128, 128, 128))
            
            # Draw bounding box
            cv2.rectangle(result_image, (x1, y1), (x2, y2), color, 2)
            
            # Draw label and confidence
            if draw_labels or draw_confidence:
                label_parts = []
                if draw_labels:
                    label_parts.append(class_name)
                if draw_confidence:
                    label_parts.append(f"{confidence:.2f}")
                
                label = " ".join(label_parts)
                
                # Calculate text size
                font = cv2.FONT_HERSHEY_SIMPLEX
                font_scale = 0.6
                thickness = 1
                (text_width, text_height), _ = cv2.getTextSize(label, font, font_scale, thickness)
                
                # Draw background rectangle
                cv2.rectangle(result_image, (x1, y1 - text_height - 10), 
                            (x1 + text_width, y1), color, -1)
                
                # Draw text
                cv2.putText(result_image, label, (x1, y1 - 5), 
                          font, font_scale, (255, 255, 255), thickness)
        
        return result_image
    
    async def update_config(self, config: Dict[str, Any]):
        """Update detector configuration"""
        try:
            if "confidence_threshold" in config:
                self.confidence_threshold = config["confidence_threshold"]
            if "iou_threshold" in config:
                self.iou_threshold = config["iou_threshold"]
            if "max_detections" in config:
                self.max_detections = config["max_detections"]
            
            logger.info("Detector configuration updated")
            
        except Exception as e:
            logger.error(f"Error updating config: {str(e)}")
            raise
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get model information"""
        return {
            "model_path": self.model_path,
            "device": self.device,
            "is_initialized": self.is_initialized,
            "confidence_threshold": self.confidence_threshold,
            "iou_threshold": self.iou_threshold,
            "max_detections": self.max_detections,
            "supported_classes": list(self.vehicle_classes.values()),
            "detection_count": self.detection_count,
            "avg_inference_time": (
                self.total_inference_time / self.detection_count 
                if self.detection_count > 0 else 0
            )
        }
    
    def reset_stats(self):
        """Reset performance statistics"""
        self.detection_count = 0
        self.total_inference_time = 0.0
        logger.info("Detection statistics reset")
