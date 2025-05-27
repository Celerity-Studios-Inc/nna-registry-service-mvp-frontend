# Dual Addressing Implementation

## Overview

This document details the implementation of a comprehensive fix for the NNA dual addressing system in the frontend codebase. The solution ensures consistent display of Human-Friendly Names (HFN) and Machine-Friendly Addresses (MFA) across all components of the asset registration workflow.

## Key Components

### 1. Enhanced Code Mapping (codeMapping.ts)

- **Comprehensive Mappings**: Added complete bidirectional mappings for all layers, categories, and subcategories
- **Layer Metadata**: Enhanced layer mappings with descriptions and proper numeric codes
- **Special Case Handling**: Added specific handling for edge cases like S.POP.HPM and W.NAT.BAS

```typescript
// Example of enhanced mappings
export const categoryAlphaToNumeric: Record<string, string> = {
  'POP': '001', // Pop
  'ROK': '002', 'RCK': '002', // Rock (with alternate code)
  'HIP': '003', // Hip-Hop
  ...
};

// Special subcategory mappings for different layers
export const layerSpecificSubcategoryMappings: Record<string, Record<string, Record<string, string>>> = {
  'S': {
    'POP': {
      'HPM': '007', // Special case: Hipster Male in Stars/Pop
      ...
    }
  },
  'W': {
    'NAT': { ... }, // Nature category subcategories
    'HIP': { ... }  // Urban/Hip-Hop category subcategories
  }
};
```

### 2. Unified Display Format Function

Created a unified function that handles formatting and ensures consistency across all components:

```typescript
export function formatNNAAddressForDisplay(
  layer: string,
  category: string,
  subcategory: string,
  sequential: string | number = "000"
): { hfn: string, mfa: string } {
  // Step 1: Get the proper alphabetic codes for HFN
  const categoryAlpha = getAlphabeticCodeForDisplay(layer, category);
  const subcategoryAlpha = getAlphabeticCodeForDisplay(layer, subcategory, categoryAlpha);
  
  // Step 2: Format the HFN address
  const hfn = `${layer}.${categoryAlpha}.${subcategoryAlpha}.${formattedSequential}`;
  
  // Step 3: Handle special cases for MFA conversion
  let mfa: string;
  
  // Special case handling for S.POP.HPM, W.NAT, etc.
  ...
  
  return { hfn, mfa };
}
```

### 3. Component Updates

#### NNAAddressPreview Component

Updated to use the unified formatter and store original subcategory codes for later use:

```typescript
const { hfn: hfnAddress, mfa: mfaAddress } = formatNNAAddressForDisplay(
  layerCode,
  categoryCode,
  subcategoryCode,
  "000"
);

// Store original subcategory for later use
if (subcategoryNumericCode) {
  sessionStorage.setItem(`originalSubcategory_${layerCode}_${categoryCode}`, subcategoryCode);
}
```

#### ReviewSubmit Component

Updated to use the unified formatter for consistent display:

```typescript
const formattedAddresses = formatNNAAddressForDisplay(
  layer,
  categoryCode,
  subcategoryCode,
  "000" // Always use "000" for display consistency
);
displayHfn = formattedAddresses.hfn;
displayMfa = formattedAddresses.mfa;
```

#### RegisterAssetPage Success Screen

Enhanced to reconstruct proper HFN/MFA addresses using the unified formatter:

```typescript
// Extract sequential number from MFA
const sequentialParts = rawMfa ? rawMfa.split('.') : [];
const sequential = sequentialParts.length > 3 ? sequentialParts[3] : '001';

// Use unified formatter
const { hfn, mfa } = formatNNAAddressForDisplay(
  layer,
  category,
  subcategory,
  sequential
);

// For display with actual sequential number
const displayHfn = hfn.replace(/\.000$/, `.${sequential}`);
const displayMfa = mfa.replace(/\.000$/, `.${sequential}`);
```

## Benefits

1. **Consistent Display**: HFN and MFA are now displayed consistently across preview, review, and success screens
2. **Robust Special Case Handling**: Properly handles all edge cases (S.POP.HPM, W.NAT.BAS, W.HIP.BAS)
3. **Maintainable Architecture**: Centralized mapping logic makes it easy to add new categories/subcategories
4. **Enhanced User Experience**: Proper layer names and consistent ".000" placeholder display
5. **Better Debugging**: Improved logging for easier troubleshooting

## Specific Fixes

- **Urban Category Display**: Now correctly shows as "HIP" in HFN and "003" in MFA (5.003.001.000)
- **Worlds Layer Display**: Properly maps numeric codes to alphabetic ones (e.g., 015 → NAT)
- **S.POP.HPM Case**: Consistently handled as S.POP.HPM.000 (HFN) and 2.001.007.000 (MFA)
- **Sequential Number Display**: Consistent ".000" placeholder for preview/review, actual value for success screen

## Testing

Extensive testing was performed across all asset types with particular focus on:
- Stars layer with POP category and HPM subcategory
- Worlds layer with Nature (NAT) and Urban (HIP) categories
- Sequential number display consistency
- Layer name display consistency

All edge cases now display correctly throughout the entire asset registration workflow.