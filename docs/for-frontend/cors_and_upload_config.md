# CORS and File Upload Configuration

## Overview
This document outlines the CORS (Cross-Origin Resource Sharing) and file upload configuration for the NNA Registry Service.

## CORS Configuration

### GCS Bucket CORS Policy (as of July 2025)

We use separate CORS JSON files for each environment, versioned in the repo:
- `cors-dev.json` for development
- `cors-staging.json` for staging
- `cors-prod.json` for production

**Example CORS JSON:**

- Development (`cors-dev.json`):
```json
[
  {
    "origin": ["https://nna-registry-frontend-dev.vercel.app", "http://localhost:3000"],
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"],
    "method": ["GET", "HEAD", "OPTIONS"],
    "maxAgeSeconds": 3600
  }
]
```
- Staging (`cors-staging.json`):
```json
[
  {
    "origin": ["https://nna-registry-frontend-stg.vercel.app"],
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"],
    "method": ["GET", "HEAD", "OPTIONS"],
    "maxAgeSeconds": 3600
  }
]
```
- Production (`cors-prod.json`):
```json
[
  {
    "origin": ["https://nna-registry-frontend.vercel.app"],
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"],
    "method": ["GET", "HEAD", "OPTIONS"],
    "maxAgeSeconds": 3600
  }
]
```

### Applying the Policy

To apply a CORS policy to a bucket:
```sh
gsutil cors set cors-dev.json gs://nna_registry_assets_dev
gsutil cors set cors-staging.json gs://nna_registry_assets_stg
gsutil cors set cors-prod.json gs://nna_registry_assets_prod
```

### Troubleshooting
- Ensure the `origin` matches the frontend domain exactly (no typos, correct order).
- After applying, wait a few minutes and clear browser cache.
- Use `gsutil cors get gs://<bucket>` to verify the active policy.
- CORS errors in the browser are almost always due to a mismatch in the allowed origins.

## Backend/API CORS
The service is configured to allow requests from the following origins:
- https://nna-registry-service-frontend.vercel.app
- https://nna-registry-service.vercel.app
- http://localhost:3000
- http://localhost:3001

### Allowed Methods
- GET
- POST
- PUT
- DELETE
- PATCH
- OPTIONS

### Allowed Headers
- Content-Type
- Authorization
- X-File-Id
- Content-Length
- Accept
- Origin
- X-Requested-With

### Exposed Headers
- Content-Length
- Content-Range

### Additional CORS Settings
- Credentials: true (allows cookies and authentication headers)
- Max Age: 3600 seconds (1 hour) for preflight request caching

## File Upload Configuration

### Size Limits
- Maximum file size: 32MB for all layers
- No per-layer size restrictions

### File Upload Headers
The following headers are set for file upload endpoints:
```typescript
@Header('Access-Control-Allow-Origin', '*')
@Header('Access-Control-Allow-Methods', 'POST, OPTIONS')
@Header(
  'Access-Control-Allow-Headers',
  'Content-Type, Authorization, Content-Length, X-Requested-With',
)
```

### Implementation Details
- Uses `FileInterceptor` from `@nestjs/platform-express`
- Preserves file paths during upload
- Validates file size before processing
- Supports multipart/form-data uploads

## Frontend Integration
To use the file upload functionality in the frontend:

1. Make direct requests to the backend URL (bypassing Vercel proxy)
2. Include the following headers:
```javascript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'multipart/form-data',
};
```

## Recent Changes
- Updated CORS configuration to handle large file uploads
- Added support for direct file uploads from frontend
- Increased file size limit to 32MB
- Added proper CORS headers for file upload endpoints
- Implemented preflight request caching

## Testing
To test the configuration:
1. Use the provided test script: `scripts/test-cors.sh`
2. Verify file uploads up to 32MB
3. Check CORS headers in browser developer tools
4. Verify preflight request caching 