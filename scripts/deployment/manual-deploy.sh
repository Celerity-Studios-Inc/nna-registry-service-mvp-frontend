#!/bin/bash
# Script to manually deploy the backend service directly to Google Cloud Run

BACKEND_DIR="/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-backend"
PROJECT_ID="revize-453014"
SERVICE_NAME="nna-registry-service"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
  echo "Backend directory not found at $BACKEND_DIR"
  exit 1
fi

# Navigate to backend directory
cd "$BACKEND_DIR" || exit 1

echo "Starting manual deployment process..."

# 1. Create a simple Dockerfile that just copies files
echo "Creating simplified Dockerfile..."
cat > Dockerfile << 'EOL'
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Copy package.json files
COPY package*.json ./

# Install dependencies
RUN npm install --production --legacy-peer-deps

# Copy source code
COPY . .

# Start the application
CMD ["node", "src/main.js"]
EOL

# 2. Build and tag the Docker image locally
echo "Building Docker image..."
docker build -t ${IMAGE_NAME}:latest .

# 3. Configure Docker to use Google Container Registry
echo "Configuring Docker for GCR..."
gcloud auth configure-docker

# 4. Push the image to Google Container Registry
echo "Pushing image to GCR..."
docker push ${IMAGE_NAME}:latest

# 5. Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME}:latest \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated

echo "Deployment completed successfully!"
echo "Your service should be accessible at: https://${SERVICE_NAME}-${REGION}.a.run.app"