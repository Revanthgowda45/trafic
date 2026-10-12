@echo off
echo ============================================
echo  FAST Traffic Detection System (SAFE MODE)
echo  Smart India Hackathon 2025
echo  With Enhanced Error Handling
echo ============================================
echo.

echo Starting FAST System with robust error handling...
echo This system includes fallbacks for cache errors!
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

echo Python found. Starting FAST backend with error-safe caching...
echo.

REM Create debug output directory
if not exist debug_output mkdir debug_output

echo ============================================
echo  SAFE FAST SYSTEM FEATURES:
echo  🚀 Intelligent Detection Caching (with fallbacks)
echo  🚀 Area Analysis Caching (error-safe)
echo  🚀 Timing Calculation Caching (robust)
echo  🚀 Perfect Error Handling (no crashes)
echo  🚀 Enhanced Traffic Analysis
echo  🚀 Real-time Performance Monitoring
echo ============================================
echo.

echo If you see cache errors, the system will automatically fall back
echo to direct processing without caching. Performance will still be good!
echo.

REM Start the FAST backend system
echo Starting FastAPI backend with SAFE FAST caching...
python main.py

echo.
echo FAST System stopped. Check logs for any cache performance info.
echo Cache performance stats available at: http://localhost:8000/api/cache/stats
echo Press any key to exit...
pause >nul
