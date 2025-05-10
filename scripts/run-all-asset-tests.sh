#!/bin/bash

# This script runs all the asset tests to verify our solution
# Usage: ./run-all-asset-tests.sh YOUR_TOKEN

# Check if token is provided
if [ -z "$1" ]; then
  echo "Error: No token provided"
  echo "Usage: ./run-all-asset-tests.sh YOUR_TOKEN"
  echo "Get a token by logging in to the app and copying it from localStorage"
  exit 1
fi

TOKEN="$1"

# Make sure test image exists
if [ ! -d "../test-assets" ]; then
  echo "Creating test-assets directory..."
  mkdir -p ../test-assets
fi

if [ ! -f "../test-assets/test-image.jpg" ]; then
  echo "Creating test image..."
  echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" | base64 --decode > ../test-assets/test-image.jpg
fi

# Make sure scripts are executable
chmod +x /Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend/scripts/field-requirement-test.mjs
chmod +x /Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend/scripts/test-backend-direct.mjs
chmod +x /Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend/scripts/test-final-solution.mjs

# Install dependencies if needed
if ! npm list -g node-fetch form-data | grep -q node-fetch; then
  echo "Installing required packages..."
  npm install -g node-fetch form-data
fi

echo "=== NNA REGISTRY SERVICE ASSET CREATION TESTS ==="
echo ""
echo "These tests will verify our asset creation solution using systematic tests"
echo "against the real backend API."
echo ""
echo "Using token: ${TOKEN:0:15}..."
echo ""

# Run the tests
echo "=== TEST 1: Systematic Field Requirements ==="
node /Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend/scripts/field-requirement-test.mjs "$TOKEN"

echo ""
echo "=== TEST 2: Backend Direct Test ==="
node /Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend/scripts/test-backend-direct.mjs "$TOKEN"

echo ""
echo "=== TEST 3: Final Solution Test ==="
node /Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend/scripts/test-final-solution.mjs "$TOKEN"

echo ""
echo "=== ALL TESTS COMPLETE ==="
echo "Check the output above to verify our solution."
echo "For detailed documentation, see ASSET_CREATION_SOLUTION.md"