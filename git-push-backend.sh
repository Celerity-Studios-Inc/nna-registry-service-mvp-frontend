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

# Check if it's already a git repository
if [ -d ".git" ]; then
  echo "Git repository already initialized"
else
  echo "Initializing git repository..."
  git init
fi

# Add all files
echo "Adding files to git..."
git add .

# Create initial commit
echo "Creating initial commit..."
git commit -m "Add subcategory normalization fix for NNA Registry Service backend" -m "This implementation fixes the issue where S.POP subcategories (LGF, LGM, DIV, IDF) were being normalized to Base (BAS) instead of preserving the original selection."

# Check if remote exists
if git remote -v | grep -q 'origin'; then
  echo "Remote 'origin' already exists"
else
  echo "Adding remote 'origin'..."
  git remote add origin https://github.com/EqualsAjayMadhok/nna-registry-service-mvp-backend.git
fi

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

echo "Repository setup complete!"