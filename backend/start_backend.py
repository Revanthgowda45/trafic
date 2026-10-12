"""
Smart Traffic Backend Startup Script
Automated startup for the FastAPI backend with YOLOv8
"""

import os
import sys
import subprocess
import logging
from pathlib import Path
import uvicorn
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        logger.error("Python 3.8 or higher is required")
        return False
    logger.info(f"Python version: {sys.version}")
    return True

def check_virtual_environment():
    """Check if virtual environment is activated"""
    venv_path = Path("venv")
    if not venv_path.exists():
        logger.warning("Virtual environment not found. Creating one...")
        return create_virtual_environment()
    
    # Check if we're in the virtual environment
    if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        logger.info("Virtual environment is active")
        return True
    else:
        logger.warning("Virtual environment exists but not activated")
        return activate_virtual_environment()

def create_virtual_environment():
    """Create a new virtual environment"""
    try:
        logger.info("Creating virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", "venv"], check=True)
        logger.info("Virtual environment created successfully")
        return activate_virtual_environment()
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to create virtual environment: {e}")
        return False

def activate_virtual_environment():
    """Activate the virtual environment"""
    try:
        if os.name == 'nt':  # Windows
            activate_script = Path("venv/Scripts/activate.bat")
            python_exe = Path("venv/Scripts/python.exe")
        else:  # Unix/Linux/MacOS
            activate_script = Path("venv/bin/activate")
            python_exe = Path("venv/bin/python")
        
        if not activate_script.exists():
            logger.error("Virtual environment activation script not found")
            return False
        
        if python_exe.exists():
            logger.info("Virtual environment found and ready")
            return True
        else:
            logger.error("Python executable not found in virtual environment")
            return False
            
    except Exception as e:
        logger.error(f"Error activating virtual environment: {e}")
        return False

def install_dependencies():
    """Install required dependencies"""
    try:
        logger.info("Installing dependencies...")
        
        # Use the virtual environment's pip
        if os.name == 'nt':  # Windows
            pip_exe = Path("venv/Scripts/pip.exe")
        else:  # Unix/Linux/MacOS
            pip_exe = Path("venv/bin/pip")
        
        if not pip_exe.exists():
            pip_exe = "pip"  # Fallback to system pip
        
        # Install requirements
        subprocess.run([
            str(pip_exe), "install", "-r", "requirements.txt"
        ], check=True)
        
        logger.info("Dependencies installed successfully")
        return True
        
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to install dependencies: {e}")
        return False
    except Exception as e:
        logger.error(f"Error installing dependencies: {e}")
        return False

def check_yolo_model():
    """Check if YOLOv8 model is available"""
    model_paths = [
        "yolov8n.pt",
        "../yolov8n.pt",
        "models/yolov8n.pt"
    ]
    
    for model_path in model_paths:
        if Path(model_path).exists():
            logger.info(f"YOLOv8 model found at: {model_path}")
            return True
    
    logger.warning("YOLOv8 model not found. It will be downloaded automatically on first run.")
    return True  # Return True as ultralytics will download it automatically

def setup_directories():
    """Create necessary directories"""
    try:
        directories = ["uploads", "static", "models", "logs"]
        for directory in directories:
            Path(directory).mkdir(exist_ok=True)
            logger.info(f"Directory created/verified: {directory}")
        return True
    except Exception as e:
        logger.error(f"Error creating directories: {e}")
        return False

def run_backend():
    """Run the FastAPI backend with uvicorn"""
    try:
        logger.info("Starting Smart Traffic Backend...")
        logger.info("=" * 50)
        logger.info("Smart Traffic Detection API")
        logger.info("YOLOv8 Backend with FastAPI + uvicorn")
        logger.info(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info("=" * 50)
        
        # Run uvicorn
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info",
            access_log=True
        )
        
    except KeyboardInterrupt:
        logger.info("Backend stopped by user")
    except Exception as e:
        logger.error(f"Error running backend: {e}")
        return False
    
    return True

def main():
    """Main startup function"""
    logger.info("Smart Traffic Backend Startup")
    logger.info("=" * 40)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Setup directories
    if not setup_directories():
        logger.error("Failed to setup directories")
        sys.exit(1)
    
    # Check virtual environment
    if not check_virtual_environment():
        logger.error("Virtual environment setup failed")
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        logger.error("Dependency installation failed")
        sys.exit(1)
    
    # Check YOLO model
    if not check_yolo_model():
        logger.error("YOLO model check failed")
        sys.exit(1)
    
    # Run the backend
    logger.info("All checks passed. Starting backend...")
    run_backend()

if __name__ == "__main__":
    main()
