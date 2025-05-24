# Manual Deployment Instructions for Backend

Since the GitHub Actions CI/CD workflow is encountering authentication issues with Google Cloud Platform, here's how to deploy the backend service manually:

## Prerequisites

1. Google Cloud SDK (gcloud) installed locally
2. Docker installed locally
3. Access to the Google Cloud project (revize-453014)
4. Local clone of the backend repository

## Deployment Steps

1. Clone the backend repository (if not already done):
   ```bash
   git clone https://github.com/EqualsAjayMadhok/nna-registry-service-mvp-backend.git
   cd nna-registry-service-mvp-backend
   ```

2. Navigate to the repository:
   ```bash
   cd /Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-backend
   ```

3. Build the Docker image locally:
   ```bash
   docker build -t gcr.io/revize-453014/nna-registry-service:latest .
   ```

4. Authenticate to Google Cloud:
   ```bash
   gcloud auth login
   gcloud config set project revize-453014
   ```

5. Configure Docker to use Google Container Registry:
   ```bash
   gcloud auth configure-docker
   ```

6. Push the image to Google Container Registry:
   ```bash
   docker push gcr.io/revize-453014/nna-registry-service:latest
   ```

7. Deploy to Cloud Run:
   ```bash
   gcloud run deploy nna-registry-service \
     --image gcr.io/revize-453014/nna-registry-service:latest \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

## Alternative: Use the Provided Script

We've created a script that automates these steps. You can run it with:

```bash
./manual-deploy.sh
```

This script will:
1. Create a simplified Dockerfile in the backend repository
2. Build and tag the Docker image
3. Configure Docker for Google Container Registry
4. Push the image
5. Deploy to Cloud Run

## Troubleshooting GitHub Actions

If you want to continue troubleshooting the GitHub Actions workflow:

1. Verify the GCP_SA_KEY secret:
   - Go to GitHub repository > Settings > Secrets and variables > Actions
   - Check if GCP_SA_KEY exists and contains a valid service account key JSON
   - Delete and recreate the secret if needed

2. Verify the GCP_PROJECT_ID secret:
   - Make sure it contains "revize-453014"

3. Try creating a new service account key:
   - Go to Google Cloud Console > IAM & Admin > Service Accounts
   - Find or create a service account with proper permissions
   - Generate a new key
   - Add the JSON content as the GCP_SA_KEY secret in GitHub