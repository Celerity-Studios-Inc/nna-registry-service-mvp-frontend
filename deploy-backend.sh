#!/bin/bash
# Script to deploy the backend with required changes

BACKEND_DIR="/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-backend"

# Navigate to backend directory
cd "$BACKEND_DIR" || exit 1

# Set MongoDB connection in environment
echo "Setting up MongoDB connection..."
cat > .env << 'EOL'
MONGODB_URI=mongodb+srv://registryservice.xhmyito.mongodb.net/
PORT=3000
NODE_ENV=development
EOL

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building backend application..."
npm run build

# Deploy to Google Cloud Run
echo "Deploying to Google Cloud Run..."
gcloud run deploy nna-registry-service \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

echo "Deployment completed. Service should be available at:"
echo "https://nna-registry-service-us-central1.a.run.app"