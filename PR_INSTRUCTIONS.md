# Pull Request Instructions

To finalize the deployment setup, you need to create a pull request to merge the changes from `feature/dashboard-and-integration` to `main`.

## Changes Summary

This PR includes the following key changes to fix CORS issues and enable Vercel deployment:

1. **API Configuration**: 
   - Modified `src/api/api.ts` to use a relative URL `/api` for API requests
   - The requests will be routed through Vercel's proxy to avoid CORS issues

2. **Vercel Configuration**: 
   - Configured `vercel.json` with rewrites to proxy API requests to the backend
   - Added proper routes for static assets and index.html

3. **Environment Configuration**:
   - Set `.env.production` to use the correct API URL

4. **API Proxy**:
   - Added serverless function in `api/proxy.js` to handle CORS headers
   - The proxy properly forwards requests to the backend and returns responses

5. **GitHub Actions Workflow**:
   - Created `main-deploy.yml` to deploy to Vercel on push to main branch
   - Fixed workflow to use the pushed code rather than a hardcoded branch

## Creating the PR

1. Go to this URL to create the PR:
   https://github.com/EqualsAjayMadhok/nna-registry-service-mvp-frontend/compare/main...feature/dashboard-and-integration

2. Use the following title:
   "Fix CORS issues and implement Vercel deployment"

3. Use the following description:
   ```
   This PR resolves CORS issues encountered when deploying to Vercel and implements automated deployments.

   ## Changes:
   - Configure API client to use relative URLs for API requests
   - Add serverless function to handle API proxying with CORS headers
   - Update vercel.json with proper rewrites and routes
   - Configure GitHub Actions workflow for automated deployments
   - Add production environment variables

   ## Testing:
   - Verify that the GitHub Actions workflow triggers after merging
   - Check the deployed site works without CORS errors
   - Test API calls to ensure they are properly proxied
   ```

4. Click "Create pull request"

## After Creating the PR

1. Review the changes one more time
2. Merge the PR to trigger the workflow
3. Monitor the GitHub Actions workflow to ensure successful deployment
4. Verify the deployed site works correctly without CORS errors