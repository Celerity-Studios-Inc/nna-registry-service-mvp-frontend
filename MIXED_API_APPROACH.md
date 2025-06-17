# Mixed API Approach - Solving CORS Issues

## Date: June 17, 2025

## Problem Identified
After implementing direct backend connection, we discovered that:
- **POST requests** (file uploads) work with direct backend
- **GET requests** fail due to CORS preflight issues

## Root Cause
Different HTTP methods have different CORS requirements:
- **POST with FormData**: Simple request, no preflight needed
- **GET with custom headers**: Triggers CORS preflight, which fails

## Solution: Mixed Approach

### Use Direct Backend For:
- **File Uploads (POST)**: `https://registry.reviz.dev/api/assets`
  - No CORS preflight issues
  - Bypasses Vercel 4.5MB limit
  - Supports full 32MB uploads

### Use Vercel Proxy For:
- **Asset Search (GET)**: `/api/assets` 
- **Asset Details (GET)**: `/api/assets`
- **All read operations**

## Implementation Details

### File Upload (POST) - Direct Backend
```javascript
const assetEndpoint = 'https://registry.reviz.dev/api/assets';
const response = await fetch(assetEndpoint, {
  method: 'POST',
  headers: { Authorization: `Bearer ${authToken}` },
  body: formData,
});
```

### Data Fetching (GET) - Vercel Proxy
```javascript
const response = await fetch(`/api/assets?${queryParams}`, {
  headers: { 
    Authorization: `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  }
});
```

## Benefits
1. **Large File Uploads**: Support up to 32MB (bypasses Vercel limit)
2. **No CORS Issues**: GET requests use proxy, POST requests work directly
3. **Backward Compatibility**: Existing functionality preserved
4. **Best of Both Worlds**: Performance for uploads, reliability for reads

## Files Modified
- `/src/api/assetService.ts`:
  - `createAsset()`: Uses direct backend (POST)
  - `getAssets()`: Uses Vercel proxy (GET)
  - `getAssetById()`: Uses Vercel proxy (GET)

## Testing Results
✅ File uploads up to 32MB work  
✅ Browse Assets works (shows uploaded files)  
✅ Asset Details should now work (View Details button)  
✅ Search functionality preserved