#!/bin/bash
# Script to deploy using an existing working image from the reference repository

SERVICE_NAME="nna-registry-service"
REGION="us-central1"
PROJECT_ID="revize-453014"

echo "Starting deployment with reference image..."

# 1. List available images
echo "Listing available images in GCR..."
gcloud container images list-tags gcr.io/${PROJECT_ID}/nna-registry-service

# Prompt for image tag to use
echo ""
echo "Please enter the tag from the list above to deploy (e.g., latest, v1, etc.):"
read IMAGE_TAG

# Validate input
if [ -z "$IMAGE_TAG" ]; then
  echo "No tag provided. Using 'latest' as default."
  IMAGE_TAG="latest"
fi

IMAGE_NAME="gcr.io/${PROJECT_ID}/nna-registry-service:${IMAGE_TAG}"

echo "Will deploy image: ${IMAGE_NAME}"
echo "Continue? (y/n)"
read CONFIRM

if [ "$CONFIRM" != "y" ]; then
  echo "Deployment cancelled."
  exit 1
fi

# 2. Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --port 8080 \
  --cpu 1 \
  --memory 512Mi \
  --timeout 300 \
  --max-instances 10

echo "Deployment completed!"
echo "Your service should be accessible at:"
echo "https://${SERVICE_NAME}-${REGION}.a.run.app"