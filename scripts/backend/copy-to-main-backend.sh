#!/bin/bash
# Script to copy deployment files to main backend directory

# Exit on any error
set -e

# Set colors for better output readability
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BACKEND_SOURCE="/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend/backend-build/nna-registry-service"
BACKEND_TARGET="/Users/ajaymadhok/nna-registry-workspace/nna-registry-service"

echo -e "${YELLOW}Starting copy of deployment files to main backend directory${NC}"
echo -e "${BLUE}Source: ${BACKEND_SOURCE}${NC}"
echo -e "${BLUE}Target: ${BACKEND_TARGET}${NC}"

# Check if source directory exists
if [ ! -d "$BACKEND_SOURCE" ]; then
  echo -e "${RED}Error: Source directory does not exist!${NC}"
  exit 1
fi

# Check if target directory exists
if [ ! -d "$BACKEND_TARGET" ]; then
  echo -e "${RED}Error: Target directory does not exist!${NC}"
  exit 1
fi

# Copy deployment scripts
echo -e "${BLUE}Copying deployment scripts...${NC}"
cp "$BACKEND_SOURCE/deploy-updated-backend.sh" "$BACKEND_TARGET/"
cp "$BACKEND_SOURCE/test-subcategory-fix.sh" "$BACKEND_TARGET/"
cp "$BACKEND_SOURCE/SUBCATEGORY_FIX_TEST_PLAN.md" "$BACKEND_TARGET/"
cp "$BACKEND_SOURCE/SUBCATEGORY_NORMALIZATION_FIX.md" "$BACKEND_TARGET/" 2>/dev/null || echo "No fix documentation to copy"

# Make scripts executable
echo -e "${BLUE}Making scripts executable...${NC}"
chmod +x "$BACKEND_TARGET/deploy-updated-backend.sh"
chmod +x "$BACKEND_TARGET/test-subcategory-fix.sh"

# Create test image if needed
echo -e "${BLUE}Creating test image for asset testing...${NC}"
cd "$BACKEND_TARGET"
if [ ! -f "test-image.jpg" ]; then
  # Use Node.js to create a test image
  node -e "
  const fs = require('fs');
  // Create a small 1x1 pixel JPG
  const buffer = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 
    0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
    0xff, 0xff, 0xff, 0xff, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00, 
    0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x00, 0x01, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0x7f, 
    0xff, 0xd9
  ]);
  fs.writeFileSync('test-image.jpg', buffer);
  console.log('Created test-image.jpg');
  " || echo "Could not create test image, please create it manually"
fi

echo -e "${GREEN}Files copied successfully to the main backend directory${NC}"
echo -e "${YELLOW}Instructions:${NC}"
echo -e "1. Navigate to the main backend directory: ${BLUE}cd $BACKEND_TARGET${NC}"
echo -e "2. Run the deployment script: ${BLUE}./deploy-updated-backend.sh${NC}"
echo -e "3. After deployment, run the test script: ${BLUE}./test-subcategory-fix.sh${NC}"