# Smart Traffic Backend - YOLOv8 Detection API

A comprehensive FastAPI backend for real-time traffic detection and analysis using YOLOv8, designed for the Smart Traffic Management System (SIH 2025).

## Features

- **Real-time Traffic Detection**: YOLOv8-powered vehicle detection
- **WebSocket Streaming**: Live video processing and analysis
- **Traffic Area Analysis**: Multi-area traffic monitoring
- **RESTful API**: Complete REST API for traffic management
- **Performance Monitoring**: Real-time statistics and metrics
- **Scalable Architecture**: Modular design for easy expansion

## Quick Start

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Git

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Run the automated setup** (Windows):
   ```bash
   start_backend.bat
   ```

   Or manually:
   ```bash
   python start_backend.py
   ```

3. **Access the API**:
   - API Base URL: http://localhost:8000
   - Interactive Documentation: http://localhost:8000/docs
   - ReDoc Documentation: http://localhost:8000/redoc

## Manual Setup

If you prefer manual setup:

1. **Create virtual environment**:
   ```bash
   python -m venv venv
   ```

2. **Activate virtual environment**:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Copy environment configuration**:
   ```bash
   cp .env.example .env
   ```

5. **Run the server**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## API Endpoints

### Health Check
- `GET /` - Basic health check
- `GET /health` - Detailed system health

### Image Analysis
- `POST /api/upload-image` - Upload and analyze single image
- `POST /api/analyze-areas` - Analyze traffic in specific areas

### Configuration
- `GET /api/config` - Get current configuration
- `POST /api/config` - Update configuration

### Statistics
- `GET /api/stats` - Get system statistics

### WebSocket
- `WS /ws/live-detection` - Real-time detection stream

## Usage Examples

### Upload Image for Analysis

```python
import requests

# Upload image
with open('traffic_image.jpg', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/api/upload-image',
        files={'file': f}
    )
    
result = response.json()
print(f"Detected {result['analysis']['total_vehicles']} vehicles")
```

### Analyze Specific Areas

```python
import requests
import base64

# Read and encode image
with open('traffic_image.jpg', 'rb') as f:
    image_data = base64.b64encode(f.read()).decode()

# Define areas (polygon coordinates)
areas = [
    [[100, 100], [300, 100], [300, 200], [100, 200]],  # Lane 1
    [[350, 100], [550, 100], [550, 200], [350, 200]]   # Lane 2
]

# Analyze areas
response = requests.post(
    'http://localhost:8000/api/analyze-areas',
    json={
        'image': f'data:image/jpeg;base64,{image_data}',
        'areas': areas
    }
)

result = response.json()
for area in result['areas']:
    print(f"{area['area_name']}: {area['total_vehicles']} vehicles")
```

### WebSocket Live Detection

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/live-detection');

ws.onopen = function() {
    // Start detection
    ws.send(JSON.stringify({
        type: 'start_detection',
        config: {
            confidence_threshold: 0.5,
            areas: [/* area definitions */]
        }
    }));
};

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if (data.type === 'detection_results') {
        console.log('Detected vehicles:', data.data.analysis.total_vehicles);
    }
};
```

## Configuration

The backend uses environment variables for configuration. Copy `.env.example` to `.env` and modify as needed:

```env
# YOLO Model Configuration
YOLO_MODEL_PATH=yolov8n.pt
CONFIDENCE_THRESHOLD=0.5
IOU_THRESHOLD=0.4

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True

# Traffic Analysis
CONGESTION_LOW=5
CONGESTION_MEDIUM=15
CONGESTION_HIGH=25
CONGESTION_CRITICAL=40
```

## Architecture

```
backend/
├── main.py                 # FastAPI application entry point
├── start_backend.py        # Automated startup script
├── requirements.txt        # Python dependencies
├── ai/                     # AI and detection modules
│   ├── yolo_detector.py    # YOLOv8 detection engine
│   ├── traffic_analyzer.py # Traffic analysis logic
│   └── websocket_manager.py # WebSocket management
├── config/                 # Configuration management
│   └── settings.py         # Application settings
├── uploads/                # Uploaded files storage
├── static/                 # Static files
└── models/                 # ML model storage
```

## Vehicle Detection Classes

The system detects the following vehicle types:
- Cars
- Motorcycles
- Buses
- Trucks
- Bicycles
- Pedestrians

## Performance

- **Detection Speed**: ~30-60 FPS (depending on hardware)
- **GPU Acceleration**: Automatic CUDA detection
- **Memory Usage**: Optimized for real-time processing
- **Scalability**: Supports multiple concurrent connections

## Troubleshooting

### Common Issues

1. **YOLO Model Not Found**:
   - The system will automatically download YOLOv8n model on first run
   - Ensure internet connection for initial setup

2. **GPU Not Detected**:
   - Install CUDA-compatible PyTorch version
   - Check GPU drivers and CUDA installation

3. **Port Already in Use**:
   - Change `API_PORT` in `.env` file
   - Kill existing processes using port 8000

4. **Memory Issues**:
   - Reduce `MAX_DETECTIONS` in configuration
   - Lower `MAX_FRAME_BUFFER_SIZE`

### Logs

Check logs for detailed error information:
- Console output during runtime
- Log file: `traffic_backend.log`

## Development

### Adding New Features

1. **New Detection Classes**:
   - Modify `VEHICLE_CLASSES` in `settings.py`
   - Update detection logic in `yolo_detector.py`

2. **Custom Analysis**:
   - Extend `TrafficAnalyzer` class
   - Add new metrics and calculations

3. **API Endpoints**:
   - Add routes in `main.py`
   - Follow FastAPI conventions

### Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest tests/
```

## Production Deployment

For production deployment:

1. **Environment Configuration**:
   ```env
   DEBUG=False
   RELOAD=False
   LOG_LEVEL=WARNING
   ```

2. **Security**:
   - Change `SECRET_KEY`
   - Configure proper CORS origins
   - Use HTTPS in production

3. **Performance**:
   - Use production ASGI server (Gunicorn + uvicorn)
   - Configure load balancing
   - Enable caching and monitoring

## Support

For issues and questions:
- Check the troubleshooting section
- Review API documentation at `/docs`
- Check system logs for detailed error information

## License

This project is part of the Smart Traffic Management System for SIH 2025.

---

**Smart Traffic Backend v1.0.0**  
Real-time traffic detection powered by YOLOv8 and FastAPI
