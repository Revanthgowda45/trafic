# ⏱️ Exact Timing System Configuration

## Vehicle Weights & Timing Constraints

Based on your specifications, the system now uses **exact timing configuration** for perfect traffic management.

## Vehicle Weights (From Your Image)

### 🚗 **Exact Weight Configuration:**
```python
WEIGHTS = {
    "car": 1.0,
    "motorbike": 0.8,
    "three_wheelers -CNG-": 1.5,
    "pickup": 2.0,
    "auto_rickshaw": 1.5,
    "minivan": 2.0,
    "bus": 2.0,
    "bicycle": 1.6,
    "truck": 2.5,
    "van": 1.1,
    "ambulance": 1.1
}
```

### 📊 **Weight Categories:**
- **🚛 Heavy Vehicles**: Truck (2.5), Bus (2.0), Pickup (2.0), Minivan (2.0)
- **🚗 Standard Vehicles**: Car (1.0), Van (1.1), Ambulance (1.1)
- **🛺 Light Vehicles**: Auto Rickshaw (1.5), Three Wheelers (1.5), Bicycle (1.6)
- **🏍️ Two Wheelers**: Motorbike (0.8)

## Timing Configuration (From Your Image)

### ⏱️ **Exact Time Constraints:**
```
Min Time: 5 Seconds
Max Time: 35 Seconds
```

### 🧮 **Calculation Formula:**
```
Timer = Total Vehicle Weight × 3 seconds
Constraints: Min 5s ≤ Timer ≤ Max 35s
```

## Lane Process with Exact Timing

### 🚦 **Step-by-Step Process:**

#### **Step 1: Lane Becomes ACTIVE**
```
Lane X → ACTIVE (GREEN)
Status: "STARTING_DETECTION"
```

#### **Step 2: YOLOv8 Detection**
```
🔍 Detect all vehicles in lane
📊 Count by type: cars, trucks, buses, motorbikes, etc.
⚖️ Apply exact weights from configuration
```

#### **Step 3: Time Calculation**
```
Example Calculations:
- 3 Cars + 1 Truck = (3×1.0 + 1×2.5) × 3 = 16.5s → 17s
- 5 Motorbikes = (5×0.8) × 3 = 12s
- 2 Buses + 4 Cars = (2×2.0 + 4×1.0) × 3 = 24s
- Empty lane = 0 weight → 5s (minimum)
- Heavy traffic = 15+ vehicles → 35s (maximum)
```

#### **Step 4: Timer Starts**
```
⏱️ Countdown from calculated time (5-35 seconds)
🚦 Status: "ANALYZING & TIMING"
📦 Show bounding boxes around detected vehicles
```

#### **Step 5: Timer Completes**
```
✅ Timer reaches 0 seconds
🔄 Status: "COMPLETED"
➡️ Automatically switch to next lane
```

#### **Step 6: Next Lane**
```
🔴 Previous lane → WAITING (RED)
🟢 Next lane → ACTIVE (GREEN)
🔄 Reset detection flag for new lane
```

## Real-World Examples

### 🚗 **Example Lane Scenarios:**

#### **Scenario 1: Light Traffic**
- **Vehicles**: 2 cars, 1 motorbike
- **Calculation**: (2×1.0 + 1×0.8) × 3 = 8.4s → **9 seconds**
- **Result**: Lane active for 9 seconds, then switches

#### **Scenario 2: Mixed Traffic**
- **Vehicles**: 3 cars, 1 bus, 2 motorbikes
- **Calculation**: (3×1.0 + 1×2.0 + 2×0.8) × 3 = 16.8s → **17 seconds**
- **Result**: Lane active for 17 seconds, then switches

#### **Scenario 3: Heavy Traffic**
- **Vehicles**: 5 cars, 2 trucks, 1 bus
- **Calculation**: (5×1.0 + 2×2.5 + 1×2.0) × 3 = 33s → **33 seconds**
- **Result**: Lane active for 33 seconds, then switches

#### **Scenario 4: Very Heavy Traffic**
- **Vehicles**: 10 cars, 3 trucks, 2 buses
- **Calculation**: (10×1.0 + 3×2.5 + 2×2.0) × 3 = 44.5s → **35 seconds** (max)
- **Result**: Lane active for 35 seconds (maximum), then switches

#### **Scenario 5: Empty Lane**
- **Vehicles**: 0 vehicles detected
- **Calculation**: 0 weight → **5 seconds** (minimum)
- **Result**: Lane active for 5 seconds (minimum), then switches

## Backend Implementation

### 🔧 **Exact Configuration:**
```python
# Fixed timing constraints (from user's specification)
min_time = 5   # Fixed minimum: 5 seconds
max_time = 35  # Fixed maximum: 35 seconds
base_time_multiplier = 3  # 3 seconds per weight unit

# Apply constraints
calculated_time = max(min_time, min(calculated_time, max_time))
```

### 📊 **Weight Mapping:**
```python
# Map detected vehicle types to exact weights
for vehicle_type, count in vehicle_types.items():
    weight_key = vehicle_type.lower()
    if weight_key == 'motorbike':
        weight_key = 'motorcycle'  # Map to 0.8
    elif weight_key in ['auto', 'rickshaw']:
        weight_key = 'auto_rickshaw'  # Map to 1.5
    
    vehicle_weight = vehicle_weights.get(weight_key, 1.0)
    total_weight += count * vehicle_weight
```

## Expected Behavior

### 🚀 **Demo Flow:**
1. **Lane 1 ACTIVE**: Detects vehicles → Calculates 5-35s → Timer starts
2. **Timer Completes**: Exactly at calculated time → Switch to Lane 2
3. **Lane 2 ACTIVE**: Fresh detection → New calculation → New timer
4. **Continue**: Same process for Lanes 3, 4, then back to 1

### 📊 **Timing Accuracy:**
- **Minimum**: Always at least 5 seconds (even empty lanes)
- **Maximum**: Never more than 35 seconds (even heavy traffic)
- **Calculation**: Exact weight-based formula
- **Switching**: Automatic when timer completes

## Perfect for SIH 2025! 🇮🇳

### ✅ **Demonstrates:**
- **Exact Weight-Based Timing** from your specifications
- **Professional Traffic Management** with 5-35 second constraints
- **Real-time Vehicle Detection** and accurate counting
- **Intelligent Time Calculation** based on actual traffic
- **Automatic Sequential Control** for all 4 lanes

The system now uses your **exact timing configuration** - Min 5 seconds, Max 35 seconds, with precise vehicle weights for realistic traffic management! 🚦⏱️🎯✅
