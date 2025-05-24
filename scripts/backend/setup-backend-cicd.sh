#!/bin/bash

# Script to set up CI/CD for the NNA Registry Backend

BACKEND_DIR="/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-backend"

# Check if directory exists
if [ ! -d "$BACKEND_DIR" ]; then
  echo "Backend directory not found at $BACKEND_DIR"
  exit 1
fi

# Create the necessary directories
echo "Creating GitHub Actions workflow directory..."
mkdir -p "$BACKEND_DIR/.github/workflows"

# Copy the CI/CD workflow file
echo "Copying CI/CD workflow file..."
cp ./gcp-deployment-files/.github/workflows/ci-cd.yml "$BACKEND_DIR/.github/workflows/ci-cd.yml"

# Copy the Dockerfile if it doesn't exist
if [ ! -f "$BACKEND_DIR/Dockerfile" ]; then
  echo "Copying Dockerfile..."
  cp ./gcp-deployment-files/Dockerfile "$BACKEND_DIR/Dockerfile"
fi

echo "CI/CD setup complete!"
echo ""
echo "Next steps:"
echo "1. Push these changes to your main branch"
echo "2. Make sure the GCP_SA_KEY secret is set in your GitHub repository"
echo "3. Monitor the GitHub Actions workflow to see the deployment progress"