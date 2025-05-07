# Setting Up Vercel Deployment

This guide explains how to set up automatic deployments to Vercel using their GitHub integration.

## Why Use Vercel's Native GitHub Integration?

Vercel's native GitHub integration is more reliable than using GitHub Actions for deployment because:

1. It's maintained by Vercel and designed specifically for their platform
2. It automatically detects framework settings (React in our case)
3. It provides preview deployments for pull requests
4. It handles environment variables more securely
5. It has better error reporting and deployment logs

## Setup Steps

1. Go to [Vercel](https://vercel.com) and sign in with your GitHub account

2. Click "Add New..." > "Project"

3. Import your GitHub repository:
   - Find and select `nna-registry-service-mvp-frontend`
   - Click "Import"

4. Configure project settings:
   - **Framework Preset**: React
   - **Root Directory**: ./
   - **Build Command**: CI=false npm run build
   - **Output Directory**: build
   - **Environment Variables**:
     - Add `REACT_APP_API_URL=/api`
     - Add `REACT_APP_USE_MOCK_API=true`

5. Click "Deploy"

## After Deployment

1. Go to the "Settings" tab of your Vercel project
2. Under "Git", ensure:
   - Production Branch is set to your main branch
   - "Autodeploy" is enabled

## Custom Domain Setup (Optional)

1. Go to the "Domains" tab in your Vercel project
2. Add your custom domain (e.g., registry-frontend.yourdomain.com)
3. Follow the verification steps

## Troubleshooting

If your deployment fails:

1. Check the build logs for specific errors
2. Ensure your project builds locally with `CI=false npm run build`
3. Verify your environment variables are set correctly
4. Make sure your vercel.json file is properly configured