#!/bin/bash

echo "🔧 NNA Registry Service - Composite Assets Testing with Real Backend"
echo "============================================================="
echo ""

# Kill any existing processes on port 3000
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 2

echo "📦 Building frontend..."
npm run build

echo ""
echo "🚀 Starting frontend with real backend connection..."
echo ""

# Start the frontend in development mode (has proxy configured)
echo "1️⃣ Starting frontend development server on port 3000..."
echo "   (Development mode includes proxy to https://registry.reviz.dev)"
npm start &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

echo ""
echo "✅ Frontend started!"
echo ""
echo "🌐 Frontend (Development): http://localhost:3000"
echo "🔗 Backend (Real): https://registry.reviz.dev"
echo "📚 Backend API Docs: https://registry.reviz.dev/api/docs"
echo ""
echo "📍 Test composite assets at: http://localhost:3000/composite-assets-test"
echo ""
echo "✨ Features ready to test:"
echo "   - Asset search with real backend data"
echo "   - Component validation" 
echo "   - HFN generation"
echo "   - Composite asset registration"
echo "   - Preview functionality"
echo ""
echo "Press Ctrl+C to stop the frontend"

# Function to cleanup when script exits
cleanup() {
    echo ""
    echo "🛑 Stopping frontend..."
    kill $FRONTEND_PID 2>/dev/null || true
    echo "✅ Frontend stopped"
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Wait for user to stop
wait