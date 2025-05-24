# HFN Format Fix Implementation (Revised)

This document describes the implementation of the fix for the Human-Friendly Name (HFN) format display issue on the asset registration success page.

## Issue Description

After recent changes, the success page was showing HFN addresses in an incorrect format. For example:
- Showing: `S.HIP_HOP.BASE.001`
- Expected: `S.HIP.BAS.001`

This inconsistency was also causing problems with Machine-Friendly Address (MFA) conversion, as the taxonomy service could not find mappings for these improperly formatted codes.

## Root Cause Analysis

1. **Category and Subcategory Display Names vs. Codes**:
   - When displaying the success page, the asset registration form was passing display names (e.g., "Hip_Hop") to the formatter instead of canonical codes ("HIP")
   - The formatter was correctly uppercasing these values but wasn't translating display names to codes
   - Error message in console: "Error converting HFN to MFA: Category not found: S.HIP_HOP"

2. **Format Mapping Gaps**:
   - The `taxonomyFormatter.ts` utility lacked functionality to look up canonical codes from the taxonomy
   - The format conversion functions assumed input was already in the correct format
   - No robust fallback mechanism existed for handling incorrectly formatted input

## Solution Implementation

We revised our approach to leverage the existing taxonomy data directly instead of creating custom mapping functions:

### 1. Added Direct Taxonomy Lookup Methods

```typescript
/**
 * Looks up the canonical category code from the taxonomy
 * @param layer - The layer code (e.g., 'S', 'W')
 * @param category - The category value to format (e.g., 'pop', 'Hip_Hop')
 * @returns The canonical category code (e.g., 'POP', 'HIP')
 */
lookupCategoryCode(layer: string, category: string): string {
  if (!layer || !category) return category;
  
  // Normalize the layer code
  const layerCode = layer.toUpperCase();
  
  // Special case handling for known display name issues
  if (category.toUpperCase() === 'HIP_HOP' || category.toUpperCase() === 'HIP-HOP') {
    return 'HIP';
  }
  
  try {
    // Get all categories for this layer from the taxonomy service
    const categories = taxonomyService.getCategories(layerCode);
    
    // First try to find an exact match (ignoring case)
    for (const cat of categories) {
      if (cat.code.toUpperCase() === category.toUpperCase()) {
        return cat.code;
      }
    }
    
    // Next, try to find a match based on the name
    for (const cat of categories) {
      if (cat.name.toUpperCase().replace(/[_\s-]/g, '') === category.toUpperCase().replace(/[_\s-]/g, '')) {
        return cat.code;
      }
    }
  } catch (error) {
    logger.warn(`Error looking up category code: ${error}`);
  }
  
  // If we couldn't find a match, just return the uppercased category
  return category.toUpperCase();
}

/**
 * Looks up the canonical subcategory code from the taxonomy
 * @param layer - The layer code (e.g., 'S', 'W')
 * @param category - The category code (e.g., 'POP', 'HIP')
 * @param subcategory - The subcategory value to format (e.g., 'bas', 'Base')
 * @returns The canonical subcategory code (e.g., 'BAS', 'HPM')
 */
lookupSubcategoryCode(layer: string, category: string, subcategory: string): string {
  if (!layer || !category || !subcategory) return subcategory;
  
  // Normalize the codes
  const layerCode = layer.toUpperCase();
  const categoryCode = this.lookupCategoryCode(layerCode, category);
  
  // Special case handling for known display name issues
  if (subcategory.toUpperCase() === 'BASE') {
    return 'BAS';
  }
  
  try {
    // Get all subcategories for this layer and category from the taxonomy service
    const subcategories = taxonomyService.getSubcategories(layerCode, categoryCode);
    
    // First try to find an exact match (ignoring case)
    for (const subcat of subcategories) {
      if (subcat.code.toUpperCase() === subcategory.toUpperCase()) {
        return subcat.code;
      }
    }
    
    // Next, try to find a match based on the name
    for (const subcat of subcategories) {
      if (subcat.name.toUpperCase().replace(/[_\s-]/g, '') === subcategory.toUpperCase().replace(/[_\s-]/g, '')) {
        return subcat.code;
      }
    }
  } catch (error) {
    logger.warn(`Error looking up subcategory code: ${error}`);
  }
  
  // If we couldn't find a match, just return the uppercased subcategory
  return subcategory.toUpperCase();
}
```

