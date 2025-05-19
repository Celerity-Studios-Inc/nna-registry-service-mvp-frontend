# HFN and MFA Format Regression Analysis

## Problem

After successfully registering an asset through the NNA Registry Service frontend, the success page is displaying HFN and MFA addresses in the wrong format:

- **Observed Format**: S.Pop.Global.002 and 2.000.000.002
- **Expected Format**: S.POP.GLB.002 and 2.001.007.002 (depending on actual category/subcategory)

This is a regression from a previously working state where category and subcategory codes were properly formatted and displayed in uppercase.

## Root Cause Analysis

After analyzing the code, I can identify potential causes:

1. The `registerAssetPage.tsx` file includes a `renderSuccessScreen` function that processes and formats the asset data after a successful submission.

2. The formatting logic in lines 1744-1843 attempts to:
   - Extract layer, category, and subcategory from the backend response
   - Retrieve the original subcategory from session storage if available
   - Generate consistent HFN and MFA formats using either the taxonomy service or fallbacks

3. Key issues:
   - **Raw Category/Subcategory Usage**: Uses backend-provided values without normalizing case
   - **Inconsistent Abbreviation Handling**: The abbreviated subcategory code (e.g., "GLB" instead of "Global") is not properly applied
   - **Service Fallback Logic**: When taxonomy service fails, the fallbacks do not properly format the code parts

4. The relevant code fragments:
```typescript
// Uses createdAsset.category without normalizing case
const category = createdAsset.category || '001';

// May be using wrong subcategory format
let subcategory = createdAsset.subcategory || 'BAS';

// Constructs HFN without case normalization
const hfnBase = `${layer}.${category}.${subcategory}`;
const fullHfn = `${hfnBase}.${sequential}`;
```

5. The taxonomy service conversion may be bypassed or not correctly normalizing format.

## Fix Implementation Plan

1. **Add Case Normalization**:
   - Ensure layer, category, and subcategory codes are converted to uppercase
   - `const category = (createdAsset.category || '001').toUpperCase();`
   - `let subcategory = (retrievedSubcategory || 'BAS').toUpperCase();`

2. **Add Code Abbreviation Handling**:
   - For known subcategories with longer names, ensure they use the abbreviated codes
   - For example, "Global" should be "GLB"

3. **Enhance Formatting Logic**:
   - Add a dedicated formatting function to ensure consistent format
   - Ensure taxonomy service uses proper code mappings

4. **Code Implementation**:
```typescript
// Normalize any category code to proper format
const category = (createdAsset.category || '001').toUpperCase();

// Normalize subcategory and handle abbreviations
let subcategory = '';
if (originalSubcategoryCode) {
  subcategory = originalSubcategoryCode.toUpperCase();
} else {
  try {
    const storedSubcategory = sessionStorage.getItem(`originalSubcategory_${layer}_${category}`);
    if (storedSubcategory) {
      subcategory = storedSubcategory.toUpperCase();
    }
  } catch (e) {
    console.warn('Error accessing sessionStorage:', e);
  }
}

// If still no subcategory, use backend value but ensure proper format
if (!subcategory) {
  subcategory = (createdAsset.subcategory || 'BAS').toUpperCase();
  
  // Handle known full name to abbreviation mappings
  const abbreviationMap: Record<string, string> = {
    'GLOBAL': 'GLB',
    'HIPSTER': 'HIP',
    'POPULAR': 'POP',
    'HIPSTERMALE': 'HPM',
    'BASE': 'BAS'
    // Add more mappings as needed
  };
  
  if (abbreviationMap[subcategory]) {
    subcategory = abbreviationMap[subcategory];
  }
}
```

5. **Add Format Verification**:
   - Validate final HFN and MFA format before display
   - Add debug logging to track format changes

## Verification Plan

After implementing the fix:

1. Register an asset with layer S, category POP, subcategory GLB
2. Verify the success page shows:
   - HFN: S.POP.GLB.00X (where X is the sequential number)
   - MFA: 2.001.007.00X (where X is the sequential number)

3. Test with other layer combinations to ensure consistent formatting

## Preventing Future Regressions

1. Add format validation functions that can be reused across components
2. Centralize address formatting logic in a single utility
3. Add clear documentation for expected formats
4. Consider adding automated tests specifically for format validation