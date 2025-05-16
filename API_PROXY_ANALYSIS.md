# API Proxy Analysis and 500 Error Debugging

This document provides a detailed analysis of the API proxy implementation in the codebase and why it's encountering 500 errors when fetching assets.

## GitHub Repository

All file paths reference the GitHub repository: https://github.com/EqualsAjayMadhok/nna-registry-service-mvp-frontend

## Key API Proxy Files

1. `api/assets.ts` - Proxy for asset operations (GET, POST)  
   https://github.com/EqualsAjayMadhok/nna-registry-service-mvp-frontend/blob/main/api/assets.ts

2. `api/assets-search.ts` - Handles advanced asset search  
   https://github.com/EqualsAjayMadhok/nna-registry-service-mvp-frontend/blob/main/api/assets-search.ts

3. `api/backend-url.ts` - Provides backend URL configuration  
   https://github.com/EqualsAjayMadhok/nna-registry-service-mvp-frontend/blob/main/api/backend-url.ts

4. `api/proxy.ts` - Generic proxy implementation  
   https://github.com/EqualsAjayMadhok/nna-registry-service-mvp-frontend/blob/main/api/proxy.ts

5. `src/api/assetService.ts` - Frontend service that calls the API  
   https://github.com/EqualsAjayMadhok/nna-registry-service-mvp-frontend/blob/main/src/api/assetService.ts

## Current Implementation

The current proxy setup works as follows:

### 1. Frontend API Requests

The frontend makes requests to the API endpoints:

```typescript
// In assetService.ts (line 277)
const response = await fetch(`/api/assets?${queryParams.toString()}`, {
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  }
});
```

### 2. Vercel Serverless Functions

These requests are handled by Vercel serverless functions:

```typescript
// In assets.ts (line 25)
const backendUrl = 'https://registry.reviz.dev/api/assets';

// In assets.ts (line 145)
const response = await fetch(finalUrl, {
  method: req.method,
  headers: headers,
  body: body,
});
```

### 3. Backend URL Configuration

The backend URL is hardcoded in multiple places:

```typescript
// In backend-url.ts (line 21)
const backendApiUrl = process.env.BACKEND_API_URL || 'https://registry.reviz.dev/api';

// In assets.ts (line 25)
const backendUrl = 'https://registry.reviz.dev/api/assets';

// In assets-search.ts (line 24)
const backendUrl = 'https://registry.reviz.dev/api/assets/search';
```

## 500 Error Analysis

The error logs show:

1. Health check endpoint works: `/api/health` and `/api/test-real-backend` report backend is available
2. Actual asset fetch fails: `GET /api/assets?page=1&limit=12&sortBy=createdAt&sortOrder=desc` returns 500
3. The error is happening in the backend, not in the proxy itself

### Likely Causes of 500 Errors

1. **Authentication Issues**: 
   - The backend may require specific authentication that's not being passed correctly
   - The token might be valid for the health endpoint but not for the assets endpoint

2. **Request Parameter Validation**:
   - The backend may be validating the request parameters and rejecting them
   - Parameters like `sortBy` or `sortOrder` might not be supported or have invalid values

3. **Backend Service Error**:
   - The backend service handling assets might be failing internally
   - Database queries might be timing out or returning errors

4. **Environment Configuration**:
   - The wrong backend URL might be used
   - Required environment variables might be missing on the backend

5. **Header Issues**:
   - CORS or content-type headers might be causing issues
   - Custom headers required by the backend might be missing

## Code Analysis

Looking at the implementation details:

### 1. Headers Forwarding

```typescript
// In assets.ts (line 62)
const headers: Record<string, string> = {};
    
// Copy relevant headers, but be careful to preserve Content-Type exactly as is
Object.entries(req.headers).forEach(([key, value]) => {
  // Skip host header which will be set by fetch
  if (key.toLowerCase() !== 'host' && typeof value === 'string') {
    headers[key] = value;
  }
});

// Set a specific Host header for the backend
headers['host'] = 'registry.reviz.dev';
```

### 2. Error Handling

```typescript
// In assets.ts (line 158)
if (response.status >= 400) {
  console.error(`ASSETS HANDLER - Backend returned error status: ${response.status}`);
  console.error(`ASSETS HANDLER - Error response body: ${responseBody.substring(0, 1000)}`);
  
  // Add more detailed error logging with highlighted formatting
  console.error(`
