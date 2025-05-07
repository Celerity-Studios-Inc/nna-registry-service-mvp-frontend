# Manual Setup for GitHub Actions Deployment to Vercel

Since automated retrieval of Vercel credentials can be complex, here's a manual approach to set up continuous deployment:

## Step 1: Generate a Vercel Token

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your profile picture → Settings → Tokens
3. Create a new token with a descriptive name (e.g., "GitHub Actions Deployment")
4. Select "Full Account" access scope
5. Copy the generated token

## Step 2: Get your Vercel Organization ID

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard)
2. The Organization ID is in the URL: `https://vercel.com/[org-name]?teamId=[org-id]`
3. Copy the value after `teamId=`

## Step 3: Get your Vercel Project ID

1. Go to your project in the Vercel Dashboard
2. Click on Settings
3. Scroll down to find "Project ID"
4. Copy this ID

## Step 4: Add Secrets to GitHub Repository

1. Go to your GitHub repository
2. Click on Settings → Secrets and variables → Actions
3. Add three new repository secrets:
   - `VERCEL_TOKEN`: Paste the token from Step 1
   - `VERCEL_ORG_ID`: Paste the organization ID from Step 2
   - `VERCEL_PROJECT_ID`: Paste the project ID from Step 3

## Step 5: Push to Trigger Deployment

Once the secrets are set up, any push to the `main` or `feature/dashboard-and-integration` branch will trigger the GitHub Actions workflow, which will:

1. Check out the code
2. Install dependencies
3. Build the project
4. Deploy to Vercel

You can verify the workflow is running by checking the Actions tab in your GitHub repository.

## Additional Notes

- The workflow is configured to deploy when code is pushed to the `main` or `feature/dashboard-and-integration` branches
- You can also manually trigger a deployment from the Actions tab
- If you want to deploy a different branch, edit the `.github/workflows/deploy.yml` file

## Troubleshooting

If the workflow fails:

1. Check that all secrets are correctly configured
2. Verify that the Vercel token has sufficient permissions
3. Ensure the Organization ID and Project ID are correct
4. Check the GitHub Actions logs for specific error messages