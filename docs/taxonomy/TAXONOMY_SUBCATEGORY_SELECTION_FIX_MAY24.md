# Subcategory Selection Fix (May 24, 2025)

## Problem

After fixing the TypeScript build errors related to `numericCode` types, subcategories were displaying correctly in the dropdown menu but could not be selected. The selection handler was not working properly due to an interface mismatch.

## Root Cause

The `SimpleTaxonomySelectionV3` component passes a string subcategory code to its `onSubcategorySelect` handler, but the handler in `RegisterAssetPage.tsx` was written to expect a `SubcategoryOption` object, causing the selection to fail silently.

This discrepancy occurred because:
1. `SimpleTaxonomySelectionV3.tsx` uses a dropdown-based approach with string values
2. The original `TaxonomySelection` component used a card-based approach with object values
3. When integrating the new component, the handler interface was not updated

## Solution

Updated the `onSubcategorySelect` handler in `RegisterAssetPage.tsx` to:

1. Accept a string subcategory code from `SimpleTaxonomySelectionV3`
2. Properly handle both format types ("POP.BAS" and "BAS")
3. Look up the subcategory details (name, numericCode) from the enhanced taxonomy service
4. Set all required form values with the found details
5. Add comprehensive error handling and logging

```typescript
onSubcategorySelect={(subcategoryCode) => {
  console.log('[REGISTER PAGE] Subcategory selected:', subcategoryCode);
  // Handle case where subcategoryCode is a string (SimpleTaxonomySelectionV3 format)
  // Format could be either "POP.BAS" or just "BAS"
  setValue('subcategoryCode', subcategoryCode);
  
  // Extract just the subcategory part for display if it contains a dot
  const displayCode = subcategoryCode.includes('.') ? 
    subcategoryCode.split('.')[1] : subcategoryCode;
  
  // Try to find the subcategory in the options to get the name
  const watchCategory = watch('categoryCode');
  try {
    // Import directly to avoid circular dependencies
    const { getSubcategories } = require('../services/enhancedTaxonomyService');
    const subcategories = getSubcategories(watchLayer, watchCategory);
    
    // Find the matching subcategory to get its name
    const subcategoryItem = subcategories.find(item => {
      const itemCode = item.code.includes('.') ? 
        item.code : 
        `${watchCategory}.${item.code}`;
      return itemCode === subcategoryCode || item.code === displayCode;
    });
    
    if (subcategoryItem) {
      setValue('subcategoryName', subcategoryItem.name);
      setValue('subcategoryNumericCode', subcategoryItem.numericCode?.toString() || '');
      console.log(`[REGISTER PAGE] Found subcategory details:`, subcategoryItem);
    } else {
      console.warn(`[REGISTER PAGE] Could not find subcategory details for ${subcategoryCode}`);
    }
  } catch (error) {
    console.error('[REGISTER PAGE] Error setting subcategory details:', error);
  }
}}
```

## Expected Behavior

1. User can now select subcategories from the dropdown
2. The form properly captures the subcategory code, name, and numeric code
3. The registration flow can proceed to the next step
4. Console logs provide detailed information for debugging

## Testing

Manually tested with the following problematic combinations:
- S.POP with various subcategories
- S.DNC with BAS and other subcategories
- L.PRF with BAS and other subcategories
- G.IND with various subcategories

All combinations now work correctly, with subcategories being selectable and properly populating the form values.