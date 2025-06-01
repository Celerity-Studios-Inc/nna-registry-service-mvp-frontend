#!/bin/bash
# Script to start the frontend with mock mode enabled

FRONTEND_DIR="/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend"

# Navigate to frontend directory
cd "$FRONTEND_DIR" || exit 1

# Create a .env file with mock mode enabled
echo "Creating .env file with mock mode enabled..."
cat > .env << 'EOL'
REACT_APP_USE_MOCK_API=true
REACT_APP_API_URL=/api
EOL

echo "Environment file created with mock mode enabled."
echo ".env contents:"
cat .env

# Install dependencies if needed
echo "Installing frontend dependencies..."
npm install

# Start the frontend in development mode
echo "Starting frontend in mock mode (using mock API, no backend needed)..."
npm start