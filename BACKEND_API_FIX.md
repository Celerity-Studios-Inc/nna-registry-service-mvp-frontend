# Backend API Fix for Asset Search/Browse Feature

This document describes the issue with the asset browse/search feature and proposed fixes.

## Issue Analysis

The Browse Assets feature is currently failing with 500 Internal Server errors when trying to fetch assets. The key findings are:

1. Frontend requests are being made to `/api/assets` with proper pagination parameters
2. The serverless function in `api/assets.ts` is correctly configured to proxy to `https://registry.reviz.dev/api/assets`
3. However, the backend API is returning 500 Internal Server errors for these requests

The console logs show:
```
GET https://nna-registry-service-mvp-frontend.vercel.app/api/assets?page=1&limit=12&sortBy=createdAt&sortOrder=desc 500 (Internal Server Error)
```

The backend is identified as available via health checks, but specific asset endpoints are failing.

## Root Cause Analysis

After examining the code, the likely issues are:

1. **API Endpoint Mismatch**: There may be a mismatch between how we're calling the endpoint and what the backend expects
2. **Parameter Format**: The pagination/sorting parameters may not be formatted as expected by the backend
3. **Authentication Issues**: The backend may require authentication for asset listing that's not being properly passed
4. **Error Handling**: Better error handling on the frontend is needed to show meaningful messages

## Proposed Fixes

### 1. Update API Endpoint Handling

Modify the assets.ts serverless function to better handle various backend API formats:

```typescript
// In api/assets.ts
// Try different endpoint formats if the primary one fails
const primaryUrl = `${backendApiUrl}/assets${url.search}`;
const fallbackUrl = `${backendApiUrl}/asset/list${url.search}`;

try {
  response = await fetch(primaryUrl, {...});
} catch (error) {
  console.log('Primary endpoint failed, trying fallback');
  response = await fetch(fallbackUrl, {...});
}
```

### 2. Enhanced Error Handling in assetService.ts

Improve error handling to provide better feedback:

```typescript
// In assetService.ts
if (response.status === 500) {
  console.error("Backend server returned 500 error, unable to fetch assets");
  return {
    data: [],
    error: {
      code: response.status,
      message: "The server encountered an error while processing your request. Please try again later.",
      details: response.statusText,
      actionable: "This may be a temporary issue with the backend service. You can try switching to mock mode for testing by adding ?mock=true to the URL."
    },
    pagination: {
      total: 0,
      page: params.page || 1,
      limit: params.limit || 10,
      pages: 0
    }
  };
}
```

### 3. Add Debug Mode Option

Add a debug mode that can be enabled to show more details about API calls:

```typescript
// In assetService.ts
const debugMode = localStorage.getItem('apiDebug') === 'true' || url.searchParams.has('debug');

if (debugMode) {
  console.log('API Debug Mode: ON');
  console.log('Request URL:', targetUrl);
  console.log('Request headers:', headers);
  // etc.
}
```

### 4. Implement Temporary Mock Fallback

Add an option to view mock data when the backend is unavailable:

```typescript
// In assetService.ts
const useMockFallback = localStorage.getItem('useMockFallback') === 'true' || 
                        url.searchParams.has('mock');

if (useMockFallback || response.status >= 500) {
  console.log('Using mock data fallback for assets');
  return {
    data: this.generateDummyAssets(params.limit || 12),
    pagination: {
      total: 100, // Simulate a larger dataset
      page: params.page || 1,
      limit: params.limit || 12,
      pages: Math.ceil(100 / (params.limit || 12))
    }
  };
}
```

## Implementation Plan

1. Update the API proxy serverless functions to better handle different backend API formats
2. Add better error handling in the assetService.ts for 500 errors
3. Implement the temporary mock fallback option for testing
4. Add a debug mode toggle in the UI for easier troubleshooting
5. Add better error display to the AssetSearch component

## Long-term Solutions

1. Work with the backend team to ensure consistent API endpoints and parameter formats
2. Implement an API specification (like OpenAPI) to ensure frontend and backend remain in sync
3. Add comprehensive error logging and monitoring to catch issues earlier