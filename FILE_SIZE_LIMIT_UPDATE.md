# File Size Limit Update

## Date: June 17, 2025

## Issue
Frontend was enforcing outdated file size limits while backend supports 32MB for all asset types.

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

## Testing
1. Try uploading a file between 5-32MB for component layers (G, S, L, M, W)
2. Try uploading a file between 10-32MB for composite layers (B, P, T, C, R)
3. Verify files up to 32MB are accepted
4. Verify files over 32MB show proper error message