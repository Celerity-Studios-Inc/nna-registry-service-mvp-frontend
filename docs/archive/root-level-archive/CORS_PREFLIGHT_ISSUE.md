# CORS Preflight Issue with Direct Backend

## Date: June 17, 2025

## Issue Discovered
When attempting to use the direct backend URL (`https://registry.reviz.dev/api/assets`) for file uploads with the Authorization header, we encounter CORS preflight errors.

## Error Message
```
Access to fetch at 'https://registry.reviz.dev/api/assets' from origin 'https://nna-registry-service-mvp-frontend.vercel.app' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Root Cause
The Authorization header triggers a CORS preflight OPTIONS request. While the backend is configured to handle simple POST requests (without Authorization header), it's not properly configured to handle preflight OPTIONS requests.

## Why It Worked Before
In previous tests where 30MB uploads succeeded, the implementation might have:
1. Not included the Authorization header
2. Used a different authentication method
3. Had different CORS configuration on the backend

## Current Solution
Use the Vercel proxy (`/api/assets`) for all uploads. This avoids CORS issues but limits file sizes to 4.5MB due to Vercel's payload size limit.

## Backend Fix Required
To support large file uploads (>4.5MB), the backend needs to:

1. **Handle OPTIONS Preflight Requests**
   ```
   Access-Control-Allow-Origin: https://nna-registry-service-mvp-frontend.vercel.app
   Access-Control-Allow-Methods: GET, POST, OPTIONS
   Access-Control-Allow-Headers: Authorization, Content-Type
   Access-Control-Max-Age: 86400
   ```

2. **Respond to OPTIONS requests** with 200 OK and the above headers

3. **Include CORS headers** in all responses (GET, POST, etc.)

## Temporary Workaround
Files are limited to 4.5MB until the backend CORS configuration is fixed. The frontend will show a warning for files over 4.5MB.

## Files Modified
- `/src/api/assetService.ts` - Reverted to use proxy for all uploads