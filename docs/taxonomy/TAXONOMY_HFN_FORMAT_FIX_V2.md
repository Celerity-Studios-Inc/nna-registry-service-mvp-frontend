# HFN/MFA Formatting Fix (Version 2)

## Problem

The application was experiencing issues with the formatting of Human-Friendly Names (HFN) and Machine-Friendly Addresses (MFA) in the asset registration workflow. Specifically:

1. When a subcategory was selected in the SimpleTaxonomySelectionV3 component, the subcategory code was being passed with the category prefix (e.g., "POP.HPM" instead of just "HPM").
2. This led to incorrect HFN formatting with doubled categories (e.g., "S.POP.POP.HPM.000" instead of "S.POP.HPM.000").
3. Additionally, MFA conversion would fail since the taxonomy service couldn't find subcategories with the doubled category.

## Root Cause Analysis

The issue stemmed from inconsistent handling of subcategory codes across different components:

1. In SimpleTaxonomySelectionV3.tsx, subcategory values were being passed as full codes (e.g., "POP.HPM") rather than just the subcategory part.
2. The RegisterAssetPage component was storing this full code in the form state without proper normalization.
3. The taxonomyFormatter utilities expected subcategory codes to be just the code part (e.g., "HPM") without the category prefix.

## Solution

We implemented a generic solution that handles subcategory codes correctly throughout the application:

1. **In taxonomyFormatter.ts:**
   - Updated `lookupSubcategoryCode` to handle and normalize subcategory codes that include the category prefix.
   - Enhanced `formatHFN` to extract just the subcategory part from combined codes like "POP.HPM".
   - Improved `convertHFNtoMFA` and `convertMFAtoHFN` to handle both formats consistently.
   - Added better logging for debugging and tracing.

2. **In SimpleTaxonomySelectionV3.tsx:**
   - Modified the component to pass just the subcategory code (e.g., "HPM") rather than the full code (e.g., "POP.HPM").

3. **In RegisterAssetPage.tsx:**
   - Enhanced `handleSubcategorySelectV3` to always normalize subcategory codes before storing them.
   - Added explicit formatting of HFN/MFA addresses after subcategory selection.
   - Improved error handling and fallback mechanisms.
   - Added more descriptive logging.

## Key Code Changes

### 1. Normalizing Subcategory Codes in taxonomyFormatter.ts

```typescript
// Extract the subcategory part if it includes a category prefix (e.g., "POP.BAS" -> "BAS")
let normalizedSubcategory = subcategory;
if (subcategory.includes('.')) {
  // Handle format like "POP.BAS" - extract just the subcategory part
  const parts = subcategory.split('.');
  normalizedSubcategory = parts[parts.length - 1];
  console.log(`Normalized subcategory from ${subcategory} to ${normalizedSubcategory}`);
}
```

### 2. Passing Subcategory Codes Correctly in SimpleTaxonomySelectionV3.tsx

```typescript
<MenuItem 
  key={displayCode} 
  value={displayCode}
>
  {subcategory.name} ({displayCode})
</MenuItem>
```

### 3. Normalizing Subcategory Codes in RegisterAssetPage.tsx

```typescript
// Format could be either "POP.BAS" or just "BAS" - always normalize to just the subcategory code
// Extract just the subcategory part if it contains a dot
const normalizedSubcategory = subcategoryCode.includes('.') ? 
  subcategoryCode.split('.')[1] : subcategoryCode;

console.log(`[REGISTER PAGE] Normalized subcategory: ${subcategoryCode} -> ${normalizedSubcategory}`);

// Store the normalized subcategory code
setValue('subcategoryCode', normalizedSubcategory);
```

## Benefits

1. **Generic Solution:** The fix handles all layer/category/subcategory combinations without special case handling.
2. **Consistent Formatting:** HFN and MFA addresses are now consistently formatted throughout the application.
3. **Better Error Handling:** Multiple levels of fallbacks ensure the application degrades gracefully when taxonomy lookups fail.
4. **Improved Debugging:** Enhanced logging makes it easier to trace the HFN/MFA formatting process.

## Testing

The fix has been tested with the following special cases that were previously problematic:

1. S.POP.HPM: Now correctly formats as "S.POP.HPM.000" in HFN and "2.001.007.000" in MFA.
2. W.BCH.SUN: Now correctly formats as "W.BCH.SUN.000" in HFN and "5.004.003.000" in MFA.

## Future Improvements

1. Consider caching frequently used mappings for better performance.
2. Implement comprehensive unit tests for all taxonomy formatting functions.
3. Add more visual feedback in the UI when taxonomy operations succeed or fail.