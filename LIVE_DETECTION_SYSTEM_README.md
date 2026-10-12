# 🚀 Live Traffic Detection System
## Smart India Hackathon 2025 - AI Traffic Optimizer

A comprehensive real-time traffic monitoring system with advanced YOLOv8 detection, live video streaming, and interactive area selection.

## 🌟 Features

### 🤖 Advanced AI Detection
- **YOLOv8 Integration**: State-of-the-art object detection
- **Multi-Class Detection**: Cars, motorcycles, buses, trucks, bicycles, pedestrians
- **Real-Time Processing**: Optimized for live video streams
- **Vehicle Tracking**: Advanced tracking with speed and direction analysis
- **Area-Based Analysis**: Custom detection zones with congestion monitoring

### 📹 Live Video Processing
- **Multiple Video Sources**: Webcam, IP cameras, RTSP streams
- **Real-Time Streaming**: WebSocket-based live video transmission
- **Frame Buffering**: Optimized processing with multi-threading
- **Performance Monitoring**: FPS tracking and processing metrics

### 🎯 Interactive Area Selection
- **Canvas Drawing**: Interactive polygon drawing for detection areas
- **Multi-Lane Support**: Define multiple traffic lanes simultaneously
- **Real-Time Visualization**: Live detection results overlay
- **Dynamic Configuration**: Add/remove areas during operation

### 📊 Live Statistics Dashboard
- **Vehicle Counting**: Real-time counts by vehicle type
- **Performance Metrics**: FPS, processing time, queue status
- **Congestion Analysis**: Traffic density assessment per area
- **Historical Data**: Tracking and trend analysis

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend        │    │   AI Engine     │
│                 │    │                  │    │                 │
│ TrafficArea     │◄──►│ Express.js       │◄──►│ YOLOv8 Detector │
│ Selector        │    │ Socket.IO        │    │ Real-time       │
│ Component       │    │ WebSocket        │    │ Processor       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ React UI        │    │ Stream Manager   │    │ Video Stream    │
│ - Live Display  │    │ - Multi-source   │    │ Processing      │
│ - Area Drawing  │    │ - WebSocket API  │    │ - Frame Buffer  │
│ - Statistics    │    │ - File Upload    │    │ - Multi-thread  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
backend/
├── ai/
│   ├── advanced_yolo_detector.py      # Core YOLOv8 detection engine
│   ├── live_stream_processor.py       # Video stream processing
│   ├── live_detection_api.py          # Flask-SocketIO API server
│   ├── real_time_detector.py          # Optimized real-time processing
│   ├── start_live_system.py           # System startup script
│   └── requirements.txt               # Python dependencies
├── server.js                          # Main Express.js server
└── package.json                       # Node.js dependencies

src/
└── components/
    └── AI/
        └── TrafficAreaSelector.tsx    # React component for live detection
```

## 🚀 Quick Start

### 1. Install Dependencies

**Backend Python Dependencies:**
```bash
cd backend/ai
pip install -r requirements.txt
```

**Backend Node.js Dependencies:**
```bash
cd backend
npm install
```

**Frontend Dependencies:**
```bash
npm install socket.io-client
```

### 2. Start the System

**Option A: Automated Startup (Recommended)**
```bash
cd backend/ai
python start_live_system.py
```

**Option B: Manual Startup**
```bash
# Terminal 1: Start AI API
cd backend/ai
python live_detection_api.py

# Terminal 2: Start Main Backend
cd backend
npm run dev

# Terminal 3: Start Frontend
npm run dev
```

### 3. Access the Application

1. Open your browser to `http://localhost:5173`
2. Navigate to "Traffic Area Selector"
3. Click "Start Live" to begin webcam detection
4. Draw detection areas on the video
5. Monitor real-time vehicle counts

## 🔧 Configuration

### Detection Settings
- **Confidence Threshold**: Minimum detection confidence (0.1-1.0)
- **IoU Threshold**: Non-maximum suppression threshold
- **Detection Interval**: Process every N frames for performance
- **Video Quality**: JPEG compression quality for streaming

### Video Sources
- **Webcam**: Built-in or USB camera (source: 0, 1, 2, ...)
- **IP Camera**: HTTP stream URL
- **RTSP Stream**: RTSP protocol URL
- **Video File**: Local video file path

### Area Configuration
- **Multiple Areas**: Define up to 8 detection zones
- **Custom Names**: Label each area (Lane 1, Lane 2, etc.)
- **Color Coding**: Visual distinction between areas
- **Active/Inactive**: Toggle areas on/off during operation

## 📡 API Endpoints

### REST API
```
GET  /health                           # System health check
GET  /api/system/info                  # System information
POST /api/analyze/image                # Analyze uploaded image
POST /api/streams/create               # Create new video stream
POST /api/streams/:id/start            # Start stream processing
POST /api/streams/:id/stop             # Stop stream processing
GET  /api/streams/list                 # List all streams
POST /api/areas/add                    # Add detection area
DELETE /api/areas/:id                  # Remove detection area
```

