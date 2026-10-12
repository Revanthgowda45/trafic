"""
Configuration Settings for Smart Traffic Backend
Centralized configuration management
"""

import os
from pathlib import Path
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class Settings:
    """Application settings and configuration"""
    
    def __init__(self):
        # Base paths
        self.BASE_DIR = Path(__file__).parent.parent
        self.UPLOADS_DIR = self.BASE_DIR / "uploads"
        self.STATIC_DIR = self.BASE_DIR / "static"
        self.MODELS_DIR = self.BASE_DIR / "models"
        
        # Create directories if they don't exist
        self.UPLOADS_DIR.mkdir(exist_ok=True)
        self.STATIC_DIR.mkdir(exist_ok=True)
        self.MODELS_DIR.mkdir(exist_ok=True)
        
        # YOLOv11x Model Configuration - Ultimate accuracy for all vehicles
        self.YOLO_MODEL_PATH = os.getenv("YOLO_MODEL_PATH", "yolo11x.pt")  # Use YOLOv11x for ultimate accuracy
        self.CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.10"))  # Ultra-low for YOLOv11x's superior accuracy
        self.IOU_THRESHOLD = float(os.getenv("IOU_THRESHOLD", "0.8"))  # Higher for YOLOv11x's advanced NMS
        self.MAX_DETECTIONS = int(os.getenv("MAX_DETECTIONS", "1500"))  # Maximum detections with YOLOv11x
        
        # Vehicle classes from COCO dataset
        self.VEHICLE_CLASSES = {
            0: "person",
            1: "bicycle", 
            2: "car",
            3: "motorcycle",
            5: "bus",
            7: "truck"
        }
        
        # API Configuration
        self.API_HOST = os.getenv("API_HOST", "0.0.0.0")
        self.API_PORT = int(os.getenv("API_PORT", "8000"))
        self.DEBUG = os.getenv("DEBUG", "True").lower() == "true"
        self.RELOAD = os.getenv("RELOAD", "True").lower() == "true"
        
        # CORS Configuration
        self.CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
        self.CORS_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        self.CORS_HEADERS = ["*"]
        
        # WebSocket Configuration
        self.MAX_WEBSOCKET_CONNECTIONS = int(os.getenv("MAX_WEBSOCKET_CONNECTIONS", "50"))
        self.WEBSOCKET_PING_INTERVAL = int(os.getenv("WEBSOCKET_PING_INTERVAL", "30"))
        self.WEBSOCKET_PING_TIMEOUT = int(os.getenv("WEBSOCKET_PING_TIMEOUT", "10"))
        
        # Traffic Analysis Configuration
        self.CONGESTION_THRESHOLDS = {
            "low": int(os.getenv("CONGESTION_LOW", "5")),
            "medium": int(os.getenv("CONGESTION_MEDIUM", "15")),
            "high": int(os.getenv("CONGESTION_HIGH", "25")),
            "critical": int(os.getenv("CONGESTION_CRITICAL", "40"))
        }
        
        # Performance Configuration
        self.MAX_FRAME_BUFFER_SIZE = int(os.getenv("MAX_FRAME_BUFFER_SIZE", "10"))
        self.PROCESSING_TIMEOUT = int(os.getenv("PROCESSING_TIMEOUT", "30"))
        self.ENABLE_GPU = os.getenv("ENABLE_GPU", "True").lower() == "true"
        
        # Logging Configuration
        self.LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
        self.LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        self.LOG_FILE = os.getenv("LOG_FILE", "traffic_backend.log")
        
        # File Upload Configuration
        self.MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", "50")) * 1024 * 1024  # 50MB
        self.ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".bmp", ".tiff"]
        self.ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".avi", ".mov", ".mkv"]
        
        # Security Configuration
        self.SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
        self.ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
        
        # Database Configuration (if needed in future)
        self.DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///traffic_data.db")
        
        # Cache Configuration
        self.ENABLE_CACHING = os.getenv("ENABLE_CACHING", "True").lower() == "true"
        self.CACHE_TTL = int(os.getenv("CACHE_TTL", "300"))  # 5 minutes
        
        # Monitoring Configuration
        self.ENABLE_METRICS = os.getenv("ENABLE_METRICS", "True").lower() == "true"
        self.METRICS_PORT = int(os.getenv("METRICS_PORT", "9090"))
        
        logger.info("Settings initialized successfully")
    
    def get_yolo_config(self) -> Dict[str, Any]:
        """Get YOLO-specific configuration"""
        return {
            "model_path": self.YOLO_MODEL_PATH,
            "confidence_threshold": self.CONFIDENCE_THRESHOLD,
            "iou_threshold": self.IOU_THRESHOLD,
            "max_detections": self.MAX_DETECTIONS,
            "vehicle_classes": self.VEHICLE_CLASSES,
            "enable_gpu": self.ENABLE_GPU
        }
    
    def get_api_config(self) -> Dict[str, Any]:
        """Get API configuration"""
        return {
            "host": self.API_HOST,
            "port": self.API_PORT,
            "debug": self.DEBUG,
            "reload": self.RELOAD,
            "cors_origins": self.CORS_ORIGINS,
            "cors_methods": self.CORS_METHODS,
            "cors_headers": self.CORS_HEADERS
        }
    
    def get_websocket_config(self) -> Dict[str, Any]:
        """Get WebSocket configuration"""
        return {
            "max_connections": self.MAX_WEBSOCKET_CONNECTIONS,
            "ping_interval": self.WEBSOCKET_PING_INTERVAL,
            "ping_timeout": self.WEBSOCKET_PING_TIMEOUT
        }
    
    def get_traffic_config(self) -> Dict[str, Any]:
        """Get traffic analysis configuration"""
        return {
            "congestion_thresholds": self.CONGESTION_THRESHOLDS,
            "max_frame_buffer_size": self.MAX_FRAME_BUFFER_SIZE,
            "processing_timeout": self.PROCESSING_TIMEOUT
        }
    
    def update_setting(self, key: str, value: Any) -> bool:
        """Update a setting dynamically"""
        try:
            if hasattr(self, key):
                setattr(self, key, value)
                logger.info(f"Setting {key} updated to {value}")
                return True
            else:
                logger.warning(f"Setting {key} not found")
                return False
        except Exception as e:
            logger.error(f"Error updating setting {key}: {str(e)}")
            return False
    
    def validate_settings(self) -> List[str]:
        """Validate all settings and return any errors"""
        errors = []
        
        # Validate thresholds
        if not 0 <= self.CONFIDENCE_THRESHOLD <= 1:
            errors.append("CONFIDENCE_THRESHOLD must be between 0 and 1")
        
        if not 0 <= self.IOU_THRESHOLD <= 1:
            errors.append("IOU_THRESHOLD must be between 0 and 1")
        
        if self.MAX_DETECTIONS <= 0:
            errors.append("MAX_DETECTIONS must be positive")
        
        # Validate ports
        if not 1 <= self.API_PORT <= 65535:
            errors.append("API_PORT must be between 1 and 65535")
        
        if not 1 <= self.METRICS_PORT <= 65535:
            errors.append("METRICS_PORT must be between 1 and 65535")
        
        # Validate file sizes
        if self.MAX_FILE_SIZE <= 0:
            errors.append("MAX_FILE_SIZE must be positive")
        
        # Validate congestion thresholds
        thresholds = self.CONGESTION_THRESHOLDS
        if not (thresholds["low"] < thresholds["medium"] < 
                thresholds["high"] < thresholds["critical"]):
            errors.append("Congestion thresholds must be in ascending order")
        
        return errors
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert settings to dictionary"""
        return {
            "yolo_config": self.get_yolo_config(),
            "api_config": self.get_api_config(),
            "websocket_config": self.get_websocket_config(),
            "traffic_config": self.get_traffic_config(),
            "file_config": {
                "max_file_size": self.MAX_FILE_SIZE,
                "allowed_image_extensions": self.ALLOWED_IMAGE_EXTENSIONS,
                "allowed_video_extensions": self.ALLOWED_VIDEO_EXTENSIONS
            },
            "logging_config": {
                "log_level": self.LOG_LEVEL,
                "log_format": self.LOG_FORMAT,
                "log_file": self.LOG_FILE
            }
        }

# Global settings instance
settings = Settings()

# Validate settings on import
validation_errors = settings.validate_settings()
if validation_errors:
    logger.warning(f"Settings validation errors: {validation_errors}")
else:
    logger.info("All settings validated successfully")
