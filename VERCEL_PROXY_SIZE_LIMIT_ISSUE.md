# Vercel Proxy Size Limit Issue

## Date: June 17, 2025

## Critical Issue Discovered
Vercel's serverless functions have a 4.5MB payload limit, preventing file uploads over ~4MB even though frontend and backend support 32MB.

## Error Details
- **Error Code**: 413 (Content Too Large)
- **Error Message**: FUNCTION_PAYLOAD_TOO_LARGE
- **Affected Endpoint**: `/api/assets` (Vercel proxy)
- **File Size That Failed**: 4.8MB

## Root Causes
1. **Vercel Limitation**: Serverless functions on Vercel have a 4.5MB request body limit
2. **No Fallback**: The app isn't falling back to direct backend connection
3. **False Success**: Error handling shows success message even when API returns 413

## Solutions

### Option 1: Direct Backend Connection (Recommended)
Bypass Vercel proxy for file uploads by using the backend URL directly:
```javascript
const assetEndpoint = process.env.NODE_ENV === 'production' 
  ? 'https://registry.reviz.dev/api/assets'
  : '/api/assets';
```

### Option 2: Client-Side File Compression
Compress images/videos before upload to stay under 4.5MB limit.

### Option 3: Chunked Upload
Split large files into chunks and reassemble on backend.

## Immediate Fixes Needed
1. Fix error handling to not show success on 413 errors
2. Add environment variable for direct backend URL
3. Implement fallback to direct backend for large files
4. Show proper error message to users about size limits

## Workaround for Users
Until fixed, users must keep files under 4.5MB when uploading through the Vercel-deployed frontend.