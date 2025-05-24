# GitHub Actions Setup for NNA Registry Backend

This document explains how the GitHub Actions CI/CD pipeline is set up for deploying the NNA Registry Backend to Google Cloud Run.

## GitHub Secrets Configuration

Configure the following secrets in your GitHub repository:

1. **GCP_PROJECT_ID**: 
   - Value: `revize-453014`

2. **GCP_SA_KEY**: 
   - The full JSON content of the service account key for `ci-cd-service-account@revize-453014.iam.gserviceaccount.com`
   - Include everything from the opening `{` to the closing `}`

3. **MONGODB_URI**: 
   - Your MongoDB connection string
   - Example: `mongodb+srv://username:password@registryservice.xhmyito.mongodb.net/nna-registry`

4. **JWT_SECRET**: 
   - A secure random string for JWT token generation

## Setting Up GitHub Secrets

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. In the left sidebar, click on "Secrets and variables" -> "Actions"
4. Click on "New repository secret"
5. Add each of the secrets mentioned above

## Workflow File

The workflow at `.github/workflows/ci-cd.yml` will:
1. Build your NestJS application
2. Create a Docker image
3. Push the image to Google Container Registry
4. Deploy the image to Google Cloud Run

## Triggering Deployment

The workflow will run automatically when you push to the main branch, or you can trigger it manually:

1. Go to the "Actions" tab in your GitHub repository
2. Select the "NNA Registry Service CI/CD" workflow
3. Click "Run workflow" -> "Run workflow"