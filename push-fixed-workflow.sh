#!/bin/bash
# Script to push the fixed workflow file to the backend repository

BACKEND_DIR="/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-backend"
SCRIPT_DIR="$(pwd)"

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
  echo "Backend directory not found at $BACKEND_DIR"
  exit 1
fi

# Create .github/workflows directory if it doesn't exist
mkdir -p "$BACKEND_DIR/.github/workflows"

# Copy the fixed workflow file to the backend repo
cp "$SCRIPT_DIR/fix-workflow.yml" "$BACKEND_DIR/.github/workflows/ci-cd.yml"

# Change to backend directory
cd "$BACKEND_DIR" || exit 1

# Commit and push changes
git add .github/workflows/ci-cd.yml
git commit -m "Fix CI/CD workflow to use --legacy-peer-deps and improved deployment"
git push origin main

echo "Fixed CI/CD workflow has been pushed to the backend repository"

# Return to original directory
cd "$SCRIPT_DIR" || exit 1