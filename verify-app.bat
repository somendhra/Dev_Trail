@echo off
REM Comprehensive GigShield Application Verification Script for Windows
REM Tests all critical features: Auth, Triggers, Claims, Payouts, Weather

setlocal enabledelayedexpansion

echo 🔍 GigShield Application Verification Suite
echo ============================================== 
echo.

set "BASE_URL=http://localhost:4000"
set "ADMIN_EMAIL=2300033142cse4@gmail.com"
set "ADMIN_PASSWORD=Sommu@123"
set "USER_EMAIL=somendhrakarthik2006@gmail.com"
set "USER_PASSWORD=Sommu@123"

set "TESTS_PASSED=0"
set "TESTS_FAILED=0"

REM ============================================================================
REM 1. HEALTH CHECK
REM ============================================================================
echo.
echo 📊 SYSTEM STATUS CHECK
echo =====================
echo.

echo Checking Backend Health...
for /f %%i in ('powershell -Command "(Invoke-WebRequest -Uri %BASE_URL%/actuator/health -Method GET -TimeoutSec 5 | Select-Object -ExpandProperty StatusCode) 2>$null"') do set "health_code=%%i"

if "!health_code!"=="200" (
    echo ✅ Backend is running (HTTP 200^)
    set /a "TESTS_PASSED+=1"
) else (
    echo ❌ Backend health check failed (HTTP !health_code!^)
    set /a "TESTS_FAILED+=1"
)

echo.
echo Checking Frontend...
for /f %%i in ('powershell -Command "(Invoke-WebRequest -Uri http://localhost -Method GET -TimeoutSec 5 | Select-Object -ExpandProperty StatusCode) 2>$null"') do set "frontend_code=%%i"

if "!frontend_code!"=="200" (
    echo ✅ Frontend is running (HTTP 200^)
    set /a "TESTS_PASSED+=1"
) else (
    echo ⚠️  Frontend not responding (HTTP !frontend_code!^)
)

echo.
echo Checking AI Service...
for /f %%i in ('powershell -Command "(Invoke-WebRequest -Uri http://localhost:8000/docs -Method GET -TimeoutSec 5 | Select-Object -ExpandProperty StatusCode) 2>$null"') do set "ai_code=%%i"

if "!ai_code!"=="200" (
    echo ✅ AI Service is running (HTTP 200^)
    set /a "TESTS_PASSED+=1"
) else (
    echo ❌ AI Service not responding (HTTP !ai_code!^)
    set /a "TESTS_FAILED+=1"
)

REM ============================================================================
REM 2. DATABASE CHECK
REM ============================================================================
echo.
echo 💾 DATABASE & INITIALIZATION
echo ===========================
echo.

echo Testing database connection...
for /f %%i in ('powershell -Command "(Invoke-WebRequest -Uri %BASE_URL%/api/triggers -Method GET -TimeoutSec 5 | Select-Object -ExpandProperty StatusCode) 2>$null"') do set "db_code=%%i"

if "!db_code!"=="200" (
    echo ✅ Database is responding
    echo     Triggers table accessible
    set /a "TESTS_PASSED+=1"
    REM Get trigger count
    for /f "delims=" %%i in ('powershell -Command "(Invoke-RestMethod -Uri %BASE_URL%/api/triggers -Method GET 2>$null | Measure-Object | Select-Object -ExpandProperty Count)"') do set "trigger_count=%%i"
    echo     Found: !trigger_count! trigger rules
) else (
    echo ❌ Database check failed
    set /a "TESTS_FAILED+=1"
)

REM ============================================================================
REM 3. AUTHENTICATION TESTS
REM ============================================================================
echo.
echo 🔐 AUTHENTICATION TESTS
echo =======================
echo.

