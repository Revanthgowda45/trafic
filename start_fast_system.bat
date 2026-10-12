@echo off
echo ============================================
echo  FAST Traffic Detection System
echo  Smart India Hackathon 2025
echo  With Advanced Caching for Maximum Speed
echo ============================================
echo.

echo Starting FAST System with Intelligent Caching...
echo This system will be significantly faster by reusing analysis data!
echo.

REM Change to backend directory
cd /d "%~dp0backend"

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

echo Python found. Starting FAST backend with intelligent caching...
echo.

REM Create debug output directory
if not exist debug_output mkdir debug_output

echo ============================================
echo  FAST SYSTEM FEATURES:
echo  🚀 Intelligent Detection Caching
echo  🚀 Area Analysis Caching  
echo  🚀 Timing Calculation Caching
echo  🚀 Perfect Calculation Debugging
echo  🚀 Enhanced Traffic Analysis
echo  🚀 Real-time Performance Monitoring
echo ============================================
echo.

REM Start the FAST backend system
echo Starting FastAPI backend with MAXIMUM SPEED caching...
python main.py

echo.
echo FAST System stopped. Check debug_output folder for analysis.
echo Cache performance stats available at: http://localhost:8000/api/cache/stats
echo Press any key to exit...
pause >nul
