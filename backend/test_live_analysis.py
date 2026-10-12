#!/usr/bin/env python3
"""
Test script for YOLO11x Live Analysis
Debug the area data format issue
"""

import requests
import json
import base64
from pathlib import Path

def test_live_analysis():
    """Test the live analysis endpoint with sample data"""
    
    # Sample area data (4 points forming a rectangle)
    sample_area = {
        "laneId": 1,
        "points": [
            {"x": 100, "y": 100},
            {"x": 300, "y": 100},
            {"x": 300, "y": 200},
            {"x": 100, "y": 200}
        ],
        "isComplete": True
    }
    
    # Create a simple test image (1x1 pixel PNG in base64)
    test_image_b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    
    # Sample lanes data
    lanes_data = [
        {
            "id": 1,
            "name": "Lane 1",
            "image": test_image_b64,
            "area": sample_area
        },
        {
            "id": 2,
            "name": "Lane 2", 
            "image": test_image_b64,
            "area": sample_area
        }
    ]
    
    # Test data
    test_data = {
        "lanes": lanes_data,
        "config": {
            "min_time": 5,
            "max_time": 35,
            "loop_interval": 2.0,
            "detection_threshold": 0.5
        }
    }
    
    print("Testing live analysis endpoint...")
    print(f"Sending data for {len(lanes_data)} lanes")
    print(f"Sample area format: {json.dumps(sample_area, indent=2)}")
    
    try:
        # Test the endpoint
        response = requests.post(
            "http://localhost:8000/api/start-live-analysis",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"\nResponse status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Live analysis started successfully!")
        else:
            print("❌ Failed to start live analysis")
            
    except Exception as e:
        print(f"❌ Error testing endpoint: {str(e)}")

def test_area_format():
    """Test area format extraction"""
    
    # Test area data
    area_data = {
        "laneId": 1,
        "points": [
            {"x": 100, "y": 100},
            {"x": 300, "y": 100},
            {"x": 300, "y": 200},
            {"x": 100, "y": 200}
        ],
        "isComplete": True
    }
    
    print("\nTesting area format extraction...")
    print(f"Input area: {area_data}")
    
    # Extract points like in the backend
    area_points = []
    if area_data and 'points' in area_data:
        area_points = [(int(point['x']), int(point['y'])) for point in area_data['points']]
    
    print(f"Extracted points: {area_points}")
    print(f"Points type: {type(area_points)}")
    print(f"First point type: {type(area_points[0]) if area_points else 'None'}")

if __name__ == "__main__":
    print("🚀 YOLO11x Live Analysis Test")
    print("=" * 40)
    
    # Test area format first
    test_area_format()
    
    # Test the endpoint
    test_live_analysis()
    
    print("\n" + "=" * 40)
    print("Test completed!")
