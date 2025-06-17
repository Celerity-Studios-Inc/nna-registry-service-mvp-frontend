# File Size Limit Update

## Date: June 17, 2025
## Status: ✅ FULLY IMPLEMENTED

## Issue
Frontend was enforcing outdated file size limits while backend supports 32MB for all asset types.
Additionally, Vercel proxy had a 4.5MB limit that blocked larger uploads.

## Previous Limits
- Component layers (G, S, L, M, W): 5MB
- Composite layer (C only): 10MB
- Backend supports: 32MB for all layers

## Fix Applied
Updated RegisterAssetPage.tsx to use 32MB limit for all asset types:

```javascript
// Before
maxSize={watchLayer === 'C' ? 10 * 1024 * 1024 : 5 * 1024 * 1024}

// After
maxSize={32 * 1024 * 1024} // 32MB for all asset types
```

## Layers Affected
### Component Layers (Previously 5MB, now 32MB)
- G (Songs)
- S (Stars)
- L (Looks)
- M (Moves)
- W (Worlds)

### Composite Layers (Previously 10MB for C only, now 32MB for all)
- B (Branded)
- P (Personalize)
- T (Training_Data)
- C (Composites)
- R (Rights)

## Technical Details
- Location: `/src/pages/RegisterAssetPage.tsx` line 1227
- The FileUpload component already had a default of 100MB, so no changes needed there
- Error messages will automatically show "32 MB" using the formatFileSize utility

## Complete Solution Implemented

### 1. Frontend Validation Updated ✅
- Changed from conditional 5MB/10MB to flat 32MB for all layers
- Location: RegisterAssetPage.tsx line 1227

### 2. Direct Backend Connection Implemented ✅
- Bypassed Vercel proxy completely
- Direct URL: `https://nna-registry-service-us-central1.run.app/api/assets`
- Files up to 32MB now upload successfully
- See DIRECT_BACKEND_IMPLEMENTATION.md for details

## Testing
1. ✅ Files under 4.5MB - Work as before
2. ✅ Files 4.5MB-32MB - Now upload successfully (previously blocked by Vercel)
3. ✅ Files over 32MB - Show proper validation error
4. ✅ Error handling - Shows user-friendly messages for size limit errors