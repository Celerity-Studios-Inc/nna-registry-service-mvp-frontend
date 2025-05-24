# Super Simple Manual Deployment Instructions

Since we're having trouble with GitHub Actions authentication, I've created a much simpler approach to deploy directly from your computer. This method doesn't require Docker, GitHub Actions, or service account keys.

## Why This Approach Is Better

1. No Docker required - Google Cloud will build the container for you
2. No GitHub authentication issues - you'll authenticate directly
3. Much faster and simpler process
4. No need to set up service accounts or keys

## Step-by-Step Instructions (No Programming Knowledge Required)

### Step 1: Open Terminal

1. Click the Spotlight (magnifying glass) in the top-right of your screen
2. Type "Terminal" and press Enter

### Step 2: Navigate to the Frontend Project

1. In the Terminal, type this command exactly as shown and press Enter:
   ```
   cd /Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend
   ```

### Step 3: Run the Direct Deployment Script

1. Type this command and press Enter:
   ```
   ./direct-manual-deploy.sh
   ```

2. Follow the simple prompts:
   - A browser window will open for Google Cloud login
   - Log in with your Google account
   - Return to the terminal window
   - The script will handle the rest!

3. Wait for deployment to complete (5-10 minutes)
   - You'll see progress messages in the terminal
   - The script will create a special deployment configuration
   - Google Cloud will build and deploy your service automatically

### Step 4: Verify the Deployment

1. When the script completes, you'll see a URL like:
   ```
   https://nna-registry-service-us-central1.a.run.app
   ```

2. Open this URL in your browser to verify the backend is running

### What If Something Goes Wrong?

If you encounter any issues:
1. Take a screenshot of the error message
2. Share it with me, and I'll provide a solution

## What This Script Does Behind the Scenes

1. Logs you into Google Cloud
2. Sets the correct project ID
3. Creates a simple deployment configuration (app.yaml)
4. Packages your code for deployment
5. Deploys directly to Google Cloud Run

No complicated Docker builds, GitHub Actions, or service account configuration required!