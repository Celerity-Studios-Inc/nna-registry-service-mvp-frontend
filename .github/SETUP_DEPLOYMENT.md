# Setting Up Continuous Deployment with GitHub Actions

This document explains how to set up the GitHub Actions workflow for automatic deployment to Vercel.

## Required Secrets

You need to set up the following secrets in your GitHub repository:

1. **VERCEL_TOKEN**: Your Vercel authentication token
2. **VERCEL_ORG_ID**: Your Vercel organization ID
3. **VERCEL_PROJECT_ID**: Your Vercel project ID

## Where to Find These Values

### Vercel Token

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your profile picture in the top right
3. Go to "Settings"
4. Select "Tokens" from the menu
5. Create a new token with "Full Account" scope

### Vercel Organization ID and Project ID

These values can be found in the Vercel project settings or by running:

```bash
vercel project ls
```

The Organization ID is also shown in the URL when you're browsing your projects in the Vercel dashboard:
`https://vercel.com/[org-name]?teamId=[org-id]`

## Setting up Secrets in GitHub

1. Go to your GitHub repository
2. Click on "Settings"
3. Select "Secrets and variables" > "Actions" from the sidebar
4. Click on "New repository secret"
5. Add each of the three secrets (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)

## Testing the Workflow

Once you've set up the secrets, any push to the branches specified in the workflow file (`main` or `feature/dashboard-and-integration`) will automatically trigger a deployment.

You can also manually trigger a deployment by:

1. Going to the "Actions" tab in your GitHub repository
2. Selecting the "Deploy to Vercel" workflow
3. Clicking "Run workflow"