# Direct Backend Implementation

## Date: June 17, 2025

## Overview
Implemented direct backend connection to bypass Vercel proxy 4.5MB file size limitation. The backend team has provided a new direct URL with proper CORS configuration.

## Changes Made

### 1. Updated API Endpoints
- **Old**: `/api/assets` (Vercel proxy - 4.5MB limit)
- **New**: `https://nna-registry-service-us-central1.run.app/api/assets` (Direct - 32MB limit)

### 2. Files Modified

#### `/src/api/assetService.ts`
1. **createAsset()** - Line 960
   - Updated to use direct backend URL
   - Added console logging for file size
   - Note: Don't set Content-Type header for FormData

2. **getAssets()** - Line 243
   - Updated to use direct backend URL for searches

3. **getAssetById()** - Lines 401, 411
   - Updated both MongoDB ID and name search paths

### 3. Error Handling Improvements

#### `/src/pages/RegisterAssetPage.tsx` - Lines 585-601
- Added try-catch around createAsset call
- Specific error message for 413 errors (file too large)
- Prevents false success messages on upload failures

## Key Backend Integration Points

1. **Backend URL**: `https://nna-registry-service-us-central1.run.app/api`
2. **CORS**: Properly configured by backend team
3. **File Size Limit**: 32MB (verified by backend team)
4. **Authentication**: Continue using Bearer token in Authorization header
5. **FormData**: Let browser set Content-Type with boundary

## Testing Instructions

1. **Small Files** (< 4.5MB)
   - Should work as before
   - Verify direct backend connection in console logs

2. **Large Files** (4.5MB - 32MB)
   - Previously failed with 413 error
   - Should now upload successfully
   - Check console for "📤 Uploading asset directly to backend"

3. **Very Large Files** (> 32MB)
   - Should show error: "File size must be less than 32 MB"
   - Frontend validation prevents upload attempt

## Benefits

1. **Increased File Size Support**: From 4.5MB to 32MB
2. **Better Performance**: Direct connection, no proxy overhead
3. **Simplified Architecture**: No need for proxy fallback logic
4. **Consistent Experience**: Same limits for all users

## Rollback Plan

If issues occur, revert changes in assetService.ts:
- Change backend URLs back to `/api/assets`
- Document that files must be under 4.5MB

## Notes

- The Vercel proxy endpoints (/api/*) are still available for backwards compatibility
- Backend availability check still uses proxy endpoints but is less critical now
- Consider adding environment variable for backend URL in future updates