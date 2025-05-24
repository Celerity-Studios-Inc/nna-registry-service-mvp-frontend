#!/bin/bash
# Script to clone the stable-backend-new-key branch to the backend directory

# Define paths
WORKSPACE_DIR="/Users/ajaymadhok/nna-registry-workspace"
BACKEND_DIR="$WORKSPACE_DIR/nna-registry-service-mvp-backend"
REFERENCE_REPO="https://github.com/EqualsAjayMadhok/nna-registry-service.git"
REFERENCE_BRANCH="stable-backend-new-key"

echo "==================================================="
echo "Cloning working reference implementation to backend"
echo "==================================================="

# Remove existing backend directory if it exists
if [ -d "$BACKEND_DIR" ]; then
  echo "Removing existing backend directory..."
  rm -rf "$BACKEND_DIR"
fi

# Clone the reference repository
echo "Cloning reference repository ($REFERENCE_BRANCH branch)..."
git clone -b "$REFERENCE_BRANCH" "$REFERENCE_REPO" "$BACKEND_DIR"

# Verify the clone was successful
if [ $? -eq 0 ]; then
  echo "Successfully cloned reference implementation!"
  echo "Backend code is now available at: $BACKEND_DIR"
  
  # List key files
  echo ""
  echo "Key files in the backend directory:"
  ls -la "$BACKEND_DIR"
  
  echo ""
  echo "Workflow files:"
  ls -la "$BACKEND_DIR/.github/workflows" 2>/dev/null || echo "No workflow files found."
  
  echo ""
  echo "Next steps:"
  echo "1. Navigate to the backend directory: cd $BACKEND_DIR"
  echo "2. Set up the GitHub repository with the proper secrets"
  echo "3. Push the code to trigger the CI/CD deployment"
else
  echo "Failed to clone the repository. Please check the error messages above."
fi