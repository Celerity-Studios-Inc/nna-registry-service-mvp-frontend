# API Proxy Debugging Guide

## Current Issues

### Issue 1: Mock Data Usage (FIXED)

The application was using mock data in production despite being configured to use the real backend API. This was evidenced by the log message `Using mock createAsset implementation` in the console and mock asset IDs being generated.

### Issue 2: API Proxy Path Handling (FIXED)

After fixing the mock data issue, we encountered a problem with the API proxy's path handling. The API requests were being sent to `https://nna-registry-service-mvp-frontend.vercel.app/api/assets` instead of `https://registry.reviz.dev/api/assets`, resulting in 405 Method Not Allowed errors.

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

## Solutions Implemented

We've implemented the following solutions to fix the issues:

### For Issue 1 (Mock Data Usage):

1. **Added Environment Variable Debugging:**
   - Created `src/api/envCheck.ts` to log environment variable values
   - Added logging to startup in `index.tsx`

2. **Domain Detection Logic:**
   - Added code to detect production domains and force real API usage regardless of environment variable values:
     ```typescript
     // Check if we're in a production domain - if so, force real API usage
     const isProductionDomain = window.location.hostname.includes('vercel.app') || 
                               window.location.hostname.includes('registry-service-frontend');
     
     // Force real API in production environments
     if (isProductionDomain) {
       useMock = false;
       console.log("Production domain detected. Forcing real API usage.");
     }
     ```

### For Issue 2 (API Proxy Path Handling):

1. **Fixed Path Handling in API Proxy:**
   - Updated `/api/proxy.ts` to correctly handle path transformations:
     ```typescript
     const path = req.url || '';
     const cleanPath = path.replace('/proxy', '');
     const targetUrl = `https://registry.reviz.dev/api${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
     ```

2. **Simplified Vercel Rewrites:**
   - Updated `vercel.json` to use a simpler rewrite rule:
     ```json
     {
       "source": "/api/:path*",
       "destination": "/api/proxy"
     }
     ```

3. **Enhanced API Client Logging:**
   - Added detailed request logging to track API calls
   - Added visual indicators in console logs to make them easier to find

## Additional Troubleshooting Steps

If issues persist, try the following:

1. **Check Vercel Function Logs:**
   - View logs in the Vercel dashboard under Functions > /api/proxy
   - Look for errors or unexpected behavior

2. **Test Direct API Requests:**
   - Use tools like Postman to test requests directly to the backend
   - Compare with proxied requests to identify differences

3. **Check for Network Issues:**
   - Use browser Network tab to check for CORS issues or other errors
   - Look for failed requests or unexpected redirects

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