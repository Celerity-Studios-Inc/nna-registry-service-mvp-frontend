#!/bin/bash
# Script to start the backend service correctly

BACKEND_DIR="/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-backend"

# Navigate to backend directory
cd "$BACKEND_DIR" || exit 1

# Install dependencies if needed
echo "Installing dependencies..."
npm install

# Try different start commands
echo "Attempting to start the backend server..."

# Option 1: Try using the local NestJS CLI
if [ -f "./node_modules/.bin/nest" ]; then
  echo "Starting with local NestJS CLI..."
  ./node_modules/.bin/nest start
elif [ -f "package.json" ]; then
  # Option 2: Check package.json for start scripts
  echo "Checking package.json for start scripts..."
  
  # Check for start:dev script
  if grep -q "\"start:dev\"" package.json; then
    echo "Found start:dev script, using npm run start:dev..."
    npm run start:dev
  # Check for dev script
  elif grep -q "\"dev\"" package.json; then
    echo "Found dev script, using npm run dev..."
    npm run dev
  # Check for regular start script
  elif grep -q "\"start\"" package.json; then
    echo "Found start script, using npm run start..."
    npm run start
  # If no scripts found, try node directly
  else
    echo "No start scripts found, trying node directly..."
    if [ -f "dist/main.js" ]; then
      echo "Starting with node dist/main.js..."
      node dist/main.js
    elif [ -f "src/main.js" ]; then
      echo "Starting with node src/main.js..."
      node src/main.js
    else
      echo "Could not find a suitable entry point. Please check the backend configuration."
      exit 1
    fi
  fi
else
  echo "Could not find package.json. Please check the backend directory."
  exit 1
fi