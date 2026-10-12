@echo off
echo Smart Traffic Backend Startup
echo ==============================

REM Change to backend directory
cd /d "%~dp0"

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment
        pause
        exit /b 1
    )
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

REM Create necessary directories
if not exist "uploads" mkdir uploads
if not exist "static" mkdir static
if not exist "models" mkdir models
if not exist "logs" mkdir logs

REM Copy YOLO model if it exists in parent directory
if exist "..\yolov8n.pt" (
    if not exist "yolov8n.pt" (
        echo Copying YOLO model...
        copy "..\yolov8n.pt" "yolov8n.pt"
    )
)

REM Start the backend
echo Starting Smart Traffic Backend...
echo ================================
echo Backend will be available at: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo ================================
python start_backend.py

pause
