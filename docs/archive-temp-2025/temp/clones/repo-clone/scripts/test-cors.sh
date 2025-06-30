#!/bin/bash

# Script to test CORS settings for the GCP Cloud Run backend
# This helps verify that the API will be accessible from the Vercel frontend

# Set your backend URLs
MOCK_BACKEND_URL="https://nna-registry-service-backend.vercel.app/api"
GCP_BACKEND_URL="https://nna-registry-service-us-central1.run.app/api"
VERCEL_ORIGIN="https://nna-registry-service-frontend.vercel.app"

echo "=== Testing CORS Configuration ==="
echo "This script checks if the backend allows cross-origin requests from the frontend"
echo ""

# Test CORS preflight for the mock backend
echo "Testing mock backend CORS preflight (OPTIONS)..."
MOCK_CORS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X OPTIONS "$MOCK_BACKEND_URL/assets" \
  -H "Origin: $VERCEL_ORIGIN" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization")

if [ "$MOCK_CORS_STATUS" -eq 204 ] || [ "$MOCK_CORS_STATUS" -eq 200 ]; then
  echo "✅ Mock backend CORS preflight successful (HTTP status: $MOCK_CORS_STATUS)"
else
  echo "⚠️ Mock backend CORS preflight issue (HTTP status: $MOCK_CORS_STATUS)"
fi

# Test CORS preflight for the GCP backend
echo "Testing GCP backend CORS preflight (OPTIONS)..."
GCP_CORS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X OPTIONS "$GCP_BACKEND_URL/assets" \
  -H "Origin: $VERCEL_ORIGIN" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization")

if [ "$GCP_CORS_STATUS" -eq 204 ] || [ "$GCP_CORS_STATUS" -eq 200 ]; then
  echo "✅ GCP backend CORS preflight successful (HTTP status: $GCP_CORS_STATUS)"
else
  echo "⚠️ GCP backend CORS preflight issue (HTTP status: $GCP_CORS_STATUS)"
  echo "  This might cause problems when connecting from the Vercel frontend"
fi

# Check actual CORS headers from the GCP backend
echo ""
echo "Checking CORS response headers from GCP backend..."
curl -s -D - "$GCP_BACKEND_URL/assets" \
  -H "Origin: $VERCEL_ORIGIN" \
  -H "Content-Type: application/json" \
  -o /dev/null | grep -i "access-control"

echo ""
echo "=== CORS Configuration Results ==="
if [ "$GCP_CORS_STATUS" -eq 204 ] || [ "$GCP_CORS_STATUS" -eq 200 ]; then
  echo "✅ The GCP backend appears to be correctly configured for CORS"
  echo "  Your Vercel frontend should be able to make API requests to it"
else
  echo "⚠️ There might be CORS issues with the GCP backend"
  echo "  You may need to update the backend CORS configuration to allow requests from:"
  echo "  $VERCEL_ORIGIN"
  echo ""
  echo "  Here's how to fix it:"
  echo "  1. Check the 'main.ts' file in your backend project"
  echo "  2. Look for the CORS configuration (app.enableCors)"
  echo "  3. Make sure it includes your Vercel frontend origin"
  echo "  4. Redeploy the backend to GCP Cloud Run"
fi