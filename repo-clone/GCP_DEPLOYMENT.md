# Deploying NNA Registry Service to Google Cloud Run

This guide walks you through deploying the NNA Registry Service to Google Cloud Run, a fully managed serverless platform for containerized applications.

## Prerequisites

1. Google Cloud Platform (GCP) account
2. Google Cloud SDK installed and configured
3. Docker installed locally (for building the container image)
4. MongoDB Atlas account (for managed MongoDB database)

## Step 1: Set Up GCP Project and Services

### Create a GCP Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project selector at the top of the page
3. Click "New Project"
4. Enter "nna-registry-service" as the project name
5. Click "Create"
6. Make sure your new project is selected

### Enable Required APIs

1. Go to "APIs & Services" > "Library"
2. Search for and enable the following APIs:
   - Cloud Run API
   - Container Registry API
   - Cloud Build API
   - Cloud Storage API
   - Secret Manager API (for secure environment variables)

## Step 2: Set Up MongoDB Atlas

1. Create a MongoDB Atlas account or log in at [cloud.mongodb.com](https://cloud.mongodb.com/)
2. Create a new cluster (the free tier works for development)
3. Set up network access:
   - Allow access from anywhere (for serverless environments)
   - Or use IP whitelisting with Google Cloud IP ranges
4. Create a database user with read/write permissions
5. Get your MongoDB connection string:
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Copy the connection string (replace `<password>` with your actual password)

## Step 3: Create a GCP Storage Bucket

1. Go to the [Cloud Storage Console](https://console.cloud.google.com/storage/browser)
2. Click "Create Bucket"
3. Name your bucket "nna-registry-assets-{PROJECT_ID}" (replace {PROJECT_ID} with your GCP project ID)
4. Choose a region (e.g., us-central1)
5. For access control, choose "Fine-grained" (recommended for production)
6. Click "Create"

## Step 4: Create Service Account for Storage Access

1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Enter "nna-storage-service-account" as the name
4. Click "Create and Continue"
5. Assign the following roles:
   - Storage Admin
   - Storage Object Admin
6. Click "Continue" and then "Done"
7. Click on the newly created service account
8. Go to the "Keys" tab
9. Click "Add Key" > "Create new key"
10. Choose JSON format
11. Click "Create" (this will download a JSON key file)

## Step 5: Set Up Secret Manager for Environment Variables

1. Go to "Security" > "Secret Manager"
2. Click "Create Secret"
3. Name it "nna-registry-env"
4. For the secret value, enter the following (with your values):
   ```
   NODE_ENV=production
   PORT=8080
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/nna-registry?retryWrites=true&w=majority
   JWT_SECRET=your_very_secure_jwt_secret_key
   GCP_PROJECT_ID=your-gcp-project-id
   GCP_BUCKET_NAME=nna-registry-assets-your-gcp-project-id
   SENTRY_DSN=your_sentry_dsn
   ```
5. Click "Create Secret"

## Step 6: Prepare the Application for Cloud Run

### Update the Dockerfile

Review the existing Dockerfile to ensure it's optimized for Cloud Run:

```dockerfile
# Use Node.js as the base image
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Set environment for Cloud Run (important: Cloud Run expects PORT=8080)
ENV NODE_ENV=production
ENV PORT=8080

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy build artifacts from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/taxonomy ./taxonomy

# Copy service account key
COPY gcp-credentials.json ./gcp-credentials.json
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/gcp-credentials.json

# Expose the application port
EXPOSE 8080

# Start the application
CMD ["node", "dist/main"]
```

## Step 7: Build and Deploy to Cloud Run

### Build and Push the Docker Image

1. Copy your service account key file to the project root and rename it to `gcp-credentials.json`

2. Configure Docker to use Google Cloud as a credential helper:
   ```bash
   gcloud auth configure-docker
   ```

3. Build and tag the Docker image:
   ```bash
   export PROJECT_ID=$(gcloud config get-value project)
   docker build -t gcr.io/$PROJECT_ID/nna-registry-service:v1 .
   ```

4. Push the image to Google Container Registry:
   ```bash
   docker push gcr.io/$PROJECT_ID/nna-registry-service:v1
   ```

### Deploy to Cloud Run

1. Deploy the image to Cloud Run:
   ```bash
   gcloud run deploy nna-registry-service \
     --image gcr.io/$PROJECT_ID/nna-registry-service:v1 \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --service-account=nna-storage-service-account@$PROJECT_ID.iam.gserviceaccount.com \
     --set-secrets="/.env=nna-registry-env:latest"
   ```

2. Wait for the deployment to complete. The command will output the service URL when finished.

## Step 8: Verify the Deployment

1. Access your service at the URL provided by Cloud Run
2. Check the Swagger documentation at `https://your-service-url/api/docs`
3. Test basic API functionality using the Swagger UI

## Step 9: Set Up Custom Domain (Optional)

1. Go to the Cloud Run service
2. Click on "Manage Custom Domains"
3. Follow the instructions to map your domain to the service

## Step 10: Set Up Continuous Deployment with Cloud Build (Optional)

1. Create a `cloudbuild.yaml` file in your repository:
   ```yaml
   steps:
     # Build the container image
     - name: 'gcr.io/cloud-builders/docker'
       args: ['build', '-t', 'gcr.io/$PROJECT_ID/nna-registry-service:$COMMIT_SHA', '.']
     
     # Push the container image to Container Registry
     - name: 'gcr.io/cloud-builders/docker'
       args: ['push', 'gcr.io/$PROJECT_ID/nna-registry-service:$COMMIT_SHA']
     
     # Deploy container image to Cloud Run
     - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
       entrypoint: gcloud
       args:
       - 'run'
       - 'deploy'
       - 'nna-registry-service'
       - '--image'
       - 'gcr.io/$PROJECT_ID/nna-registry-service:$COMMIT_SHA'
       - '--region'
       - 'us-central1'
       - '--platform'
       - 'managed'
       - '--allow-unauthenticated'
       - '--service-account'
       - 'nna-storage-service-account@$PROJECT_ID.iam.gserviceaccount.com'
       - '--set-secrets=/.env=nna-registry-env:latest'
   
   images:
     - 'gcr.io/$PROJECT_ID/nna-registry-service:$COMMIT_SHA'
   ```

2. Set up Cloud Build trigger in the GCP Console:
   - Go to "Cloud Build" > "Triggers"
   - Click "Create Trigger"
   - Connect your GitHub repository
   - Configure the trigger to use the `cloudbuild.yaml` file

## Troubleshooting

### Image Push Failed

If you encounter permission issues when pushing the Docker image:
```bash
gcloud auth configure-docker --quiet
```

### Cloud Run Deployment Errors

Check the logs in the Cloud Run console for detailed error messages.

### MongoDB Connection Issues

1. Verify the MongoDB connection string in Secret Manager
2. Ensure network access is properly configured in MongoDB Atlas

### Storage Access Issues

1. Check the service account permissions
2. Verify the bucket name and project ID in the environment variables

## Monitoring and Maintenance

1. **Logging**: View logs in the Cloud Run console or set up Cloud Logging
2. **Monitoring**: Set up Cloud Monitoring for performance metrics
3. **Alerts**: Configure alerts for downtime or performance issues
4. **Scaling**: Cloud Run automatically scales based on traffic

## Cost Optimization

1. Cloud Run charges only for the time your service is processing requests
2. For low-traffic applications, the free tier may be sufficient
3. Configure concurrency settings based on your application's needs
4. Consider setting maximum instances to control costs for unexpected traffic spikes

## Next Steps

After deploying the backend to Google Cloud Run, you can:

1. Integrate with your frontend application
2. Set up automated testing in your CI/CD pipeline
3. Configure monitoring and alerting for production usage
4. Implement a staging environment for testing changes before production