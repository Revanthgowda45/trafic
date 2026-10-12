"""
AI Module for Smart Traffic Detection
Contains YOLOv8 detection engine, traffic analysis, and WebSocket management
"""

from .yolo_detector import YOLODetector
from .traffic_analyzer import TrafficAnalyzer
from .websocket_manager import WebSocketManager, StreamProcessor

__all__ = [
    "YOLODetector",
    "TrafficAnalyzer", 
    "WebSocketManager",
    "StreamProcessor"
]

__version__ = "1.0.0"
