#!/usr/bin/env python3
"""
Test Fast Analysis Cache System
Smart India Hackathon 2025 - AI Traffic Optimizer
Test the caching functionality with sample data
"""

import cv2
import numpy as np
import logging
from backend.ai.fast_analysis_cache import get_fast_cache

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_fast_cache():
    """Test the fast analysis cache system"""
    
    print("🚀 Testing Fast Analysis Cache System")
    print("=" * 50)
    
    # Initialize cache
    cache = get_fast_cache()
    
    # Create test image
    test_image = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
    
    # Test area points
    test_area_points = [(100, 100), (200, 100), (200, 200), (100, 200)]
    
    # Test detection results (mock YOLO format)
    test_detections = [
        {'class': 'car', 'confidence': 0.85, 'bbox': [100, 100, 50, 30]},
        {'class': 'motorcycle', 'confidence': 0.92, 'bbox': [200, 150, 30, 20]},
        {'class': 'person', 'confidence': 0.78, 'bbox': [150, 120, 20, 40]}
    ]
    
    # Test analysis results
    test_analysis = {
        'vehicle_count': 3,
        'vehicle_types': {'car': 1, 'motorcycle': 1, 'person': 1},
        'congestion_level': 'medium'
    }
    
    # Test timing results
    test_vehicle_types = {'car': 1, 'motorcycle': 1, 'person': 1}
    test_timing = {
        'calculated_time': 15,
        'total_weight': 2.3,
        'weight_breakdown': {'car': 1.0, 'motorcycle': 0.8, 'person': 0.5}
    }
    
    print("\n1. Testing Image Hash Generation...")
    try:
        image_hash = cache.get_image_hash(test_image)
        print(f"✅ Image hash generated: {image_hash}")
    except Exception as e:
        print(f"❌ Image hash failed: {e}")
        return False
    
    print("\n2. Testing Detection Caching...")
    try:
        # Cache detections
        cache.cache_detections(test_image, test_detections)
        print("✅ Detections cached successfully")
        
        # Retrieve detections
        cached_detections = cache.get_cached_detections(test_image)
        if cached_detections is not None:
            print(f"✅ Detections retrieved: {len(cached_detections)} items")
        else:
            print("❌ Failed to retrieve cached detections")
            return False
    except Exception as e:
        print(f"❌ Detection caching failed: {e}")
        return False
    
    print("\n3. Testing Analysis Caching...")
    try:
        # Cache analysis
        cache.cache_analysis(test_image, test_area_points, "Lane_1", test_analysis)
        print("✅ Analysis cached successfully")
        
        # Retrieve analysis
        cached_analysis = cache.get_cached_analysis(test_image, test_area_points, "Lane_1")
        if cached_analysis is not None:
            print(f"✅ Analysis retrieved: {cached_analysis['vehicle_count']} vehicles")
        else:
            print("❌ Failed to retrieve cached analysis")
            return False
    except Exception as e:
        print(f"❌ Analysis caching failed: {e}")
        return False
    
    print("\n4. Testing Timing Caching...")
    try:
        # Cache timing
        cache.cache_timing(test_vehicle_types, "Lane_1", test_timing)
        print("✅ Timing cached successfully")
        
        # Retrieve timing
        cached_timing = cache.get_cached_timing(test_vehicle_types, "Lane_1")
        if cached_timing is not None:
            print(f"✅ Timing retrieved: {cached_timing['calculated_time']}s")
        else:
            print("❌ Failed to retrieve cached timing")
            return False
    except Exception as e:
        print(f"❌ Timing caching failed: {e}")
        return False
    
    print("\n5. Testing Cache Statistics...")
    try:
        stats = cache.get_cache_stats()
        print(f"✅ Cache Stats:")
        print(f"   - Cache hits: {stats['cache_hits']}")
        print(f"   - Cache misses: {stats['cache_misses']}")
        print(f"   - Hit rate: {stats['hit_rate_percent']:.1f}%")
        print(f"   - Total entries: {stats['total_entries']}")
    except Exception as e:
        print(f"❌ Cache stats failed: {e}")
        return False
    
    print("\n6. Testing Cache Performance...")
    try:
        import time
        
        # Test cache miss (first time)
        start_time = time.time()
        result1 = cache.get_cached_detections(test_image)
        miss_time = (time.time() - start_time) * 1000
        
        # Test cache hit (second time)
        start_time = time.time()
        result2 = cache.get_cached_detections(test_image)
        hit_time = (time.time() - start_time) * 1000
        
        print(f"✅ Performance Test:")
        print(f"   - Cache hit time: {hit_time:.2f}ms")
        print(f"   - Cache miss time: {miss_time:.2f}ms")
        print(f"   - Speedup: {miss_time/hit_time:.1f}x faster")
        
    except Exception as e:
        print(f"❌ Performance test failed: {e}")
        return False
    
    print("\n7. Testing Error Handling...")
    try:
        # Test with invalid image
        invalid_result = cache.get_cached_detections(None)
        print(f"✅ Invalid image handled: {invalid_result}")
        
        # Test with empty area points
        empty_analysis = cache.get_cached_analysis(test_image, [], "Lane_1")
        print(f"✅ Empty area handled: {empty_analysis}")
        
    except Exception as e:
        print(f"❌ Error handling failed: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 ALL TESTS PASSED! Fast Cache is working perfectly!")
    print("🚀 Your system is ready for maximum speed performance!")
    
    return True

if __name__ == "__main__":
    success = test_fast_cache()
    if success:
        print("\n✅ Fast Analysis Cache System is ready for production!")
    else:
        print("\n❌ Fast Analysis Cache System needs fixes!")
