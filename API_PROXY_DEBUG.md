# API Proxy Debugging Guide

## Current Issue

The application is still using mock data in production despite being configured to use the real backend API. This is evidenced by the log message `Using mock createAsset implementation` in the console and mock asset IDs being generated.

## Investigation Findings

1. **Environment Configuration:**
   - `.env.production` correctly has `REACT_APP_USE_MOCK_API=false`
   - `vercel.json` correctly includes this variable in its "env" section
   - GitHub workflow (`main-deploy.yml`) correctly sets this variable

2. **API Proxy Setup:**
   - The proxy has moved from a direct Vercel rewrite to a serverless function at `/api/proxy.ts`
   - This function correctly forwards requests to `https://registry.reviz.dev/api`

3. **Runtime Environment Variable Issue:**
   - Despite correct configuration, the application appears to be reading `REACT_APP_USE_MOCK_API` as `true` at runtime
   - This causes `assetService.ts` to use mock implementations instead of making real API calls

## Debugging Changes Made

1. Added environment variable debugging:
   - Created `src/api/envCheck.ts` to log and check environment variables
   - Added logging to `index.tsx` to check values at startup
   - Enhanced `assetService.ts` to log environment variable values

2. Enhanced the API proxy with detailed logging:
   - Request information (method, path, headers, body)
   - Response information (status, headers, body preview)
   - Better error handling with more detailed error messages

## Recommended Solutions

Try the following approaches in order:

1. **Verify Build Process:**
   - Check that the Vercel build is correctly including environment variables
   - The build logs should show `REACT_APP_USE_MOCK_API=false` 

2. **Update Vercel Project Settings:**
   - Go to the Vercel dashboard for this project
   - Navigate to "Settings" > "Environment Variables"
   - Check that `REACT_APP_USE_MOCK_API` is set to `false` for the Production environment
   - If not, add or update this variable

3. **Force Environment Variable in Code:**
   - If the above doesn't work, you can temporarily hardcode the value in `assetService.ts` by changing:
     ```typescript
     const useMock = process.env.REACT_APP_USE_MOCK_API === 'true';
     ```
     to:
     ```typescript
     const useMock = false; // Force real API usage in production
     ```

4. **Update Deployment Scripts:**
   - If needed, update the GitHub Actions workflow to add a post-build step that verifies the environment variables were correctly included in the build

5. **Test with a Manual Deployment:**
   - Create a test branch with these debugging changes
   - Deploy it manually using Vercel CLI with explicit environment variables
   - Check the logs for any issues

## Monitoring the Fix

After implementing any of the solutions above:

1. Check the Function Logs in the Vercel dashboard
2. Review the application logs in the browser console
3. Test creating an asset and verify if real or mock data is being used

## Reference Information

- Backend API URL: https://registry.reviz.dev/api
- API Proxy implementation: `/api/proxy.ts`
- Asset service implementation: `src/api/assetService.ts` 
- Environment configuration: `vercel.json` and `.env.production`