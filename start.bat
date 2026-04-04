@echo off
setlocal enabledelayedexpansion

:: AI Gig Insurance Platform - Windows Native Startup Script
:: Automatically manages dependencies and multi-service orchestration.

echo ----------------------------------------------------------------
echo ^|^| AI Gig Insurance Platform - Windows All-in-One Startup ^|^|
echo ----------------------------------------------------------------

:: --- Configuration ---
set BACKEND_PORT=4000
set AI_PORT=8000
set FRONTEND_PORT=5173

:: --- Dependency Check ---
echo 🧐 Checking environment...
where java >nul 2>&1 || (echo ❌ Error: Java is not installed. && exit /b 1)
where mvn >nul 2>&1 || (echo ❌ Error: Maven is not installed. && exit /b 1)
where npm >nul 2>&1 || (echo ❌ Error: Node.js/NPM is not installed. && exit /b 1)
where python >nul 2>&1 || (echo ❌ Error: Python is not installed. && exit /b 1)

:: --- 1. Aggressive Cleanup ---
echo 🔍 Cleaning up existing processes...
for %%P in (%BACKEND_PORT% %AI_PORT% %FRONTEND_PORT%) do (
    for /f "tokens=5" %%A in ('netstat -ano ^| findstr :%%P ^| findstr LISTENING') do (
        if not "%%A"=="" (
            echo ⚠ Port %%P in use (PID: %%A). Killing...
            taskkill /F /PID %%A /T >nul 2>&1
        )
    )
)

:: --- 2. AI Engine Setup ---
echo.
echo 🤖 [1/3] Setting up AI Engine...
cd ai-model
if not exist venv (
    echo 📦 Creating Python virtual environment...
    python -m venv venv
)
echo 📦 Installing AI dependencies...
venv\Scripts\pip install -q -r requirements.txt
echo 🧠 AI Model starting in background...
start /B venv\Scripts\uvicorn main:app --host 0.0.0.0 --port %AI_PORT% --no-access-log > ai_model.log 2>&1
cd ..

:: --- 3. Backend Setup ---
echo 🖥 [2/3] Setting up Spring Boot Backend...
cd backend
if exist .env (
    echo 🔐 Loading backend environment from .env...
    for /f "usebackq tokens=1,* delims==" %%A in (`findstr /r /v "^[ ]*# ^[ ]*$" .env`) do (
        if not "%%A"=="" set "%%A=%%B"
    )
)
echo 🧹 Building (mvn clean install)...
call mvn clean install -DskipTests -q
echo ☕ Backend starting in background...
start /B mvn spring-boot:run -q > backend.log 2>&1
cd ..

:: --- 4. Frontend Setup ---
echo 🌐 [3/3] Setting up React Frontend...
cd frontend
echo 📦 Installing dependencies (npm install)...
call npm install --silent
echo ✨ Frontend starting in background...
start /B npm run dev -- --port %FRONTEND_PORT% > frontend.log 2>&1
cd ..

:: --- 5. Finalize ---
echo ----------------------------------------------------------------
echo ⏳ Waiting for services to initialize (15s)...
timeout /t 15 /nobreak >nul

echo ----------------------------------------------------------------
echo ✨ All systems launched!
echo 🤖 AI Engine: http://localhost:%AI_PORT%
echo 🖥 Backend:   http://localhost:%BACKEND_PORT%
echo 🌐 Frontend:  http://localhost:%FRONTEND_PORT%
echo ----------------------------------------------------------------
echo 📝 Logs: ai-model\ai_model.log, backend\backend.log, frontend\frontend.log
echo 🛑 Close this window to stop background monitoring, or use Task Manager.
echo ----------------------------------------------------------------

:: Keep window open if run via double-click
pause
