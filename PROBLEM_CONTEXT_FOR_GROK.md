# NNA Registry Service Frontend: Problem Context and Solution Attempts

## Problem Overview

The NNA Registry Service Frontend is a React/TypeScript application for managing digital assets within a Naming, Numbering, and Addressing (NNA) Framework. We are facing two critical deployment issues:

1. **CORS Issues**: When deployed to Vercel, the frontend application cannot communicate with the backend API (hosted at registry.reviz.dev) due to Cross-Origin Resource Sharing (CORS) restrictions.

2. **CI/CD Automation**: We need to set up automated deployment through GitHub Actions to streamline the deployment process to Vercel.

## Technical Details of the Problems

### CORS Issue Details

- **Error Messages**: "Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource."
- **Current API Configuration**: The frontend is configured to directly access `https://registry.reviz.dev/api`
- **Browser Behavior**: Modern browsers block these cross-origin requests without proper CORS headers
- **Backend Constraints**: We don't have direct access to modify the backend API to add CORS headers

### CI/CD Automation Challenges

- **Manual Deployment Process**: Currently, deployments require manual steps
- **GitHub Actions Configuration**: Previous workflow attempts have had issues with branch references
- **Vercel Configuration**: The Vercel setup needs proper environment variables and build commands
- **TypeScript Errors**: Previous attempts introduced TypeScript errors when modifying API configuration

## Previous Unsuccessful Attempts

### Attempt 1: Direct CORS Headers in vercel.json

We tried adding CORS headers directly in the Vercel configuration:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,PUT,DELETE,OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "X-Requested-With, Content-Type, Accept" }
      ]
    }
  ]
}
```

**Result**: Failed because Vercel can't add CORS headers to external API responses.

### Attempt 2: Modifying API Client Without Proxy

We tried changing the API client to use different configurations for development vs. production:

```typescript
// Problematic change in src/api/api.ts
export const apiConfig = {
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://registry.reviz.dev/api' 
    : 'http://localhost:3000/api',
};
```

**Result**: Failed with TypeScript errors because it didn't account for the entire API service architecture.

### Attempt 3: Simple Proxy Without CORS Handling

We implemented a basic proxy function without proper CORS handling:

```javascript
// api/proxy.js (incomplete version)
module.exports = (req, res) => {
  const targetUrl = `https://registry.reviz.dev${req.url}`;
  fetch(targetUrl).then(response => response.json()).then(data => {
    res.json(data);
  });
};
```

**Result**: Failed with CORS errors on non-GET requests and didn't handle headers properly.

### Attempt 4: GitHub Action with Hardcoded Branch

We created a GitHub Actions workflow that referenced a specific branch:

```yaml
# .github/workflows/deploy.yml
steps:
  - uses: actions/checkout@v3
    with:
      ref: feature/specific-branch  # Hardcoded branch
```

**Result**: Failed because it always deployed code from the specified branch, not the actual main branch.

## Current Solution Plan

After multiple attempts, we've developed a comprehensive solution:

### 1. API Proxy Approach

- **Serverless Function**: Created a full-featured proxy in `api/proxy.js`
- **Proper CORS Handling**: Added complete CORS headers for all request types
- **Request Forwarding**: Properly forwards all headers, methods, and body content
- **Environment Configuration**: Updated `.env.production` to use relative URL paths

### 2. Vercel Configuration

- **Rewrite Rules**: Added proper rewrite rules in `vercel.json` to route API requests
- **Framework Configuration**: Set correct framework and build settings
- **Removed Problematic Headers**: Eliminated conflicting header configurations

### 3. API Client Updates

- **Relative URLs**: Modified API client to use relative URL paths that work with the proxy
- **Simplified Configuration**: Removed environment-specific logic that caused TypeScript errors

### 4. GitHub Actions Workflow

- **Dynamic Branch Reference**: Fixed workflow to use the code that triggered the workflow
- **Environment Setup**: Added proper environment variable configuration
- **Deployment Commands**: Used the recommended Vercel action for deployment

## Document Locations

Here are the key documents that detail our solution:

1. **Main Configuration Files**:
   - `/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend/vercel.json`
   - `/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend/.env.production`
   - `/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend/src/api/api.ts`
   - `/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend/.github/workflows/main-deploy.yml`
   - `/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend/api/proxy.js`

2. **Documentation Files**:
   - `/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend/PR_INSTRUCTIONS.md`: Steps to create the pull request
   - `/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend/DEPLOYMENT_VERIFICATION.md`: How to verify the deployment works
   - `/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend/VERCEL_SECRETS_SETUP.md`: How to set up required secrets
   - `/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend/CORS_TROUBLESHOOTING.md`: Detailed CORS issue troubleshooting
   - `/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend/VERCEL_LOGS.md`: How to monitor deployment logs
   - `/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend/README_DEPLOYMENT_UPDATE.md`: Updated README deployment section
   - `/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend/DEPLOYMENT_SUMMARY.md`: Comprehensive overview of the solution

3. **Technical Documentation**:
   - `/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend/docs/NNA Framework Whitepaper Ver 1.1.2 - Slab.md`: Framework overview
   - `/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend/docs/NNA Registry Service Frontend Implementation Plan Ver 1.2.2 - Slab.md`: Implementation plan

## Specific Challenges for Grok to Help With

1. **Verifying CORS Solution**: Is our API proxy approach with Vercel serverless functions the most appropriate solution? Are there any edge cases we haven't considered?

2. **GitHub Actions Configuration**: Is our workflow configuration optimal for CI/CD with Vercel? Are there any best practices we should incorporate?

3. **TypeScript Integration**: Previous attempts caused TypeScript errors. Have we properly isolated the API changes to avoid breaking type checking?

4. **Proxy Performance**: Will our serverless function approach scale well? Are there performance optimizations we should consider?

5. **Security Considerations**: Are there any security concerns with our API proxy implementation?

## Next Steps

1. Create and merge the pull request as per PR_INSTRUCTIONS.md
2. Verify the deployment works correctly following DEPLOYMENT_VERIFICATION.md
3. Monitor the logs using the instructions in VERCEL_LOGS.md
4. If issues persist, apply the troubleshooting steps in CORS_TROUBLESHOOTING.md

Any advice from Grok on these aspects would be greatly appreciated.