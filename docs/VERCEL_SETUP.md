# Vercel Deployment Setup

## Current Configuration

- **Repository**: EqualsAjayMadhok/nna-registry-service-mvp-frontend
- **Domain**: registry-service-frontend.vercel.app
- **Branch Tracking**: Currently set to `main`

## Required Configuration

1. **Branch Tracking**: 
   - Keep production branch set to `main` 
   - We're using a GitHub workflow to deploy `feature/dashboard-and-integration` branch code when pushed to `main`
   - This workaround is needed because Vercel can't directly track the feature branch

2. **Set Environment Variables**:
   - REACT_APP_API_URL: /api (using our proxy configuration)

3. **Custom Domain** (Optional):
   - Can be configured in Settings > Domains

## API Proxy Configuration

We've set up a proxy in `vercel.json` to handle CORS issues:

```json
{
  "rewrites": [
    { 
      "source": "/api/:path*", 
      "destination": "https://registry.reviz.dev/api/:path*" 
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
        { "key": "Access-Control-Allow-Headers", "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" }
      ]
    }
  ]
}
```

## Current CI/CD Workflow

1. **Development Process**:
   - Make changes in feature branches
   - Push to GitHub
   - Vercel creates preview deployments automatically for pull requests
   - After testing, merge your changes to `feature/dashboard-and-integration`
   - To deploy to production, push to `main` branch (our GitHub workflow will deploy the `feature/dashboard-and-integration` branch code)

2. **Deployment Workflow Files**:
   - `.github/workflows/main-deploy.yml`: Deploys the feature branch code when pushed to main

3. **When Ready for Final Production**:
   - When development is complete, merge `feature/dashboard-and-integration` to `main`
   - The main branch will contain the final, stable code

## Troubleshooting

If deployments are not being triggered automatically:

1. Check GitHub integration settings in Vercel
2. Verify webhook is properly configured
3. Check deployment logs for errors

## Manual Deployment

You can always trigger a manual deployment:

1. From Vercel dashboard: Project > Deployments > "New Deployment"
2. Using Vercel CLI: `vercel --prod`