# 🚦 Smart AI Traffic Management & Adaptive Signal Control System

An intelligent, real-time traffic monitoring and adaptive traffic signal control system powered by **YOLOv8 computer vision**, **FastAPI**, and **React + Vite**. The system dynamically detects vehicles across multi-lane intersections and live CCTV streams, computes Passenger Car Unit (PCU) congestion weights, and allocates optimal green signal timings in real time using Webster's traffic flow formula.

---

## 🌟 Key Features

- **⚡ Ultra-Fast YOLOv8 Object Detection**: Sub-`60ms` CPU inference speed supporting `15–20+ FPS` real-time video detection and live CCTV camera streaming.
- **🎯 Multi-Vehicle Classification**: Detects and tracks Cars, Motorcycles, Buses, Trucks, Auto-Rickshaws, Bicycles, and Pedestrians.
- **⏱️ Adaptive Signal Timing Engine**: Automatically computes dynamic green signal duration based on actual real-time vehicle density and PCU weights.
- **📹 Live CCTV & Video Analytics**:
  - Upload custom traffic videos (`.mp4`) for automated frame-by-frame detection.
  - Stream live CCTV footage simulation or physical webcams with real-time bounding boxes and crosshair tracking.
  - Letterbox-accurate canvas overlay matching exact aspect ratios.
- **🚥 4-Lane Synchronized Intersection Management**:
  - Manages 4 independent lanes with sequential or density-prioritized green signal cycles.
  - Emergency vehicle detection with instant green signal override.
- **📊 Real-Time Telemetry & HUD**: Direct canvas HUD displaying vehicle count, latency in milliseconds, congestion rating, and recommended green signal duration.

---

## 🏗️ Architecture & Technology Stack

```
┌────────────────────────────────────────────────────────┐
│                   React + Vite (Frontend)              │
│       Tailwind CSS • TypeScript • HTML5 Canvas API     │
└───────────────────────────▲────────────────────────────┘
                            │  HTTP REST / WebSockets
                            ▼
┌────────────────────────────────────────────────────────┐
│                   FastAPI (Backend)                    │
│      Python 3.11+ • Uvicorn • NumPy • OpenCV           │
└───────────────────────────▲────────────────────────────┘
                            │  Inference
                            ▼
┌────────────────────────────────────────────────────────┐
│             Ultralytics YOLOv8 Engine                  │
│       YOLOv8n / YOLOv8s • COCO Traffic Classes         │
└───────────────────────────┘
```

### Frontend
- **Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Vanilla CSS
- **Icons**: Lucide React
- **Graphics**: Hardware-accelerated HTML5 Canvas 2D API

### Backend
- **Framework**: FastAPI (Asynchronous Python REST & WebSocket Server)
- **ASGI Server**: Uvicorn
- **Computer Vision**: OpenCV (`cv2`), Ultralytics YOLOv8 (`yolov8n.pt`, `yolov8s.pt`), PyTorch
- **Data Processing**: NumPy, Pillow

---

## 📐 PCU Weights & Adaptive Timing Formula

The system assigns traffic weights to each vehicle category based on **Passenger Car Units (PCU)**:

| Vehicle Type | PCU Weight | Description |
| :--- | :---: | :--- |
| **Car** | `1.0` | Standard passenger vehicle |
| **Motorcycle / Scooter** | `0.8` | Two-wheeler |
| **Bicycle** | `1.6` | Slow-moving narrow vehicle |
| **Auto-Rickshaw / 3-Wheeler** | `1.5` | Commercial three-wheeler |
| **Bus** | `2.2` | Heavy passenger transport |
| **Truck** | `2.5` | Heavy commercial goods vehicle |
| **Pedestrian** | `0.5` | Road crossing pedestrian |

### Green Signal Calculation Formula
$$\text{Total PCU} = \sum (\text{Count}_i \times \text{Weight}_i)$$

$$\text{Allocated Green Time (seconds)} = \text{clamp}\left(10, \ 65, \ \text{round}\left(4.0 + (\text{Total PCU} \times 1.8)\right)\right)$$

