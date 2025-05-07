# Vercel Deployment Guide for NNA Registry Service Frontend

This guide explains how to deploy the NNA Registry Service Frontend to Vercel and connect it to your deployed backend at https://registry.reviz.dev.

## Prerequisites

- Node.js 14+ installed
- Vercel CLI installed (`npm install -g vercel`)
- Vercel account (https://vercel.com)
- Git repository for your project

## Configuration Files

The following files have been set up for Vercel deployment:

1. `.env.production` - Contains environment variables for production
2. `.env.development` - Contains environment variables for local development
3. `vercel.json` - Vercel configuration with API proxy and environment variables

## Deployment Steps

### 1. Prepare for Deployment

Before deploying, make sure:

- All code changes are committed to Git
- The project builds locally without errors
- Environment variables are correctly set

### 2. Login to Vercel

If you haven't already, log in to the Vercel CLI:

```bash
vercel login
```

### 3. Deploy to Vercel

You can deploy using our deployment script:

```bash
./deploy-to-vercel.sh
```

Or manually with:

```bash
# Build the project
npm run build

# Deploy to Vercel production
vercel --prod
```

### 4. Verify Configuration

After deployment, verify:

1. The application is accessible at the Vercel URL
2. API requests are correctly proxied to https://registry.reviz.dev
3. Authentication works correctly
4. Asset creation and viewing work as expected

## Troubleshooting

### API Connection Issues

If the API connection isn't working:

1. Check the Network tab in browser DevTools to see the actual API calls
2. Verify the `vercel.json` rewrites are correctly set up
3. Ensure environment variables are properly configured in Vercel project settings

### CORS Issues

If you encounter CORS errors:

1. Check that the backend at https://registry.reviz.dev allows requests from your Vercel domain
2. Verify the headers in `vercel.json` are correctly configured

### Authentication Problems

If users can't log in:

1. Ensure token storage is functioning correctly
2. Verify API calls include the correct Authorization headers
3. Check for any console errors related to authentication

## Updating the Deployment

To update your Vercel deployment after making changes:

1. Commit your changes to Git
2. Run the deployment script: `./deploy-to-vercel.sh`

## Environment Variables

The following environment variables need to be set in Vercel:

- `REACT_APP_API_BASE_URL`: The URL of the API endpoint, set to https://registry.reviz.dev/api
- `REACT_APP_USE_MOCK_API`: Set to "false" to use the real API

You can set these in the Vercel dashboard under Project Settings > Environment Variables.

## Switching Between Mock and Real API

To switch between mock API and real API, update the `REACT_APP_USE_MOCK_API` environment variable:

- Set to "true" to use mock API (for development)
- Set to "false" to use the real API (for production)

## CI/CD Setup (Future Enhancement)

For continuous deployment, you can:

1. Connect your Git repository to Vercel
2. Enable automatic deployments on push to main branch
3. Set up preview deployments for pull requests