#!/usr/bin/env bash

# GigShield Docker Deployment Script
# Usage: bash docker-deploy.sh [command]
# Commands: build, start, stop, logs, status, clean

set -e

COMPOSE_CMD="docker-compose"
COMMAND="${1:-start}"

echo "🐳 GigShield Docker Deployment"
echo "================================="

case $COMMAND in
    build)
        echo "📦 Building Docker images..."
        $COMPOSE_CMD build --no-cache
        echo "✅ Build complete!"
        ;;
    
    start)
        echo "🚀 Starting services..."
        $COMPOSE_CMD up -d --build
        echo "⏳ Waiting for services to initialize..."
        sleep 30
        echo ""
        $COMPOSE_CMD ps
        echo ""
        echo "✅ Services started!"
        echo "🌐 Frontend: http://localhost"
        echo "📡 Backend: http://localhost:4000"
        echo "🤖 AI Service: http://localhost:8000/docs"
        ;;
    
    stop)
        echo "⛔ Stopping services..."
        $COMPOSE_CMD stop
        echo "✅ Services stopped!"
        ;;
    
    restart)
        echo "🔄 Restarting services..."
        $COMPOSE_CMD restart
        echo "✅ Services restarted!"
        ;;
    
    logs)
        SERVICE="${2:-}"
        if [ -z "$SERVICE" ]; then
            echo "📋 Showing logs from all services..."
            $COMPOSE_CMD logs -f
        else
            echo "📋 Showing logs from $SERVICE..."
            $COMPOSE_CMD logs -f "$SERVICE"
        fi
        ;;
    
    status)
        echo "📊 Service Status:"
        $COMPOSE_CMD ps
        ;;
    
    clean)
        echo "🧹 Cleaning up (removing containers but keeping volumes)..."
        $COMPOSE_CMD down
        echo "✅ Cleanup complete!"
        ;;
    
    clean-all)
        echo "⚠️  Full cleanup including database..."
        $COMPOSE_CMD down -v
        echo "✅ Full cleanup complete! Database has been deleted."
        ;;
    
    *)
        echo "❌ Unknown command: $COMMAND"
        echo ""
        echo "Available commands:"
        echo "  build       - Build Docker images"
        echo "  start       - Build and start all services"
        echo "  stop        - Stop all services"
        echo "  restart     - Restart all services"
        echo "  logs        - Show logs (optionally: logs [service-name])"
        echo "  status      - Show service status"
        echo "  clean       - Stop and remove containers (keep database)"
        echo "  clean-all   - Stop and remove everything (DELETE DATABASE)"
        exit 1
        ;;
esac
