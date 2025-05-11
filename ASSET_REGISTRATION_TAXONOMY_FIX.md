# Asset Registration Taxonomy Fix

## Issue
When attempting to create assets through the frontend UI, we were receiving a 500 Internal Server Error from the backend with the error message:

```
Invalid category: 001 for layer: S
```

## Root Cause Analysis
After investigating the error and the code structure, we determined that the issue was in how the asset data was being submitted to the backend API:

1. The frontend was sending numeric category codes (e.g., "001") in the `category` field
2. The backend expects alphabetic category codes (e.g., "POP") in the `category` field

The NNA taxonomy structure in `enriched_nna_layer_taxonomy_v1.3.json` uses a dual addressing system:
- Categories are defined with numeric keys (e.g., "001") but have alphabetic codes (e.g., "code": "POP")
- In the S (Stars) layer: `"001": { "code": "POP", "name": "Pop" }`

The backend validation was rejecting numeric codes like "001" and expecting alphabetic codes like "POP".

## Fix Implementation
We modified the `RegisterAssetPage.tsx` file to use the alphabetic codes rather than the numeric ones when submitting data to the API:

```typescript
// BEFORE:
category: data.categoryCode,          // e.g., "001" - REJECTED BY API
subcategory: data.subcategoryCode,    // e.g., "001" - REJECTED BY API

// AFTER:
category: data.categoryName || data.categoryCode,  // e.g., "POP" - ACCEPTED BY API
subcategory: data.subcategoryName || data.subcategoryCode,  // e.g., "BAS" - ACCEPTED BY API
```

This change ensures we're sending the alphabetic code (stored in categoryName/subcategoryName) instead of the numeric identifier (stored in categoryCode/subcategoryCode).

## Verification
The fix was confirmed by:
1. Checking the backend API expectations based on the error message
2. Reviewing the taxonomy structure to confirm the dual addressing format 
3. Examining the reference implementation and mock data which uses alphabetic codes
4. Confirming with requirements documentation about the dual addressing system

## Additional Notes
- The NNA taxonomy uses dual addressing:
  - Human-Friendly Names (HFN): Uses alphabetic codes like "S.POP.KPO.001" 
  - Machine-Friendly Addresses (MFA): Uses numeric codes like "S.001.013.001"
- While both addressing systems are supported in the data model, the API endpoint for asset creation expects the alphabetic codes
- This fix ensures proper integration between the frontend form submission and backend API expectations