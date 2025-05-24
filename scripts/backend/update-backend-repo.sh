#!/bin/bash

# Script to copy files from the working branch to the backend repository

BACKEND_DIR="/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-backend"
TEMP_DIR="/tmp/nna-working-branch"
SCRIPT_DIR="$(pwd)"

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
  echo "Backend directory not found at $BACKEND_DIR"
  exit 1
fi

# Navigate to backend directory
cd "$BACKEND_DIR" || exit 1

# Ensure clean state
git stash

# Create necessary directories
mkdir -p .github/workflows

# Copy CI/CD workflows
cp "$TEMP_DIR/.github/workflows/ci-cd.yml" .github/workflows/

# Copy Dockerfile
cp "$TEMP_DIR/Dockerfile" .

# Copy package files if they don't already have proper content
if [ ! -f package-lock.json ]; then
  echo "Copying package-lock.json..."
  cp "$TEMP_DIR/package-lock.json" .
fi

# Add and commit changes
git add .github/workflows/ci-cd.yml Dockerfile package-lock.json
git commit -m "Copy CI/CD configuration from working branch"

# Push changes
git push origin main

# Return to original directory
cd "$SCRIPT_DIR" || exit 1

echo "Backend repository has been updated with CI/CD configuration from the working branch!"