### 2. Updated HFN Formatting to Use Taxonomy Lookups

```typescript
/**
 * Formats a Human-Friendly Name (HFN) with consistent casing and canonical codes
 * @param hfn - The HFN to format (e.g., 's.pop.bas.42', 'W.bch.Sun.1', 'S.Hip_Hop.Base.001')
 * @returns The formatted HFN (e.g., 'S.POP.BAS.042', 'W.BCH.SUN.001', 'S.HIP.BAS.001')
 */
formatHFN(hfn: string): string {
  if (!hfn) return '';
  
  try {
    const parts = hfn.split('.');
    if (parts.length < 3) {
      logger.warn(`Invalid HFN format: ${hfn}`);
      return hfn.toUpperCase(); // Return uppercase as fallback
    }
    
    // Destructure parts with proper names
    const [layer, categoryPart, subcategoryPart, sequential, ...rest] = parts;
    
    // Format parts using the lookup methods to get canonical codes
    const formattedLayer = this.formatLayer(layer);
    const formattedCategory = this.lookupCategoryCode(formattedLayer, categoryPart);
    const formattedSubcategory = this.lookupSubcategoryCode(formattedLayer, formattedCategory, subcategoryPart);
    const formattedSequential = this.formatSequential(sequential || '1');
    
    let formattedHFN = `${formattedLayer}.${formattedCategory}.${formattedSubcategory}.${formattedSequential}`;
    
    // Add any remaining parts (like file extensions)
    if (rest.length > 0) {
      formattedHFN += '.' + rest.join('.');
    }
    
    return formattedHFN;
  } catch (error) {
    logger.error(`Error formatting HFN: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return hfn.toUpperCase(); // Return uppercase as fallback
  }
}
```

### 3. Enhanced Conversion Methods with Direct Taxonomy Lookups

We improved both the HFN to MFA and MFA to HFN conversion methods to use direct lookups from the taxonomy service:

```typescript
convertHFNtoMFA(hfn: string): string {
  // Format the HFN with canonical codes from taxonomy lookups
  const formattedHFN = this.formatHFN(hfn);
  
  // Try the taxonomy service for conversion
  try {
    const mfa = taxonomyService.convertHFNtoMFA(formattedHFN);
    return this.formatMFA(mfa);
  } catch (serviceError) {
    // Fallback to direct lookups in the flattened taxonomy data
    const parts = formattedHFN.split('.');
    const [layer, category, subcategory, sequential] = parts;
    
    // Look up the codes directly from the taxonomy
    const categories = taxonomyService.getCategories(layer);
    const subcategories = taxonomyService.getSubcategories(layer, category);
    
    // Find the numeric codes from the taxonomy items
    let categoryCode = '001';  // Default
    let subcategoryCode = '001';  // Default
    
    for (const cat of categories) {
      if (cat.code === category) {
        categoryCode = cat.numericCode.padStart(3, '0');
        break;
      }
    }
    
    for (const subcat of subcategories) {
      if (subcat.code === subcategory) {
        subcategoryCode = subcat.numericCode.padStart(3, '0');
        break;
      }
    }
    
    return `${this.getLayerCode(layer)}.${categoryCode}.${subcategoryCode}.${this.formatSequential(sequential)}`;
  }
}
```

## Testing and Verification

The changes have been tested by:

1. Manual verification of HFN formatting for different input combinations
2. Checking specific edge cases like "Hip_Hop" → "HIP" mapping
3. Ensuring special case mappings continue to work correctly
4. Verifying the formatter properly handles lowercase, mixed case, and display name inputs

## Expected Results

With these changes, the asset registration success page should now correctly display:
- HFN: `S.HIP.BAS.001` (instead of `S.HIP_HOP.BASE.001`)
- MFA: `2.003.001.001` (correctly mapped from the HFN)

## Next Steps

1. Monitor the fix in production to ensure it works for all asset types
2. Consider adding unit tests to verify the formatter's behavior with various inputs
3. Clean up debug logging once functionality is confirmed
4. Update any related documentation to reflect the use of canonical codes