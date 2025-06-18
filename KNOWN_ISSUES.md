# Known Issues

## Last Updated: June 17, 2025

## ~~CRITICAL: Vercel Proxy 4.5MB Size Limit~~ ✅ FIXED WITH SMART ROUTING

### Status: Fixed - June 17, 2025

### Description
Vercel's serverless functions have a 4.5MB request payload limit. This has been resolved with backend CORS fixes and smart routing implementation.

### Solution Implemented
- **Smart Routing Strategy**: Automatic routing based on file size
- **Small files (≤4.5MB)**: Use Vercel proxy for optimal performance
- **Large files (>4.5MB)**: Direct backend connection up to 32MB
- **Backend CORS**: Properly configured to handle preflight requests

### Backend CORS Fix Applied
The backend team implemented:
1. OPTIONS preflight request handling
2. Proper Access-Control headers (Authorization, Content-Type)
3. Multiple allowed origins including production URLs
4. 24-hour preflight cache (Access-Control-Max-Age: 86400)

### Current Behavior
- **Files ≤4.5MB**: Upload via proxy (faster, no CORS preflight) ✅
- **Files >4.5MB to 32MB**: Upload via direct backend ✅
- **Files >32MB**: Frontend validation prevents upload ✅
- **All GET requests**: Continue using proxy (no changes needed) ✅

See SMART_ROUTING_RESTORED.md for implementation details.

---

## 1. Sort Order Dropdown Not Triggering Re-sort

### Status: Known Issue - Low Priority

### Description
When changing the Order dropdown (A→Z to Z→A, or Newest First to Oldest First), the results do not immediately re-sort.

### Current Behavior
- Sort By dropdown works correctly and triggers re-sort ✅
- Order dropdown displays correct labels ✅
- Order dropdown onChange event doesn't fire properly ❌
- Results remain in current order when Order is changed

### Workaround
Users can change the Sort By option to trigger a complete re-sort with the desired order.

### Technical Details
- Attempted fixes in commits 260b374 and 38aae1a
- The `handleSortOrderChange` function is implemented but not being called
- Possible Material-UI Select component issue with conditional MenuItem rendering

### Files Affected
- `/src/components/search/AssetSearch.tsx`

---

## 2. File Size Upload Limits ✅ FIXED

### Status: Fixed - June 17, 2025

### Description
Frontend was enforcing outdated file size limits while backend supports 32MB for all asset types.

### Previous Behavior
- Component layers (G, S, L, M, W): Limited to 5MB in frontend
- Composite layer C: Limited to 10MB in frontend
- Other composite layers (B, P, T, R): Would have used 5MB limit
- Backend accepts up to 32MB for all layers

### Fix Applied
Updated RegisterAssetPage.tsx to use 32MB limit for all asset types.

### Current Behavior
- All layers now support up to 32MB file uploads
- Error messages properly display "32 MB" limit when exceeded
- Consistent with backend capabilities

See FILE_SIZE_LIMIT_UPDATE.md for implementation details.