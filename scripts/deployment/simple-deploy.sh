#!/bin/bash
# Simple script to deploy the backend service to Google Cloud Run

SERVICE_NAME="nna-registry-service"
REGION="us-central1"
IMAGE_NAME="gcr.io/revize-453014/nna-registry-service:latest"

echo "Starting simple deployment process..."

# 1. Login to Google Cloud
echo "Logging in to Google Cloud..."
gcloud auth login

# 2. Set the project
echo "Setting the project..."
gcloud config set project revize-453014

# 3. Deploy to Cloud Run using an existing image
echo "Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated

echo "Deployment completed! Your service should be accessible at:"
echo "https://${SERVICE_NAME}-${REGION}.a.run.app"