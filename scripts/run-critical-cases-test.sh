#!/bin/bash

# Script to run critical test cases for taxonomy refactoring
# This script runs the Node.js tests and then opens the browser tests

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}Running Critical Taxonomy Test Cases${NC}"
echo -e "${BLUE}===============================================${NC}"

# Make script executable
chmod +x ./scripts/test-critical-cases.js

echo -e "${CYAN}Running Node.js tests...${NC}"
node ./scripts/test-critical-cases.js

# Check if the test passed
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Node.js tests completed successfully!${NC}"
else
  echo -e "${RED}Node.js tests encountered errors. Check the output above.${NC}"
fi

echo -e "${YELLOW}Opening browser test page...${NC}"

# Open the browser test page
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  open http://localhost:3000/test-critical-cases.html
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  xdg-open http://localhost:3000/test-critical-cases.html
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
  # Windows
  start http://localhost:3000/test-critical-cases.html
else
  echo -e "${YELLOW}Please open this URL in your browser:${NC}"
  echo -e "http://localhost:3000/test-critical-cases.html"
fi

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}Test Script Execution Complete${NC}"
echo -e "${BLUE}===============================================${NC}"
echo -e "${YELLOW}NOTE: Make sure the development server is running (npm start)${NC}"
echo -e "${YELLOW}before opening the browser tests.${NC}"