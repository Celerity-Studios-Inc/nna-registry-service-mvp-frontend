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

# Check if remote exists
if git remote -v | grep -q 'origin'; then
  echo "Remote 'origin' already exists"
else
  echo "Adding remote 'origin'..."
  git remote add origin https://github.com/EqualsAjayMadhok/nna-registry-service-mvp-backend.git
fi

# Add all files to staging
echo "Adding files to git..."
git add .

# Create initial commit if needed
if git log -n 1 >/dev/null 2>&1; then
  echo "Repository already has commits"
else
  echo "Creating initial commit..."
  git commit -m "Add subcategory normalization fix for NNA Registry Service backend" -m "This implementation fixes the issue where S.POP subcategories (LGF, LGM, DIV, IDF) were being normalized to Base (BAS) instead of preserving the original selection."
fi

# Force push to GitHub
echo "Force pushing to GitHub..."
echo "This will overwrite any existing code in the repository."
read -p "Are you sure you want to continue? (y/n): " confirm
if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
  git push -f origin main
  echo "Repository setup complete!"
else
  echo "Force push cancelled."
  echo "To push your changes without force, you'll need to pull first:"
  echo "cd $BACKEND_DIR && git pull origin main --allow-unrelated-histories"
  echo "Then resolve any conflicts and push again."
fi