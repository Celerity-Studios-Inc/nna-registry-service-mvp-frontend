# Setting Up GitHub Secrets for Vercel Deployment

⚠️ **IMPORTANT: The GitHub Actions deployment workflow is currently failing because the required Vercel secrets are not configured.**

To fix this issue, you need to add three specific secrets to your GitHub repository following these steps:

## 1. Get Vercel Token

1. Go directly to [Vercel Tokens page](https://vercel.com/account/tokens)
2. Click "Create" to create a new token
3. Name it "GitHub Actions Deployment"
4. Choose an expiration date (or "No expiration") - recommended: 1 year
5. Click "Create" and immediately copy the generated token (this is shown only once)
   - Keep this token secure - you'll need it for the `VERCEL_TOKEN` secret

## 2. Get Vercel Organization ID

1. Go directly to [Vercel Account Settings](https://vercel.com/account)
2. Your Organization ID is displayed under "Your ID" in the right column
3. Copy this ID value - this is your `VERCEL_ORG_ID`

## 3. Get Vercel Project ID

1. Go to your project in Vercel Dashboard
2. Click on "Settings" in the top navigation
3. Find and copy the "Project ID" value - this is your `VERCEL_PROJECT_ID`
4. If you're having trouble finding it, you can also see it in the URL when viewing project settings: `https://vercel.com/[username]/[project-name]/settings`

## 4. Add Secrets to GitHub

1. Go directly to [GitHub Repository Secrets](https://github.com/EqualsAjayMadhok/nna-registry-service-mvp-frontend/settings/secrets/actions)
2. Click "New repository secret"
3. Add each secret one by one:

   | Secret Name | Value to Enter |
   |-------------|---------------|
   | `VERCEL_TOKEN` | Paste the token you copied in step 1 |
   | `VERCEL_ORG_ID` | Paste the organization ID you copied in step 2 |
   | `VERCEL_PROJECT_ID` | Paste the project ID you copied in step 3 |

4. Click "Add secret" after entering each one
5. Verify all three secrets appear in your list of repository secrets

## 5. Trigger the Workflow

After adding all three secrets, trigger the workflow again using one of these methods:

### Option 1: Empty Commit (Preferred)
```bash
git commit --allow-empty -m "Trigger workflow after adding Vercel secrets"
git push origin main
```

### Option 2: Manual Trigger
1. Go to [GitHub Actions](https://github.com/EqualsAjayMadhok/nna-registry-service-mvp-frontend/actions)
2. Select the "Deploy to Vercel Production" workflow
3. Click "Run workflow" dropdown
4. Select the "main" branch
5. Click the green "Run workflow" button

## 6. Verify Deployment Success

1. Check the [GitHub Actions page](https://github.com/EqualsAjayMadhok/nna-registry-service-mvp-frontend/actions) to ensure the workflow completes successfully
2. Visit your [Vercel Dashboard](https://vercel.com/dashboard) to confirm the deployment
3. Test the live application at your Vercel deployment URL

If you continue to encounter issues, check the workflow logs for specific error messages.