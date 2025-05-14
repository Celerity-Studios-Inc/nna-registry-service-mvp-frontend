# Dual Addressing System Fix Plan

## 1. Diagnosis of Current Issues

After a comprehensive review of the NNA Framework's dual addressing implementation in the frontend codebase, I've identified several core issues:

### 1.1 Root Causes

1. **Inconsistent Code Mapping**: The mapping between numeric codes (MFA) and alphabetic codes (HFN) is incomplete and inconsistent across different components. This is particularly problematic for:
   - Worlds layer (W) category codes: The numeric to alphabetic mapping is incomplete for categories like "015" → "NAT"
   - Urban category (003): Not consistently mapped to "HIP" across all layers
   - Special cases like S.POP.HPM not consistently handled 

2. **Isolated Component Logic**: The conversion and display logic is spread across multiple components with isolated implementations:
   - `codeMapping.ts`: Central mapping functions but incomplete coverage
   - `NNAAddressPreview.tsx`: Special case handling for Worlds layer only
   - `ReviewSubmit.tsx`: Display formatting but limited coordination with other components
   - `RegisterAssetPage.tsx`: Additional override logic for success screen display

3. **Sequential Number Display**: Inconsistent handling of `.000` placeholder across different stages

4. **Data Flow Issues**: The original subcategory data is sometimes lost during the form submission flow, making it difficult to reconstruct the correct HFN/MFA on the success screen.

### 1.2 Specific Issues

1. **Urban Category (003) Display**: Not correctly showing as "HIP" in HFN, reverting to numeric code
2. **MFA Format Issues**: Showing `5.001.001.000` instead of `5.003.001.000` for Urban category
3. **File Preview Issues**: Video previews in Step 3 have partial issues due to MIME type handling
4. **Layer Name Display**: Inconsistent layer name display across the asset registration workflow
5. **Special Case Handling**: S.POP.HPM requires special handling that isn't consistently applied

## 2. Implementation Plan

### 2.1 Core Fix: Enhanced Dual Addressing Management

1. **Centralize All Mapping Logic** in `codeMapping.ts`:
   - Create comprehensive bidirectional mappings for all layers (G, S, L, M, W, B, P, T, C, R)
   - Implement robust numeric-to-alphabetic and alphabetic-to-numeric converters
   - Add explicit special case handling for edge cases like S.POP.HPM and W.NAT.BAS
   
2. **Standard Display Format Function** to ensure consistent display:
   - Create a unified `formatNNAAddressForDisplay()` function that handles all display formats
   - Ensure consistent `.000` placeholder display in all components

3. **Layer Name Standardization**:
   - Create a central registry of layer names with consistent display formats
   - Implement helper functions to format layer display consistently across all components

### 2.2 Implementation Steps

#### Step 1: Enhance codeMapping.ts

- Expand layer mappings with full metadata
- Add comprehensive category and subcategory mappings for all layers
- Implement dedicated mappers for each layer to handle special cases
- Create standardized display formatters

#### Step 2: Update NNAAddressPreview Component

- Leverage enhanced mappings from codeMapping.ts
- Remove component-specific special case handling
- Use the standardized display formatter

#### Step 3: Update ReviewSubmit Component

- Align with enhanced codeMapping.ts functions
- Add better validation for HFN/MFA formats
- Preserve original subcategory codes for display

#### Step 4: Fix RegisterAssetPage Display

- Improve asset creation success display logic
- Use the standardized formatter for consistency
- Enhance reconstruction of HFN from MFA when needed

#### Step 5: Comprehensive Testing

- Test all layer/category combinations
- Verify consistent display across preview, review, and success screens
- Validate special case handling for S.POP.HPM and W layers

## 3. Detailed Code Changes

### 3.1 Core codeMapping.ts Improvements

