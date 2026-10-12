"""
Advanced YOLOv9 Traffic Detection System
Smart India Hackathon 2025 - AI Traffic Optimizer
Enhanced accuracy with YOLOv9 architecture
"""

import torch
import cv2
import numpy as np
from typing import List, Dict, Any, Optional
import logging
import asyncio
from datetime import datetime
import os
from pathlib import Path

# Use ultralytics which supports YOLOv9 models natively
from ultralytics import YOLO
YOLOV9_AVAILABLE = True  # Ultralytics supports YOLOv9

logger = logging.getLogger(__name__)

class YOLOv9Detector:
    """Advanced YOLOv9 detector for traffic monitoring with enhanced accuracy"""
    
    def __init__(self, model_path: str = "yolov9c.pt"):  # YOLOv9c for best balance
        self.model_path = model_path
        self.model = None
        self.is_initialized = False
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Enhanced vehicle classes optimized for Indian traffic
        self.vehicle_classes = {
            0: "person",           # pedestrians
            1: "bicycle",          # bicycles (including cycle-rickshaws)
            2: "car",              # cars (including hatchbacks, sedans, SUVs)
            3: "motorcycle",       # motorcycles (including scooters, bikes)
            5: "bus",              # buses (city buses, private buses)
            7: "truck",            # trucks (all types - mini trucks, heavy trucks)
            # Additional Indian vehicle categories
            4: "airplane",         # airplanes
            6: "train",            # trains
            8: "boat",             # boats
            # Animals common on Indian roads
            15: "cat",             # cats
            16: "dog",             # dogs (street dogs)
            17: "horse",           # horses (horse carts)
            18: "sheep",           # sheep
            19: "cow",             # cows (sacred animals on roads)
            20: "elephant",        # elephants (in some regions)
        }
        
        # Indian vehicle type mapping for better classification
        self.indian_vehicle_mapping = {
            "motorcycle": ["scooter", "bike", "motorcycle", "two-wheeler"],
            "car": ["car", "hatchback", "sedan", "suv", "taxi", "cab"],
            "truck": ["truck", "mini-truck", "heavy-truck", "goods-vehicle", "lorry"],
            "bus": ["bus", "city-bus", "private-bus", "school-bus"],
            "bicycle": ["bicycle", "cycle", "cycle-rickshaw"],
            "person": ["pedestrian", "person", "people"]
        }
        
        # Maximum accuracy detection parameters for YOLOv9
        self.confidence_threshold = 0.15  # Very low for maximum detection
        self.iou_threshold = 0.7  # Higher for better overlap handling
        self.max_detections = 1000  # Maximum detections allowed
        self.agnostic_nms = True
        
        # YOLOv9 specific parameters
        self.use_multi_scale = True  # Multi-scale inference
        self.use_tta = True  # Test-time augmentation
        
        # Advanced duplicate removal parameters
        self.duplicate_threshold = 0.8  # IoU threshold for duplicate detection
        self.confidence_boost_factor = 1.2  # Boost factor for Indian vehicles
        
        # Performance tracking
        self.detection_count = 0
        self.total_inference_time = 0.0
        
        logger.info(f"YOLOv9Detector initialized with device: {self.device}")
        logger.info(f"YOLOv9 native support: {YOLOV9_AVAILABLE}")
    
    async def initialize(self):
        """Initialize the YOLOv9 model"""
        try:
            logger.info(f"Loading YOLOv9 model: {self.model_path}")
            
            # Use ultralytics YOLO which supports YOLOv9 models
            self.model = YOLO(self.model_path)
            logger.info("Using ultralytics YOLOv9 implementation")
            
            # Move model to appropriate device
            if hasattr(self.model, 'to'):
                self.model.to(self.device)
            
            # Warm up the model with a dummy inference
            dummy_image = np.zeros((640, 640, 3), dtype=np.uint8)
            _ = self.model(dummy_image, verbose=False)
            
            self.is_initialized = True
            logger.info(f"YOLOv9 model loaded successfully on {self.device}")
            
        except Exception as e:
            logger.error(f"Failed to initialize YOLOv9 model: {str(e)}")
            logger.info("Falling back to YOLOv8...")
            # Fallback to YOLOv8 if YOLOv9 fails
            try:
                self.model = YOLO("yolov8s.pt")
                self.model.to(self.device)
                dummy_image = np.zeros((640, 640, 3), dtype=np.uint8)
                _ = self.model(dummy_image, verbose=False)
                self.is_initialized = True
                logger.info("Successfully loaded YOLOv8 as fallback")
            except Exception as fallback_error:
                logger.error(f"Fallback to YOLOv8 also failed: {str(fallback_error)}")
                raise
    
    def preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """
        Maximum accuracy preprocessing for YOLOv9
        """
        # Ensure image is in RGB format
        if len(image.shape) == 3 and image.shape[2] == 3:
            if image.dtype == np.uint8:
                image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Advanced preprocessing pipeline for maximum detection accuracy
        
        # 1. Adaptive histogram equalization with optimized parameters
        if len(image.shape) == 3:
            lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
            clahe = cv2.createCLAHE(clipLimit=4.0, tileGridSize=(16,16))  # More aggressive
            lab[:,:,0] = clahe.apply(lab[:,:,0])
            image = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
        
        # 2. Advanced noise reduction while preserving edges
        image = cv2.bilateralFilter(image, 15, 80, 80)
        
        # 3. Multi-stage sharpening for better vehicle edge detection
        # First stage: Unsharp masking
        gaussian = cv2.GaussianBlur(image, (0, 0), 2.0)
        image = cv2.addWeighted(image, 1.5, gaussian, -0.5, 0)
        
        # Second stage: Laplacian sharpening
        kernel = np.array([[0,-1,0], [-1,5,-1], [0,-1,0]])
        image = cv2.filter2D(image, -1, kernel)
        
        # 4. Gamma correction for better visibility in shadows
        gamma = 1.2
        inv_gamma = 1.0 / gamma
        table = np.array([((i / 255.0) ** inv_gamma) * 255 for i in np.arange(0, 256)]).astype("uint8")
        image = cv2.LUT(image, table)
        
        # 5. Final normalization
        image = np.clip(image, 0, 255).astype(np.uint8)
        
        return image

    async def detect_objects(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """
        Detect objects using YOLOv9 with enhanced accuracy
        
        Args:
            image: Input image as numpy array
            
        Returns:
            List of detection dictionaries
        """
        if not self.is_initialized:
            await self.initialize()
        
        try:
            start_time = datetime.now()
            
            # Enhanced preprocessing for YOLOv9
            processed_image = self.preprocess_image(image.copy())
            
            # YOLOv9 inference with maximum accuracy settings
            inference_params = {
                "conf": self.confidence_threshold,
                "iou": self.iou_threshold,
                "max_det": self.max_detections,
                "agnostic_nms": self.agnostic_nms,
                "verbose": False,
                "half": False,  # Full precision for maximum accuracy
                "imgsz": [640, 832],  # Multi-scale input sizes for better detection
                "augment": self.use_tta,  # Test-time augmentation
                "visualize": False,
                "save": False,
                "save_txt": False,
                "save_conf": False,
                "save_crop": False,
                "show_labels": True,
                "show_conf": True,
                "vid_stride": 1,
                "stream_buffer": False,
                "line_width": None,
                "classes": None,  # Detect all classes
                "retina_masks": False
            }
            
            results = self.model(processed_image, **inference_params)
            
            # Process results with enhanced filtering
            detections = []
            if results and len(results) > 0:
                result = results[0]
                
                if hasattr(result, 'boxes') and result.boxes is not None:
                    boxes = result.boxes.xyxy.cpu().numpy()
                    confidences = result.boxes.conf.cpu().numpy()
                    class_ids = result.boxes.cls.cpu().numpy().astype(int)
                    
                    # Enhanced detection processing with Indian vehicle optimization
                    detections = self._process_detections(boxes, confidences, class_ids, image.shape)
                    
                    # Remove duplicates using advanced NMS
                    detections = self._remove_duplicates(detections)
                    
                    # Apply Indian vehicle-specific optimizations
                    detections = self._optimize_for_indian_vehicles(detections)
            
            # Update performance metrics
            inference_time = (datetime.now() - start_time).total_seconds()
            self.detection_count += 1
            self.total_inference_time += inference_time
            
            logger.debug(f"YOLOv9 detected {len(detections)} objects in {inference_time:.3f}s")
            return detections
            
        except Exception as e:
            logger.error(f"Error in YOLOv9 detection: {str(e)}")
            return []
    
    def _process_detections(self, boxes: np.ndarray, confidences: np.ndarray, 
                          class_ids: np.ndarray, image_shape: tuple) -> List[Dict[str, Any]]:
        """
        Enhanced detection processing with YOLOv9 optimizations
        """
        detections = []
        img_height, img_width = image_shape[:2]
        
        for i, (box, conf, class_id) in enumerate(zip(boxes, confidences, class_ids)):
            # Filter for vehicle classes
            if class_id in self.vehicle_classes:
                x1, y1, x2, y2 = box
                
                # Enhanced validation
                width = x2 - x1
                height = y2 - y1
                area = width * height
                
                # More sophisticated filtering for YOLOv9
                if not self._is_valid_detection(x1, y1, x2, y2, conf, class_id, img_width, img_height):
                    continue
                
                # Indian vehicle optimized confidence thresholds
                class_specific_thresholds = {
                    0: 0.20,   # person - pedestrians (common in Indian traffic)
                    1: 0.15,   # bicycle - very low (cycle rickshaws common)
                    2: 0.12,   # car - ultra low (most common Indian vehicle)
                    3: 0.10,   # motorcycle - ultra low (scooters very common)
                    4: 0.30,   # airplane
                    5: 0.15,   # bus - low (many types of buses)
                    6: 0.25,   # train
                    7: 0.12,   # truck - ultra low (mini trucks, heavy trucks)
                    8: 0.30,   # boat
                    15: 0.25,  # cat
                    16: 0.20,  # dog (street dogs common)
                    17: 0.20,  # horse (horse carts)
                    18: 0.25,  # sheep
                    19: 0.15,  # cow (very common on Indian roads)
                    20: 0.30   # elephant
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
                    "relative_size": float(area / (img_width * img_height)),
                    "model_version": "YOLOv9",
                    "timestamp": datetime.now().isoformat()
                }
                detections.append(detection)
        
        return detections
    
    def _is_valid_detection(self, x1: float, y1: float, x2: float, y2: float, 
                           conf: float, class_id: int, img_width: int, img_height: int) -> bool:
        """
        Enhanced validation for YOLOv9 detections
        """
        width = x2 - x1
        height = y2 - y1
        area = width * height
        
        # Indian vehicle optimized minimum area thresholds
        min_areas = {
            0: 40,     # person - pedestrians (common in Indian traffic)
            1: 25,     # bicycle - ultra low (cycle rickshaws)
            2: 60,     # car - low for small Indian cars
            3: 30,     # motorcycle - ultra low (scooters very common)
            4: 200,    # airplane
            5: 120,    # bus - low for mini buses
            6: 300,    # train
            7: 80,     # truck - ultra low (mini trucks common in India)
            8: 100,    # boat
            15: 20,    # cat
            16: 25,    # dog (street dogs)
            17: 60,    # horse (horse carts)
            18: 50,    # sheep
            19: 80,    # cow (very common on Indian roads)
            20: 200    # elephant
        }
        
        min_area = min_areas.get(class_id, 100)
        if area < min_area:
            return False
        
        # Aspect ratio validation
        aspect_ratio = width / height if height > 0 else 1.0
        
        # Relaxed aspect ratio ranges for maximum detection
        aspect_ratio_ranges = {
            0: (0.1, 3.0),   # person - very flexible
            1: (0.2, 4.0),   # bicycle - flexible for various angles
            2: (0.3, 5.0),   # car - flexible for various angles
            3: (0.2, 4.0),   # motorcycle - flexible
            4: (1.0, 8.0),   # airplane
            5: (1.0, 6.0),   # bus - flexible
            6: (2.0, 15.0),  # train - very long
            7: (0.8, 6.0),   # truck - flexible
            8: (0.5, 4.0),   # boat
            14: (0.3, 3.0),  # bird
            15: (0.3, 2.0),  # cat
            16: (0.3, 2.5),  # dog
            17: (0.5, 2.0),  # horse
            18: (0.4, 2.0),  # sheep
            19: (0.5, 2.5)   # cow
        }
        
        min_aspect, max_aspect = aspect_ratio_ranges.get(class_id, (0.1, 10.0))
        if not (min_aspect <= aspect_ratio <= max_aspect):
            return False
        
        # Boundary validation
        if x1 < 0 or y1 < 0 or x2 > img_width or y2 > img_height:
            return False
        
        return True
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get performance statistics"""
        avg_inference_time = (
            self.total_inference_time / self.detection_count 
            if self.detection_count > 0 else 0
        )
        
        return {
            "model_version": "YOLOv9",
            "device": self.device,
            "total_detections": self.detection_count,
            "average_inference_time": avg_inference_time,
            "total_inference_time": self.total_inference_time,
            "confidence_threshold": self.confidence_threshold,
            "iou_threshold": self.iou_threshold,
            "yolov9_native": YOLOV9_AVAILABLE
        }
    
    async def update_config(self, config: Dict[str, Any]) -> bool:
        """Update detector configuration"""
        try:
            if "confidence_threshold" in config:
                self.confidence_threshold = float(config["confidence_threshold"])
            if "iou_threshold" in config:
                self.iou_threshold = float(config["iou_threshold"])
            if "max_detections" in config:
                self.max_detections = int(config["max_detections"])
            
            logger.info(f"YOLOv9 configuration updated: {config}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating YOLOv9 config: {str(e)}")
            return False
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get model information"""
        return {
            "model_name": "YOLOv9c",
            "model_path": self.model_path,
            "device": self.device,
            "is_initialized": self.is_initialized,
            "confidence_threshold": self.confidence_threshold,
            "iou_threshold": self.iou_threshold,
            "max_detections": self.max_detections,
            "supported_classes": list(self.vehicle_classes.values()),
            "indian_vehicle_optimization": True,
            "duplicate_removal": True,
            "performance_stats": self.get_performance_stats()
        }
    
    def _remove_duplicates(self, detections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Advanced duplicate removal using IoU-based filtering
        """
        if len(detections) <= 1:
            return detections
        
        # Sort detections by confidence (highest first)
        detections.sort(key=lambda x: x['confidence'], reverse=True)
        
        filtered_detections = []
        
        for detection in detections:
            is_duplicate = False
            
            for existing in filtered_detections:
                # Calculate IoU between current detection and existing ones
                iou = self._calculate_iou(detection['bbox'], existing['bbox'])
                
                # Check if it's a duplicate
                if iou > self.duplicate_threshold:
                    # Same class and high overlap = duplicate
                    if detection['class_id'] == existing['class_id']:
                        is_duplicate = True
                        break
                    # Different classes but very high overlap = likely same object
                    elif iou > 0.9:
                        is_duplicate = True
                        break
            
            if not is_duplicate:
                filtered_detections.append(detection)
        
        logger.debug(f"Removed {len(detections) - len(filtered_detections)} duplicate detections")
        return filtered_detections
    
    def _calculate_iou(self, bbox1: Dict[str, float], bbox2: Dict[str, float]) -> float:
        """
        Calculate Intersection over Union (IoU) between two bounding boxes
        """
        # Extract coordinates
        x1_1, y1_1, x2_1, y2_1 = bbox1['x1'], bbox1['y1'], bbox1['x2'], bbox1['y2']
        x1_2, y1_2, x2_2, y2_2 = bbox2['x1'], bbox2['y1'], bbox2['x2'], bbox2['y2']
        
        # Calculate intersection area
        x1_i = max(x1_1, x1_2)
        y1_i = max(y1_1, y1_2)
        x2_i = min(x2_1, x2_2)
        y2_i = min(y2_1, y2_2)
        
        if x2_i <= x1_i or y2_i <= y1_i:
            return 0.0
        
        intersection = (x2_i - x1_i) * (y2_i - y1_i)
        
        # Calculate union area
        area1 = (x2_1 - x1_1) * (y2_1 - y1_1)
        area2 = (x2_2 - x1_2) * (y2_2 - y1_2)
        union = area1 + area2 - intersection
        
        return intersection / union if union > 0 else 0.0
    
    def _optimize_for_indian_vehicles(self, detections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Apply Indian vehicle-specific optimizations
        """
        optimized_detections = []
        
        for detection in detections:
            # Create a copy to avoid modifying original
            optimized = detection.copy()
            
            # Boost confidence for common Indian vehicles
            class_name = detection['class_name']
            if class_name in ['motorcycle', 'car', 'truck', 'bicycle']:
                optimized['confidence'] = min(1.0, detection['confidence'] * self.confidence_boost_factor)
                optimized['indian_vehicle_boost'] = True
            
            # Enhanced classification for Indian context
            optimized['indian_classification'] = self._classify_indian_vehicle(detection)
            
            # Add size-based sub-classification
            optimized['size_category'] = self._get_size_category(detection)
            
            optimized_detections.append(optimized)
        
        return optimized_detections
    
    def _classify_indian_vehicle(self, detection: Dict[str, Any]) -> str:
        """
        Classify vehicles in Indian context
        """
        class_name = detection['class_name']
        area = detection['area']
        aspect_ratio = detection['aspect_ratio']
        
        if class_name == 'motorcycle':
            if area < 2000:
                return 'scooter'
            elif area < 5000:
                return 'motorcycle'
            else:
                return 'heavy-bike'
        
        elif class_name == 'car':
            if area < 8000:
                return 'hatchback'
            elif area < 15000:
                return 'sedan'
            else:
                return 'suv'
        
        elif class_name == 'truck':
            if area < 10000:
                return 'mini-truck'
            elif area < 25000:
                return 'medium-truck'
            else:
                return 'heavy-truck'
        
        elif class_name == 'bus':
            if area < 20000:
                return 'mini-bus'
            else:
                return 'city-bus'
        
        elif class_name == 'bicycle':
            if aspect_ratio > 2.0:
                return 'cycle-rickshaw'
            else:
                return 'bicycle'
        
        return class_name
    
    def _get_size_category(self, detection: Dict[str, Any]) -> str:
        """
        Categorize vehicle by size
        """
        area = detection['area']
        
        if area < 2000:
            return 'very_small'
        elif area < 8000:
            return 'small'
        elif area < 20000:
            return 'medium'
        elif area < 40000:
            return 'large'
        else:
            return 'very_large'
