"""
WebSocket Manager for Real-time Traffic Detection
Handles WebSocket connections and real-time streaming
"""

from fastapi import WebSocket, WebSocketDisconnect
import json
import asyncio
import logging
from typing import List, Dict, Any, Set
from datetime import datetime
import cv2
import numpy as np
import base64

logger = logging.getLogger(__name__)

class WebSocketManager:
    """Manages WebSocket connections for real-time traffic detection"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.connection_configs: Dict[WebSocket, Dict[str, Any]] = {}
        self.detection_tasks: Dict[WebSocket, asyncio.Task] = {}
        
        logger.info("WebSocketManager initialized")
    
    async def connect(self, websocket: WebSocket):
        """Accept a new WebSocket connection"""
        try:
            await websocket.accept()
            self.active_connections.append(websocket)
            self.connection_configs[websocket] = {}
            
            logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")
            
            # Send welcome message
            await self.send_personal_message({
                "type": "connection_established",
                "message": "Connected to Smart Traffic Detection API",
                "timestamp": datetime.now().isoformat()
            }, websocket)
            
        except Exception as e:
            logger.error(f"Error connecting WebSocket: {str(e)}")
    
    async def disconnect(self, websocket: WebSocket):
        """Disconnect a WebSocket connection"""
        try:
            # Stop any running detection task
            if websocket in self.detection_tasks:
                task = self.detection_tasks[websocket]
                if not task.done():
                    task.cancel()
                del self.detection_tasks[websocket]
            
            # Remove from active connections
            if websocket in self.active_connections:
                self.active_connections.remove(websocket)
            
            # Remove configuration
            if websocket in self.connection_configs:
                del self.connection_configs[websocket]
            
            logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")
            
        except Exception as e:
            logger.error(f"Error disconnecting WebSocket: {str(e)}")
    
    async def disconnect_all(self):
        """Disconnect all WebSocket connections"""
        try:
            # Cancel all detection tasks
            for task in self.detection_tasks.values():
                if not task.done():
                    task.cancel()
            
            # Close all connections
            for websocket in self.active_connections.copy():
                try:
                    await websocket.close()
                except:
                    pass
            
            # Clear all data
            self.active_connections.clear()
            self.connection_configs.clear()
            self.detection_tasks.clear()
            
            logger.info("All WebSocket connections disconnected")
            
        except Exception as e:
            logger.error(f"Error disconnecting all WebSockets: {str(e)}")
    
    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        """Send a message to a specific WebSocket connection"""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Error sending personal message: {str(e)}")
            await self.disconnect(websocket)
    
    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast a message to all connected WebSocket clients"""
        if not self.active_connections:
            return
        
        disconnected = []
        for websocket in self.active_connections:
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error broadcasting to WebSocket: {str(e)}")
                disconnected.append(websocket)
        
        # Clean up disconnected clients
        for websocket in disconnected:
            await self.disconnect(websocket)
    
    async def start_live_detection(self, websocket: WebSocket, config: Dict[str, Any]):
        """Start live detection for a WebSocket connection"""
        try:
            # Store configuration
            self.connection_configs[websocket] = config
            
            # Send confirmation
            await self.send_personal_message({
                "type": "detection_started",
                "message": "Live detection started",
                "config": config,
                "timestamp": datetime.now().isoformat()
            }, websocket)
            
            logger.info(f"Live detection started for WebSocket with config: {config}")
            
        except Exception as e:
            logger.error(f"Error starting live detection: {str(e)}")
            await self.send_personal_message({
                "type": "error",
                "message": f"Failed to start live detection: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }, websocket)
    
    async def stop_live_detection(self, websocket: WebSocket):
        """Stop live detection for a WebSocket connection"""
        try:
            # Cancel detection task if running
            if websocket in self.detection_tasks:
                task = self.detection_tasks[websocket]
                if not task.done():
                    task.cancel()
                del self.detection_tasks[websocket]
            
            # Send confirmation
            await self.send_personal_message({
                "type": "detection_stopped",
                "message": "Live detection stopped",
                "timestamp": datetime.now().isoformat()
            }, websocket)
            
            logger.info("Live detection stopped for WebSocket")
            
        except Exception as e:
            logger.error(f"Error stopping live detection: {str(e)}")
    
    async def send_detection_results(self, websocket: WebSocket, results: Dict[str, Any]):
        """Send detection results to a specific WebSocket connection"""
        try:
            message = {
                "type": "detection_results",
                "data": results,
                "timestamp": datetime.now().isoformat()
            }
            await self.send_personal_message(message, websocket)
            
        except Exception as e:
            logger.error(f"Error sending detection results: {str(e)}")
    
    async def send_system_stats(self, stats: Dict[str, Any]):
        """Broadcast system statistics to all connected clients"""
        try:
            message = {
                "type": "system_stats",
                "data": stats,
                "timestamp": datetime.now().isoformat()
            }
            await self.broadcast(message)
            
        except Exception as e:
            logger.error(f"Error sending system stats: {str(e)}")
    
    async def send_error(self, websocket: WebSocket, error_message: str):
        """Send error message to a specific WebSocket connection"""
        try:
            message = {
                "type": "error",
                "message": error_message,
                "timestamp": datetime.now().isoformat()
            }
            await self.send_personal_message(message, websocket)
            
        except Exception as e:
            logger.error(f"Error sending error message: {str(e)}")
    
    def get_connection_count(self) -> int:
        """Get the number of active connections"""
        return len(self.active_connections)
    
    def get_connection_info(self) -> List[Dict[str, Any]]:
        """Get information about all active connections"""
        info = []
        for i, websocket in enumerate(self.active_connections):
            config = self.connection_configs.get(websocket, {})
            has_detection_task = websocket in self.detection_tasks
            
            info.append({
                "connection_id": i,
                "config": config,
                "has_active_detection": has_detection_task,
                "client_info": getattr(websocket, 'client', None)
            })
        
        return info

class StreamProcessor:
    """Processes video streams for WebSocket clients"""
    
    def __init__(self, yolo_detector, traffic_analyzer):
        self.yolo_detector = yolo_detector
        self.traffic_analyzer = traffic_analyzer
        self.processing_stats = {
            "frames_processed": 0,
            "total_processing_time": 0.0,
            "average_fps": 0.0
        }
        
    async def process_stream_frame(self, frame_data: str, areas: List[List[tuple]] = None) -> Dict[str, Any]:
        """
        Process a single frame from video stream
        
        Args:
            frame_data: Base64 encoded frame data
            areas: Optional list of detection areas
            
        Returns:
            Processing results
        """
        try:
            start_time = datetime.now()
            
            # Decode frame
            if ',' in frame_data:
                frame_data = frame_data.split(',')[1]
            
            image_bytes = base64.b64decode(frame_data)
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                raise ValueError("Failed to decode image")
            
            # Perform detection
            detections = await self.yolo_detector.detect_objects(image)
            
            # Analyze traffic
            if areas:
                # Analyze specific areas
                area_analyses = []
                for i, area in enumerate(areas):
                    area_analysis = self.traffic_analyzer.analyze_area(
                        detections, image, area, f"area_{i}"
                    )
                    area_analyses.append(area_analysis)
                
                analysis = {
                    "overall": self.traffic_analyzer.analyze_frame(detections, image),
                    "areas": area_analyses
                }
            else:
                # Overall analysis
                analysis = self.traffic_analyzer.analyze_frame(detections, image)
            
            # Update processing stats
            processing_time = (datetime.now() - start_time).total_seconds()
            self.processing_stats["frames_processed"] += 1
            self.processing_stats["total_processing_time"] += processing_time
            
            if self.processing_stats["frames_processed"] > 0:
                avg_time = (self.processing_stats["total_processing_time"] / 
                           self.processing_stats["frames_processed"])
                self.processing_stats["average_fps"] = 1.0 / avg_time if avg_time > 0 else 0
            
            # Prepare results
            results = {
                "detections": detections,
                "analysis": analysis,
                "processing_time": round(processing_time, 3),
                "frame_info": {
                    "width": image.shape[1],
                    "height": image.shape[0],
                    "channels": image.shape[2]
                },
                "stats": dict(self.processing_stats)
            }
            
            return results
            
        except Exception as e:
            logger.error(f"Error processing stream frame: {str(e)}")
            return {
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def get_processing_stats(self) -> Dict[str, Any]:
        """Get processing statistics"""
        return dict(self.processing_stats)
    
    def reset_stats(self):
        """Reset processing statistics"""
        self.processing_stats = {
            "frames_processed": 0,
            "total_processing_time": 0.0,
            "average_fps": 0.0
        }
