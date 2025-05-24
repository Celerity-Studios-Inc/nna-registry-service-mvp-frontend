# HFN and MFA Format Standardization

## Summary of Changes

This document outlines the fixes implemented to ensure consistent HFN (Human-Friendly Name) and MFA (Machine-Friendly Address) format handling across all layers in the NNA Registry Service.

## Problem Description

Several inconsistencies were identified in how HFN and MFA addresses were handled across different layers:

1. **Inconsistent HFN Display**: 
   - For Worlds (W) layer, the HFN sometimes displayed the filename instead of the proper W.XXX.YYY.ZZZ format
   - For Stars (S) layer, subcategory overrides were applied only in specific scenarios

2. **Inconsistent Sequential Number Display**:
   - Step 2 (TaxonomySelection) showed ".000" as placeholder
   - Step 4 (ReviewSubmit) showed the actual sequential number
   - Success screen showed the final assigned sequential number
   - This inconsistency made it difficult for users to understand the process

3. **Layer-Specific Logic**:
   - HFN/MFA handling contained special cases for specific layers
   - Lacked a unified approach across all layer types

## Implemented Fixes

### 1. Universal HFN Format Standardization

```typescript
// Handle HFN standardization for all layers
const isValidHFNFormat = hfn && /^[A-Z]\.[A-Z0-9]{3}\.[A-Z0-9]{3}\.\d{3}$/.test(hfn);

if (!isValidHFNFormat || createdAsset.layer === 'W') {
  // If not a valid HFN format or specifically for Worlds layer, reconstruct it properly
  // Extract sequential from MFA (last part) if available
  const sequentialParts = mfa ? mfa.split('.') : [];
  const sequential = sequentialParts.length > 3 ? sequentialParts[3] : '001';
  
  // Get layer code, category and subcategory
  const layer = createdAsset.layer || '';
  const category = createdAsset.category || '001';
  const subcategory = originalSubcategoryCode || createdAsset.subcategory || 'BAS';
  
  // Recreate proper HFN using the standard format
  hfn = `${layer}.${category}.${subcategory}.${sequential}`;
  console.log(`HFN FORMAT FIX: Recreating HFN for ${layer} layer: ${hfn}`);
}
```

### 2. Improved Subcategory Override Logic

```typescript
// Check if we need to override the subcategory display (applies to any layer but focus on Stars)
else if (originalSubcategoryCode &&
         (createdAsset.subcategory === 'Base' || createdAsset.subcategory === 'BAS') &&
         (createdAsset.layer === 'S' || hfn.split('.')[2] === 'BAS')) {
  // Parse the backend HFN (e.g., "S.POP.BAS.015")
  const parts = hfn.split('.');
  if (parts.length === 4 && (parts[2] === 'BAS' || parts[2] === 'Base')) {
    // Replace BAS/Base with the original subcategory
    parts[2] = originalSubcategoryCode;
    const displayHfn = parts.join('.');
    console.log(`DISPLAY OVERRIDE: Replacing backend HFN ${hfn} with original subcategory version ${displayHfn}`);
    hfn = displayHfn;
  }
}
```

### 3. Consistent MFA Display in Success Screen

```typescript
<Typography variant="subtitle2" color="text.secondary" align="center">
  Machine-Friendly Address (MFA)
</Typography>
<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
  <Typography variant="body1" fontFamily="monospace" fontWeight="medium" align="center">
    {/* Display with .000 for consistency with other steps */}
    {mfa ? mfa.replace(/\.\d{3}$/, '.000') : ''}
  </Typography>
  <Tooltip title="Showing placeholder .000 for sequential number">
    <InfoIcon color="info" fontSize="small" sx={{ ml: 1, width: 18, height: 18 }} />
  </Tooltip>
</Box>
```

### 4. Informative Tooltips

- Added tooltips to explain format modifications to users
- Different tooltips based on layer type and specific modifications
- Clear indication when original subcategory codes are preserved

## Files Modified

1. **RegisterAssetPage.tsx**:
   - Enhanced HFN/MFA processing in the success screen
   - Added consistent MFA formatting with ".000" placeholder
   - Improved subcategory override logic to work across all layers

2. **ReviewSubmit.tsx** (previous fix):
   - Updated to consistently use ".000" as the sequential number placeholder
   - Added displayHfn and displayMfa variables to maintain consistency

## Benefits

1. **Consistent User Experience**:
   - Users see the same format (with .000) across all steps
   - Easier to understand the NNA address structure

2. **Better Error Resilience**:
   - More robust handling of unexpected data formats
   - Proper fallbacks for missing data

3. **Universal Layer Support**:
   - Works for all layer types: Songs (G), Stars (S), Looks (L), Moves (M), Worlds (W), etc.
   - No special handling needed for specific layers

4. **Improved Code Maintainability**:
   - Centralized logic for HFN/MFA handling
   - Better documentation and logging