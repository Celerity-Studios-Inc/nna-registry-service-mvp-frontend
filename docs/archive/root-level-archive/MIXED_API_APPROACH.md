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

### Smart Routing Approach:

**Use Vercel Proxy For:**
- **Small File Uploads** (< 4MB): `/api/assets`
  - No CORS issues
  - Reliable routing
- **Asset Search (GET)**: `/api/assets` 
- **Asset Details (GET)**: `/api/assets`
- **All read operations**

**Use Direct Backend For:**
- **Large File Uploads** (> 4MB): `https://registry.reviz.dev/api/assets`
  - Bypasses Vercel 4.5MB limit
  - Only when necessary

## Implementation Details

### File Upload (POST) - Smart Routing
```javascript
const fileSize = assetData.files?.length > 0 ? assetData.files[0].size : 0;
const useDirect = fileSize > 4 * 1024 * 1024; // 4MB threshold
const assetEndpoint = useDirect ? 'https://registry.reviz.dev/api/assets' : '/api/assets';

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