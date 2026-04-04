#!/usr/bin/env bash

# AI Gig Insurance Platform - Ultimate Startup Script
# A robust, cross-platform solution for multi-service orchestration.

# --- Configuration ---
BACKEND_PORT=4000
AI_PORT=8000
FRONTEND_PORT=5173
COLOR_GREEN='\033[0;32m'
COLOR_RED='\033[0;31m'
COLOR_YELLOW='\033[1;33m'
COLOR_CYAN='\033[0;36m'
COLOR_NC='\033[0m' # No Color

echo -e "${COLOR_CYAN}----------------------------------------------------------------${COLOR_NC}"
echo -e "${COLOR_GREEN}🚀 AI Gig Insurance Platform - All-in-One Startup${COLOR_NC}"
echo -e "${COLOR_CYAN}----------------------------------------------------------------${COLOR_NC}"

# --- OS Detection ---
OS_TYPE="unknown"
case "$OSTYPE" in
  linux*)   OS_TYPE="linux" ;;
  darwin*)  OS_TYPE="macos" ;;
  msys*|cygwin*|win32*) OS_TYPE="windows" ;;
  *)        OS_TYPE=$(uname -s | tr '[:upper:]' '[:lower:]' | sed 's/mingw.*/windows/;s/msys.*/windows/') ;;
esac

# --- Dependency Check ---
check_cmd() {
  if ! command -v "$1" &> /dev/null; then
    echo -e "${COLOR_RED}❌ Error: $1 is not installed environment.${COLOR_NC}"
    exit 1
  fi
}

echo -e "🧐 Checking environment... (${OS_TYPE})"
check_cmd "java"
check_cmd "mvn"
check_cmd "npm"
PYTHON_CMD="python"
if ! command -v "python" &> /dev/null; then
  if command -v "python3" &> /dev/null; then
    PYTHON_CMD="python3"
  else
    echo -e "${COLOR_RED}❌ Error: Python is not installed.${COLOR_NC}"
    exit 1
  fi
fi

# --- Helper: Aggressive Kill Port ---
kill_port() {
  local PORT=$1
  echo -e "🔍 Checking port $PORT..."
  
  for i in {1..3}; do
    if [ "$OS_TYPE" == "windows" ]; then
      PIDS=$(netstat -ano | grep ":$PORT" | awk '{print $5}' | sort -u | grep -v "0")
      if [ -n "$PIDS" ]; then
        for PID in $PIDS; do
          echo -e "${COLOR_YELLOW}⚠ Port $PORT in use (PID: $PID). Killing...${COLOR_NC}"
          taskkill -F -PID $PID >/dev/null 2>&1 || true
        done
        sleep 1
      else
        return 0
      fi
    else
      if command -v lsof &> /dev/null; then
        PIDS=$(lsof -t -i:$PORT || true)
        if [ -n "$PIDS" ]; then
          echo -e "${COLOR_YELLOW}⚠ Port $PORT in use (PIDs: $PIDS). Killing...${COLOR_NC}"
          kill -9 $PIDS >/dev/null 2>&1 || true
          sleep 1
        else
          return 0
        fi
      fi
    fi
  done
}

# --- 1. Cleanup ---
kill_port $BACKEND_PORT
kill_port $AI_PORT
kill_port $FRONTEND_PORT

# --- 2. AI Engine Setup ---
echo -e "\n🤖 ${COLOR_CYAN}[1/3] Setting up AI Engine...${COLOR_NC}"
(
  cd ai-model || exit
  [ ! -d "venv" ] && $PYTHON_CMD -m venv venv
  
  if [ "$OS_TYPE" == "windows" ]; then
    ./venv/Scripts/pip install -q -r requirements.txt
    exec ./venv/Scripts/uvicorn main:app --host 0.0.0.0 --port $AI_PORT --no-access-log > ai_model.log 2>&1
  else
    ./venv/bin/pip install -q -r requirements.txt
    exec ./venv/bin/uvicorn main:app --host 0.0.0.0 --port $AI_PORT --no-access-log > ai_model.log 2>&1
  fi
) &
AI_PID=$!

# --- 3. Backend Setup ---
echo -e "🖥 ${COLOR_CYAN}[2/3] Setting up Spring Boot Backend...${COLOR_NC}"
(
  cd backend || exit
  if [ -f .env ]; then
    echo "  🔐 Loading backend environment from .env..."
    set -a
    . ./.env
    set +a
  fi
  echo "  🧹 Building (mvn clean install)..."
  mvn clean install -DskipTests -q
  exec mvn spring-boot:run -q > backend.log 2>&1
) &
BACK_PID=$!

# --- 4. Frontend Setup ---
echo -e "🌐 ${COLOR_CYAN}[3/3] Setting up React Frontend...${COLOR_NC}"
(
  cd frontend || exit
  echo "  📦 Installing dependencies (npm install)..."
  npm install --silent
  exec npm run dev -- --port $FRONTEND_PORT > frontend.log 2>&1
) &
FRONT_PID=$!

# --- 5. Health Monitoring ---
echo -e "${COLOR_CYAN}----------------------------------------------------------------${COLOR_NC}"
echo -e "⏳ Waiting for services to wake up..."

check_health() {
  local URL=$1
  local NAME=$2
  for i in {1..30}; do
    if curl -s --head "$URL" | head -n 1 | grep "200\|302\|101" > /dev/null; then
      return 0
    fi
    sleep 2
  done
  return 1
}

# Use simple background check logic
(
  if check_health "http://localhost:$AI_PORT/health" "AI Engine"; then echo -e "  ✅ AI Engine Ready!"; fi
) &
(
  if check_health "http://localhost:$BACKEND_PORT/actuator/health" "Backend"; then echo -e "  ✅ Backend Ready!"; fi
) &
(
  if check_health "http://localhost:$FRONTEND_PORT" "Frontend"; then echo -e "  ✅ Frontend Ready!"; fi
) &

sleep 15
echo -e "${COLOR_CYAN}----------------------------------------------------------------${COLOR_NC}"
echo -e "${COLOR_GREEN}✨ All systems launched!${COLOR_NC}"
echo -e "🤖 AI Engine: http://localhost:$AI_PORT"
echo -e "🖥 Backend:   http://localhost:$BACKEND_PORT"
echo -e "🌐 Frontend:  http://localhost:$FRONTEND_PORT"
echo -e "${COLOR_CYAN}----------------------------------------------------------------${COLOR_NC}"
echo -e "📝 Logs: ai-model.log, backend.log, frontend.log"
echo -e "${COLOR_YELLOW}🛑 Press Ctrl+C to stop all services.${COLOR_NC}"

cleanup() {
  echo -e "\n\n${COLOR_RED}🛑 Stopping services...${COLOR_NC}"
  if [ "$OS_TYPE" == "windows" ]; then
    [ -n "$BACK_PID" ] && taskkill -F -PID $BACK_PID >/dev/null 2>&1 || true
    [ -n "$FRONT_PID" ] && taskkill -F -PID $FRONT_PID >/dev/null 2>&1 || true
    [ -n "$AI_PID" ] && taskkill -F -PID $AI_PID >/dev/null 2>&1 || true
  else
    kill $BACK_PID $FRONT_PID $AI_PID >/dev/null 2>&1 || true
  fi
  exit
}

trap cleanup INT TERM
wait
