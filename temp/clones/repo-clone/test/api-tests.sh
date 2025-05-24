#!/bin/bash
# Automated API test script for NNA Registry Service
# This script tests all major API endpoints

# Colors for better output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000"
ADMIN_TOKEN=""
USER_TOKEN=""

# Test counter
PASSED=0
FAILED=0
TOTAL=0

# Function to run a test
run_test() {
  local name=$1
  local result=$2
  local expected=$3
  local description=$4
  
  TOTAL=$((TOTAL + 1))
  
  echo -e "\n${YELLOW}Test $TOTAL: $description${NC}"
  
  if [[ "$result" == *"$expected"* ]]; then
    echo -e "${GREEN}✓ PASSED: $name${NC}"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}✗ FAILED: $name${NC}"
    echo -e "Expected to contain: '$expected'"
    echo -e "Got: $result"
    FAILED=$((FAILED + 1))
  fi
}

# Function to clear test data
clear_test_data() {
  echo -e "\n${YELLOW}Cleaning up test data...${NC}"
  # Implement cleanup logic here if needed
}

echo -e "${YELLOW}Starting API tests for NNA Registry Service${NC}"
echo -e "${YELLOW}=====================================${NC}"

# 1. Authentication Tests
echo -e "\n${YELLOW}AUTHENTICATION TESTS${NC}"
echo -e "${YELLOW}------------------${NC}"

# 1.1 Register a user
echo "Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}')

run_test "User Registration" "$REGISTER_RESPONSE" "token" "Register a new user and get JWT token"

# Extract user token
USER_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

# 1.2 Register an admin (for admin-only endpoints)
echo "Testing admin registration..."
REGISTER_ADMIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}')

