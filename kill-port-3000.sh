#!/bin/bash
# Script to find and kill processes using port 3000

# Set text colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Finding processes using port 3000...${NC}"

# Find processes using port 3000
PROCESSES=$(lsof -ti:3000)

if [ -z "$PROCESSES" ]; then
  echo -e "${GREEN}No processes found using port 3000${NC}"
else
  echo -e "${YELLOW}Found the following processes using port 3000:${NC}"
  lsof -i:3000
  
  echo -e "${YELLOW}Killing processes...${NC}"
  for PID in $PROCESSES; do
    echo -e "${BLUE}Killing process $PID${NC}"
    kill -9 $PID
  done
  
  echo -e "${GREEN}All processes using port 3000 have been terminated${NC}"
fi

echo -e "${GREEN}Port 3000 is now available${NC}"