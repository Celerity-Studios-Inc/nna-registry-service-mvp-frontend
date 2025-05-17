#!/bin/bash

# Absolute path to the backend directory
BACKEND_DIR="/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-backend"

# Check if directory exists
if [ ! -d "$BACKEND_DIR" ]; then
  echo "Backend directory not found at $BACKEND_DIR"
  exit 1
fi

# Navigate to the backend directory
echo "Navigating to $BACKEND_DIR..."
cd "$BACKEND_DIR"

# Check if it's a git repository
if [ ! -d ".git" ]; then
  echo "Not a git repository. Please run git-push-backend.sh first."
  exit 1
fi

# Pull remote changes
echo "Pulling remote changes and allowing unrelated histories..."
git pull origin main --allow-unrelated-histories

# Check for merge conflicts
if [ $? -ne 0 ]; then
  echo "Merge conflicts detected. Please resolve them manually."
  echo "Once resolved, run: git add . && git commit -m 'Merge remote changes' && git push origin main"
  exit 1
fi

# Push to GitHub
echo "Pushing to GitHub..."
git push origin main

echo "Repository setup complete!"