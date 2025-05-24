# API Proxy Regression Fix

## Issue Description

A regression was identified in the asset creation workflow where attempts to create assets using the real backend API were failing with a 500 Internal Server Error. The console error showed:

```
POST https://registry-service-frontend.vercel.app/api/proxy?path=assets 500 (Internal Server Error)
assetService.ts:833 API response status: 500
assetService.ts:837 Asset creation failed: Error handling backend response
```

## Root Cause Analysis

After careful investigation of recent code changes, we identified the regression was introduced when changing from the direct `/api/assets` endpoint to the `/api/proxy?path=assets` endpoint in commit 8c1d881.

The proxy endpoint has issues handling FormData correctly, especially for multipart/form-data requests containing file uploads. The proxy implementation in `proxy.ts` isn't properly forwarding the binary data of the FormData object, leading to malformed requests at the backend.

## Solution

The solution is to revert to using the direct `/api/assets` endpoint, which is specifically designed to handle FormData correctly with proper binary data handling. The `assets.ts` serverless function was built for this exact purpose and has special handling for multipart/form-data.

These changes:

1. Replace the proxy endpoint URL with the direct assets endpoint
2. Update the documentation to explain the importance of using the dedicated endpoint for FormData
3. Maintain all the field format improvements we've made to ensure backend compatibility

## Testing

This fix should be tested by:

1. Creating a new asset with the application using the real backend API
2. Monitoring the network requests in the browser's developer tools
3. Verifying that the asset creation request goes to `/api/assets` and returns a successful response
4. Confirming the asset is created and appears in the backend database

## Related Issues

This resolves a regression introduced in commit 8c1d881 which was trying to fix CORS issues by using the proxy endpoint. The dedicated assets endpoint already has proper CORS handling, so this change maintains that fix while correctly handling FormData.