### WebSocket Events
```
connection_established                 # Client connected
subscribe_stream                       # Subscribe to stream updates
unsubscribe_stream                     # Unsubscribe from stream
detection_update                       # Real-time detection results
stream_started                         # Stream started notification
stream_stopped                         # Stream stopped notification
detection_area_added                   # New area added
system_stats                           # System statistics
```

## 🎯 Vehicle Detection Classes

| Class ID | Vehicle Type | Color Code | Description |
|----------|--------------|------------|-------------|
| 0 | Person | Yellow | Pedestrians |
| 1 | Bicycle | Magenta | Bicycles |
| 2 | Car | Green | Passenger cars |
| 3 | Motorcycle | Blue | Motorcycles, scooters |
| 5 | Bus | Red | Buses, large vehicles |
| 7 | Truck | Cyan | Trucks, commercial vehicles |

## 📊 Performance Metrics

### Real-Time Statistics
- **FPS**: Frames processed per second
- **Processing Time**: Average detection time per frame
- **Queue Status**: Input/output buffer utilization
- **Vehicle Counts**: Live counts by vehicle type
- **Congestion Level**: Traffic density assessment

### System Monitoring
- **Memory Usage**: RAM consumption tracking
- **CPU Utilization**: Processing load monitoring
- **Network Traffic**: WebSocket data transmission
- **Error Rates**: Failed detections and dropped frames

## 🔍 Troubleshooting

### Common Issues

**1. Camera Not Detected**
```bash
# Check available cameras
python -c "import cv2; print([i for i in range(10) if cv2.VideoCapture(i).isOpened()])"
```

**2. Low FPS Performance**
- Reduce video resolution
- Increase detection interval
- Lower JPEG quality
- Use GPU acceleration (CUDA)

**3. WebSocket Connection Failed**
- Check firewall settings
- Verify port availability (3001, 5001)
- Ensure backend services are running

**4. Detection Accuracy Issues**
- Adjust confidence threshold
- Improve lighting conditions
- Use higher resolution video
- Retrain model for specific scenarios

### Performance Optimization

**GPU Acceleration:**
```bash
# Install CUDA-enabled PyTorch
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

**Memory Optimization:**
- Reduce frame buffer sizes
- Lower video resolution
- Limit concurrent streams
- Use frame skipping for high FPS sources

## 🧪 Testing

### Unit Tests
```bash
cd backend/ai
python -m pytest tests/
```

### Integration Tests
```bash
# Test API endpoints
curl http://localhost:5001/health

# Test WebSocket connection
node test_websocket.js
```

### Performance Tests
```bash
# Benchmark detection speed
python benchmark_detection.py

# Load test with multiple streams
python load_test_streams.py
```

## 🚀 Deployment

### Production Setup
1. **Environment Variables:**
   ```bash
   export NODE_ENV=production
   export AI_MODEL_PATH=/path/to/yolov8n.pt
   export MAX_WORKERS=4
   ```

2. **Process Management:**
   ```bash
   # Using PM2
   pm2 start backend/server.js --name traffic-backend
   pm2 start backend/ai/live_detection_api.py --name traffic-ai
   ```

3. **Reverse Proxy (Nginx):**
   ```nginx
   location /api/ {
       proxy_pass http://localhost:3001;
   }
   
   location /socket.io/ {
       proxy_pass http://localhost:3001;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
   }
   ```

### Docker Deployment
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY backend/ai/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
CMD ["python", "ai/start_live_system.py"]
```

## 📈 Scaling

### Horizontal Scaling
- **Load Balancer**: Distribute streams across multiple instances
- **Redis**: Shared session storage for WebSocket connections
- **Message Queue**: Decouple detection processing

### Vertical Scaling
- **GPU Clusters**: Multiple GPU cards for parallel processing
- **High-Memory Systems**: Larger frame buffers and caching
- **NVMe Storage**: Fast model loading and video caching

## 🔒 Security

### Authentication
- JWT tokens for API access
- WebSocket authentication
- Rate limiting for API endpoints

### Data Privacy
- No video storage by default
- Configurable data retention
- GDPR compliance options

## 📝 License

This project is part of the Smart India Hackathon 2025 submission.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

For technical support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the troubleshooting guide

---

## 🎉 Demo Instructions

### For SIH 2025 Demo:

1. **Start the system:**
   ```bash
   cd backend/ai
   python start_live_system.py
   ```

2. **Open frontend:**
   - Navigate to Traffic Area Selector
   - Click "Start Live" for webcam detection

3. **Draw detection areas:**
   - Click "Draw Area"
   - Click to create polygon points
   - Click "Finish Area" to complete

4. **Monitor results:**
   - Watch real-time vehicle detection
   - View live statistics
   - Observe area-based analysis

5. **Demonstrate features:**
   - Multiple vehicle types detection
   - Real-time counting
   - Performance metrics
   - Interactive area management

**Expected Results:**
- Real-time vehicle detection with bounding boxes
- Live vehicle counts by type
- Area-based traffic analysis
- Performance metrics (FPS, processing time)
- Interactive area selection and management

---

🚀 **Ready for Smart India Hackathon 2025 Demo!** 🚀
