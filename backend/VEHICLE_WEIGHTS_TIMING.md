# 🚦 Vehicle Weight-Based Timer System

## Vehicle Weights Configuration

Based on your provided weights, the system uses the following vehicle weight factors:

```python
WEIGHTS = {
    "car": 1.0,
    "motorcycle": 0.8,
    "three_wheelers": 1.5,  # CNG auto rickshaw
    "pickup": 2.0,
    "auto_rickshaw": 1.5,
    "minivan": 2.0,
    "bus": 2.0,
    "bicycle": 1.6,
    "truck": 2.5,
    "van": 1.1,
    "ambulance": 1.1,
    "person": 0.5  # pedestrian
}
```

## Timer Calculation Formula

### Basic Formula:
```
Timer = Total Weight × Base Multiplier
Base Multiplier = 3 seconds per weight unit
```

### Constraints:
- **Minimum Time**: 5 seconds
- **Maximum Time**: 35 seconds

## Example Calculations

### Example 1: Mixed Traffic
**Vehicles Detected:**
- 3 Cars (3 × 1.0 = 3.0)
- 2 Motorcycles (2 × 0.8 = 1.6)
- 1 Bus (1 × 2.0 = 2.0)
- 1 Truck (1 × 2.5 = 2.5)

**Calculation:**
```
Total Weight = 3.0 + 1.6 + 2.0 + 2.5 = 9.1
Timer = 9.1 × 3 = 27.3 seconds → 27 seconds
```

### Example 2: Light Traffic
**Vehicles Detected:**
- 1 Car (1 × 1.0 = 1.0)
- 1 Motorcycle (1 × 0.8 = 0.8)

**Calculation:**
```
Total Weight = 1.0 + 0.8 = 1.8
Timer = 1.8 × 3 = 5.4 seconds → 5 seconds (minimum)
```

### Example 3: Heavy Traffic
**Vehicles Detected:**
- 5 Cars (5 × 1.0 = 5.0)
- 3 Buses (3 × 2.0 = 6.0)
- 2 Trucks (2 × 2.5 = 5.0)

**Calculation:**
```
Total Weight = 5.0 + 6.0 + 5.0 = 16.0
Timer = 16.0 × 3 = 48 seconds → 35 seconds (maximum)
```

## Weight Breakdown Response

The system provides detailed breakdown in WebSocket responses:

```json
{
  "weight_breakdown": {
    "car": {
      "count": 3,
      "weight_per_vehicle": 1.0,
      "total_weight": 3.0,
      "time_contribution": 9.0
    },
    "bus": {
      "count": 1,
      "weight_per_vehicle": 2.0,
      "total_weight": 2.0,
      "time_contribution": 6.0
    }
  },
  "total_weight": 5.0,
  "time_calculation": "5.0 weight × 3s = 15s"
}
```

## Vehicle Type Mapping

The system maps YOLOv8 detected classes to weight categories:

| YOLOv8 Detection | Weight Category | Weight Value |
|------------------|-----------------|--------------|
| car | car | 1.0 |
| motorbike | motorcycle | 0.8 |
| bus | bus | 2.0 |
| truck | truck | 2.5 |
| bicycle | bicycle | 1.6 |
| person | person | 0.5 |

## Benefits of Weight-Based System

1. **🚛 Heavy Vehicle Priority**: Trucks and buses get more time
2. **🏍️ Light Vehicle Efficiency**: Motorcycles get less time
3. **⚖️ Fair Distribution**: Time proportional to traffic load
4. **🎯 Realistic Timing**: Based on actual vehicle clearing time
5. **📊 Transparent Calculation**: Clear weight breakdown shown

## Real-Time Updates

The system continuously:
1. **Detects vehicles** using YOLOv8
2. **Calculates weights** for each vehicle type
3. **Computes timer** using weight formula
4. **Updates frontend** with breakdown details
5. **Switches lanes** when timer expires

This creates a **smart, fair, and efficient** traffic management system! 🚦✨
