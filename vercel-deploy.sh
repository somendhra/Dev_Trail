#!/bin/bash
# Vercel Frontend Deployment Script

echo "🚀 GigShield Frontend - Vercel Deployment"
echo "==========================================="
echo ""

# Check if in frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "   Please run this script from the frontend directory"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js not found. Please install Node.js"
    exit 1
fi

# Check if npm packages are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Prerequisites ready"
echo ""

# Get backend URL
read -p "Enter your backend API URL (e.g., http://localhost:4000): " BACKEND_URL
if [ -z "$BACKEND_URL" ]; then
    BACKEND_URL="http://localhost:4000"
    echo "Using default: $BACKEND_URL"
fi

echo ""
echo "Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful"
echo ""
echo "Deploying to Vercel..."
vercel --prod \
    --env VITE_API_URL="$BACKEND_URL"

echo ""
echo "✅ Deployment complete!"
echo "   Your frontend is now live on Vercel"
