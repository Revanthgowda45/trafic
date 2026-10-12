"""
Fast Analysis Cache System
Smart India Hackathon 2025 - AI Traffic Optimizer
Caches analysis results for faster subsequent processing
"""

import cv2
import numpy as np
from typing import List, Dict, Any, Tuple, Optional, Union
import logging
from datetime import datetime, timedelta
import json
import hashlib
from collections import defaultdict
import threading
import time

logger = logging.getLogger(__name__)

class FastAnalysisCache:
    """High-performance caching system for traffic analysis results"""
    
    def __init__(self, cache_duration_seconds: int = 30, max_cache_size: int = 100):
        self.cache_duration = cache_duration_seconds
        self.max_cache_size = max_cache_size
        
        # Cache storage
        self.detection_cache = {}  # Stores YOLO detection results
        self.analysis_cache = {}   # Stores area analysis results
        self.timing_cache = {}     # Stores timing calculations
        
        # Cache metadata
        self.cache_timestamps = {}
        self.cache_access_count = defaultdict(int)
        self.cache_hits = 0
        self.cache_misses = 0
        
        # Thread safety
        self.cache_lock = threading.RLock()
        
        # Performance tracking
        self.last_cleanup = time.time()
        self.cleanup_interval = 60  # seconds
        
        logger.info(f"🚀 FastAnalysisCache initialized - Duration: {cache_duration_seconds}s, Max size: {max_cache_size}")
    
    def get_image_hash(self, image: np.ndarray) -> str:
        """Generate fast hash for image to use as cache key"""
        try:
            if image is None or not isinstance(image, np.ndarray):
                logger.warning(f"🚀 CACHE: Invalid image type: {type(image)}")
                return f"invalid_image_{int(time.time())}"
            
            # Use image shape and a sample of pixels for fast hashing
            h, w = image.shape[:2]
            
            if h == 0 or w == 0:
                logger.warning(f"🚀 CACHE: Invalid image dimensions: {h}x{w}")
                return f"empty_image_{int(time.time())}"
            
            # Sample pixels from different regions for hash (safer indexing)
            try:
                sample_points = [
                    image[min(h//4, h-1), min(w//4, w-1)],
                    image[min(h//2, h-1), min(w//2, w-1)], 
                    image[min(3*h//4, h-1), min(3*w//4, w-1)],
                    image[min(h//8, h-1), min(7*w//8, w-1)],
                    image[min(7*h//8, h-1), min(w//8, w-1)]
                ]
                
                # Flatten sample points properly for hashing
                flattened_samples = []
                for point in sample_points:
                    if isinstance(point, np.ndarray):
                        flattened_samples.extend(point.flatten().tolist())
                    elif isinstance(point, (int, float, np.integer, np.floating)):
                        flattened_samples.append(float(point))
                    else:
                        flattened_samples.append(str(point))
                
                # Create hash from shape and sample pixels
                hash_data = f"{h}x{w}_{hash(tuple(flattened_samples))}"
                return hashlib.md5(hash_data.encode()).hexdigest()[:16]
                
            except (IndexError, ValueError) as e:
                logger.warning(f"🚀 CACHE: Error sampling pixels: {str(e)}")
                # Fallback to simple shape-based hash
                hash_data = f"{h}x{w}_{image.mean():.2f}"
                return hashlib.md5(hash_data.encode()).hexdigest()[:16]
            
        except Exception as e:
            logger.error(f"🚀 CACHE: Error generating image hash: {str(e)}")
            logger.error(f"🚀 CACHE: Image shape: {getattr(image, 'shape', 'unknown')}")
            logger.error(f"🚀 CACHE: Image type: {type(image)}")
            return f"fallback_{int(time.time())}"
    
    def get_area_hash(self, area_points: List[Tuple[int, int]]) -> str:
        """Generate hash for area polygon"""
        try:
            area_str = "_".join([f"{x},{y}" for x, y in area_points])
            return hashlib.md5(area_str.encode()).hexdigest()[:12]
        except Exception:
            return "area_fallback"
    
    def is_cache_valid(self, cache_key: str) -> bool:
        """Check if cache entry is still valid"""
        try:
            with self.cache_lock:
                if cache_key not in self.cache_timestamps:
                    return False
                
                cache_time = self.cache_timestamps[cache_key]
                current_time = time.time()
                
                return (current_time - cache_time) < self.cache_duration
        except Exception:
            return False
    
    def get_cached_detections(self, image: np.ndarray) -> Optional[Any]:
        """Get cached YOLO detection results"""
        try:
            image_hash = self.get_image_hash(image)
            cache_key = f"detections_{image_hash}"
            
            with self.cache_lock:
                if cache_key in self.detection_cache and self.is_cache_valid(cache_key):
                    self.cache_hits += 1
                    self.cache_access_count[cache_key] += 1
                    
                    cached_data = self.detection_cache[cache_key]
                    # Get count safely for logging
                    count = len(cached_data) if hasattr(cached_data, '__len__') else "unknown"
                    logger.info(f"🚀 CACHE HIT: Detections - {count} detections from cache")
                    return cached_data
                
                self.cache_misses += 1
                return None
                
        except Exception as e:
            logger.error(f"🚀 CACHE: Error getting cached detections: {str(e)}")
            return None
    
    def cache_detections(self, image: np.ndarray, detections: Any) -> None:
        """Cache YOLO detection results"""
        try:
            image_hash = self.get_image_hash(image)
            cache_key = f"detections_{image_hash}"
            
            with self.cache_lock:
                # Handle different detection result formats
                if hasattr(detections, 'copy'):
                    cached_detections = detections.copy()
                elif isinstance(detections, list):
                    cached_detections = detections.copy() if detections else []
                else:
                    # For YOLO Results objects or other formats
                    cached_detections = detections
                
                self.detection_cache[cache_key] = cached_detections
                self.cache_timestamps[cache_key] = time.time()
                
                # Get count safely
                detection_count = len(detections) if hasattr(detections, '__len__') else "unknown"
                logger.info(f"🚀 CACHE STORE: Cached {detection_count} detections for key {cache_key}")
                
                # Cleanup if needed
                self._cleanup_cache_if_needed()
                
        except Exception as e:
            logger.error(f"🚀 CACHE: Error caching detections: {str(e)}")
            logger.error(f"🚀 CACHE: Detection type: {type(detections)}")
    
    def get_cached_analysis(self, image: np.ndarray, area_points: List[Tuple[int, int]], 
                           lane_name: str) -> Optional[Dict]:
        """Get cached area analysis results"""
        try:
            image_hash = self.get_image_hash(image)
            area_hash = self.get_area_hash(area_points)
            cache_key = f"analysis_{image_hash}_{area_hash}_{lane_name}"
            
            with self.cache_lock:
                if cache_key in self.analysis_cache and self.is_cache_valid(cache_key):
                    self.cache_hits += 1
                    self.cache_access_count[cache_key] += 1
                    
                    cached_data = self.analysis_cache[cache_key]
                    logger.info(f"🚀 CACHE HIT: Analysis - {lane_name} from cache ({cached_data.get('total_vehicles', 0)} vehicles)")
                    return cached_data
                
                self.cache_misses += 1
                return None
                
        except Exception as e:
            logger.error(f"🚀 CACHE: Error getting cached analysis: {str(e)}")
            return None
    
    def cache_analysis(self, image: np.ndarray, area_points: List[Tuple[int, int]], 
                      lane_name: str, analysis_result: Dict) -> None:
        """Cache area analysis results"""
        try:
            image_hash = self.get_image_hash(image)
            area_hash = self.get_area_hash(area_points)
            cache_key = f"analysis_{image_hash}_{area_hash}_{lane_name}"
            
            with self.cache_lock:
                self.analysis_cache[cache_key] = analysis_result.copy()
                self.cache_timestamps[cache_key] = time.time()
                
                vehicle_count = analysis_result.get('total_vehicles', 0)
                logger.info(f"🚀 CACHE STORE: Cached analysis for {lane_name} - {vehicle_count} vehicles")
                
                # Cleanup if needed
                self._cleanup_cache_if_needed()
                
        except Exception as e:
            logger.error(f"🚀 CACHE: Error caching analysis: {str(e)}")
    
    def get_cached_timing(self, vehicle_types: Dict[str, int], lane_name: str) -> Optional[Dict]:
        """Get cached timing calculation results"""
        try:
            # Create hash from vehicle types
            types_str = "_".join([f"{k}:{v}" for k, v in sorted(vehicle_types.items())])
            timing_hash = hashlib.md5(types_str.encode()).hexdigest()[:12]
            cache_key = f"timing_{timing_hash}_{lane_name}"
            
            with self.cache_lock:
                if cache_key in self.timing_cache and self.is_cache_valid(cache_key):
                    self.cache_hits += 1
                    self.cache_access_count[cache_key] += 1
                    
                    cached_data = self.timing_cache[cache_key]
                    logger.info(f"🚀 CACHE HIT: Timing - {lane_name} from cache ({cached_data.get('calculated_time', 0)}s)")
                    return cached_data
                
                self.cache_misses += 1
                return None
                
        except Exception as e:
            logger.error(f"🚀 CACHE: Error getting cached timing: {str(e)}")
            return None
    
    def cache_timing(self, vehicle_types: Dict[str, int], lane_name: str, 
                    timing_result: Dict) -> None:
        """Cache timing calculation results"""
        try:
            # Create hash from vehicle types
            types_str = "_".join([f"{k}:{v}" for k, v in sorted(vehicle_types.items())])
            timing_hash = hashlib.md5(types_str.encode()).hexdigest()[:12]
            cache_key = f"timing_{timing_hash}_{lane_name}"
            
            with self.cache_lock:
                self.timing_cache[cache_key] = timing_result.copy()
                self.cache_timestamps[cache_key] = time.time()
                
                calc_time = timing_result.get('calculated_time', 0)
                logger.info(f"🚀 CACHE STORE: Cached timing for {lane_name} - {calc_time}s")
                
                # Cleanup if needed
                self._cleanup_cache_if_needed()
                
        except Exception as e:
            logger.error(f"🚀 CACHE: Error caching timing: {str(e)}")
    
    def _cleanup_cache_if_needed(self) -> None:
        """Clean up expired cache entries"""
        try:
            current_time = time.time()
            
            # Only cleanup periodically to avoid overhead
            if current_time - self.last_cleanup < self.cleanup_interval:
                return
            
            self.last_cleanup = current_time
            
            # Find expired entries
            expired_keys = []
            for key, timestamp in self.cache_timestamps.items():
                if current_time - timestamp > self.cache_duration:
                    expired_keys.append(key)
            
            # Remove expired entries
            for key in expired_keys:
                self._remove_cache_entry(key)
            
            # Remove oldest entries if cache is too large
            total_entries = len(self.cache_timestamps)
            if total_entries > self.max_cache_size:
                # Sort by access count and timestamp
                sorted_keys = sorted(
                    self.cache_timestamps.keys(),
                    key=lambda k: (self.cache_access_count[k], self.cache_timestamps[k])
                )
                
                # Remove least accessed entries
                entries_to_remove = total_entries - self.max_cache_size
                for key in sorted_keys[:entries_to_remove]:
                    self._remove_cache_entry(key)
            
            if expired_keys or total_entries > self.max_cache_size:
                logger.info(f"🚀 CACHE CLEANUP: Removed {len(expired_keys)} expired entries, cache size: {len(self.cache_timestamps)}")
                
        except Exception as e:
            logger.error(f"🚀 CACHE: Error during cleanup: {str(e)}")
    
    def _remove_cache_entry(self, key: str) -> None:
        """Remove a cache entry from all caches"""
        try:
            # Remove from all cache types
            self.detection_cache.pop(key, None)
            self.analysis_cache.pop(key, None)
            self.timing_cache.pop(key, None)
            
            # Remove metadata
            self.cache_timestamps.pop(key, None)
            self.cache_access_count.pop(key, None)
            
        except Exception as e:
            logger.error(f"🚀 CACHE: Error removing cache entry {key}: {str(e)}")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache performance statistics"""
        try:
            with self.cache_lock:
                total_requests = self.cache_hits + self.cache_misses
                hit_rate = (self.cache_hits / total_requests * 100) if total_requests > 0 else 0
                
                return {
                    'cache_hits': self.cache_hits,
                    'cache_misses': self.cache_misses,
                    'hit_rate_percent': round(hit_rate, 2),
                    'total_entries': len(self.cache_timestamps),
                    'detection_cache_size': len(self.detection_cache),
                    'analysis_cache_size': len(self.analysis_cache),
                    'timing_cache_size': len(self.timing_cache),
                    'cache_duration_seconds': self.cache_duration,
                    'max_cache_size': self.max_cache_size
                }
        except Exception as e:
            logger.error(f"🚀 CACHE: Error getting stats: {str(e)}")
            return {'error': str(e)}
    
    def clear_cache(self) -> None:
        """Clear all cache entries"""
        try:
            with self.cache_lock:
                self.detection_cache.clear()
                self.analysis_cache.clear()
                self.timing_cache.clear()
                self.cache_timestamps.clear()
                self.cache_access_count.clear()
                
                self.cache_hits = 0
                self.cache_misses = 0
                
                logger.info("🚀 CACHE: All cache entries cleared")
                
        except Exception as e:
            logger.error(f"🚀 CACHE: Error clearing cache: {str(e)}")
    
    def invalidate_image_cache(self, image: np.ndarray) -> None:
        """Invalidate cache entries for a specific image"""
        try:
            image_hash = self.get_image_hash(image)
            
            with self.cache_lock:
                keys_to_remove = []
                for key in self.cache_timestamps.keys():
                    if image_hash in key:
                        keys_to_remove.append(key)
                
                for key in keys_to_remove:
                    self._remove_cache_entry(key)
                
                if keys_to_remove:
                    logger.info(f"🚀 CACHE: Invalidated {len(keys_to_remove)} entries for image")
                    
        except Exception as e:
            logger.error(f"🚀 CACHE: Error invalidating image cache: {str(e)}")

# Global cache instance
fast_cache = FastAnalysisCache(cache_duration_seconds=30, max_cache_size=100)

def get_fast_cache() -> FastAnalysisCache:
    """Get the global fast cache instance"""
    return fast_cache
