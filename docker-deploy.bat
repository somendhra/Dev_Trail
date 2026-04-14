@echo off
REM GigShield Docker Deployment Script for Windows
REM Usage: docker-deploy.bat [command]
REM Commands: build, start, stop, logs, status, clean

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not installed or not in PATH
    exit /b 1
)

setlocal enabledelayedexpansion
set "COMMAND=%~1"
if "!COMMAND!"=="" set "COMMAND=start"

echo.
echo 🐳 GigShield Docker Deployment
echo ==================================
echo.

if /i "!COMMAND!"=="build" (
    echo 📦 Building Docker images...
    docker-compose build --no-cache
    echo ✅ Build complete!
    
) else if /i "!COMMAND!"=="start" (
    echo 🚀 Starting services...
    docker-compose up -d --build
    echo ⏳ Waiting for services to initialize...
    timeout /t 30 /nobreak
    echo.
    docker-compose ps
    echo.
    echo ✅ Services started!
    echo 🌐 Frontend: http://localhost
    echo 📡 Backend: http://localhost:4000
    echo 🤖 AI Service: http://localhost:8000/docs
    
) else if /i "!COMMAND!"=="stop" (
    echo ⛔ Stopping services...
    docker-compose stop
    echo ✅ Services stopped!
    
) else if /i "!COMMAND!"=="restart" (
    echo 🔄 Restarting services...
    docker-compose restart
    echo ✅ Services restarted!
    
) else if /i "!COMMAND!"=="logs" (
    set "SERVICE=%~2"
    if "!SERVICE!"=="" (
        echo 📋 Showing logs from all services...
        docker-compose logs -f
    ) else (
        echo 📋 Showing logs from !SERVICE!...
        docker-compose logs -f !SERVICE!
    )
    
) else if /i "!COMMAND!"=="status" (
    echo 📊 Service Status:
    docker-compose ps
    
) else if /i "!COMMAND!"=="clean" (
    echo 🧹 Cleaning up (removing containers but keeping volumes^)...
    docker-compose down
    echo ✅ Cleanup complete!
    
) else if /i "!COMMAND!"=="clean-all" (
    echo ⚠️  Full cleanup including database...
    docker-compose down -v
    echo ✅ Full cleanup complete! Database has been deleted.
    
) else (
    echo ❌ Unknown command: !COMMAND!
    echo.
    echo Available commands:
    echo   build       - Build Docker images
    echo   start       - Build and start all services
    echo   stop        - Stop all services
    echo   restart     - Restart all services
    echo   logs        - Show logs (optionally: logs [service-name^]^)
    echo   status      - Show service status
    echo   clean       - Stop and remove containers (keep database^)
    echo   clean-all   - Stop and remove everything (DELETE DATABASE^)
    exit /b 1
)

endlocal
