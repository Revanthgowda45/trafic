"""
Smart Traffic Backend - FastAPI Application with YOLOv8 Integration
Real-time traffic detection and analysis system for SIH 2025
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
import asyncio
import json
import base64
import time
import cv2
import numpy as np
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime
import os
from pathlib import Path

# Import our custom modules
from ai.yolo_detector import YOLODetector  # Use YOLOv8 for faster performance
from ai.video_detector import VideoDetector
from ai.enhanced_traffic_analyzer import EnhancedTrafficAnalyzer
from ai.websocket_manager import WebSocketManager
from ai.fast_analysis_cache import get_fast_cache
from config.settings import Settings
from perfect_calculation_debug import debug_detection_calculation

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Smart Traffic Detection API",
    description="Real-time traffic monitoring and analysis using YOLOv8",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
settings = Settings()
detector = YOLODetector("yolov8n.pt")  # Use YOLOv8n for maximum real-time inference speed
video_detector = VideoDetector("yolov8s.pt")  # Video processing with YOLOv8s
analyzer = EnhancedTrafficAnalyzer()
websocket_manager = WebSocketManager()
fast_cache = get_fast_cache()

# Create directories
os.makedirs("uploads", exist_ok=True)
os.makedirs("static", exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.on_event("startup")
async def startup_event():
    """Initialize the application on startup"""
    logger.info("Starting Smart Traffic Detection API...")
    await detector.initialize()
    await video_detector.initialize()
    logger.info("YOLOv8 models loaded successfully (Image + Video) - Optimized for speed")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down Smart Traffic Detection API...")
    await websocket_manager.disconnect_all()

# Health check endpoint
@app.get("/")
async def root():
    """Root endpoint - health check"""
    return {
        "message": "Smart Traffic Detection API",
        "status": "running",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "yolo_model": "loaded" if detector.is_initialized else "not_loaded",
        "websocket_connections": len(websocket_manager.active_connections),
        "timestamp": datetime.now().isoformat()
    }

# Image upload and analysis endpoints
@app.post("/api/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """Upload and analyze a single image"""
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Perform detection
        results = await detector.detect_objects(image)
        
        # Analyze traffic (standard analysis)
        analysis = analyzer.analyze_frame(results, image)
        
        # Perform dense traffic analysis with YOLOv8
        dense_analysis = detector.analyze_dense_traffic(results, image.shape) if hasattr(detector, 'analyze_dense_traffic') else {}
        
        return {
            "success": True,
            "filename": file.filename,
            "detections": results,
            "analysis": analysis,
            "dense_traffic_analysis": dense_analysis,
            "model_info": {
                "model": "YOLOv8s",
                "total_detections": len(results),
                "performance": "optimized_for_speed"
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

# Video processing endpoints
@app.post("/api/detect-frame")
async def detect_frame(data: dict):
    """Real-time detection for video frames and live video streams with dynamic timing"""
    try:
        t0 = time.time()
        image_data = data.get("image")
        conf_thresh = float(data.get("confidence", 0.30))
        
        if not image_data:
            raise HTTPException(status_code=400, detail="Image data required")
        
        # Base64 decode
        if "," in image_data:
            raw_b64 = image_data.split(",")[1]
        else:
            raw_b64 = image_data
            
        nparr = np.frombuffer(base64.b64decode(raw_b64), np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image frame")
            
        # Detect objects using YOLO model with optimal vehicle detection range
        orig_thresh = detector.confidence_threshold
        detector.confidence_threshold = max(0.15, min(0.55, conf_thresh))
        results = await detector.detect_objects(image)
        detector.confidence_threshold = orig_thresh
        
        # Class-by-class breakdown and PCU traffic weight calculation
        vehicle_counts = {"car": 0, "motorcycle": 0, "bus": 0, "truck": 0, "bicycle": 0, "person": 0}
        total_pcu = 0.0
        pcu_weights = {"car": 1.0, "motorcycle": 0.8, "bus": 2.2, "truck": 2.5, "bicycle": 1.6, "person": 0.5}
        
        for det in results:
            cls = det.get("class_name", "car").lower()
            if cls == "motorbike":
                cls = "motorcycle"
            if cls in vehicle_counts:
                vehicle_counts[cls] += 1
            else:
                vehicle_counts[cls] = 1
            total_pcu += pcu_weights.get(cls, 1.0)
            
        total_vehicles = len(results)
        
        # Calculate dynamic green time using Webster formula
        if total_vehicles == 0:
            rec_green_time = 10
            congestion = "low"
        else:
            rec_green_time = int(max(10, min(65, round(4.0 + (total_pcu * 1.8)))))
            congestion = "critical" if total_vehicles >= 25 else "high" if total_vehicles >= 16 else "medium" if total_vehicles >= 8 else "low"
            
        inference_ms = round((time.time() - t0) * 1000, 1)
        
        return {
            "success": True,
            "detections": results,
            "vehicle_counts": vehicle_counts,
            "total_vehicles": total_vehicles,
            "total_pcu_weight": round(total_pcu, 1),
            "recommended_green_time": rec_green_time,
            "congestion_level": congestion,
            "inference_time_ms": inference_ms,
            "frame_width": image.shape[1],
            "frame_height": image.shape[0],
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error in detect_frame: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload-video")
async def upload_video(file: UploadFile = File(...)):
    """Upload and analyze a video file"""
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('video/'):
            raise HTTPException(status_code=400, detail="File must be a video")
        
        # Save uploaded video
        video_filename = f"video_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
        video_path = os.path.join("uploads", video_filename)
        
        with open(video_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        logger.info(f"Video uploaded: {video_filename} ({len(content)} bytes)")
        
        # Process video asynchronously
        def progress_callback(progress, frame_num, total_frames):
            logger.info(f"Processing video: {progress:.1f}% ({frame_num}/{total_frames})")
        
        analysis = await video_detector.process_video_file(video_path, progress_callback)
        
        return {
            "success": True,
            "filename": file.filename,
            "video_path": video_path,
            "video_url": f"http://localhost:8000/uploads/{video_filename}",
            "analysis": analysis,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error processing video: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")

@app.get("/api/video-stats")
async def get_video_stats():
    """Get video processing statistics"""
    try:
        stats = video_detector.get_processing_stats()
        return {
            "success": True,
            "stats": stats,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting video stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting video stats: {str(e)}")

@app.post("/api/start-live-stream")
async def start_live_stream(data: dict):
    """Start live video stream processing"""
    try:
        source = data.get("source", 0)  # Default to webcam
        
        # Start live stream processing in background
        async def stream_callback(result, frame):
            # Send results via WebSocket
            await websocket_manager.broadcast({
                "type": "live_detection",
                "data": {
                    "detections": result["detections"],
                    "dense_analysis": result["dense_analysis"],
                    "frame_number": result["frame_number"],
                    "timestamp": result["timestamp"]
                }
            })
        
        # Start processing (this runs in background)
        asyncio.create_task(video_detector.process_live_stream(source, stream_callback))
        
        return {
            "success": True,
            "message": f"Live stream started from source: {source}",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error starting live stream: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error starting live stream: {str(e)}")

@app.post("/api/stop-live-stream")
async def stop_live_stream():
    """Stop live video stream processing"""
    try:
        video_detector.stop_processing()
        
        return {
            "success": True,
            "message": "Live stream stopped",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error stopping live stream: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error stopping live stream: {str(e)}")

@app.post("/api/analyze-areas")
async def analyze_traffic_areas(data: dict):
    """Analyze traffic in specific areas"""
    try:
        # Extract data
        image_data = data.get('image')
        areas = data.get('areas', [])
        
        if not image_data or not areas:
            raise HTTPException(status_code=400, detail="Image data and areas are required")
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data.split(',')[1])
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Perform detection
        results = await detector.detect_objects(image)
        
        # Analyze each area
        area_analyses = []
        for i, area in enumerate(areas):
            # Extract area points from area object
            area_points = []
            if area and 'points' in area:
                area_points = [(int(point['x']), int(point['y'])) for point in area['points']]
            elif isinstance(area, list):
                # Handle if area is already a list of points
                area_points = [(int(point[0]), int(point[1])) for point in area]
            
            area_analysis = analyzer.analyze_area(results, image, area_points, f"Lane_{i+1}")
            area_analyses.append(area_analysis)
        
        return {
            "success": True,
            "total_detections": len(results),
            "areas": area_analyses,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error analyzing areas: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error analyzing areas: {str(e)}")

# WebSocket endpoint for real-time detection
@app.websocket("/ws/live-detection")
async def websocket_live_detection(websocket: WebSocket):
    """WebSocket endpoint for real-time traffic detection"""
    await websocket_manager.connect(websocket)
    
    try:
        while True:
            # Wait for client message
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "start_detection":
                # Start live detection
                await websocket_manager.start_live_detection(websocket, message.get("config", {}))
            
            elif message.get("type") == "stop_detection":
                # Stop live detection
                await websocket_manager.stop_live_detection(websocket)
            
            elif message.get("type") == "frame_data":
                # Process incoming frame
                frame_data = message.get("data")
                if frame_data:
                    await process_live_frame(websocket, frame_data)
                    
    except WebSocketDisconnect:
        await websocket_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        await websocket_manager.disconnect(websocket)

async def process_live_frame(websocket: WebSocket, frame_data: str):
    """Process a single frame from live stream"""
    try:
        # Decode frame
        image_bytes = base64.b64decode(frame_data.split(',')[1])
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Perform detection
        results = await detector.detect_objects(image)
        
        # Analyze traffic
        analysis = analyzer.analyze_frame(results, image)
        
        # Send results back
        response = {
            "type": "detection_results",
            "data": {
                "detections": results,
                "analysis": analysis,
                "timestamp": datetime.now().isoformat()
            }
        }
        
        await websocket.send_text(json.dumps(response))
        
    except Exception as e:
        logger.error(f"Error processing live frame: {str(e)}")

# Configuration endpoints
@app.get("/api/config")
async def get_config():
    """Get current configuration"""
    return {
        "yolo_model": settings.YOLO_MODEL_PATH,
        "confidence_threshold": settings.CONFIDENCE_THRESHOLD,
        "iou_threshold": settings.IOU_THRESHOLD,
        "max_detections": settings.MAX_DETECTIONS,
        "supported_classes": settings.VEHICLE_CLASSES
    }

@app.post("/api/config")
async def update_config(config: dict):
    """Update configuration"""
    try:
        # Update settings
        if "confidence_threshold" in config:
            settings.CONFIDENCE_THRESHOLD = config["confidence_threshold"]
        if "iou_threshold" in config:
            settings.IOU_THRESHOLD = config["iou_threshold"]
        if "max_detections" in config:
            settings.MAX_DETECTIONS = config["max_detections"]
        
        # Update detector
        await detector.update_config(config)
        
        return {"success": True, "message": "Configuration updated"}
        
    except Exception as e:
        logger.error(f"Error updating config: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating config: {str(e)}")

# Live 4-Lane Analysis System
@app.post("/api/start-live-analysis")
async def start_live_analysis(data: dict):
    """Start continuous YOLOv8 analysis for 4 lanes - Optimized for speed"""
    try:
        lanes_data = data.get('lanes', [])
        analysis_config = data.get('config', {
            'min_time': 5,
            'max_time': 35,
            'loop_interval': 2.0,  # seconds between analysis
            'detection_threshold': 0.5
        })
        
        if not lanes_data:
            raise HTTPException(status_code=400, detail="Lanes data is required")
        
        logger.info(f"Starting live analysis for {len(lanes_data)} lanes")
        for i, lane in enumerate(lanes_data):
            logger.debug(f"Lane {i+1}: has_image={bool(lane.get('image'))}, has_area={bool(lane.get('area'))}")
            if lane.get('area'):
                logger.debug(f"Lane {i+1} area: {lane['area']}")
        
        # Start live analysis loop
        asyncio.create_task(live_analysis_loop(lanes_data, analysis_config))
        
        return {
            "success": True,
            "message": "Live YOLOv8 analysis started for 4 lanes - Fast performance mode",
            "config": analysis_config,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error starting live analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error starting live analysis: {str(e)}")

@app.post("/api/stop-live-analysis")
async def stop_live_analysis():
    """Stop continuous YOLOv8 analysis"""
    try:
        # Set global flag to stop analysis
        global live_analysis_running
        live_analysis_running = False
        
        return {
            "success": True,
            "message": "Live YOLOv8 analysis stopped",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error stopping live analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error stopping live analysis: {str(e)}")

# Global flag for live analysis
live_analysis_running = False

async def live_analysis_loop(lanes_data: List[Dict], config: Dict):
    """Sequential traffic light system - One lane active at a time in loop"""
    global live_analysis_running
    live_analysis_running = True
    
    logger.info("Starting sequential YOLOv8 traffic light system...")
    
    # Traffic light timing configuration based on vehicle weights (from user's specification)
    vehicle_weights = {
        'car': 1.0,
        'motorbike': 0.8,
        'motorcycle': 0.8,
        'three_wheelers': 1.5,  # CNG auto rickshaw  
        'pickup': 2.0,
        'auto_rickshaw': 1.5,
        'minivan': 2.0,
        'bus': 2.0,
        'bicycle': 1.6,
        'truck': 2.5,
        'van': 1.1,
        'ambulance': 1.1,
        'person': 0.5  # pedestrian
    }
    
    # Base time multiplier (seconds per weight unit)
    base_time_multiplier = 3  # 3 seconds per weight unit
    
    current_active_lane = 0  # Start with lane 0
    lane_timer = 0
    lane_start_time = datetime.now()
    lane_detection_complete = False  # Flag to ensure detection is done before timer starts
    last_client_seen = datetime.now()
    
    while live_analysis_running:
        try:
            # Auto-pause loop if no clients are connected for 40s (e.g. user closed browser)
            if len(websocket_manager.active_connections) > 0:
                last_client_seen = datetime.now()
            elif (datetime.now() - last_client_seen).total_seconds() > 40:
                logger.info("⏸️ No active WebSocket clients connected for 40s. Automatically stopping backend live analysis loop.")
                live_analysis_running = False
                break

            analysis_results = []
            
            # Analyze all lanes but only one is active
            for lane_idx, lane in enumerate(lanes_data):
                if not lane.get('image') or not lane.get('area'):
                    logger.warning(f"Skipping lane {lane_idx + 1}: missing image or area")
                    continue
                
                # Decode image
                image_data = lane['image']
                if ',' in image_data:
                    image_bytes = base64.b64decode(image_data.split(',')[1])
                else:
                    image_bytes = base64.b64decode(image_data)
                
                nparr = np.frombuffer(image_bytes, np.uint8)
                image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                if image is None:
                    continue
                
                # 🚀 FAST CACHE: Check for cached detections first
                try:
                    cached_detections = fast_cache.get_cached_detections(image)
                    if cached_detections is not None:
                        results = cached_detections
                        logger.info(f"🚀 FAST CACHE: Using cached detections for Lane {lane_idx + 1}")
                    else:
                        # Perform YOLOv8 detection
                        results = await detector.detect_objects(image)
                        logger.info(f"🚀 FAST CACHE: Detection completed, type: {type(results)}, count: {len(results) if results else 0}")
                        
                        # Cache the detection results
                        fast_cache.cache_detections(image, results)
                        logger.info(f"🚀 FAST CACHE: Cached new detections for Lane {lane_idx + 1}")
                except Exception as cache_error:
                    logger.error(f"🚀 FAST CACHE: Cache error for Lane {lane_idx + 1}: {str(cache_error)}")
                    # Fallback to direct detection without caching
                    results = await detector.detect_objects(image)
                    logger.info(f"🚀 FAST CACHE: Using fallback detection for Lane {lane_idx + 1}")
                
                # Extract area points from area object
                area_points = []
                try:
                    if lane['area'] and 'points' in lane['area']:
                        area_points = [(int(point['x']), int(point['y'])) for point in lane['area']['points']]
                        logger.debug(f"Lane {lane_idx + 1}: Extracted {len(area_points)} area points")
                    else:
                        logger.warning(f"Lane {lane_idx + 1}: No valid area points found")
                        continue
                except Exception as e:
                    logger.error(f"Lane {lane_idx + 1}: Error extracting area points: {str(e)}")
                    continue
                
                # 🚀 FAST CACHE: Check for cached area analysis
                try:
                    cached_analysis = fast_cache.get_cached_analysis(image, area_points, f"Lane_{lane_idx + 1}")
                    if cached_analysis is not None:
                        area_analysis = cached_analysis
                        logger.info(f"🚀 FAST CACHE: Using cached analysis for Lane {lane_idx + 1}")
                        
                        # Skip debug calculation if we have cached results
                        debug_info = None
                    else:
                        # Analyze area with enhanced traffic analysis
                        area_analysis = analyzer.analyze_area(results, image, area_points, f"Lane_{lane_idx + 1}")
                        
                        # Cache the analysis results
                        fast_cache.cache_analysis(image, area_points, f"Lane_{lane_idx + 1}", area_analysis)
                        logger.info(f"🚀 FAST CACHE: Cached new analysis for Lane {lane_idx + 1}")
                        
                        # 🔧 PERFECT CALCULATION DEBUG - Only run if not cached
                        debug_info = debug_detection_calculation(
                            raw_detections=results,
                            image=image,
                            area_points=area_points,
                            lane_name=f"Lane_{lane_idx + 1}"
                        )
                except Exception as analysis_cache_error:
                    logger.error(f"🚀 FAST CACHE: Analysis cache error for Lane {lane_idx + 1}: {str(analysis_cache_error)}")
                    # Fallback to direct analysis without caching
                    area_analysis = analyzer.analyze_area(results, image, area_points, f"Lane_{lane_idx + 1}")
                    debug_info = debug_detection_calculation(
                        raw_detections=results,
                        image=image,
                        area_points=area_points,
                        lane_name=f"Lane_{lane_idx + 1}"
                    )
                
                # Calculate timing based on vehicle count and types
                vehicle_count = area_analysis.get('vehicle_count', 0)
                vehicle_types = area_analysis.get('vehicle_types', {})
                
                # 🔧 USE DEBUG INFO FOR PERFECT CALCULATION (only if not cached)
                if debug_info is not None:
                    debug_area_detections = debug_info.get('area_detections', [])
                    debug_vehicle_count = len(debug_area_detections)
                    debug_timing = debug_info.get('perfect_timing', {})
                    
                    # Override with debug calculation if it found vehicles
                    if debug_vehicle_count > 0 and vehicle_count == 0:
                        logger.info(f"🔧 PERFECT DEBUG: Lane {lane_idx + 1} - Using debug calculation: {debug_vehicle_count} vehicles found")
                        vehicle_count = debug_vehicle_count
                        vehicle_types = debug_timing.get('vehicle_breakdown', {})
                        
                        # Update area_analysis with corrected data
                        area_analysis['vehicle_count'] = vehicle_count
                        area_analysis['vehicle_types'] = vehicle_types
                        
                        # Update cache with corrected data
                        fast_cache.cache_analysis(image, area_points, f"Lane_{lane_idx + 1}", area_analysis)
                
                # Ensure vehicle_count matches total from vehicle_types
                total_from_types = sum(vehicle_types.values()) if vehicle_types else 0
                if total_from_types > vehicle_count:
                    vehicle_count = total_from_types
                    logger.info(f"🔍 Lane {lane_idx + 1}: Corrected vehicle count from {area_analysis.get('vehicle_count', 0)} to {vehicle_count}")
                
                # Log actual detection results with more detail
                logger.info(f"🔍 Lane {lane_idx + 1}: Real detection - {vehicle_count} vehicles detected")
                logger.info(f"🔍 Lane {lane_idx + 1}: Vehicle breakdown: {vehicle_types}")
                logger.info(f"🔍 Lane {lane_idx + 1}: Raw detections count: {len(results) if results else 0}")
                logger.info(f"🔍 Lane {lane_idx + 1}: Area analysis vehicle count: {area_analysis.get('vehicle_count', 0)}")
                # Log debug info only if available
                if debug_info is not None:
                    debug_vehicle_count = len(debug_info.get('area_detections', []))
                    logger.info(f"🔧 Lane {lane_idx + 1}: Debug found {debug_vehicle_count} vehicles in area")
                
                # 🚀 FAST CACHE: Check for cached timing calculation
                try:
                    cached_timing = fast_cache.get_cached_timing(vehicle_types, f"Lane_{lane_idx + 1}")
                    if cached_timing is not None:
                        calculated_time = cached_timing.get('calculated_time', 5)
                        total_weight = cached_timing.get('total_weight', 0.0)
                        weight_breakdown = cached_timing.get('weight_breakdown', {})
                        logger.info(f"🚀 FAST CACHE: Using cached timing for Lane {lane_idx + 1} - {calculated_time}s")
                    else:
                        # Calculate intelligent timing based on vehicle weights
                        total_weight = 0
                        weight_breakdown = {}
                        cached_timing = None  # Ensure it's None for later check
                except Exception as timing_cache_error:
                    logger.error(f"🚀 FAST CACHE: Timing cache error for Lane {lane_idx + 1}: {str(timing_cache_error)}")
                    # Fallback to direct calculation
                    total_weight = 0
                    weight_breakdown = {}
                    cached_timing = None
                
                # Debug: Show available weights
                logger.info(f"🧮 Lane {lane_idx + 1}: Available vehicle weights: {vehicle_weights}")
                logger.info(f"🧮 Lane {lane_idx + 1}: Processing vehicle types: {vehicle_types}")
                
                for vehicle_type, count in vehicle_types.items():
                    # Map detected vehicle types to weight categories
                    weight_key = vehicle_type.lower()
                    if weight_key == 'motorbike':
                        weight_key = 'motorcycle'
                    elif weight_key in ['auto', 'rickshaw']:
                        weight_key = 'auto_rickshaw'
                    
                    vehicle_weight = vehicle_weights.get(weight_key, 1.0)  # Default weight 1.0
                    vehicle_total_weight = count * vehicle_weight
                    total_weight += vehicle_total_weight
                    
                    # Debug logging for each vehicle type
                    logger.info(f"🧮 Lane {lane_idx + 1}: {vehicle_type} ({count}) → weight_key: '{weight_key}' → {vehicle_weight} each → total: {vehicle_total_weight}")
                    
                    weight_breakdown[vehicle_type] = {
                        'count': count,
                        'weight_per_vehicle': vehicle_weight,
                        'total_weight': vehicle_total_weight,
                        'time_contribution': vehicle_total_weight * base_time_multiplier
                    }
                
                # Scientifically sound, logical traffic signal timing calculation:
                # Startup clearance delay t0 = 4.0s
                # Clearance per PCU weight unit = 1.8s
                min_time = config.get('min_time', 10)
                max_time = config.get('max_time', 65)
                
                if vehicle_count == 0:
                    calculated_time = min_time
                    total_weight = 0.0
                else:
                    # Fallback to realistic weight if breakdown is empty
                    if total_weight <= 0:
                        total_weight = float(vehicle_count) * 1.05
                    
                    # Webster-inspired green time: t0 + (total_weight * clearance_rate)
                    raw_time = 4.0 + (total_weight * 1.8)
                    calculated_time = int(max(min_time, min(max_time, round(raw_time))))
                
                logger.info(f"🚦 Lane {lane_idx + 1} LOGICAL TIMING: {vehicle_count} vehicles (Total PCU weight {total_weight:.1f}) → Allocated Green: {calculated_time}s [Range: {min_time}-{max_time}s]")
                
                # 🚀 FAST CACHE: Cache the timing calculation if not already cached
                try:
                    if cached_timing is None:
                        timing_result = {
                            'calculated_time': calculated_time,
                            'total_weight': total_weight,
                            'weight_breakdown': weight_breakdown,
                            'vehicle_count': vehicle_count,
                            'vehicle_types': vehicle_types
                        }
                        fast_cache.cache_timing(vehicle_types, f"Lane_{lane_idx + 1}", timing_result)
                        logger.info(f"🚀 FAST CACHE: Cached timing calculation for Lane {lane_idx + 1}")
                except Exception as timing_store_error:
                    logger.error(f"🚀 FAST CACHE: Error storing timing cache for Lane {lane_idx + 1}: {str(timing_store_error)}")
                
                # Determine if this lane is currently active (only ONE lane can be active)
                is_active = (lane_idx == current_active_lane)
                
                # For active lane: First detect vehicles, then start timer
                if is_active:
                    # Step 1: YOLOv8 detection and time calculation
                    if not lane_detection_complete:
                        logger.info(f"🔍 Lane {lane_idx + 1}: Starting YOLOv8 detection and time calculation...")
                        lane_detection_complete = True
                        lane_start_time = datetime.now()  # Reset timer after detection
                        logger.info(f"⏱️ Lane {lane_idx + 1}: Detected {vehicle_count} vehicles, allocated time: {calculated_time}s")
                        logger.info(f"🚦 Lane {lane_idx + 1}: Timer starting NOW!")
                    
                    # Step 2: Timer countdown
                    elapsed_time = (datetime.now() - lane_start_time).total_seconds()
                    remaining_time = max(0, int(calculated_time - elapsed_time))
                    traffic_status = "GREEN"
                    
                    if remaining_time <= 3:
                        logger.info(f"⏱️ Lane {lane_idx + 1}: Timer status - Elapsed: {elapsed_time:.1f}s, Remaining: {remaining_time}s, Target: {calculated_time}s")
                    
                    if remaining_time > 0:
                        detection_status = f"ACTIVE ({remaining_time}s left of {calculated_time}s)"
                    elif remaining_time == 0:
                        detection_status = "TIMER FINISHED - READY TO SWITCH"
                    else:
                        detection_status = "COMPLETED"
                else:
                    remaining_time = 0
                    traffic_status = "RED"
                    detection_status = f"WAITING (Allocated: {calculated_time}s)"
                
                # Enhanced analysis result with traffic light status
                lane_result = {
                    "lane_id": lane_idx + 1,
                    "lane_name": f"Lane {lane_idx + 1}",
                    "vehicle_count": vehicle_count,
                    "vehicle_types": vehicle_types,
                    "calculated_time": calculated_time,
                    "remaining_time": remaining_time,
                    "is_active": is_active,
                    "traffic_light_status": traffic_status,
                    "detection_status": detection_status,
                    "congestion_level": "critical" if vehicle_count >= 25 else "high" if vehicle_count >= 16 else "medium" if vehicle_count >= 8 else "low",
                    "detections": results if results else [],  # Send detections for all lanes so bounding boxes are visible
                    "area_analysis": area_analysis,
                    "processing_time": area_analysis.get('processing_time', 0),
                    "weight_breakdown": weight_breakdown,
                    "total_weight": total_weight,
                    "time_calculation": f"{total_weight:.1f} weight × 1.8s + 4.0s startup = {calculated_time}s",
                    "detection_complete": lane_detection_complete if is_active else False,
                    "timestamp": datetime.now().isoformat()
                }
                
                analysis_results.append(lane_result)
            
            # Perfect Sequential Loop Logic - One After One
            if analysis_results and len(analysis_results) > 0:
                # Get current active lane data
                active_lane_data = None
                for lane in analysis_results:
                    if lane['lane_id'] == current_active_lane + 1:
                        active_lane_data = lane
                        break
                
                if active_lane_data:
                    # Check if current lane time is COMPLETELY finished
                    elapsed_time = (datetime.now() - lane_start_time).total_seconds()
                    
                    # Use the exact calculated time (Min 5s, Max 35s)
                    actual_time = active_lane_data['calculated_time']
                    remaining_time = active_lane_data['remaining_time']
                    
                    # STRICT CONDITION: ONLY switch when timer is COMPLETELY finished
                    # Must satisfy ALL conditions:
                    # 1. Elapsed time >= calculated time
                    # 2. Remaining time = 0  
                    # 3. Detection was completed
                    # 4. At least minimum time has passed (safety check)
                    
                    logger.info(f"🔍 Lane {active_lane_data['lane_id']} Switch Check:")
                    logger.info(f"   Elapsed: {elapsed_time:.1f}s >= Target: {actual_time}s? {elapsed_time >= actual_time}")
                    logger.info(f"   Remaining: {remaining_time}s <= 0? {remaining_time <= 0}")
                    logger.info(f"   Detection Complete? {active_lane_data.get('detection_complete', False)}")
                    
                    if (elapsed_time >= actual_time and 
                        remaining_time <= 0 and 
                        active_lane_data.get('detection_complete', False)):
                        # Current lane completed - switch to next lane
                        previous_lane = current_active_lane + 1
                        
                        # Check mode: Smart Priority (heaviest traffic first) vs Sequential (1->2->3->4)
                        is_smart_mode = config.get('mode') == 'smart_priority'
                        if is_smart_mode and len(analysis_results) > 1:
                            other_lanes = [l for l in analysis_results if l['lane_id'] != previous_lane]
                            if other_lanes:
                                highest_lane = max(other_lanes, key=lambda l: (l.get('total_weight', 0), l.get('vehicle_count', 0)))
                                current_active_lane = highest_lane['lane_id'] - 1
                            else:
                                current_active_lane = (current_active_lane + 1) % len(analysis_results)
                        else:
                            current_active_lane = (current_active_lane + 1) % len(analysis_results)
                            
                        next_lane_after = (current_active_lane + 1) % len(analysis_results) + 1
                        
                        # Reset detection flag for new lane (IMPORTANT!)
                        lane_detection_complete = False
                        lane_start_time = datetime.now()
                        
                        logger.info(f"✅ Lane {previous_lane} TIMER FINISHED - {actual_time}s allocated duration elapsed")
                        logger.info(f"🔄 Switching to Lane {current_active_lane + 1} (Priority Mode: {'Smart Density' if is_smart_mode else 'Sequential'})")
                        logger.info(f"🚦 Lane {current_active_lane + 1} is now ACTIVE (GREEN)")
                        logger.info(f"🔴 Lane {previous_lane} is now WAITING (RED)")
                        
                        # Update all lanes status for smooth transition
                        for i, lane in enumerate(analysis_results):
                            if i == current_active_lane:
                                lane['is_active'] = True
                                lane['traffic_light_status'] = "GREEN"
                                lane['detection_status'] = f"ACTIVE ({lane['calculated_time']}s green)"
                            else:
                                lane['is_active'] = False
                                lane['traffic_light_status'] = "RED"
                                lane['remaining_time'] = 0
                                lane['detection_status'] = f"WAITING (Allocated: {lane['calculated_time']}s)"
                else:
                    # Initialize the loop with Lane 1
                    current_active_lane = 0
                    lane_start_time = datetime.now()
                    logger.info("🚀 Starting traffic loop with Lane 1 (GREEN)")
            
            # Calculate dynamic wait times and queue positions for each lane
            for lane in analysis_results:
                l_idx = lane['lane_id'] - 1
                if lane['is_active']:
                    lane['estimated_wait_time'] = 0
                    lane['queue_position'] = 0
                else:
                    steps = (l_idx - current_active_lane) % len(analysis_results)
                    lane['queue_position'] = steps
                    active_rem = active_lane_data['remaining_time'] if active_lane_data else 0
                    accum_wait = active_rem
                    for s in range(1, steps):
                        inter_idx = (current_active_lane + s) % len(analysis_results)
                        for other in analysis_results:
                            if other['lane_id'] == inter_idx + 1:
                                accum_wait += other.get('calculated_time', 20)
                                break
                    lane['estimated_wait_time'] = accum_wait
            
            # Broadcast results via WebSocket
            await websocket_manager.broadcast({
                "type": "live_analysis_update",
                "data": {
                    "lanes": analysis_results,
                    "system_status": {
                        "model": "YOLOv8s",
                        "analysis_active": True,
                        "total_lanes": len(analysis_results),
                        "active_lanes": 1,
                        "waiting_lanes": len(analysis_results) - 1,
                        "current_active_lane": current_active_lane + 1,
                        "next_lane": (current_active_lane + 1) % len(analysis_results) + 1,
                        "loop_sequence": f"Lane {current_active_lane + 1} → Lane {(current_active_lane + 1) % len(analysis_results) + 1}",
                        "mode": config.get('mode', 'smart_priority'),
                        "traffic_light_system": "smart_adaptive_traffic_controller"
                    },
                    "traffic_timing": {
                        "vehicle_weights": vehicle_weights,
                        "base_clearance_per_weight": 1.8,
                        "startup_delay": 4.0,
                        "min_time": min_time,
                        "max_time": max_time,
                        "timing_formula": f"4.0s startup + (Total PCU Weight × 1.8s) [Bounded {min_time}s - {max_time}s]"
                    },
                    "timestamp": datetime.now().isoformat()
                }
            })
            
            logger.info(f"🔄 Perfect Loop Status - Active: Lane {current_active_lane + 1}, Next: Lane {(current_active_lane + 1) % len(analysis_results) + 1}")
            
            # Fast loop interval for smooth switching
            await asyncio.sleep(0.5)  # Update every 500ms for smooth transitions
            
        except Exception as e:
            logger.error(f"Error in live analysis loop: {str(e)}")
            await asyncio.sleep(1.0)  # Short delay on error
    
    logger.info("Live YOLOv8 analysis loop stopped")

# Statistics endpoint
@app.get("/api/stats")
async def get_statistics():
    """Get system statistics"""
    cache_stats = fast_cache.get_cache_stats()
    return {
        "active_connections": len(websocket_manager.active_connections),
        "total_detections": analyzer.get_total_detections(),
        "system_uptime": analyzer.get_uptime(),
        "model_info": detector.get_model_info(),
        "live_analysis_running": live_analysis_running,
        "cache_performance": cache_stats,
        "timestamp": datetime.now().isoformat()
    }

# Fast Cache Management endpoints
@app.get("/api/cache/stats")
async def get_cache_statistics():
    """Get detailed cache performance statistics"""
    return fast_cache.get_cache_stats()

@app.post("/api/cache/clear")
async def clear_cache():
    """Clear all cache entries"""
    fast_cache.clear_cache()
    return {"message": "Cache cleared successfully", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    # Run the application
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
