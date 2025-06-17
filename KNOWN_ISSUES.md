# Known Issues

## Last Updated: June 17, 2025

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