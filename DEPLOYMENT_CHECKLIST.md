# Vercel Deployment Checklist

This document provides a checklist to ensure proper deployment of the NNA Registry Service Frontend to Vercel.

## Prerequisites

- [ ] Node.js v14 or higher installed
- [ ] npm v6 or higher installed
- [ ] Vercel CLI installed (`npm install -g vercel`)
- [ ] Vercel account with access to the project

## Pre-Deployment Steps

1. **Check Environment Variables**
   - [ ] Verify `.env.production` has `REACT_APP_USE_MOCK_API=false`
   - [ ] Ensure `REACT_APP_API_URL=/api` is set correctly

2. **Verify API Proxy Setup**
   - [ ] Confirm `/api/proxy.js` is properly implemented
   - [ ] Ensure `vercel.json` routes are configured correctly

3. **Test Build Locally**
   - [ ] Run `npm run build` to verify the build succeeds
   - [ ] Test the build with `npm run serve` to check local functionality

## Deployment Steps

1. **Deploy to Vercel**
   - [ ] Use the deployment script: `./deploy-to-vercel.sh`
   - [ ] Or manually run: `vercel --prod`

2. **Verify Environment Variables in Vercel**
   - [ ] In Vercel dashboard, go to your project > Settings > Environment Variables
   - [ ] Verify the following variables are set:
     - `REACT_APP_API_URL=/api`
     - `REACT_APP_USE_MOCK_API=false`

## Post-Deployment Verification

1. **Check Frontend Functionality**
   - [ ] Visit the deployed site URL
   - [ ] Verify the application loads without JavaScript errors
   - [ ] Test user registration and login
   - [ ] Test asset creation and viewing

2. **Verify API Connection**
   - [ ] Check browser network tab for API calls
   - [ ] Ensure API calls get proper responses (not CORS errors)
   - [ ] Verify authentication flow works

3. **Check CORS Headers**
   - [ ] In browser developer tools, examine network requests
   - [ ] For OPTIONS requests, ensure correct CORS headers are returned
   - [ ] For API requests, check response headers contain proper CORS headers

## Troubleshooting

If issues are encountered, check the following:

1. **CORS Issues**
   - Verify the `/api/proxy.js` file correctly sets CORS headers
   - Check that preflight OPTIONS requests are handled properly
   - Ensure the target API allows requests from your Vercel domain

2. **API Connection Problems**
   - Check Vercel function logs for any errors in the proxy
   - Verify the target API endpoint is correct and accessible
   - Test API connection directly to ensure the backend is responsive

3. **Build Issues**
   - Review Vercel build logs for any errors
   - Ensure dependencies are properly installed
   - Check for any environment variable issues during build

## Vercel Configuration Reference

Proper `vercel.json` configuration:

```json
{
  "version": 2,
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/proxy"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

Proper proxy implementation:
- Handle OPTIONS requests explicitly
- Set CORS headers on all responses
- Forward request headers and body correctly
- Handle errors gracefully