# Deployment Section Update for README.md

Replace the current Deployment section in README.md with the following updated content:

## Deployment

### Vercel Deployment

This project is configured for deployment to Vercel with automated GitHub Actions integration.

#### Option 1: Automated GitHub Actions Deployment (Recommended)

The repository is configured with GitHub Actions workflows that automatically deploy to Vercel when changes are pushed to the main branch.

1. Make changes to your code
2. Push to the main branch or merge a PR into main
3. GitHub Actions will automatically:
   - Build the application
   - Deploy to Vercel production environment
   - Report the deployment status

To set up the automated deployment, you need to configure the following GitHub repository secrets:
- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

See [VERCEL_SECRETS_SETUP.md](./VERCEL_SECRETS_SETUP.md) for detailed instructions.

#### Option 2: Vercel GitHub Integration

1. Go to [Vercel](https://vercel.com) and sign in with your GitHub account
2. Click "Add New..." > "Project"
3. Select this repository
4. Configure the project settings:
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`
5. Add environment variables:
   - `REACT_APP_API_URL`: `/api`
   - `REACT_APP_USE_MOCK_API`: `false`
6. Click "Deploy"

Vercel will automatically deploy when changes are pushed to GitHub.

#### Option 3: Manual Deployment

To deploy manually using the Vercel CLI:

1. Install Vercel CLI: `npm install -g vercel`
2. Login: `vercel login`
3. Create production environment file:
   ```bash
   echo "REACT_APP_API_URL=/api" > .env.production
   echo "REACT_APP_USE_MOCK_API=false" >> .env.production
   ```
4. Deploy: `vercel --prod`

### CORS Configuration

This application uses an API proxy approach to avoid CORS issues when deployed to Vercel:

1. API requests are made to relative paths `/api/...`
2. Vercel configuration routes these requests to a serverless function
3. The serverless function in `api/proxy.js` handles CORS headers and forwards to the backend

If you encounter CORS issues, refer to [CORS_TROUBLESHOOTING.md](./CORS_TROUBLESHOOTING.md).

### Deployment Verification

After deployment, follow the steps in [DEPLOYMENT_VERIFICATION.md](./DEPLOYMENT_VERIFICATION.md) to ensure everything is working correctly.

### Environment Variables

Production deployments should have these environment variables:

- `REACT_APP_API_URL`: Set to `/api` for production deployments
- `REACT_APP_USE_MOCK_API`: Set to `false` for production deployments

These variables are automatically set by the GitHub Actions workflow or can be configured in the Vercel dashboard.