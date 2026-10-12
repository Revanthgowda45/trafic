@echo off
echo ========================================
echo   YOLOv8 Live Traffic Analysis System
echo   Smart India Hackathon 2025 - Fast Mode
echo ========================================
echo.

echo Activating virtual environment...
call .\venv\Scripts\activate

echo.
echo Starting FastAPI backend with YOLOv8...
echo Backend will be available at: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo Model: YOLOv8s (Optimized for Speed)
echo.

echo Starting server...
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

pause
