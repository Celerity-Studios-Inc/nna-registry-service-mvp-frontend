# Manual Vercel Deployment Guide

This guide provides instructions for setting up and deploying your React app to Vercel, both manually and via GitHub Actions.

## GitHub Secrets Setup

For GitHub Actions automated deployment, you need to add these secrets to your repository:

1. **VERCEL_TOKEN** - Your Vercel API token
   - Get it from: https://vercel.com/account/tokens

2. **VERCEL_ORG_ID** - Your Vercel organization ID
   - Get it by running: `vercel whoami`
   - Or from your Vercel dashboard URL: `https://vercel.com/[org-name]`

3. **VERCEL_PROJECT_ID** - Your Vercel project ID
   - Get it from your project settings in Vercel dashboard
   - Or by running: `vercel projects ls`

## Manual Deployment Steps

If GitHub Actions deployment fails, follow these steps:

1. Install Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. Build your project:
   ```
   cd /path/to/your/project
   npm run build
   ```

4. Deploy to Vercel:
   ```
   vercel --prod
   ```

## Troubleshooting GitHub Actions Deployment

If the GitHub Actions workflow fails with errors about missing secrets:

1. Check that all required secrets are added to your GitHub repository
2. Ensure secret names EXACTLY match what the action expects
3. Try running a manual deployment to verify Vercel credentials work
4. Check the GitHub Actions logs for specific error messages

## Environment Variables

Make sure to set the following environment variables in your Vercel project settings:

- `REACT_APP_API_URL` - API endpoint URL
- `REACT_APP_USE_MOCK_API` - Set to "true" to use mock API implementation

EOF < /dev/null