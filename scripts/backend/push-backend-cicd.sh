#!/bin/bash

# Script to push CI/CD setup to GitHub repository

BACKEND_DIR="/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-backend"

# Check if directory exists
if [ ! -d "$BACKEND_DIR" ]; then
  echo "Backend directory not found at $BACKEND_DIR"
  exit 1
fi

# Run the setup script first
./setup-backend-cicd.sh

# Navigate to the backend directory
echo "Navigating to $BACKEND_DIR..."
cd "$BACKEND_DIR"

# Add the files to git
echo "Adding files to git..."
git add .github/workflows/ci-cd.yml Dockerfile

# Commit the changes
echo "Committing changes..."
git commit -m "Add CI/CD setup for GCP deployment"

# Push to GitHub
echo "Pushing to GitHub..."
git push origin main

echo "Changes pushed to GitHub!"
echo ""
echo "The CI/CD workflow should be triggered automatically."
echo "Monitor the deployment at: https://github.com/EqualsAjayMadhok/nna-registry-service-mvp-backend/actions"