# Deployment Verification Guide

After merging the PR and deploying to Vercel, follow these steps to verify everything is working correctly.

## 1. Verify GitHub Actions Workflow

1. Go to the GitHub Actions tab in your repository to check the workflow status
2. Look for the "Deploy to Vercel Production" workflow that should have triggered automatically
3. Verify that all steps completed successfully
4. The workflow should end with a success message and a deployment URL

## 2. Check Vercel Deployment

1. Visit your Vercel dashboard to confirm the deployment completed
2. Verify that the deployment is assigned to the Production environment
3. Check the deployment logs for any errors
4. Make note of the deployed URL (usually `nna-registry-service-mvp-frontend.vercel.app`)

## 3. Test the Application

1. Open the deployed URL in your browser
2. Verify that the application loads successfully
3. Check browser developer tools (F12) for any console errors
4. Verify that there are no CORS-related errors in the console

## 4. Test API Integration

1. Try to log in to the application (if authentication is implemented)
2. Test search functionality to ensure API calls work
3. Attempt to register a new asset (if that feature is available)
4. Confirm that API requests show up in the Network tab without CORS errors
5. Verify that requests to `/api/*` are being properly proxied to the backend

## 5. Debugging Common Issues

If you encounter issues:

### CORS Errors Still Present

1. Verify that your API calls are using the relative URL `/api/...` format
2. Check the Network tab to confirm the requests are being made to the correct endpoints
3. Inspect the response headers to ensure CORS headers are present

### API Requests Failing

1. Check the Vercel Function Logs for the proxy function
2. Verify that the API backend (registry.reviz.dev) is accessible
3. Test the API directly to ensure it's responding correctly

### Workflow Failures

1. Check the GitHub Actions logs for specific error messages
2. Verify that all required secrets (VERCEL_TOKEN, etc.) are properly set in the repository
3. Confirm that the Vercel project is properly linked to the GitHub repository

## 6. Additional Verification

1. Test the application on both desktop and mobile devices
2. Verify that all critical user flows work end-to-end
3. Check performance metrics in the Vercel dashboard

If everything checks out, your application should be successfully deployed with CORS issues resolved!