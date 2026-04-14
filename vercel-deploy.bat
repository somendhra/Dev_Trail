@echo off
REM Vercel Frontend Deployment Script for Windows

echo.
echo 🚀 GigShield Frontend - Vercel Deployment
echo ===========================================
echo.

REM Check if in frontend directory
if not exist "package.json" (
    echo ❌ Error: package.json not found
    echo    Please run this script from the frontend directory
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Node.js not found. Please install Node.js
    exit /b 1
)

REM Check if npm packages are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
)

REM Check if vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 📦 Installing Vercel CLI...
    call npm install -g vercel
)

echo ✅ Prerequisites ready
echo.

REM Get backend URL
set /p BACKEND_URL="Enter your backend API URL (e.g., http://localhost:4000): "
if "%BACKEND_URL%"=="" (
    set BACKEND_URL=http://localhost:4000
    echo Using default: %BACKEND_URL%
)

echo.
echo Building frontend...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed!
    exit /b 1
)

echo ✅ Build successful
echo.
echo Deploying to Vercel...
call vercel --prod --env VITE_API_URL="%BACKEND_URL%"

echo.
echo ✅ Deployment complete!
echo    Your frontend is now live on Vercel
echo.
pause
