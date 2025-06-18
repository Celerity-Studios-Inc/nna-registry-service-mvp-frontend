# Smart Routing Restored - CORS Issues Fixed

## Date: June 17, 2025

## Backend Team Resolution
The backend team has successfully implemented proper CORS configuration to handle preflight requests. This enables the optimal smart routing strategy for file uploads.

## CORS Configuration Applied
The backend now properly handles:
- **Preflight OPTIONS requests** for all endpoints
- **Multiple allowed origins** including production and development URLs
- **Proper headers** including Authorization, Content-Type, etc.
- **Credentials support** for authenticated requests
- **24-hour cache** for preflight responses (Access-Control-Max-Age: 86400)

## Smart Routing Strategy Implemented

### Small Files (≤ 4.5MB)
- **Route**: Use Vercel proxy (`/api/assets`)
- **Benefits**: 
  - Optimal performance (no CORS preflight)
  - Lower latency through proxy
  - Reliable routing for most files

### Large Files (> 4.5MB)
- **Route**: Direct backend (`https://registry.reviz.dev/api/assets`)
- **Benefits**:
  - Supports up to 32MB uploads
  - Bypasses Vercel's 4.5MB proxy limit
  - Direct connection for better throughput

## Implementation Details

### Code Changes
```javascript
const fileSize = assetData.files?.length > 0 ? assetData.files[0].size : 0;
const useDirect = fileSize > 4.5 * 1024 * 1024; // 4.5MB threshold
const assetEndpoint = useDirect 
  ? 'https://registry.reviz.dev/api/assets'  // Direct for large files
  : '/api/assets';                           // Proxy for small files
```

### Console Logging
- Clear indication of routing strategy
- File size information
- Routing rationale for debugging

## Expected Results

### Small File Test (< 4.5MB)
- Console: "📤 Uploading asset via PROXY"
- Console: "✅ Using proxy for optimal performance"
- Expected: Successful upload

### Large File Test (> 4.5MB, ≤ 32MB)
- Console: "📤 Uploading asset via DIRECT backend"
- Console: "✅ Using direct backend for large file upload"
- Expected: Successful upload with no CORS errors

### Very Large File Test (> 32MB)
- Frontend validation should prevent upload
- Error: "File size must be less than 32 MB"

## Files Modified
- `/src/api/assetService.ts` - Implemented smart routing
- Frontend file size limit already set to 32MB

## Testing Priority
1. Test 4.4MB file (should use proxy)
2. Test 5.0MB file (should use direct backend)
3. Test larger files up to 32MB
4. Verify no CORS errors occur
5. Test that View Details (GET requests) still work via proxy

This implementation provides the best of both worlds: optimal performance for small files and large file support when needed.