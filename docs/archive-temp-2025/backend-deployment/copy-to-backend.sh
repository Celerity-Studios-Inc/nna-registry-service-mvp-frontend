#!/bin/bash
# Script to copy CI/CD files to the backend repository

# Set the path to your backend repository
BACKEND_REPO="../nna-registry-service-mvp-backend"

# Check if backend repository exists
if [ ! -d "$BACKEND_REPO" ]; then
  echo "Error: Backend repository not found at $BACKEND_REPO"
  echo "Please clone the backend repository first."
  exit 1
fi

# Create GitHub Actions workflow directory
mkdir -p "$BACKEND_REPO/.github/workflows"

# Copy CI/CD workflow file
cp ci-cd.yml "$BACKEND_REPO/.github/workflows/"
echo "✅ Copied CI/CD workflow file to $BACKEND_REPO/.github/workflows/"

# Copy Dockerfile
cp Dockerfile "$BACKEND_REPO/"
echo "✅ Copied Dockerfile to $BACKEND_REPO/"

# Copy setup guide
cp SETUP_GUIDE.md "$BACKEND_REPO/"
echo "✅ Copied setup guide to $BACKEND_REPO/"

echo "Done! Files have been copied to the backend repository."
echo "Next steps:"
echo "1. Navigate to the backend repository: cd $BACKEND_REPO"
echo "2. Commit and push the changes: git add .github/workflows/ci-cd.yml Dockerfile SETUP_GUIDE.md && git commit -m \"Set up GitHub Actions for GCP deployment\" && git push"
echo "3. Follow the remaining steps in SETUP_GUIDE.md"