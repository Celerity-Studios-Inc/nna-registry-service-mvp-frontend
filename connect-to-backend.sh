#!/bin/bash

# Script to update the frontend to connect to the new backend

# Use the production backend URL
BACKEND_URL="https://registry.reviz.dev/api"

# Update .env file or create if it doesn't exist
echo "Updating .env file with backend URL: $BACKEND_URL"
cat > .env << EOL
REACT_APP_API_URL=$BACKEND_URL
REACT_APP_USE_MOCK_API=false
EOL

echo "Environment variables updated. Frontend will now connect to: $BACKEND_URL"
echo ""
echo "To apply these changes, you need to restart your frontend development server:"
echo "1. Stop the current server (if running) with Ctrl+C"
echo "2. Start it again with: npm start"
echo ""
echo "To test the connection to the backend, try registering a new asset with subcategories like LGF, LGM, DIV, or IDF."