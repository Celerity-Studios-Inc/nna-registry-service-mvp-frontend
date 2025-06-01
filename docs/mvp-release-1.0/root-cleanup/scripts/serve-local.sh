#!/bin/bash

# Script to build and serve the production build for local testing
# with proper API routing configuration

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Header
echo -e "${BLUE}${BOLD}======================================================${NC}"
echo -e "${BLUE}${BOLD}   NNA Registry Service - Local Production Testing     ${NC}"
echo -e "${BLUE}${BOLD}======================================================${NC}"
echo -e "${YELLOW}This script will build and serve the production version of the app${NC}"
echo -e "${YELLOW}with special configuration for proper API routing.${NC}"
echo

# Check if serve.json exists
if [ ! -f "./serve.json" ]; then
  echo -e "${RED}${BOLD}ERROR: serve.json not found!${NC}"
  echo -e "${YELLOW}This file is required for proper API routing.${NC}"
  echo -e "${YELLOW}Make sure you're running this script from the project root.${NC}"
  exit 1
fi

# Step 1: Building the application
echo -e "${GREEN}${BOLD}Step 1: Building production version...${NC}"
npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}${BOLD}Build failed! Check errors above.${NC}"
  exit 1
fi

echo -e "${GREEN}${BOLD}Build successful!${NC}"
echo

# Step 2: Check for 'serve' installation
echo -e "${GREEN}${BOLD}Step 2: Checking prerequisites...${NC}"
if ! command -v serve &> /dev/null; then
  echo -e "${YELLOW}'serve' is not installed. Installing globally...${NC}"
  npm install -g serve
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install 'serve' globally.${NC}"
    echo -e "${YELLOW}You can install it manually with: npm install -g serve${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}'serve' installed successfully.${NC}"
else
  echo -e "${GREEN}'serve' is already installed.${NC}"
fi
echo

# Step 3: Starting the server
echo -e "${GREEN}${BOLD}Step 3: Starting local production server...${NC}"
echo -e "${YELLOW}${BOLD}IMPORTANT INFORMATION:${NC}"
echo -e "${BLUE}- App will be available at:${NC} http://localhost:3000"
echo -e "${BLUE}- API diagnostic endpoint:${NC} http://localhost:3000/api/health"
echo -e "${BLUE}- Routing diagnostics:${NC} http://localhost:3000/api/serve-local"
echo
echo -e "${YELLOW}${BOLD}TROUBLESHOOTING:${NC}"
echo -e "${YELLOW}- If you see HTML instead of JSON at API endpoints, the routing is not working correctly${NC}"
echo -e "${YELLOW}- Check browser console for detailed error messages${NC}"
echo
echo -e "${GREEN}${BOLD}Server starting now...${NC}"
echo -e "${BLUE}Press Ctrl+C to stop the server${NC}"
echo -e "${BLUE}${BOLD}======================================================${NC}"

# Serve with proper configuration for API routing
# The -s flag enables SPA mode (Single Page Application) 
# The --config serve.json ensures API routes are handled correctly
serve -s build -l 3000 --config serve.json