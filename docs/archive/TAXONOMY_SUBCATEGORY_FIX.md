# Taxonomy Subcategory Mapping Fix

This document focuses specifically on the subcategory mapping issues identified in the taxonomy system, particularly for the World (W) layer with Beach category and Sunset subcategory.

## Issue Summary

The most critical issue observed is that certain subcategories are being assigned incorrect numeric codes when converting between Human-Friendly Names (HFN) and Machine-Friendly Addresses (MFA). In particular:

1. **W.BCH.SUN (Beach Sunset)**: In the taxonomy, this has the numeric code 003, but the system is generating code 77 through a fallback hash mechanism.
2. **W.STG.FES (Concert Stage Festival)**: Special case handling exists but is not being consistently applied.

These issues occur because:
- The mapping tables in `codeMapping.ts` are incomplete for World layer categories and subcategories
- The fallback mechanism in `taxonomyService.ts` generates hash-based codes instead of looking up the correct codes
- Special case handling differs between `taxonomyService.ts` and `codeMapping.ts`

## Subcategory-Specific Fixes

### 1. Add Explicit Handling for W.BCH.SUN

Add a special case handler in the getSubcategoryNumericCode method in taxonomyService.ts:

```typescript
// In getSubcategoryNumericCode method
// Add immediately after the existing special case handlers (around line 615)

// IMPORTANT FIX: Handle special case for Sunset (SUN) subcategory in Worlds Beach category
if (layerCode === 'W' && (categoryCode === 'BCH' || categoryCode === '004') && subcategoryCode === 'SUN') {
  console.log('Using known mapping for SUN (Sunset) subcategory in Worlds Beach category: 3');
  return 3; // Known mapping for SUN in Worlds Beach category
}
```

### 2. Fix Beach Category Subcategory Mappings in codeMapping.ts

Add the complete Beach subcategory mappings to the layerSpecificSubcategoryMappings object:

```typescript
// In layerSpecificSubcategoryMappings, add to or create the 'W' section:

'W': {
  // Beach category subcategories
  'BCH': {
    'BAS': '001', // Base
    'TRO': '002', // Tropical
    'SUN': '003', // Sunset
    'WAV': '004', // Waves
    'PAL': '005', // Palm
  },
  // Numeric to alphabetic for Beach subcategories
  'BCH_NUMERIC': {
    '001': 'BAS', // Base
    '002': 'TRO', // Tropical
    '003': 'SUN', // Sunset
    '004': 'WAV', // Waves
    '005': 'PAL'  // Palm
  },
  // Other World layer category mappings...
}
```

### 3. Update the Fallback Mechanism

Improve the fallback code generation in taxonomyService.ts to search for subcategories by name before generating a hash-based code:

```typescript
// In taxonomyService.ts getSubcategoryNumericCode method (around line 684)

// Before generating a hash-based fallback, try to find the subcategory by its name
const layer = this.getLayer(layerCode);
if (layer && layer.categories) {
  // Try to find the category first - if using a numeric code, try all categories
  const categoryKeys = Object.keys(layer.categories);
  for (const catKey of categoryKeys) {
    const category = layer.categories[catKey];
    // Skip if no subcategories
    if (!category.subcategories) continue;
    
    // Check each subcategory to find a name match
    for (const [subCode, subcategory] of Object.entries(category.subcategories)) {
      if (
        // Exact name match (case-insensitive)
        subcategory.name.toLowerCase() === subcategoryCode.toLowerCase() ||
        // Name contains the code
        subcategory.name.toLowerCase().includes(subcategoryCode.toLowerCase()) ||
        // Code contains the name 
        subcategoryCode.toLowerCase().includes(subcategory.name.toLowerCase())
      ) {
        console.log(`Found subcategory by name: ${subcategory.name} with code ${subCode} in ${layerCode}.${catKey}`);
        // If the category matches our category, use it directly
        if (catKey === normalizedCategoryCode) {
          return subcategory.numericCode || parseInt(subCode, 10) || 0;
        }
        // If we're using a different category but found a name match, remember it as fallback
        if (!bestMatch) {
          bestMatch = {
            numericCode: subcategory.numericCode || parseInt(subCode, 10) || 0,
            categoryKey: catKey
          };
        }
      }
    }
  }
  
  // If we found a best match in another category, use it
  if (bestMatch) {
    console.log(`Using best name match from different category ${bestMatch.categoryKey}: numeric code ${bestMatch.numericCode}`);
    return bestMatch.numericCode;
  }
}

// Only fall back to hash-based generation if no match found at all
```

### 4. Add Special Case Handling for formatNNAAddressForDisplay

Update the formatNNAAddressForDisplay function in codeMapping.ts to properly handle W.BCH.SUN:

```typescript
// In formatNNAAddressForDisplay (around line 476)

// Special handling for W.BCH.SUN (Beach Sunset)
else if (layer === 'W' && 
    (categoryAlpha === 'BCH' || category === '004') && 
    (subcategoryAlpha === 'SUN' || subcategory === '003')) {
  mfa = `5.004.003.${formattedSequential}`;
  console.log('Applied special case handling for W.BCH.SUN (Beach Sunset)');
}
```

## Testing Specifically for Subcategory Mapping

To verify the subcategory fixes, we should test the following specific scenarios:

1. **Basic conversion test for W.BCH.SUN:**
   ```javascript
   const result = convertHFNToMFA('W.BCH.SUN.001');
   // Should return 5.004.003.001
   ```

2. **formatNNAAddressForDisplay test:**
   ```javascript
   const { hfn, mfa } = formatNNAAddressForDisplay('W', 'BCH', 'SUN', '001');
   // Should return { hfn: 'W.BCH.SUN.001', mfa: '5.004.003.001' }
   ```

3. **Reverse conversion test:**
   ```javascript
   const result = convertMFAToHFN('5.004.003.001');
   // Should return W.BCH.SUN.001
   ```

4. **Test with various input formats:**
   ```javascript
   // Using category name
   const { hfn, mfa } = formatNNAAddressForDisplay('W', 'Beach', 'Sunset', '001');
   // Should return { hfn: 'W.BCH.SUN.001', mfa: '5.004.003.001' }
   
   // Using numeric codes
   const { hfn, mfa } = formatNNAAddressForDisplay('W', '004', '003', '001');
   // Should return { hfn: 'W.BCH.SUN.001', mfa: '5.004.003.001' }
   ```

## Why This Approach Works

1. **Explicit Mappings**: By providing complete mapping tables for the World layer, we eliminate the need for fallback code generation.

2. **Special Case Handling**: The direct special case handling ensures that common cases like W.BCH.SUN are always mapped correctly.

3. **Name-Based Lookup**: The improved fallback mechanism tries to find subcategories by name before resorting to hash-based generation, making it more likely to find the correct mapping.

4. **Consistency**: By aligning the mappings in taxonomyService.ts and codeMapping.ts, we ensure consistent behavior across the application.

## Long-Term Considerations

While these fixes address the immediate issues, a more sustainable approach would be to:

1. **Refactor to use the enhanced mapping approach**: The codeMapping.enhanced.ts file shows a data-driven approach that relies on the taxonomy service for all mappings.

2. **Add validation tests**: Implement automated tests that verify all taxonomy mappings work correctly in both directions.

3. **Add error monitoring**: Log any fallback code generation as warnings and monitor these in production to catch any new mapping issues.

By implementing these fixes and long-term improvements, we can ensure reliable and consistent subcategory mapping throughout the NNA Registry Service.