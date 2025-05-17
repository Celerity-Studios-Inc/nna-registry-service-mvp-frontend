#!/bin/bash
# Script to test the taxonomy compatibility fix using frontend mock mode

echo "================================="
echo "  Testing Frontend-Only Solution"
echo "================================="
echo ""
echo "This script will start the frontend with mock mode enabled,"
echo "allowing us to test the taxonomy normalization without a backend."
echo ""

# Directory variables
FRONTEND_DIR="/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend"

# Navigate to frontend directory
cd "$FRONTEND_DIR" || exit 1

# Create a .env.local file to enable mock mode
echo "Setting up mock mode environment variables..."
cat > .env.local << 'EOL'
REACT_APP_USE_MOCK_API=true
REACT_APP_API_URL=/api
EOL

echo "Created .env.local with mock mode enabled."

# Start the frontend application
echo ""
echo "Starting frontend in development mode with mock API..."
echo "This will open your browser to test the taxonomy subcategory fix."
echo ""
echo "To test the fix:"
echo "1. Select 'Songs' (S) as the layer"
echo "2. Select 'Pop' (POP) as the category"
echo "3. Select 'Hip-Hop Music' (HPM) as the subcategory"
echo "4. Verify the NNA address is generated correctly as S.POP.HPM.XXX"
echo "5. Check the browser console for logs about normalization working"
echo ""

# Start the application
npm start