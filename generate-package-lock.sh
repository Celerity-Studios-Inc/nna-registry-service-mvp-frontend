#!/bin/bash

# Script to generate package-lock.json in the backend repository

BACKEND_DIR="/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-backend"

# Check if directory exists
if [ ! -d "$BACKEND_DIR" ]; then
  echo "Backend directory not found at $BACKEND_DIR"
  exit 1
fi

# Navigate to the backend directory
echo "Navigating to $BACKEND_DIR..."
cd "$BACKEND_DIR"

# Install dependencies to generate package-lock.json
echo "Installing dependencies to generate package-lock.json..."
npm install

# Commit and push the package-lock.json file
echo "Committing and pushing package-lock.json..."
git add package-lock.json
git commit -m "Add package-lock.json for CI/CD"
git push origin main

echo "Package-lock.json has been generated and pushed to GitHub!"