# Vercel Secrets Setup for GitHub Actions

This guide explains how to set up the necessary secrets for the GitHub Actions workflow to deploy to Vercel.

## Required Secrets

The GitHub Actions workflow requires the following secrets:

1. `VERCEL_TOKEN`: A Vercel API token for authentication
2. `VERCEL_ORG_ID`: Your Vercel organization ID
3. `VERCEL_PROJECT_ID`: The ID of your Vercel project

## Step 1: Create a Vercel API Token

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your profile picture in the top-right corner
3. Select "Settings"
4. Navigate to "Tokens" in the left sidebar
5. Click "Create" to create a new token
6. Give it a name like "GitHub Actions Deployment"
7. Set an appropriate expiration (or "No expiration" for permanent tokens)
8. Copy the generated token - you'll need it for the `VERCEL_TOKEN` secret

## Step 2: Get Your Vercel Organization ID

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your organization (if you have multiple)
3. Click on "Settings" in the top navigation
4. Look for "General" in the left sidebar
5. Copy the "ID" field - this is your `VERCEL_ORG_ID`

## Step 3: Get Your Vercel Project ID

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click on "Settings" in the top navigation
4. Look for "General" in the left sidebar
5. Copy the "Project ID" - this is your `VERCEL_PROJECT_ID`

## Step 4: Add Secrets to GitHub Repository

1. Go to your GitHub repository
2. Click on "Settings"
3. Select "Secrets and variables" then "Actions" in the left sidebar
4. Click "New repository secret"
5. Add each of the following secrets:
   - Name: `VERCEL_TOKEN`, Value: (the token you copied in Step 1)
   - Name: `VERCEL_ORG_ID`, Value: (the org ID you copied in Step 2)
   - Name: `VERCEL_PROJECT_ID`, Value: (the project ID you copied in Step 3)
6. Click "Add secret" after entering each one

## Verification

You can verify that the secrets are set up correctly by checking if they appear in the list of repository secrets. Due to security measures, you'll only see the names of the secrets, not their values.

## Troubleshooting

If the workflow fails with authentication errors:

1. Double-check that all three secrets are set correctly
2. Verify that the Vercel token has not expired
3. Ensure the token has sufficient permissions (should be a "Full Access" token)
4. Check that the organization and project IDs match your Vercel project

## Security Notes

- Never commit these values directly to your repository
- If you suspect a token has been compromised, immediately rotate it in the Vercel dashboard
- Consider setting an expiration date on your tokens for better security
- Restrict token permissions where possible