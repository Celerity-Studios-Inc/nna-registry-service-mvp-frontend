# Backend Deployment Plan

Based on a thorough review of the reference repository (https://github.com/EqualsAjayMadhok/nna-registry-service), I've developed a step-by-step plan to correctly deploy the backend service.

## 1. Prerequisites

Before we start, ensure you have:

- Google Cloud CLI installed and configured
- Docker Desktop installed and running (for local testing)
- Access to the GitHub repository with admin permissions
- Access to Google Cloud Console with appropriate permissions

## 2. Required Google Cloud Setup

1. **Service Account**:
   - We need a service account with these roles:
     - Cloud Run Admin
     - Cloud Build Editor
     - Storage Admin
     - Service Account User
   - The service account `github-actions@revize-453014.iam.gserviceaccount.com` appears to be already set up

2. **APIs to Enable**:
   - Cloud Build API (cloudbuild.googleapis.com)
   - Cloud Run API (run.googleapis.com)
   - Container Registry API (containerregistry.googleapis.com)

## 3. GitHub Repository Setup

1. **GitHub Secrets**:
   - Add the following secrets to the repository:
     - `GCP_PROJECT_ID`: revize-453014
     - `GCP_SA_KEY`: The JSON key for the GitHub Actions service account

## 4. Files to Copy from Reference Repository

1. **Workflow File**:
   - Copy `.github/workflows/ci-cd.yml` from the reference repository

2. **Docker Configuration**:
   - Copy `Dockerfile` from the reference repository
   - This Dockerfile uses a multi-stage build process:
     - Stage 1: Build the application
     - Stage 2: Create a minimal production image

3. **Configuration Files**:
   - Copy `nest-cli.json` if using NestJS

## 5. Implementation Steps

1. **Clone the Backend Repository**:
   ```bash
   git clone https://github.com/EqualsAjayMadhok/nna-registry-service-mvp-backend.git
   cd nna-registry-service-mvp-backend
   ```

2. **Create GitHub Workflows Directory**:
   ```bash
   mkdir -p .github/workflows
   ```

3. **Copy CI/CD Workflow File**:
   ```bash
   curl -o .github/workflows/ci-cd.yml https://raw.githubusercontent.com/EqualsAjayMadhok/nna-registry-service/main/.github/workflows/ci-cd.yml
   ```

4. **Copy Dockerfile**:
   ```bash
   curl -o Dockerfile https://raw.githubusercontent.com/EqualsAjayMadhok/nna-registry-service/main/Dockerfile
   ```

5. **Commit and Push Changes**:
   ```bash
   git add .github/workflows/ci-cd.yml Dockerfile
   git commit -m "Add CI/CD setup for GCP deployment"
   git push origin main
   ```

6. **Verify GitHub Actions**:
   - Go to GitHub repository → Actions tab
   - Check if workflow is running
   - Debug any issues

## 6. Manual Deployment (if needed)

If the GitHub Actions workflow fails, you can deploy manually using:

```bash
# Authenticate to Google Cloud
gcloud auth login

# Set the project
gcloud config set project revize-453014

# Build the Docker image locally
docker build -t gcr.io/revize-453014/nna-registry-service:latest .

# Configure Docker for GCR
gcloud auth configure-docker

# Push the image
docker push gcr.io/revize-453014/nna-registry-service:latest

# Deploy to Cloud Run
gcloud run deploy nna-registry-service \
  --image gcr.io/revize-453014/nna-registry-service:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 7. Troubleshooting

1. **GitHub Actions Authentication Issues**:
   - Verify the `GCP_SA_KEY` secret contains the full, valid JSON key
   - Make sure the service account has the necessary permissions

2. **Docker Build Failures**:
   - Check if all required files are present in the repository
   - Ensure Dockerfile is correctly formatted
   - Look for dependency issues in package.json

3. **Cloud Run Deployment Issues**:
   - Check if the container is listening on PORT 8080
   - Verify the application has a proper startup process
   - Examine Cloud Run logs for specific error messages

4. **Application Runtime Issues**:
   - Check environment variables needed by the application
   - Ensure database connections are properly configured
   - Verify API endpoints are correctly defined

## 8. Automated Implementation Script

For a one-click solution, I've created a script that will automate the above steps. Run:

```bash
./setup-backend-cicd.sh
```

This script will:
1. Create necessary directories
2. Copy required files from the reference repository
3. Commit and push changes
4. Print status messages

## Next Steps

After successful deployment:
1. Verify the backend service is running
2. Test API endpoints
3. Configure the frontend to connect to the backend
4. Implement monitoring and alerts as needed