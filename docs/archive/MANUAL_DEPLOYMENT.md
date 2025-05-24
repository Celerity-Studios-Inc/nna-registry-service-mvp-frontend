# Manual Deployment to Vercel

If the GitHub Actions workflow is not working due to missing secrets or other issues, you can deploy directly to Vercel using the Vercel CLI tool. This guide walks you through the process.

## Prerequisites

1. Install the Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel from the CLI:
   ```bash
   vercel login
   ```

## Option 1: Deploy from Local Environment

1. Make sure your code is up to date with the latest changes:
   ```bash
   git pull origin main
   ```

2. Build the project locally:
   ```bash
   # Create production environment file
   echo "REACT_APP_API_URL=/api" > .env.production
   echo "REACT_APP_USE_MOCK_API=false" >> .env.production
   
   # Install dependencies if needed
   npm install
   
   # Build the project
   npm run build
   ```

3. Deploy to Vercel production:
   ```bash
   vercel --prod
   ```

4. Follow the prompts. If this is your first time running the command:
   - Confirm the project you want to deploy to
   - Confirm the directory to deploy (usually the current directory)
   - Confirm settings and overrides

## Option 2: Use the Deployment Script

This project includes a deployment script that handles the build and deployment process:

```bash
# Make the script executable if needed
chmod +x scripts/deploy.sh

# Run the deployment script
./scripts/deploy.sh
```

## Option 3: Deploy Directly from GitHub

You can also deploy directly from GitHub using the Vercel dashboard:

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..."
3. Select "Project"
4. Import from your GitHub repository
5. Configure project settings:
   - Framework Preset: Create React App
   - Environment Variables:
     - REACT_APP_API_URL: /api
     - REACT_APP_USE_MOCK_API: false
6. Click "Deploy"

## Verifying the Deployment

After deployment, verify these items:

1. Check the build logs for any errors
2. Confirm the deployment URL is accessible
3. Test the application's API connectivity using the browser's developer tools
4. Look for console logs indicating "Production domain detected. Forcing real API usage."
5. Follow the steps in `DEPLOYMENT_VERIFICATION.md` to fully test the application

## Troubleshooting

If you encounter issues during manual deployment:

1. Check if any environment variables are missing
2. Ensure you have the latest version of Vercel CLI
3. Try running `vercel logout` and then `vercel login` again
4. Check the Vercel dashboard for more detailed error messages