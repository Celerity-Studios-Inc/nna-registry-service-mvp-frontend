#!/bin/bash
# Script to manually deploy the backend directly from your computer
# No GitHub Actions, no Docker required

BACKEND_DIR="/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-backend"
PROJECT_ID="revize-453014"
SERVICE_NAME="nna-registry-service"
REGION="us-central1"

echo "======================================"
echo "NNA Registry Service Manual Deployment"
echo "======================================"

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
  echo "Error: Backend directory not found at $BACKEND_DIR"
  exit 1
fi

# Navigate to backend directory
cd "$BACKEND_DIR" || exit 1

echo "Step 1: Login to Google Cloud"
echo "----------------------------"
echo "If a browser window doesn't open automatically, please copy the URL shown in the terminal"
echo "and open it manually in your browser."
echo ""
gcloud auth login

echo ""
echo "Step 2: Set the Google Cloud project"
echo "----------------------------------"
gcloud config set project "$PROJECT_ID"

echo ""
echo "Step 3: Deploy directly to Cloud Run"
echo "-----------------------------------"
echo "This will deploy your code directly to Google Cloud Run without building a Docker image first."
echo "Google Cloud will handle the build process for you."
echo ""

# Create a simple app.yaml file for direct deployment
cat > app.yaml << EOL
runtime: nodejs18
env: standard

env_variables:
  NODE_ENV: "production"
  PORT: "8080"

instance_class: F1
automatic_scaling:
  min_instances: 0
  max_instances: 10
EOL

echo "Created app.yaml configuration for deployment"

# Create a zip file of the project for direct upload
echo "Creating project archive for upload..."
zip -r backend.zip . -x "node_modules/*" ".git/*"

# Deploy using gcloud
echo "Deploying directly to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated

echo ""
echo "Deployment completed!"
echo "Your service should be accessible at: https://$SERVICE_NAME-$REGION.a.run.app"
echo ""
echo "If you encounter any issues, please check the logs at:"
echo "https://console.cloud.google.com/logs/viewer?project=$PROJECT_ID&resource=cloud_run_revision%2Fservice_name%2F$SERVICE_NAME"