ADMIN_TOKEN=$(echo $REGISTER_ADMIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

# Make the user an admin (requires manual DB update in a real scenario)
# For testing purpose, we simulate this already being done

# 1.3 Test login
echo "Testing user login..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}')

run_test "User Login" "$LOGIN_RESPONSE" "token" "Login with valid credentials and get JWT token"

# 1.4 Test login with wrong password
echo "Testing login with wrong password..."
INVALID_LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrongpassword"}')

run_test "Invalid Login" "$INVALID_LOGIN_RESPONSE" "Invalid credentials" "Attempt login with invalid credentials"

# 1.5 Test profile retrieval
echo "Testing profile retrieval..."
PROFILE_RESPONSE=$(curl -s -X GET $BASE_URL/auth/profile \
  -H "Authorization: Bearer $USER_TOKEN")

run_test "Profile Retrieval" "$PROFILE_RESPONSE" "email" "Get user profile with valid token"

# 2. Asset Management Tests
echo -e "\n${YELLOW}ASSET MANAGEMENT TESTS${NC}"
echo -e "${YELLOW}----------------------${NC}"

# 2.1 Create asset (requires file upload - using a placeholder file)
echo "Creating test file..."
echo "Test audio content" > test-audio.mp3

echo "Testing asset creation..."
CREATE_ASSET_RESPONSE=$(curl -s -X POST $BASE_URL/assets \
  -H "Authorization: Bearer $USER_TOKEN" \
  -F "file=@test-audio.mp3" \
  -F 'data={"layer":"G","category":"POP","subcategory":"TSW","source":"Test","tags":["test"],"description":"Test asset"};type=application/json')

run_test "Create Asset" "$CREATE_ASSET_RESPONSE" "nna_address" "Create a new asset with valid data"

# Extract asset name for later tests
ASSET_NAME=$(echo $CREATE_ASSET_RESPONSE | grep -o '"name":"[^"]*' | sed 's/"name":"//')

# 2.2 Get asset by name
echo "Testing get asset by name..."
GET_ASSET_RESPONSE=$(curl -s -X GET "$BASE_URL/assets/$ASSET_NAME" \
  -H "Authorization: Bearer $USER_TOKEN")

run_test "Get Asset" "$GET_ASSET_RESPONSE" "$ASSET_NAME" "Get asset by name"

# 2.3 Search assets
echo "Testing asset search..."
SEARCH_ASSET_RESPONSE=$(curl -s -X GET "$BASE_URL/assets?layer=G&category=POP" \
  -H "Authorization: Bearer $USER_TOKEN")

run_test "Search Assets" "$SEARCH_ASSET_RESPONSE" "assets" "Search assets by criteria"

# 2.4 Update asset
echo "Testing asset update..."
UPDATE_ASSET_RESPONSE=$(curl -s -X PUT "$BASE_URL/assets/$ASSET_NAME" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"Updated test asset","tags":["test","updated"]}')

run_test "Update Asset" "$UPDATE_ASSET_RESPONSE" "Updated test asset" "Update an existing asset"

# 2.5 Curate asset (admin only)
echo "Testing asset curation..."
CURATE_ASSET_RESPONSE=$(curl -s -X PUT "$BASE_URL/assets/$ASSET_NAME/curate" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

run_test "Curate Asset" "$CURATE_ASSET_RESPONSE" "$ASSET_NAME" "Curate an asset (admin only)"

# 3. Taxonomy Tests
echo -e "\n${YELLOW}TAXONOMY TESTS${NC}"
echo -e "${YELLOW}-------------${NC}"

# 3.1 Validate taxonomy
echo "Testing taxonomy validation..."
VALIDATE_TAXONOMY_RESPONSE=$(curl -s -X POST $BASE_URL/taxonomy/validate \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"layer":"G","category":"POP","subcategory":"TSW"}')

run_test "Validate Taxonomy" "$VALIDATE_TAXONOMY_RESPONSE" "valid" "Validate a taxonomy combination"

# 3.2 Get taxonomy layers
echo "Testing get taxonomy layers..."
GET_LAYERS_RESPONSE=$(curl -s -X GET $BASE_URL/taxonomy/layers \
  -H "Authorization: Bearer $USER_TOKEN")

run_test "Get Taxonomy Layers" "$GET_LAYERS_RESPONSE" "layers" "Get all available taxonomy layers"

# 4. Storage Tests (simplified since we can't test actual GCP storage)
echo -e "\n${YELLOW}STORAGE TESTS${NC}"
echo -e "${YELLOW}------------${NC}"

# 4.1 Test signed URL generation (if implemented)
echo "Testing signed URL generation..."
SIGNED_URL_RESPONSE=$(curl -s -X GET "$BASE_URL/storage/signed-url?fileName=test.mp3&contentType=audio/mp3" \
  -H "Authorization: Bearer $USER_TOKEN")

run_test "Generate Signed URL" "$SIGNED_URL_RESPONSE" "url" "Generate a signed URL for direct upload"

# 5. Cleanup
echo "Testing asset deletion..."
DELETE_ASSET_RESPONSE=$(curl -s -X DELETE "$BASE_URL/assets/$ASSET_NAME" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

run_test "Delete Asset" "$DELETE_ASSET_RESPONSE" "deleted" "Delete an asset"

# 6. Check Swagger Documentation
echo -e "\n${YELLOW}SWAGGER DOCUMENTATION TEST${NC}"
echo -e "${YELLOW}-------------------------${NC}"

echo "Testing Swagger documentation access..."
SWAGGER_RESPONSE=$(curl -s -X GET $BASE_URL/api/docs)

run_test "Swagger Documentation" "$SWAGGER_RESPONSE" "swagger" "Access Swagger documentation"

# Clean up test files
rm -f test-audio.mp3

# Summary
echo -e "\n${YELLOW}TEST SUMMARY${NC}"
echo -e "${YELLOW}------------${NC}"
echo -e "Total tests: $TOTAL"
echo -e "${GREEN}Tests passed: $PASSED${NC}"
echo -e "${RED}Tests failed: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
  echo -e "\n${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "\n${RED}Some tests failed!${NC}"
  exit 1
fi