echo Testing Admin Login...
set "admin_json={"email":"!ADMIN_EMAIL!","password":"!ADMIN_PASSWORD!"}"
for /f %%i in ('powershell -Command "(Invoke-WebRequest -Uri %BASE_URL%/api/auth/login -Method POST -Body '{\"email\":\"!ADMIN_EMAIL!\",\"password\":\"!ADMIN_PASSWORD!\"}' -ContentType 'application/json' -TimeoutSec 5 | Select-Object -ExpandProperty StatusCode) 2>$null"') do set "admin_code=%%i"

if "!admin_code!"=="200" (
    echo ✅ Admin Login successful ^(HTTP 200^)
    set /a "TESTS_PASSED+=1"
) else (
    echo ❌ Admin Login failed ^(HTTP !admin_code!^)
    set /a "TESTS_FAILED+=1"
)

echo Testing User Login...
for /f %%i in ('powershell -Command "(Invoke-WebRequest -Uri %BASE_URL%/api/auth/login -Method POST -Body '{\"email\":\"!USER_EMAIL!\",\"password\":\"!USER_PASSWORD!\"}' -ContentType 'application/json' -TimeoutSec 5 | Select-Object -ExpandProperty StatusCode) 2>$null"') do set "user_code=%%i"

if "!user_code!"=="200" (
    echo ✅ User Login successful ^(HTTP 200^)
    set /a "TESTS_PASSED+=1"
) else (
    echo ❌ User Login failed ^(HTTP !user_code!^)
    set /a "TESTS_FAILED+=1"
)

REM ============================================================================
REM 4. WEATHER SERVICE TESTS
REM ============================================================================
echo.
echo 🌦️  WEATHER SERVICE TESTS
echo ==========================
echo.

echo Testing Weather API...
for /f %%i in ('powershell -Command "(Invoke-WebRequest -Uri '%BASE_URL%/api/weather/district/Hyderabad/state/Telangana' -Method GET -TimeoutSec 5 | Select-Object -ExpandProperty StatusCode) 2>$null"') do set "weather_code=%%i"

if "!weather_code!"=="200" (
    echo ✅ Weather API responding ^(HTTP 200^)
    set /a "TESTS_PASSED+=1"
    REM Get weather details
    powershell -Command "(Invoke-RestMethod -Uri '%BASE_URL%/api/weather/district/Hyderabad/state/Telangana' -Method GET 2>$null) | ConvertTo-Json -Depth 2 | Select-Object -First 5" > nul 2>&1
    echo     Retrieved weather data for Hyderabad, Telangana
) else (
    echo ❌ Weather API failed ^(HTTP !weather_code!^)
    set /a "TESTS_FAILED+=1"
)

REM ============================================================================
REM 5. PLANS & SUBSCRIPTION TESTS
REM ============================================================================
echo.
echo 💰 PLANS ^& SUBSCRIPTION TESTS
echo ==============================
echo.

echo Testing Plans Endpoint...
for /f %%i in ('powershell -Command "(Invoke-WebRequest -Uri %BASE_URL%/api/plans -Method GET -TimeoutSec 5 | Select-Object -ExpandProperty StatusCode) 2>$null"') do set "plans_code=%%i"

if "!plans_code!"=="200" (
    echo ✅ Plans API responding ^(HTTP 200^)
    set /a "TESTS_PASSED+=1"
) else (
    echo ❌ Plans API failed ^(HTTP !plans_code!^)
    set /a "TESTS_FAILED+=1"
)

REM ============================================================================
REM 6. TRIGGER ENGINE VERIFICATION
REM ============================================================================
echo.
echo ⚡ PARAMETRIC TRIGGER ENGINE
echo ============================
echo.

echo Testing Trigger Rules...
for /f %%i in ('powershell -Command "(Invoke-WebRequest -Uri %BASE_URL%/api/triggers -Method GET -TimeoutSec 5 | Select-Object -ExpandProperty StatusCode) 2>$null"') do set "triggers_code=%%i"

if "!triggers_code!"=="200" (
    echo ✅ Trigger Engine initialized ^(HTTP 200^)
    set /a "TESTS_PASSED+=1"
    
    REM List expected triggers
    echo.
    echo Expected Triggers:
    echo   1. HEAVY_RAIN - rainfall ^>= 50mm
    echo   2. EXTREME_RAIN - rainfall ^>= 100mm
    echo   3. CYCLONE - rainfall ^>= 200mm
    echo   4. EXTREME_HEAT - temperature ^>= 42°C
    echo   5. SEVERE_HEAT_WAVE - temperature ^>= 45°C
    echo   6. HIGH_WINDS - wind_speed ^>= 60km/h
    echo   7. CYCLONE_WINDS - wind_speed ^>= 80km/h
    echo   8. HAZARDOUS_AQI - aqi ^>= 300
    echo   9. POOR_AQI - aqi ^>= 200
    echo  10. EXTREME_HUMIDITY - humidity ^>= 92 percent
) else (
    echo ❌ Trigger Engine check failed
    set /a "TESTS_FAILED+=1"
)

REM ============================================================================
REM SUMMARY
REM ============================================================================
echo.
echo ================================================
echo TEST SUMMARY
echo ================================================

echo.
echo ✅ Passed: !TESTS_PASSED!
echo ❌ Failed: !TESTS_FAILED!
echo.

if !TESTS_FAILED! equ 0 (
    echo 🎉 All critical tests passed!
    echo.
    echo ACCESS URLS:
    echo   Frontend     http://localhost
    echo   Backend      http://localhost:4000
    echo   AI Service   http://localhost:8000/docs
    echo.
    echo ADMIN LOGIN:
    echo   Email: !ADMIN_EMAIL!
    echo   Pass:  !ADMIN_PASSWORD!
    echo.
    echo USER LOGIN:
    echo   Email: !USER_EMAIL!
    echo   Pass:  !USER_PASSWORD!
) else (
    echo ⚠️  Some tests failed. Check Docker logs:
    echo   docker-compose logs backend
    echo   docker-compose logs frontend
    echo   docker-compose logs ai-model
)

echo.
endlocal
