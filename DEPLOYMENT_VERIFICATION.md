# Deployment Verification Guide

This guide will help you verify that the application has been deployed correctly and is using the real backend API instead of mock data.

## Step 1: Monitor Deployment

1. **GitHub Actions Workflow**
   - Go to: https://github.com/EqualsAjayMadhok/nna-registry-service-mvp-frontend/actions
   - Look for the most recent workflow run (should be from the commit we just pushed)
   - Verify that it completes successfully (green checkmark)

2. **Vercel Deployment**
   - Go to: https://vercel.com/dashboard
   - Select the NNA Registry Service Frontend project
   - Check the "Deployments" tab for the latest deployment
   - Verify that it's completed successfully

## Step 2: Check the Deployed Application

1. **Access the Application**
   - Go to: https://registry-service-frontend.vercel.app
   - Login with your credentials

2. **Open Browser Developer Tools**
   - Right-click on the page and select "Inspect" or press F12
   - Go to the "Console" tab
   - Look for logs related to environment variables and API usage

3. **Check for Environment Variable and API Configuration Logs**
   - You should see logs from our added debugging code like:
     ```
     Application starting with environment: {apiUrl: "/api", useMockApi: "false", useMockEvaluated: false}
     API Configuration: {baseURL: "/api"}
     🔄 API Client configured with baseURL: /api
     ```
   - If on a production domain, you should see:
     ```
     Production domain detected. Forcing real API usage.
     useMock determined as: false
     ```
   - When making API requests, you should see logs like:
     ```
     🔼 API Request: POST /api/assets
     ```

## Step 3: Test API Integration

1. **Register a New Asset**
   - Navigate to "Register Asset" in the sidebar
   - Fill out the asset registration form
   - Upload a test image
   - Submit the registration

2. **Check API Logs in Console**
   - Look for logs like:
     ```
     API Proxy: POST request to /assets
     Original URL: /assets
     Cleaned path: /assets
     Proxying to: https://registry.reviz.dev/api/assets
     ```
   - Verify there are no errors related to the API proxy
   - Ensure the proxy URL correctly shows `https://registry.reviz.dev/api/assets` and not the frontend domain

3. **Verify Real Asset Creation**
   - After successful registration, check if the asset was created with a real ID
   - Real IDs typically follow a pattern like UUID format
   - Mock IDs include "mock" in the string (e.g., "mock-asset-1746720202295")

## Step 4: Search for Created Asset

1. **Browse Assets**
   - Navigate to "Browse Assets" in the sidebar
   - Search for the asset you just created

2. **Verify Asset Details**
   - Open the asset details page
   - Confirm all details match what you entered
   - Verify that the asset has both human-friendly name (HFN) and machine-friendly address (MFA)

## Troubleshooting

### If the application is still using mock data:

1. **Check Vercel Environment Variables**
   - Go to the Vercel project settings
   - Verify that `REACT_APP_USE_MOCK_API` is set to `false`

2. **Verify Domain Detection**
   - Check the console logs for "Production domain detected"
   - Ensure the hostname includes "vercel.app" or "registry-service-frontend"

3. **Clear Browser Cache**
   - Try opening the site in an incognito/private window
   - Or clear your browser cache and reload

### If API proxy errors occur (405 Method Not Allowed):

1. **Check Function Logs**
   - In Vercel dashboard, go to "Functions"
   - Look for the `/api/proxy` function
   - Check the logs for errors or unexpected path handling

2. **Verify Proxy Path Cleaning**
   - Look for console logs showing "Original URL" and "Cleaned path"
   - Ensure the "Proxying to" URL correctly points to `https://registry.reviz.dev/api/...`
   - Make sure requests aren't being sent to the frontend domain

3. **Test Backend API Directly**
   - Try accessing `https://registry.reviz.dev/api/docs` directly
   - Ensure the backend API is working correctly

4. **Reference Documentation**
   - For detailed troubleshooting, refer to `API_PROXY_DEBUG.md`
   - For proxy configuration details, check the `vercel.json` file

## Success Criteria

Your deployment is successful if:

1. The GitHub Actions workflow completes successfully
2. The Vercel deployment completes without errors
3. The application logs show "useMock determined as: false"
4. API requests are being proxied to https://registry.reviz.dev
5. Created assets have real IDs (not containing "mock-asset")