- **Minimum Green Time**: `10 seconds` (prevents starvation)
- **Maximum Green Time**: `65 seconds` (prevents excessive cross-traffic delays)
- **Congestion Thresholds**:
  - `0–7 vehicles`: Low Congestion (10–20s green)
  - `8–15 vehicles`: Medium Congestion (21–35s green)
  - `16–24 vehicles`: High Congestion (36–50s green)
  - `25+ vehicles`: Critical Congestion (51–65s green)

---

## ⚡ Performance Optimization

The detection engine has been specifically optimized for real-time responsiveness on standard CPU hardware:

| Metric | Before Optimization | After Optimization | Improvement |
| :--- | :---: | :---: | :---: |
| **Model Inference Latency** | `~1,499.9 ms` | **`50.6 – 65.3 ms`** | **~25x Faster** ⚡ |
| **Total Roundtrip Latency** | `~2,100 ms` | **`63.8 – 72.5 ms`** | **~30x Faster** ⚡ |
| **Live Stream Throughput** | `< 1 FPS` | **`15 – 18 FPS`** | **Smooth Real-Time** |

- **Traffic-Class Filtering**: Passes `classes=[0, 1, 2, 3, 5, 7]` directly to YOLO, skipping anchor and NMS evaluations across non-traffic COCO classes.
- **Resolution Scaling**: Downscales frame capture to `480px` (`imgsz=416`), reducing payload size by ~75% without compromising detection accuracy.
- **Low-Latency Loopback**: Connects directly via `127.0.0.1` instead of `localhost`, eliminating Windows IPv6 socket lookup delays.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **Git**

---

### 1. Clone the Repository
```bash
git clone https://github.com/Revanthgowda45/trafic.git
cd trafic
```

---

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Windows (CMD):
.\venv\Scripts\activate.bat
# On Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
python main.py
```
The backend API server will start at: **`http://127.0.0.1:8000`**  
API documentation is available at: **`http://127.0.0.1:8000/docs`**

---

### 3. Frontend Setup
Open a new terminal window at the project root:
```bash
# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```
The web dashboard will be available at: **`http://localhost:5173`**

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check endpoint |
| `POST` | `/api/detect-frame` | Real-time single frame YOLO detection & signal timing calculation |
| `POST` | `/api/upload-video` | Upload video file for batch processing |
| `GET` | `/api/stats` | System metrics, active connections, and uptime |
| `GET` | `/api/cache/stats` | Detection cache performance statistics |
| `WS` | `/ws/live-detection` | Real-time WebSocket stream for high-speed lane detections |

---

## 📁 Project Structure

```
trafic/
├── backend/
│   ├── ai/
│   │   ├── yolo_detector.py           # High-speed YOLOv8 detection engine
│   │   ├── enhanced_traffic_analyzer.py # PCU & timing calculations
│   │   ├── video_detector.py          # Video batch processing
│   │   └── websocket_manager.py       # Live WebSocket broadcaster
│   ├── config/
│   │   └── settings.py                # Environment configurations
│   ├── main.py                        # FastAPI application entrypoint
│   └── requirements.txt               # Python package dependencies
├── src/
│   ├── components/
│   │   ├── AI/
│   │   │   ├── VideoDetection.tsx     # Live stream & video playback UI
│   │   │   ├── FourLaneAnalyzer.tsx   # 4-Lane intersection simulator
│   │   │   └── DetectionCanvas.tsx    # HTML5 Canvas bounding box renderer
│   │   ├── Dashboard/                 # Metrics & charts
│   │   └── Layout/                    # Header & Sidebar
│   ├── services/                      # API & WebSocket client services
│   ├── App.tsx                        # Root React application
│   └── main.tsx                       # React DOM entrypoint
├── package.json                       # Frontend dependencies & scripts
├── vite.config.ts                     # Vite build configuration
├── .gitignore                         # Git exclusion rules
└── README.md                          # Master documentation
```

---

## 🛡️ License

This project is licensed under the MIT License.
