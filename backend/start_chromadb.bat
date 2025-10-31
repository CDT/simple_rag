@echo off
REM ChromaDB Server Startup Script
REM This script starts the ChromaDB server with the required configuration

echo Starting ChromaDB server...
echo.

REM Check if port 8000 is already in use
netstat -ano | findstr ":8000" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================
    echo WARNING: Port 8000 is already in use!
    echo ChromaDB server may already be running.
    echo ============================================================
    echo.
    echo Please check if ChromaDB is already running:
    echo 1. Check for existing ChromaDB windows
    echo 2. Or run: netstat -ano ^| findstr ":8000"
    echo 3. Or try accessing: http://localhost:8000/api/v2
    echo.
    echo If you want to start a new instance, first stop the existing one.
    echo.
    pause
    exit /b 1
)

echo ChromaDB will be accessible at: http://localhost:8000
echo Data will be stored in: backend\chroma_db
echo Logs will be displayed in this window
echo.

REM Set environment variables to configure ChromaDB
set ANONYMIZED_TELEMETRY=True
set IS_PERSISTENT=True
set ALLOW_RESET=True

echo [%date% %time%] ChromaDB server starting...
echo Port: 8000, Path: chroma_db
echo.
echo Press Ctrl+C to stop the ChromaDB server
echo.

REM Start ChromaDB server
REM --path: Directory where ChromaDB will store data
REM --host: Host to bind to (localhost for local access only)
REM --port: Port to listen on (8000 is the default)
REM Filter out OpenTelemetry informational messages (requires OTEL collector setup)
echo [%date% %time%] ChromaDB server started successfully
echo.
chroma run --path chroma_db --host localhost --port 8000 2>&1 | findstr /V /C:"OpenTelemetry"

REM If chroma command fails, show error message
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to start ChromaDB server
    echo Make sure ChromaDB is installed: pip install chromadb
    echo.
    pause
)

