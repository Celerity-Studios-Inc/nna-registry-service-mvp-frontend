# CORS Troubleshooting Guide

This guide helps diagnose and fix Cross-Origin Resource Sharing (CORS) issues that might occur with the NNA Registry Service frontend application when deployed to Vercel.

## Understanding CORS

CORS is a security feature implemented by browsers that restricts web applications from making requests to a domain different from the one that served the web application. The main errors you might see are:

- "Access to fetch at 'X' from origin 'Y' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource."
- "Response to preflight request doesn't pass access control check"

## Our Current Solution

Our application uses a three-part approach to solve CORS issues:

1. **Client-side API Configuration**: The frontend application makes requests to relative URLs (`/api/...`)
2. **Vercel Rewrites**: The `vercel.json` configuration routes requests to our serverless function
3. **API Proxy Function**: A Node.js serverless function in `api/proxy.js` adds CORS headers and forwards requests

## Common Issues and Solutions

### 1. Incorrect API URL in Frontend Code

**Symptoms**:
- Browser directly attempts to access `https://registry.reviz.dev/api` instead of using the proxy
- CORS errors in browser console
- Network tab shows requests to the wrong URL

**Solutions**:
- Verify that `src/api/api.ts` has `baseURL: '/api'` configured
- Check that environment variables are set correctly in `.env.production`
- Verify that the compiled code is using the correct URLs (inspect network requests)

### 2. Proxy Function Not Being Called

**Symptoms**:
- No logs from the proxy function in Vercel Function Logs
- Direct requests to the backend API instead of through the proxy

**Solutions**:
- Verify that `vercel.json` has the correct rewrites configuration
- Check that the proxy function is deployed correctly to Vercel
- Ensure the path in the rewrite rule matches the frontend API calls

### 3. CORS Headers Missing from Proxy Responses

**Symptoms**:
- Proxy function is called but CORS errors still occur
- Missing Access-Control-Allow-Origin headers in response

**Solutions**:
- Verify that `api/proxy.js` is setting the correct CORS headers
- Check that the headers are being set for both regular responses and OPTIONS requests
- Ensure the proxy is forwarding all necessary headers from the backend

### 4. Preflight OPTIONS Requests Failing

**Symptoms**:
- Errors specifically mentioning preflight requests
- Failed OPTIONS requests in Network tab

**Solutions**:
- Verify that the proxy correctly handles OPTIONS requests
- Check that all required CORS headers are set for OPTIONS responses
- Ensure the response status for OPTIONS requests is 204 (No Content)

### 5. Backend API Issues

**Symptoms**:
- Proxy seems to work but backend API returns errors
- Unexpected response formats or status codes

**Solutions**:
- Test the backend API directly to ensure it's working
- Check authentication headers are correctly forwarded by the proxy
- Verify that the backend URL in the proxy is correct

## Debugging Steps

1. **Examine Browser Console**: Look for specific CORS error messages
2. **Check Network Tab**: 
   - Look for failed requests
   - Examine request URLs to ensure they're using the proxy
   - Check request/response headers for CORS-related headers
3. **Inspect Vercel Function Logs**:
   - Look for error messages from the proxy function
   - Check if the proxy is being called for all API requests
4. **Test Direct API Access**:
   - Use tools like Postman or curl to test API endpoints directly
   - Compare with proxied requests to identify differences

## Advanced Troubleshooting

### Temporary CORS Testing

For testing, you can use browser extensions that disable CORS checks (like CORS Unblock for Chrome). However, this is only for local development and testing - it doesn't solve the issue for other users.

### Additional Proxy Configuration

If specific API requests require special handling:

1. Modify the proxy function to handle different request types differently
2. Add custom error handling for specific API endpoints
3. Consider adding detailed logging for troubleshooting

### Backend Configuration (if you have access)

If you have access to the backend API:

1. Configure it to accept CORS requests directly
2. Add specific origins to the allowed origins list
3. Ensure it correctly handles preflight OPTIONS requests

## When to Consider Alternative Approaches

If the proxy approach doesn't solve your CORS issues:

1. Consider using a different proxy approach (like Cloudflare Workers)
2. Talk to the backend team about enabling CORS directly
3. Evaluate if server-side rendering might help avoid some CORS limitations

Remember that CORS issues are security features, not bugs. The goal is to properly implement secure cross-origin communication, not to bypass security controls.