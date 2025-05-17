# Setting Up GCP Deployment for NNA Registry Backend

This guide provides step-by-step instructions for setting up GitHub Actions to automatically deploy your NNA Registry Backend to Google Cloud Run when you push to the main branch.

## Prerequisites

1. A Google Cloud Platform (GCP) account
2. A GCP project with billing enabled
3. GitHub repository for your backend code

## Step 1: Create a GCP Service Account

1. Go to the [GCP Console](https://console.cloud.google.com/)
2. Navigate to "IAM & Admin" > "Service Accounts"
3. Click "Create Service Account"
4. Name the service account (e.g., "github-actions-deploy")
5. Assign the following roles:
   - Cloud Run Admin
   - Cloud Build Editor
   - Storage Admin
   - Service Account User
   - Secret Manager Admin
6. Create a JSON key for this service account and download it

## Step 2: Enable Required APIs

Run the following commands using the Google Cloud SDK or enable them through the console:

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

## Step 3: Set Up GitHub Secrets

Add the following secrets to your GitHub repository:

1. Go to your GitHub repository > "Settings" > "Secrets and variables" > "Actions"
2. Add the following secrets:
   - `GCP_PROJECT_ID`: Your GCP project ID
   - `GCP_SA_KEY`: The entire content of the JSON key file you downloaded earlier

## Step 4: Add Workflow File to Your Repository

1. Create a directory structure `.github/workflows` in your repository
2. Copy the `ci-cd.yml` file provided in this package to that directory
3. Commit and push these changes to your repository

## Step 5: Add Dockerfile to Your Repository

1. Copy the `Dockerfile` provided in this package to the root of your repository
2. Commit and push these changes to your repository

## Step 6: Verify NestJS Configuration

1. Copy the `nest-cli.json` file provided in this package to the root of your repository if it doesn't already exist
2. Commit and push these changes to your repository

## Step 7: Trigger the Workflow

The workflow will run automatically when you push changes to the main branch, or you can trigger it manually:

1. Go to your GitHub repository > "Actions" tab
2. Select the "CI/CD Pipeline for NNA Registry Backend" workflow
3. Click "Run workflow" > "Run workflow"

## Step 8: Verify Deployment

1. Wait for the GitHub Actions workflow to complete (you can monitor it in the Actions tab)
2. The workflow output will include the URL for your deployed Cloud Run service
3. Visit this URL to verify that your API is working correctly

## Troubleshooting

If the deployment fails, check the GitHub Actions logs for detailed error messages. Common issues include:

1. Insufficient permissions for the service account
2. APIs not enabled on your GCP project
3. Incorrect secrets in GitHub repository
4. Build or Docker image creation failures

## Additional Notes

- The deployed service will be publicly accessible due to the `--allow-unauthenticated` flag
- Each deployment will create a new revision in Cloud Run
- Cloud Run automatically manages scaling for you based on traffic
- Your Docker image is stored in Google Container Registry