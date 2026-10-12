# 🚦 Sequential Traffic Light System

## Overview
Advanced AI-powered traffic management system that operates lanes **one at a time** in sequence, just like real traffic lights.

## How It Works

### 🔄 Sequential Operation
1. **Lane 1** gets GREEN light → Vehicles pass → Timer expires
2. **Lane 2** gets GREEN light → Vehicles pass → Timer expires  
3. **Lane 3** gets GREEN light → Vehicles pass → Timer expires
4. **Lane 4** gets GREEN light → Vehicles pass → Timer expires
5. **Back to Lane 1** → Cycle repeats

### ⏱️ Intelligent Timing System

#### Vehicle-Based Timing:
- **Cars**: 2 seconds each
- **Motorcycles**: 1 second each
- **Buses**: 4 seconds each
- **Trucks**: 5 seconds each
- **Bicycles**: 1 second each
- **Pedestrians**: 0.5 seconds each

#### Example Calculation:
```
Lane has: 5 cars + 2 buses + 1 truck
Time = (5 × 2s) + (2 × 4s) + (1 × 5s) = 10 + 8 + 5 = 23 seconds
```

#### Constraints:
- **Minimum Time**: 5 seconds (even if no vehicles)
- **Maximum Time**: 35 seconds (safety limit)

### 🚦 Traffic Light States

#### GREEN Lane (Active):
- ✅ Vehicles can pass
- ⏰ Timer counts down
- 🟢 Green border in UI
- 📊 Real-time vehicle analysis

#### RED Lanes (Waiting):
- ❌ Vehicles must wait
- ⏸️ Timer shows calculated time
- 🔴 Orange border in UI
- 📈 Continuous monitoring

### 🤖 YOLOv8 Integration

#### Real-Time Analysis:
- **Vehicle Detection**: Cars, buses, trucks, motorcycles, bicycles, pedestrians
- **Area-Based Counting**: Only vehicles in selected polygon areas
- **Live Updates**: Every 1 second
- **Performance**: Optimized YOLOv8s for speed

#### Smart Features:
- **Dynamic Timing**: Adjusts based on actual vehicle count
- **Vehicle Classification**: Different timing for different vehicle types
- **Congestion Detection**: High/Medium/Low traffic levels
- **Real-Time Switching**: Automatic lane transitions

### 📊 System Status

#### WebSocket Updates Include:
```json
{
  "lanes": [
    {
      "lane_id": 1,
      "is_active": true,
      "traffic_light_status": "GREEN",
      "remaining_time": 15,
      "vehicle_count": 8,
      "vehicle_types": {"car": 5, "bus": 2, "truck": 1},
      "vehicle_timing_breakdown": {
        "car": "5 × 2s = 10s",
        "bus": "2 × 4s = 8s", 
        "truck": "1 × 5s = 5s"
      }
    }
  ],
  "system_status": {
    "current_active_lane": 1,
    "traffic_light_system": "sequential"
  }
}
```

### 🎯 Benefits

1. **Realistic Traffic Control**: Mimics real traffic light behavior
2. **Intelligent Timing**: Based on actual vehicle count and types
3. **Fair Distribution**: Each lane gets its turn
4. **Safety**: Minimum/maximum time limits
5. **Efficiency**: No wasted time on empty lanes
6. **Real-Time**: Instant updates and switching

### 🚀 API Endpoints

- `POST /api/start-live-analysis` - Start sequential system
- `POST /api/stop-live-analysis` - Stop sequential system
- `WS /ws/live-detection` - Real-time updates

### 📱 Frontend Features

- **Live Status Display**: Shows which lane is active
- **Timer Countdown**: Real-time remaining time
- **Vehicle Breakdown**: Shows timing calculation
- **Visual Indicators**: Green/Red lane borders
- **Sequential Animation**: Smooth lane transitions

## Perfect for SIH 2025! 🇮🇳

This system demonstrates advanced AI traffic management with:
- ✅ Real traffic light simulation
- ✅ AI-powered vehicle detection  
- ✅ Intelligent timing algorithms
- ✅ Real-time monitoring
- ✅ Professional visualization