```typescript
// Comprehensive layer metadata
export const layerMappings: Record<string, { name: string, numeric: number, alias?: string[] }> = {
  G: { name: 'Songs', numeric: 1, alias: ['Music', 'Audio'] },
  S: { name: 'Stars', numeric: 2, alias: ['Characters', 'Avatars'] },
  L: { name: 'Looks', numeric: 3, alias: ['Fashion', 'Clothing'] },
  M: { name: 'Moves', numeric: 4, alias: ['Dances', 'Animations'] }, 
  W: { name: 'Worlds', numeric: 5, alias: ['Environments', 'Backgrounds'] },
  B: { name: 'Branded', numeric: 6, alias: ['Sponsored'] },
  P: { name: 'Personalize', numeric: 7, alias: ['Custom'] },
  T: { name: 'Training Data', numeric: 8, alias: ['AI Data'] },
  C: { name: 'Composite', numeric: 9, alias: ['Combined'] },
  R: { name: 'Rights', numeric: 10, alias: ['Licensing'] },
};

// Comprehensive category mappings by layer type
export const categoryMappings: Record<string, Record<string, string>> = {
  // Common mappings used by multiple layers
  common: {
    'POP': '001', 'ROK': '002', 'HIP': '003', 'RNB': '006',
    'DNC': '004', 'LAT': '010', 'IND': '011', 'ALT': '012',
    'WLD': '013', 'JZZ': '007', 'JPO': '008', 'BOL': '009',
    'NAT': '015', // Nature - special for W layer
  },
  // Reverse mappings - numeric to alphabetic
  numeric: {
    '001': 'POP', '002': 'ROK', '003': 'HIP', '004': 'DNC',
    '005': 'DSF', '006': 'RNB', '007': 'JZZ', '008': 'JPO', 
    '009': 'BOL', '010': 'LAT', '011': 'IND', '012': 'ALT',
    '013': 'WLD', '014': 'RFK', '015': 'NAT',
  }
};

// Format NNA address with consistent display (using .000 for sequential placeholder)
export function formatNNAAddressForDisplay(
  layerCode: string,
  categoryCode: string, 
  subcategoryCode: string,
  sequential: string = '000'
): { hfn: string, mfa: string } {
  // Convert codes to proper format
  let displayCategory = getAlphabeticCode(layerCode, categoryCode);
  let displaySubcategory = getAlphabeticCode(layerCode, subcategoryCode, displayCategory);
  
  // Format the HFN address
  const displayHfn = `${layerCode}.${displayCategory}.${displaySubcategory}.${sequential}`;
  
  // Format the MFA address
  const displayMfa = convertHFNToMFA(displayHfn);
  
  return { hfn: displayHfn, mfa: displayMfa };
}
```

### 3.2 Unified Display Format Implementation

This approach centralizes the HFN/MFA display logic, ensuring that the same format is used consistently across all components:

1. Preview screen in TaxonomySelection
2. Review screen in ReviewSubmit 
3. Success screen in RegisterAssetPage

The key is to create a unified display formatter that:
- Maintains alphabetic codes for HFN
- Maintains numeric codes for MFA
- Consistently formats sequential numbers as `.000` for previews
- Preserves special case handling for S.POP.HPM and W layers

## 4. Testing Plan

1. Verify all layer types with the updated code
2. Test across all steps of the registration flow
3. Ensure the following high-priority cases work correctly:
   - S.POP.HPM: Should display as S.POP.HPM.000 (HFN) and 2.001.007.000 (MFA)
   - W.NAT.BAS: Should display as W.NAT.BAS.000 (HFN) and 5.015.001.000 (MFA)
   - W.HIP.BAS: Should display as W.HIP.BAS.000 (HFN) and 5.003.001.000 (MFA)

4. Validate success screen displays:
   - Confirm proper formatting of HFN/MFA
   - Verify proper layer name display
   - Test file preview for different types (image, video, audio)

## 5. Concluding Remarks

The proposed solution addresses the core issues by:

1. Centralizing code mapping logic
2. Creating consistent display formatting
3. Preserving original values when needed for reconstruction
4. Adding comprehensive coverage for all layer types
5. Implementing special case handling at the library level rather than in components

This approach will provide a more robust and maintainable implementation of the dual addressing system as specified in the NNA Framework whitepaper.