"""
Advanced YOLOv11x Video Detection System
Smart India Hackathon 2025 - AI Traffic Optimizer
Real-time video processing with maximum accuracy
"""

import cv2
import numpy as np
import asyncio
import threading
import queue
import time
from typing import List, Dict, Any, Optional, Callable
import logging
from datetime import datetime
from pathlib import Path
import json
import base64
from concurrent.futures import ThreadPoolExecutor
import os

from .yolov11x_detector import YOLOv11xDetector

logger = logging.getLogger(__name__)

class VideoDetector:
    """Advanced video detection system using YOLOv11x for traffic monitoring"""
    
    def __init__(self, model_path: str = "yolo11x.pt"):
        self.detector = YOLOv11xDetector(model_path)
        self.is_initialized = False
        
        # Video processing parameters
        self.target_fps = 30
        self.processing_fps = 10  # Process every 3rd frame for performance
        self.frame_skip = max(1, self.target_fps // self.processing_fps)
        
        # Threading and queue management
        self.frame_queue = queue.Queue(maxsize=30)
        self.result_queue = queue.Queue(maxsize=30)
        self.processing_thread = None
        self.is_processing = False
        
        # Performance tracking
        self.processed_frames = 0
        self.total_processing_time = 0.0
        self.fps_counter = 0
        self.last_fps_time = time.time()
        self.current_fps = 0
        
        # Video statistics
        self.video_stats = {
            'total_frames': 0,
            'processed_frames': 0,
            'total_detections': 0,
            'average_detections_per_frame': 0,
            'processing_fps': 0,
            'video_fps': 0
        }
        
        # Detection tracking for video analysis
        self.detection_history = []
        self.max_history_length = 100  # Keep last 100 frames of detections
        
        logger.info("VideoDetector initialized with YOLOv11x")
    
    async def initialize(self):
        """Initialize the video detector"""
        try:
            await self.detector.initialize()
            self.is_initialized = True
            logger.info("VideoDetector initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize VideoDetector: {str(e)}")
            raise
    
    def start_processing(self):
        """Start the video processing thread"""
        if not self.is_processing:
            self.is_processing = True
            self.processing_thread = threading.Thread(target=self._processing_loop, daemon=True)
            self.processing_thread.start()
            logger.info("Video processing thread started")
    
    def stop_processing(self):
        """Stop the video processing thread"""
        self.is_processing = False
        if self.processing_thread and self.processing_thread.is_alive():
            self.processing_thread.join(timeout=5)
        logger.info("Video processing thread stopped")
    
    def _processing_loop(self):
        """Main processing loop for video frames"""
        while self.is_processing:
            try:
                # Get frame from queue with timeout
                frame_data = self.frame_queue.get(timeout=1.0)
                
                if frame_data is None:
                    continue
                
                frame, frame_number, timestamp = frame_data
                
                # Process frame with YOLOv11x
                start_time = time.time()
                detections = asyncio.run(self.detector.detect_objects(frame))
                processing_time = time.time() - start_time
                
                # Analyze dense traffic for video
                dense_analysis = self.detector.analyze_dense_traffic(detections, frame.shape)
                
                # Create result
                result = {
                    'frame_number': frame_number,
                    'timestamp': timestamp,
                    'detections': detections,
                    'dense_analysis': dense_analysis,
                    'processing_time': processing_time,
                    'detection_count': len(detections)
                }
                
                # Add to result queue
                if not self.result_queue.full():
                    self.result_queue.put(result)
                
                # Update statistics
                self._update_stats(result)
                
                # Add to detection history
                self.detection_history.append(result)
                if len(self.detection_history) > self.max_history_length:
                    self.detection_history.pop(0)
                
                # Update FPS counter
                self._update_fps()
                
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"Error in video processing loop: {str(e)}")
    
    def _update_stats(self, result: Dict[str, Any]):
        """Update video processing statistics"""
        self.processed_frames += 1
        self.total_processing_time += result['processing_time']
        self.video_stats['processed_frames'] = self.processed_frames
        self.video_stats['total_detections'] += result['detection_count']
        
        if self.processed_frames > 0:
            self.video_stats['average_detections_per_frame'] = (
                self.video_stats['total_detections'] / self.processed_frames
            )
    
    def _update_fps(self):
        """Update FPS calculation"""
        self.fps_counter += 1
        current_time = time.time()
        
        if current_time - self.last_fps_time >= 1.0:  # Update every second
            self.current_fps = self.fps_counter / (current_time - self.last_fps_time)
            self.video_stats['processing_fps'] = round(self.current_fps, 2)
            self.fps_counter = 0
            self.last_fps_time = current_time
    
    async def process_video_file(self, video_path: str, progress_callback: Optional[Callable] = None) -> Dict[str, Any]:
        """
        Process a video file and return comprehensive analysis
        
        Args:
            video_path: Path to video file
            progress_callback: Optional callback for progress updates
            
        Returns:
            Comprehensive video analysis results
        """
        if not self.is_initialized:
            await self.initialize()
        
        try:
            # Open video file
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                raise ValueError(f"Could not open video file: {video_path}")
            
            # Get video properties
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            video_fps = cap.get(cv2.CAP_PROP_FPS)
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            duration = total_frames / video_fps if video_fps > 0 else 0
            
            self.video_stats['total_frames'] = total_frames
            self.video_stats['video_fps'] = video_fps
            
            logger.info(f"Processing video: {total_frames} frames, {video_fps} FPS, {duration:.2f}s")
            
            # Start processing thread
            self.start_processing()
            
            # Process video frames
            frame_number = 0
            processed_count = 0
            all_results = []
            
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Skip frames based on processing FPS
                if frame_number % self.frame_skip == 0:
                    timestamp = frame_number / video_fps if video_fps > 0 else 0
                    
                    # Add frame to processing queue
                    if not self.frame_queue.full():
                        self.frame_queue.put((frame.copy(), frame_number, timestamp))
                    
                    processed_count += 1
                
                frame_number += 1
                
                # Update progress
                if progress_callback:
                    progress = (frame_number / total_frames) * 100
                    progress_callback(progress, frame_number, total_frames)
                
                # Collect results
                while not self.result_queue.empty():
                    try:
                        result = self.result_queue.get_nowait()
                        all_results.append(result)
                    except queue.Empty:
                        break
            
            # Wait for remaining processing to complete
            time.sleep(2)
            while not self.result_queue.empty():
                try:
                    result = self.result_queue.get_nowait()
                    all_results.append(result)
                except queue.Empty:
                    break
            
            # Stop processing
            self.stop_processing()
            cap.release()
            
            # Generate comprehensive analysis
            analysis = self._generate_video_analysis(all_results, {
                'total_frames': total_frames,
                'video_fps': video_fps,
                'width': width,
                'height': height,
                'duration': duration,
                'processed_frames': len(all_results)
            })
            
            logger.info(f"Video processing completed: {len(all_results)} frames processed")
            return analysis
            
        except Exception as e:
            logger.error(f"Error processing video: {str(e)}")
            raise
    
    def _generate_video_analysis(self, results: List[Dict[str, Any]], video_info: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive video analysis from frame results"""
        
        if not results:
            return {
                'error': 'No frames were processed',
                'video_info': video_info
            }
        
        # Aggregate statistics
        total_detections = sum(r['detection_count'] for r in results)
        avg_detections = total_detections / len(results) if results else 0
        avg_processing_time = sum(r['processing_time'] for r in results) / len(results) if results else 0
        
        # Vehicle type analysis across video
        vehicle_counts = {'car': 0, 'motorcycle': 0, 'bus': 0, 'truck': 0, 'bicycle': 0, 'person': 0}
        confidence_scores = []
        density_levels = []
        
        for result in results:
            for detection in result['detections']:
                class_name = detection['class_name']
                if class_name in vehicle_counts:
                    vehicle_counts[class_name] += 1
                confidence_scores.append(detection['confidence'])
            
            # Collect density information
            dense_analysis = result.get('dense_analysis', {})
            density_metrics = dense_analysis.get('density_metrics', {})
            if 'density_level' in density_metrics:
                density_levels.append(density_metrics['density_level'])
        
        # Traffic flow analysis
        traffic_flow = self._analyze_traffic_flow(results)
        
        # Peak detection analysis
        peak_analysis = self._analyze_peak_traffic(results)
        
        # Quality metrics
        avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0
        high_confidence_count = len([c for c in confidence_scores if c > 0.8])
        
        return {
            'video_info': video_info,
            'processing_summary': {
                'total_frames_processed': len(results),
                'total_detections': total_detections,
                'average_detections_per_frame': round(avg_detections, 2),
                'average_processing_time': round(avg_processing_time, 3),
                'processing_fps': round(len(results) / video_info['duration'], 2) if video_info['duration'] > 0 else 0
            },
            'vehicle_analysis': {
                'total_counts': vehicle_counts,
                'dominant_vehicle_type': max(vehicle_counts, key=vehicle_counts.get),
                'vehicle_distribution': {k: round((v/total_detections)*100, 1) if total_detections > 0 else 0 
                                       for k, v in vehicle_counts.items()}
            },
            'quality_metrics': {
                'average_confidence': round(avg_confidence, 3),
                'high_confidence_detections': high_confidence_count,
                'detection_quality': 'excellent' if avg_confidence > 0.7 else 'good' if avg_confidence > 0.5 else 'fair'
            },
            'traffic_flow_analysis': traffic_flow,
            'peak_traffic_analysis': peak_analysis,
            'density_analysis': {
                'density_levels': density_levels,
                'most_common_density': max(set(density_levels), key=density_levels.count) if density_levels else 'unknown',
                'congestion_percentage': round((density_levels.count('very_dense') + density_levels.count('extremely_dense')) / len(density_levels) * 100, 1) if density_levels else 0
            },
            'frame_results': results[:10],  # Include first 10 frames for detailed view
            'model_info': {
                'model': 'YOLOv11x',
                'video_optimized': True,
                'real_time_capable': True
            },
            'timestamp': datetime.now().isoformat()
        }
    
    def _analyze_traffic_flow(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze traffic flow patterns across video"""
        
        if len(results) < 2:
            return {'error': 'Insufficient data for flow analysis'}
        
        # Calculate detection count changes over time
        detection_counts = [r['detection_count'] for r in results]
        
        # Smooth the data using moving average
        window_size = min(5, len(detection_counts))
        smoothed_counts = []
        for i in range(len(detection_counts)):
            start_idx = max(0, i - window_size // 2)
            end_idx = min(len(detection_counts), i + window_size // 2 + 1)
            smoothed_counts.append(sum(detection_counts[start_idx:end_idx]) / (end_idx - start_idx))
        
        # Analyze trends
        increasing_trend = sum(1 for i in range(1, len(smoothed_counts)) if smoothed_counts[i] > smoothed_counts[i-1])
        decreasing_trend = sum(1 for i in range(1, len(smoothed_counts)) if smoothed_counts[i] < smoothed_counts[i-1])
        
        trend_percentage = (increasing_trend / (len(smoothed_counts) - 1)) * 100 if len(smoothed_counts) > 1 else 0
        
        return {
            'trend_analysis': {
                'increasing_periods': increasing_trend,
                'decreasing_periods': decreasing_trend,
                'trend_direction': 'increasing' if trend_percentage > 60 else 'decreasing' if trend_percentage < 40 else 'stable',
                'trend_strength': abs(trend_percentage - 50) / 50  # 0 = stable, 1 = strong trend
            },
            'flow_characteristics': {
                'min_vehicles': min(detection_counts),
                'max_vehicles': max(detection_counts),
                'average_vehicles': round(sum(detection_counts) / len(detection_counts), 2),
                'variance': round(np.var(detection_counts), 2),
                'flow_consistency': 'high' if np.var(detection_counts) < 10 else 'medium' if np.var(detection_counts) < 25 else 'low'
            }
        }
    
    def _analyze_peak_traffic(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze peak traffic periods in the video"""
        
        detection_counts = [r['detection_count'] for r in results]
        
        if not detection_counts:
            return {'error': 'No detection data available'}
        
        avg_detections = sum(detection_counts) / len(detection_counts)
        peak_threshold = avg_detections * 1.3  # 30% above average
        
        # Find peak periods
        peak_frames = []
        for i, count in enumerate(detection_counts):
            if count > peak_threshold:
                timestamp = results[i]['timestamp']
                peak_frames.append({
                    'frame_number': results[i]['frame_number'],
                    'timestamp': timestamp,
                    'vehicle_count': count,
                    'density_level': results[i].get('dense_analysis', {}).get('density_metrics', {}).get('density_level', 'unknown')
                })
        
        return {
            'peak_detection': {
                'peak_threshold': round(peak_threshold, 2),
                'peak_frame_count': len(peak_frames),
                'peak_percentage': round((len(peak_frames) / len(results)) * 100, 1),
                'peak_frames': peak_frames[:5]  # Top 5 peak frames
            },
            'traffic_intensity': {
                'low_traffic_frames': len([c for c in detection_counts if c < avg_detections * 0.7]),
                'normal_traffic_frames': len([c for c in detection_counts if avg_detections * 0.7 <= c <= avg_detections * 1.3]),
                'high_traffic_frames': len([c for c in detection_counts if c > avg_detections * 1.3]),
                'intensity_classification': 'high' if len(peak_frames) / len(results) > 0.3 else 'medium' if len(peak_frames) / len(results) > 0.1 else 'low'
            }
        }
    
    async def process_live_stream(self, source: str = 0, callback: Optional[Callable] = None):
        """
        Process live video stream (webcam or IP camera)
        
        Args:
            source: Video source (0 for webcam, URL for IP camera)
            callback: Callback function for real-time results
        """
        if not self.is_initialized:
            await self.initialize()
        
        try:
            cap = cv2.VideoCapture(source)
            if not cap.isOpened():
                raise ValueError(f"Could not open video source: {source}")
            
            # Set camera properties for better performance
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
            cap.set(cv2.CAP_PROP_FPS, 30)
            
            self.start_processing()
            
            frame_number = 0
            logger.info(f"Started live stream processing from source: {source}")
            
            while self.is_processing:
                ret, frame = cap.read()
                if not ret:
                    logger.warning("Failed to read frame from video source")
                    break
                
                # Process every nth frame
                if frame_number % self.frame_skip == 0:
                    timestamp = time.time()
                    
                    if not self.frame_queue.full():
                        self.frame_queue.put((frame.copy(), frame_number, timestamp))
                
                # Get results and call callback
                while not self.result_queue.empty():
                    try:
                        result = self.result_queue.get_nowait()
                        if callback:
                            callback(result, frame)
                    except queue.Empty:
                        break
                
                frame_number += 1
                
                # Small delay to prevent overwhelming
                await asyncio.sleep(0.01)
            
            cap.release()
            self.stop_processing()
            logger.info("Live stream processing stopped")
            
        except Exception as e:
            logger.error(f"Error in live stream processing: {str(e)}")
            raise
    
    def get_processing_stats(self) -> Dict[str, Any]:
        """Get current processing statistics"""
        return {
            'video_stats': self.video_stats.copy(),
            'current_fps': self.current_fps,
            'queue_status': {
                'frame_queue_size': self.frame_queue.qsize(),
                'result_queue_size': self.result_queue.qsize(),
                'is_processing': self.is_processing
            },
            'detection_history_length': len(self.detection_history),
            'model_info': self.detector.get_model_info() if self.is_initialized else {}
        }
    
    def clear_history(self):
        """Clear detection history to free memory"""
        self.detection_history.clear()
        logger.info("Detection history cleared")
    
    def __del__(self):
        """Cleanup when object is destroyed"""
        self.stop_processing()
