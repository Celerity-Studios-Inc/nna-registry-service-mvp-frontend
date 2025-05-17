#!/bin/bash

# Script to check GCP Cloud Run deployment status and URL
# This helps verify the backend deployment before connecting the frontend

# Set your GCP project ID
PROJECT_ID="nna-registry-service"
SERVICE_NAME="nna-registry-service"
REGION="us-central1"

echo "=== NNA Registry Service GCP Deployment Check ==="
echo "This script will check your GCP Cloud Run deployment status"
echo "Project ID: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed or not in your PATH."
    echo "Please install the Google Cloud SDK from: https://cloud.google.com/sdk/docs/install"
    echo "Or make sure it's in your PATH."
    exit 1
fi

# Check if the user is authenticated with gcloud
echo "Checking GCP authentication..."
ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null)
if [ -z "$ACCOUNT" ]; then
    echo "❌ Not authenticated with GCP. Please run: gcloud auth login"
    exit 1
else
    echo "✅ Authenticated as: $ACCOUNT"
fi

# Check if the project exists and is accessible
echo "Checking project access..."
if ! gcloud projects describe "$PROJECT_ID" &> /dev/null; then
    echo "❌ Project $PROJECT_ID not found or not accessible."
    echo "Please check the project ID and your permissions."
    exit 1
else
    echo "✅ Project $PROJECT_ID is accessible"
fi

# Set the project as active
gcloud config set project "$PROJECT_ID"

# Check if the Cloud Run service exists
echo "Checking Cloud Run service..."
SERVICE_INFO=$(gcloud run services describe "$SERVICE_NAME" --region="$REGION" --format="yaml" 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "❌ Cloud Run service $SERVICE_NAME not found in region $REGION."
    echo "Available services:"
    gcloud run services list --platform managed
    exit 1
fi

# Get the service URL
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region="$REGION" --format="value(status.url)" 2>/dev/null)
echo "✅ Cloud Run service found: $SERVICE_URL"

# Check if the service is publicly accessible
echo "Checking service accessibility..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL" 2>/dev/null)
if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 404 ] || [ "$HTTP_STATUS" -eq 401 ]; then
    echo "✅ Service is accessible (HTTP status: $HTTP_STATUS)"
else
    echo "⚠️ Service may not be publicly accessible (HTTP status: $HTTP_STATUS)"
fi

# Check Swagger documentation
echo "Checking API documentation..."
SWAGGER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL/api/docs" 2>/dev/null)
if [ "$SWAGGER_STATUS" -eq 200 ]; then
    echo "✅ Swagger documentation is available at: $SERVICE_URL/api/docs"
else
    echo "⚠️ Swagger documentation not available (HTTP status: $SWAGGER_STATUS)"
fi

echo ""
echo "=== Frontend Configuration ==="
echo "To connect your frontend to this backend, update your .env or vercel.json with:"
echo "REACT_APP_REAL_API_URL=$SERVICE_URL/api"
echo ""
echo "Then update your Vercel deployment with these environment variables."
echo "You can toggle between mock and real data using the API configuration in the app."