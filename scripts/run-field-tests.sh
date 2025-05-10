#!/bin/bash

# Run systematic field requirement tests against the backend
# This script will help determine exactly what fields are required/accepted

echo "===== NNA REGISTRY SERVICE FIELD REQUIREMENT TESTS ====="

# Ensure dependencies are installed
if ! npm list -g node-fetch form-data | grep -q node-fetch; then
  echo "Installing required packages..."
  npm install -g node-fetch form-data
fi

# Ensure test image exists
if [ ! -d "../test-assets" ]; then
  echo "Creating test-assets directory..."
  mkdir -p ../test-assets
fi

if [ ! -f "../test-assets/test-image.jpg" ]; then
  echo "Creating test image..."
  echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" | base64 --decode > ../test-assets/test-image.jpg
fi

# Make test script executable
chmod +x ./field-requirement-test.mjs

# Check if token is provided
if [ -n "$1" ]; then
  echo "Using provided token"
  node ./field-requirement-test.mjs "$1"
else
  echo "No token provided. The script will attempt to login."
  echo "If login fails, please get a token from localStorage after logging in to the app,"
  echo "then run: ./run-field-tests.sh YOUR_TOKEN"
  node ./field-requirement-test.mjs
fi

echo "Tests complete. Review the output above to determine field requirements."