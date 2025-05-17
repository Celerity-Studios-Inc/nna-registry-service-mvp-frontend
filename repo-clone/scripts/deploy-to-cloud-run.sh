#!/bin/bash
# Script to deploy NNA Registry Service to Google Cloud Run

# Exit on any error
set -e

# Set text colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}NNA Registry Service - Google Cloud Run Deployment${NC}"
echo -e "${YELLOW}=================================================${NC}\n"

# Check if Google Cloud SDK is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: Google Cloud SDK is not installed.${NC}"
    echo -e "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed.${NC}"
    echo -e "Please install it before proceeding."
    exit 1
fi

# Authenticate with Google Cloud
echo -e "${BLUE}Authenticating with Google Cloud...${NC}"
gcloud auth login
gcloud auth configure-docker --quiet

# Get or set project ID
echo -e "\n${BLUE}Setting up GCP project...${NC}"
read -p "Enter your GCP project ID (or press enter to create a new one): " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    echo -e "${BLUE}Creating a new GCP project...${NC}"
    PROJECT_ID="nna-registry-service-$(date +%Y%m%d%H%M%S)"
    gcloud projects create $PROJECT_ID --name="NNA Registry Service"
    echo -e "${GREEN}Created project: $PROJECT_ID${NC}"
fi

# Set the current project
gcloud config set project $PROJECT_ID
echo -e "${GREEN}Using project: $PROJECT_ID${NC}"

# Enable required APIs
echo -e "\n${BLUE}Enabling required GCP APIs...${NC}"
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.gcr.io
gcloud services enable cloudbuild.googleapis.com
gcloud services enable storage-api.googleapis.com
gcloud services enable secretmanager.googleapis.com
echo -e "${GREEN}Enabled required APIs${NC}"

# Create GCP Storage bucket
echo -e "\n${BLUE}Creating Cloud Storage bucket...${NC}"
BUCKET_NAME="nna-registry-assets-$PROJECT_ID"
gcloud storage buckets create gs://$BUCKET_NAME --location=us-central1
echo -e "${GREEN}Created bucket: $BUCKET_NAME${NC}"

# Create service account for storage
echo -e "\n${BLUE}Creating service account for storage access...${NC}"
SERVICE_ACCOUNT_NAME="nna-storage-service-account"
SERVICE_ACCOUNT_EMAIL="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"

# Check if service account already exists
if gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL &>/dev/null; then
    echo -e "${GREEN}Service account already exists: $SERVICE_ACCOUNT_EMAIL${NC}"
else
    gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
        --display-name="NNA Registry Storage Service Account"
    echo -e "${GREEN}Created service account: $SERVICE_ACCOUNT_EMAIL${NC}"
fi

# Grant storage permissions
echo -e "\n${BLUE}Granting storage permissions...${NC}"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/storage.objectAdmin"
echo -e "${GREEN}Granted storage permissions${NC}"

# Create service account key
echo -e "\n${BLUE}Creating service account key...${NC}"
KEY_FILE="gcp-credentials.json"
gcloud iam service-accounts keys create $KEY_FILE \
    --iam-account=$SERVICE_ACCOUNT_EMAIL
echo -e "${GREEN}Created service account key: $KEY_FILE${NC}"

# Get MongoDB connection string
echo -e "\n${BLUE}Setting up environment variables...${NC}"
read -p "Enter your MongoDB connection string: " MONGODB_URI
read -p "Enter a JWT secret key (or press enter to generate one): " JWT_SECRET

if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
    echo -e "${GREEN}Generated JWT secret${NC}"
fi

read -p "Enter your Sentry DSN (or press enter to skip): " SENTRY_DSN

# Create secrets in Secret Manager
echo -e "\n${BLUE}Creating secrets in Secret Manager...${NC}"
ENV_CONTENT="NODE_ENV=production
PORT=8080
MONGODB_URI=$MONGODB_URI
JWT_SECRET=$JWT_SECRET
GCP_PROJECT_ID=$PROJECT_ID
GCP_BUCKET_NAME=$BUCKET_NAME
GOOGLE_APPLICATION_CREDENTIALS=/app/gcp-credentials.json"

if [ ! -z "$SENTRY_DSN" ]; then
    ENV_CONTENT="${ENV_CONTENT}
SENTRY_DSN=$SENTRY_DSN"
fi

echo "$ENV_CONTENT" > .env.production

# Create the secret
if gcloud secrets describe nna-registry-env &>/dev/null; then
    gcloud secrets versions add nna-registry-env --data-file=.env.production
    echo -e "${GREEN}Updated secret: nna-registry-env${NC}"
else
    gcloud secrets create nna-registry-env --data-file=.env.production
    echo -e "${GREEN}Created secret: nna-registry-env${NC}"
fi

rm .env.production

# Build and push Docker image
echo -e "\n${BLUE}Building and pushing Docker image...${NC}"
IMAGE_NAME="gcr.io/$PROJECT_ID/nna-registry-service:v1"

docker build -t $IMAGE_NAME .
docker push $IMAGE_NAME
echo -e "${GREEN}Built and pushed image: $IMAGE_NAME${NC}"

# Deploy to Cloud Run
echo -e "\n${BLUE}Deploying to Cloud Run...${NC}"
gcloud run deploy nna-registry-service \
  --image=$IMAGE_NAME \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --service-account=$SERVICE_ACCOUNT_EMAIL \
  --set-secrets="/.env=nna-registry-env:latest"

# Get the service URL
SERVICE_URL=$(gcloud run services describe nna-registry-service --platform=managed --region=us-central1 --format='value(status.url)')

echo -e "\n${GREEN}Deployment complete!${NC}"
echo -e "Your NNA Registry Service is now available at: ${BLUE}$SERVICE_URL${NC}"
echo -e "Swagger documentation: ${BLUE}$SERVICE_URL/api/docs${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. Test your API using the Swagger UI"
echo -e "2. Connect your frontend application to this backend"
echo -e "3. Set up continuous deployment with Cloud Build"