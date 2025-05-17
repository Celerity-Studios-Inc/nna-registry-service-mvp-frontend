#!/bin/bash
# Script to start both frontend and backend services

BACKEND_DIR="/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-backend"
FRONTEND_DIR="/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend"

# Function to display section headers
section() {
  echo ""
  echo "===================================================="
  echo "  $1"
  echo "===================================================="
  echo ""
}

# Start backend service
start_backend() {
  section "STARTING BACKEND SERVICE"
  
  # Navigate to backend directory
  cd "$BACKEND_DIR" || exit 1
  
  # Install dependencies if needed
  echo "Installing backend dependencies..."
  npm install
  
  # Use the local NestJS CLI
  echo "Starting backend with local NestJS CLI..."
  echo "Using: npm run start:dev"
  echo ""
  echo "NOTE: This will run in this terminal window. Open a new terminal"
  echo "to run the frontend service."
  echo ""
  
  # Start the backend service
  npm run start:dev
}

# Start frontend service
start_frontend() {
  section "STARTING FRONTEND SERVICE"
  
  # Navigate to frontend directory
  cd "$FRONTEND_DIR" || exit 1
  
  # Install dependencies if needed
  echo "Installing frontend dependencies..."
  npm install
  
  echo "Starting frontend service..."
  npm start
}

# Explain usage
usage() {
  section "USAGE"
  echo "This script helps start the NNA Registry services:"
  echo ""
  echo "Option 1: Start backend (use this in one terminal)"
  echo "  ./start-services.sh backend"
  echo ""
  echo "Option 2: Start frontend (use this in another terminal)"
  echo "  ./start-services.sh frontend"
  echo ""
  echo "After both services are running, you can test the subcategory fix at:"
  echo "http://localhost:3000/register-asset"
  echo ""
}

# Main script execution
if [ "$1" == "backend" ]; then
  start_backend
elif [ "$1" == "frontend" ]; then
  start_frontend
else
  usage
fi