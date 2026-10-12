@echo off
echo ============================================
echo  Perfect Calculation Debug System
echo  Smart India Hackathon 2025
echo ============================================
echo.

echo Starting Perfect Debug System...
echo This will help troubleshoot the calculation issues
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

echo Python found. Starting enhanced backend with perfect debugging...
echo.

REM Create debug output directory
if not exist debug_output mkdir debug_output

REM Start the enhanced backend with perfect debugging
echo Starting FastAPI backend with enhanced debugging...
python main.py

echo.
echo System stopped. Check debug_output folder for detailed analysis.
echo Press any key to exit...
pause >nul