====================== ASSET CREATION ERROR ======================
Status: ${response.status} ${response.statusText}
URL: ${finalUrl}
Method: ${req.method}
Content-Type: ${contentType}
Authorization: ${headers['authorization'] ? 'Present' : 'Missing'}
FormData: ${isMultipart ? 'Yes (multipart/form-data)' : 'No'}

Error Response:
${responseBody.substring(0, 1000)}

Request Headers:
${JSON.stringify(headers, null, 2)}
====================== END ERROR DETAILS ======================
`);
}
```

### 3. Backend Response Handling

```typescript
// In assets.ts (line 182)
try {
  parsedResponse = JSON.parse(responseBody);

  // Add more helpful information to errors
  if (response.status === 400) {
    parsedResponse = {
      ...parsedResponse,
      _debug: {
        message: "The server returned a 400 Bad Request error. This typically indicates missing required fields or validation errors.",
        // ...
      }
    };
  } else if (response.status === 500) {
    // Add debug information for Internal Server Errors
    parsedResponse = {
      ...parsedResponse,
      _debug: {
        message: "The server returned a 500 Internal Server Error. This could be due to server-side issues processing the request.",
        // ...
      }
    };
  }
} catch (e) {
  // If not valid JSON, return the raw text
  parsedResponse = {
    text: responseBody,
    error: "Response couldn't be parsed as JSON",
    status: response.status,
    message: response.statusText,
    timestamp: new Date().toISOString()
  };
}
```

## Debugging Plan

To fix the 500 error issues, we need to:

1. **Get detailed error information** from the backend response
2. **Standardize backend URL configuration** across all API endpoints
3. **Implement better diagnostics** for API failures
4. **Create test endpoints** to verify connectivity with different parameters

## Implementation Plan

### 1. Create API Config File

```typescript
// Create api/config.ts
export const CONFIG = {
  BACKEND_URL: process.env.BACKEND_API_URL || 'https://registry.reviz.dev/api',
  TIMEOUT: 15000, // 15 seconds timeout
  DEBUG: process.env.NODE_ENV !== 'production',
};
```

### 2. Update Assets Endpoint

```typescript
// Update api/assets.ts to use the config
import { CONFIG } from './config';

// Replace hardcoded URL
const backendUrl = `${CONFIG.BACKEND_URL}/assets`;

// Improve error logging
if (response.status >= 400) {
  console.error(`
ASSETS ERROR REPORT:
URL: ${finalUrl}
Method: ${req.method}
Status: ${response.status}
Response: ${responseBody.substring(0, 500)}
`);
}
```

### 3. Create Debugging Endpoint

```typescript
// Create api/debug-backend.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';
import { CONFIG } from './config';

async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const endpoint = req.query.endpoint as string || 'assets';
  const params = req.query.params as string || '';
  const token = req.headers.authorization || '';
  
  try {
    // Make request to backend
    const url = `${CONFIG.BACKEND_URL}/${endpoint}${params ? `?${params}` : ''}`;
    console.log(`Making request to: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Host': new URL(CONFIG.BACKEND_URL).host,
      },
      timeout: CONFIG.TIMEOUT,
    });
    
    const data = await response.text();
    let parsedData;
    try {
      parsedData = JSON.parse(data);
    } catch (e) {
      parsedData = { text: data };
    }
    
    return res.status(200).json({
      success: true,
      statusCode: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: parsedData,
      endpoint,
      params,
      hasAuth: !!token,
      url,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      endpoint,
      params,
    });
  }
}

module.exports = handler;
```

### 4. Test Minimal Parameters

```typescript
// Create api/test-minimal-assets.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';
import { CONFIG } from './config';

async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Make request with minimal parameters
    const url = `${CONFIG.BACKEND_URL}/assets?limit=1`;
    console.log(`Making minimal request to: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: CONFIG.TIMEOUT,
    });
    
    const contentType = response.headers.get('content-type') || '';
    let data;
    
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    return res.status(200).json({
      success: true,
      statusCode: response.status,
      contentType,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

module.exports = handler;
```

## Next Steps

1. Deploy these diagnostic endpoints to gather more information
2. Test with different parameter combinations to identify which trigger errors
3. Update all API proxy files to use the standardized configuration
4. Implement better error handling and diagnostics
5. Add fallback to mock data when backend is unavailable

This systematic approach will help identify and fix the 500 errors without relying on hardcoded special cases.