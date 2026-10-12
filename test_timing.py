#!/usr/bin/env python3
"""
Test script to verify timing calculations
"""

def test_timing_calculation():
    # Vehicle weights (from user's specification)
    vehicle_weights = {
        'car': 1.0,
        'motorbike': 0.8,
        'motorcycle': 0.8,
        'three_wheelers': 1.5,
        'pickup': 2.0,
        'auto_rickshaw': 1.5,
        'minivan': 2.0,
        'bus': 2.0,
        'bicycle': 1.6,
        'truck': 2.5,
        'van': 1.1,
        'ambulance': 1.1,
        'person': 0.5
    }
    
    base_time_multiplier = 3  # 3 seconds per weight unit
    min_time = 5   # Fixed minimum: 5 seconds
    max_time = 35  # Fixed maximum: 35 seconds
    
    # Test scenarios
    test_cases = [
        {"name": "Empty lane", "vehicles": {}, "expected_min": 5},
        {"name": "5 cars", "vehicles": {"car": 5}, "expected": 15},
        {"name": "3 cars + 1 truck", "vehicles": {"car": 3, "truck": 1}, "expected": 16.5},
        {"name": "2 buses + 4 cars", "vehicles": {"bus": 2, "car": 4}, "expected": 24},
        {"name": "8 motorbikes", "vehicles": {"motorcycle": 8}, "expected": 19.2},
        {"name": "Heavy traffic", "vehicles": {"car": 10, "truck": 3, "bus": 2}, "expected": 44.5}
    ]
    
    print("🧮 Timing Calculation Test")
    print("=" * 50)
    
    for test in test_cases:
        vehicle_types = test["vehicles"]
        
        # Calculate total weight
        total_weight = 0
        weight_breakdown = {}
        
        for vehicle_type, count in vehicle_types.items():
            weight_key = vehicle_type.lower()
            if weight_key == 'motorbike':
                weight_key = 'motorcycle'
            elif weight_key in ['auto', 'rickshaw']:
                weight_key = 'auto_rickshaw'
            
            vehicle_weight = vehicle_weights.get(weight_key, 1.0)
            vehicle_total_weight = count * vehicle_weight
            total_weight += vehicle_total_weight
            
            weight_breakdown[vehicle_type] = {
                'count': count,
                'weight_per_vehicle': vehicle_weight,
                'total_weight': vehicle_total_weight
            }
        
        # Calculate time
        raw_time = total_weight * base_time_multiplier
        calculated_time = max(min_time, min(int(raw_time), max_time))
        
        print(f"\n📊 {test['name']}:")
        print(f"   Vehicles: {vehicle_types}")
        print(f"   Total Weight: {total_weight:.1f}")
        print(f"   Raw Calculation: {total_weight:.1f} × {base_time_multiplier} = {raw_time:.1f}s")
        print(f"   Final Time: {calculated_time}s (constrained to {min_time}-{max_time}s)")
        
        if "expected" in test:
            expected = test["expected"]
            expected_final = max(min_time, min(int(expected), max_time))
            status = "✅" if calculated_time == expected_final else "❌"
            print(f"   Expected: {expected}s → {expected_final}s {status}")
        elif "expected_min" in test:
            expected = test["expected_min"]
            status = "✅" if calculated_time == expected else "❌"
            print(f"   Expected Min: {expected}s {status}")

if __name__ == "__main__":
    test_timing_calculation()
