# Backend Connection Fix Plan

## Issue Summary

The frontend is experiencing 500 errors when trying to fetch assets from the backend. Key observations:

1. The backend health check endpoint (`/api/health` and `/api/test-real-backend`) report that the backend is available and working.
2. However, actual asset fetching fails with 500 errors when calling `/api/assets`.
3. The error logs show the request reaches the backend but returns an Internal Server Error.

## Root Causes

1. **Hard-coded Backend URL**: The assets.ts serverless function hardcodes the backend URL to `https://registry.reviz.dev/api/assets`, which may not be the correct URL or may have connectivity issues.

2. **Authentication Issues**: The request may not include the correct authentication headers or credentials needed by the backend.

3. **Request Format Issues**: There may be a mismatch between the request format the backend expects and what is being sent.

## Fix Implementation Plan

### 1. Update Backend URL Configuration

Create a centralized backend URL configuration to ensure consistency:

```typescript
// In api/config.ts (create this file)
export const CONFIG = {
  BACKEND_URL: process.env.BACKEND_API_URL || 'https://registry.reviz.dev/api',
  // Add alternate backends for fallback if needed
  FALLBACK_BACKEND_URL: process.env.FALLBACK_BACKEND_URL || 'https://backup-registry.reviz.dev/api',
  // Timeout settings
  TIMEOUT: 10000, // 10 seconds
};
```

### 2. Update the assets.ts Serverless Function

Modify the assets.ts file to use the centralized configuration:

```typescript
// Import the config
import { CONFIG } from './config';

// Replace the hardcoded backend URL
const backendUrl = CONFIG.BACKEND_URL + '/assets';
```

### 3. Add Error Handling and Diagnostics

Enhance the error handling in the assets.ts file:

```typescript
// Add detailed error logging
console.error(`ASSETS HANDLER ERROR DETAILS:
  URL: ${backendUrl}
  Method: ${req.method}
  Headers: ${JSON.stringify(headers, null, 2)}
  Status: ${response.status}
  Response: ${responseBody.substring(0, 200)}
`);

// Try fallback if main backend fails
if (response.status >= 500) {
  console.log('Attempting fallback backend...');
  const fallbackUrl = CONFIG.FALLBACK_BACKEND_URL + '/assets';
  // Repeat request to fallback
  // ...
}
```

### 4. Check Authentication

Verify that the authentication token is being correctly passed to the backend:

```typescript
// Log authentication status (don't log the actual token)
console.log('Authentication header present:', !!headers['authorization']);
```

### 5. Test with a Basic Query First

Add a simple test endpoint to verify basic connectivity:

```typescript
// In api/test-backend.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';
import { CONFIG } from './config';

async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Make a simple GET request to the assets endpoint
    const response = await fetch(`${CONFIG.BACKEND_URL}/assets?limit=1`, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.text();
    
    return res.status(200).json({
      status: response.status,
      ok: response.ok,
      data: data.substring(0, 500) + '...',
      headers: response.headers.raw()
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

module.exports = handler;
```

### 6. Review API Proxy Implementation

The current implementation uses a direct proxy to `registry.reviz.dev` which might be causing issues. Consider using a more robust proxy solution:

```typescript
// In api/assets.ts
// Add timeout to fetch requests
const response = await fetch(backendUrl, {
  method: req.method,
  headers: headers,
  body: body,
  timeout: CONFIG.TIMEOUT,
  follow: 3 // follow up to 3 redirects
});
```

## Verification Steps

1. Create a simple test endpoint that just verifies connectivity to the backend
2. Test fetching a single asset with minimal parameters
3. Test with various query parameters to identify if certain parameters trigger the error
4. Deploy the changes gradually to verify each fix
5. Add monitoring to track error rates before and after the changes

## Fallback Plan

If the backend integration cannot be fixed immediately, implement a fallback to mock data:

```typescript
// In the assets handler
if (response.status >= 500) {
  console.log('Backend failed, falling back to mock data');
  
  // Return mock data that matches the expected format
  return res.status(200).json({
    success: true,
    data: {
      items: generateMockAssets(10),
      total: 10,
      page: 1,
      limit: 10
    }
  });
}

// Mock asset generator function
function generateMockAssets(count: number) {
  // Generate mock assets...
}
```

This plan provides a comprehensive approach to debugging and fixing the backend connectivity issues while ensuring the application remains functional.