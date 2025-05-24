#!/bin/bash
# Script for very simple backend deployment with minimal Dockerfile

BACKEND_DIR="/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-backend"
PROJECT_ID="revize-453014"
SERVICE_NAME="nna-registry-service"
REGION="us-central1"

echo "====================================="
echo "Simple Backend Deployment"
echo "====================================="

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
  echo "Error: Backend directory not found at $BACKEND_DIR"
  exit 1
fi

# Navigate to backend directory
cd "$BACKEND_DIR" || exit 1

echo "Step 1: Creating a very simple Dockerfile"
echo "----------------------------------------"

# Create a super simple Dockerfile that just copies files and runs npm start
cat > Dockerfile << 'EOL'
FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy all files
COPY . ./

# Expose the port
EXPOSE 8080

# Set environment variables
ENV PORT=8080
ENV NODE_ENV=production

# Start the app
CMD ["node", "src/main.js"]
EOL

echo "Created a simple Dockerfile"

echo ""
echo "Step 2: Login to Google Cloud"
echo "----------------------------"
gcloud auth login

echo ""
echo "Step 3: Set the Google Cloud project"
echo "-----------------------------------"
gcloud config set project "$PROJECT_ID"

echo ""
echo "Step 4: Build and Deploy"
echo "-----------------------"
echo "Building and deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8080 \
  --timeout 300s

echo ""
echo "Deployment completed!"
echo "Your service should be accessible at: https://$SERVICE_NAME-$REGION.a.run.app"