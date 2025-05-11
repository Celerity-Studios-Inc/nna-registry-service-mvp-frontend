# NNA Address Mapping Fix

## Issue
When generating Machine-Friendly Addresses (MFA) from Human-Friendly Names (HFN), the subcategory numeric codes were incorrectly mapped. Specifically, for the "S" (Stars) layer with "POP" category and "HPM" (Pop_Hipster_Male_Stars) subcategory, the MFA was showing 2.001.001.001 instead of the correct 2.001.007.001.

## Root Cause
The `convertHFNToMFA` function in `codeMapping.ts` was using hardcoded mappings that didn't correctly handle all subcategory cases. Specifically:

1. The function used a simplified mapping system that didn't account for layer-specific subcategory codes
2. The S (Stars) layer has different subcategory mappings for POP than the G (Songs) layer
3. The HPM (Pop_Hipster_Male_Stars) subcategory in the S layer should map to "007", but was incorrectly mapping to "001"

## Fix Implementation

We've implemented a comprehensive solution:

1. Enhanced the `convertHFNToMFA` function with detailed category and subcategory mappings based on the taxonomy data structure:
   ```typescript
   const subcategoryMappings: Record<string, Record<string, string>> = {
     'POP': {
       'BAS': '001',
       // ... other mappings ...
       'HPM': '007', // Pop_Hipster_Male_Stars (Stars layer)
     },
     // ... other categories ...
   };
   ```

2. Created layer-specific logic to handle different subcategory mappings depending on the layer:
   ```typescript
   // Handle special case for S layer (Stars) with Pop category
   if (layerAlpha === 'S' && categoryAlpha === 'POP') {
     const starsPOPSubcategories: Record<string, string> = {
       '001': 'BAS',
       // ... other mappings ...
       '007': 'HPM'  // Pop_Hipster_Male_Stars
     };
     subcategoryAlpha = starsPOPSubcategories[subcategoryNumeric] || 'BAS';
   }
   ```

3. Enhanced the `TaxonomySelection.tsx` component to use the proper category and subcategory names when generating addresses, with fallbacks for numeric codes:
   ```typescript
   let categoryAlpha = categoryName || selectedCategoryCode;
   let subcategoryAlpha = subcategoryName || selectedSubcategoryCode;
   
   // If we have numeric codes without names, convert them (fallback)
   if (/^\d+$/.test(subcategoryAlpha)) {
     // For Stars (S) layer with POP category, the mappings are different
     if (layerCode === 'S' && (categoryAlpha === 'POP' || categoryAlpha === '001')) {
       if (subcategoryAlpha === '007') subcategoryAlpha = 'HPM';
       // ... other mappings ...
     }
   }
   ```

## Testing
These changes have been tested with various layer/category/subcategory combinations to ensure the correct MFA is generated in all cases. For example:

- S.POP.HPM.001 now correctly generates 2.001.007.001
- G.POP.BAS.001 correctly generates 1.001.001.001
- G.ROK.CLS.001 correctly generates 1.002.002.001

## Additional Notes
The fix maintains backward compatibility with existing code while providing more accurate mappings. The changes are based on the structure defined in the `enriched_nna_layer_taxonomy_v1.3.json` file, which is the authoritative source for the taxonomy structure.

This fix ensures that the UI correctly displays and communicates the MFA addresses matching what the backend API expects and generates.