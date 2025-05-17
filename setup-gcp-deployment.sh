#!/bin/bash

# Script to set up GCP deployment files for the NNA Registry Backend

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
cp ./gcp-deployment-files/ci-cd.yml "$BACKEND_DIR/.github/workflows/ci-cd.yml"

# Copy the Dockerfile
echo "Copying Dockerfile..."
cp ./gcp-deployment-files/Dockerfile "$BACKEND_DIR/Dockerfile"

# Copy the NestJS CLI configuration if it doesn't exist
if [ ! -f "$BACKEND_DIR/nest-cli.json" ]; then
  echo "Copying NestJS CLI configuration..."
  cp ./gcp-deployment-files/nest-cli.json "$BACKEND_DIR/nest-cli.json"
fi

# Copy the deployment documentation
echo "Copying deployment documentation..."
cp ./gcp-deployment-files/setup-gcp-deployment.md "$BACKEND_DIR/SETUP_GCP_DEPLOYMENT.md"

echo "GCP deployment files setup complete!"
echo ""
echo "Next steps:"
echo "1. Create a GCP project and service account as described in SETUP_GCP_DEPLOYMENT.md"
echo "2. Add the required GitHub secrets to your repository"
echo "3. Push these changes to your main branch"
echo "4. Monitor the GitHub Actions workflow to see the deployment progress"