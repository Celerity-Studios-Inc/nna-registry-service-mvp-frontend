#!/bin/bash

# This script runs a direct test against the backend API
# to definitively determine what fields and formats it expects

echo "=== NNA Registry Service Backend API Test ==="
echo "Running direct test against the API..."

# Install dependencies if not already installed
if ! npm list -g node-fetch | grep -q node-fetch; then
  echo "Installing node-fetch..."
  npm install -g node-fetch form-data
fi

# Create test image if needed
if [ ! -d "../test-assets" ]; then
  echo "Creating test-assets directory..."
  mkdir -p ../test-assets
fi

# Check if test image exists
if [ ! -f "../test-assets/test-image.jpg" ]; then
  echo "Creating test image..."
  # Create a simple test image using base64
  echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" | base64 --decode > ../test-assets/test-image.jpg
fi

# Run the test script
echo "Running backend test script..."
node ./test-backend-direct.mjs

echo "Test complete."