#!/bin/bash
# Script to clean up unnecessary backend build files in the frontend repo

# Exit on any error
set -e

# Set colors for better output readability
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BACKEND_BUILD_DIR="/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend/backend-build"

echo -e "${YELLOW}Starting cleanup of backend build files${NC}"
echo -e "${BLUE}Target: ${BACKEND_BUILD_DIR}${NC}"

# Check if target directory exists
if [ ! -d "$BACKEND_BUILD_DIR" ]; then
  echo -e "${RED}Error: Backend build directory does not exist!${NC}"
  exit 1
fi

# Ask for confirmation
echo -e "${YELLOW}WARNING: This will remove the entire backend-build directory.${NC}"
echo -e "${YELLOW}Make sure you have already copied all necessary files to the main backend directory.${NC}"
read -p "Do you want to proceed? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${BLUE}Removing backend build directory...${NC}"
  rm -rf "$BACKEND_BUILD_DIR"
  echo -e "${GREEN}Cleanup completed successfully${NC}"
else
  echo -e "${BLUE}Cleanup aborted${NC}"
fi

# Check for other unnecessary directories that might need cleaning
echo -e "\n${BLUE}Checking for other unnecessary directories...${NC}"
DIRS_TO_CHECK=("fresh-clone" "repo-clone" "backend-deployment")

for dir in "${DIRS_TO_CHECK[@]}"; do
  FULL_PATH="/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend/$dir"
  if [ -d "$FULL_PATH" ]; then
    echo -e "${YELLOW}Found potentially unnecessary directory: $dir${NC}"
    echo -e "${YELLOW}To remove it, run: rm -rf $FULL_PATH${NC}"
  fi
done

echo -e "\n${GREEN}Cleanup check completed${NC}"
echo -e "${YELLOW}Instructions:${NC}"
echo -e "1. Review any additional directories that may need cleanup"
echo -e "2. Proceed with the deployment in the main backend directory"