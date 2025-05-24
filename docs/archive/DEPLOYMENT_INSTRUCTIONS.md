# NNA Registry Service Frontend - Deployment Instructions

## Overview

The NNA Registry Service Frontend is now configured for automated deployment to Vercel with proper CORS handling. This document provides instructions for monitoring the deployment process and troubleshooting common issues.

## Deployment Process

### 1. GitHub Actions Workflow

When changes are pushed to the `main` branch, the GitHub Actions workflow is automatically triggered:

1. Check the workflow status at: https://github.com/EqualsAjayMadhok/nna-registry-service-mvp-frontend/actions
2. The "Deploy to Vercel Production" workflow should show as running or completed
3. If successful, the application will be deployed to Vercel

### 2. Vercel Deployment

After the GitHub Actions workflow completes:

1. Visit the Vercel dashboard to view the deployment: https://vercel.com/dashboard
2. Select the NNA Registry Service Frontend project
3. Verify that the latest deployment is showing as "Production" and "Complete"
4. The application should be accessible at the assigned Vercel URL

## Required Secrets

For the GitHub Actions workflow to deploy successfully, the following secrets must be configured in the GitHub repository:

1. `VERCEL_TOKEN`: Vercel API token for authentication
2. `VERCEL_ORG_ID`: Vercel organization ID
3. `VERCEL_PROJECT_ID`: Vercel project ID

To verify or update these secrets:
1. Go to the GitHub repository Settings
2. Navigate to Secrets and Variables > Actions
3. Check that all three secrets are present

## Troubleshooting

### 1. GitHub Actions Workflow Fails

If the workflow fails:

1. Check the workflow logs for specific error messages
2. Verify that all required secrets are configured correctly
3. Ensure the project is correctly linked to Vercel

### 2. CORS Issues Persist

If CORS issues occur in the deployed application:

1. Check the browser console for specific error messages
2. Verify in the Network tab that requests are being routed through the proxy
3. Check Vercel Function Logs for errors in the API proxy

To view Vercel Function Logs:
1. Go to the Vercel Dashboard
2. Select your project
3. Navigate to "Functions"
4. Look for the `/api/proxy` function
5. Click to view logs and metrics

### 3. API Requests Fail

If API requests are failing:

1. Check that `vercel.json` has the correct rewrites configuration
2. Verify that the backend API at `registry.reviz.dev` is accessible
3. Test the API endpoints directly to ensure they're responding correctly

## Monitoring and Maintenance

### 1. Deployment Logs

To monitor deployment logs:

1. GitHub Actions logs show the build and deployment process
2. Vercel deployment logs show the actual deployment to the Vercel platform
3. Vercel Function logs show runtime logs for the API proxy

### 2. Performance Monitoring

To monitor application performance:

1. Use the Vercel Analytics dashboard for performance metrics
2. Monitor Function execution times and error rates
3. Check for any timeouts or memory issues in the serverless functions

### 3. Updating the Deployment

To update the deployment:

1. Make changes to the codebase
2. Commit and push to the `main` branch
3. The GitHub Actions workflow will automatically rebuild and redeploy

## Environment Variables

The application uses the following environment variables in production:

1. `REACT_APP_API_URL`: Set to `/api` to use the proxy
2. `REACT_APP_USE_MOCK_API`: Set to `false` in production

These variables are automatically set by the GitHub Actions workflow.