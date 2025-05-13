# Subcategory Compatibility Fix

## Problem Statement & Updates

### Initial Problem (Previous Fix)

After fixing the category code encoding (converting numeric codes like "001" to alphabetic codes like "POP"), we encountered validation errors with the S.POP.HPM combination:

```
Invalid subcategory: HPM for layer: S, category: POP
```

We implemented a special case fix for S.POP.HPM by substituting 'BAS' in the API request while maintaining the correct MFA display.

### Updated Problem (May 2025)

After further testing with the restored frontend (commit 461b17f) connected to the production backend, we've discovered that:

1. The backend now accepts and preserves HPM as a valid subcategory for S.POP
2. However, all other subcategories (e.g., LGF, JZZ) are still normalized to "BAS" in the backend response

This means:
- When selecting S.POP.HPM: backend returns S.POP.HPM.003
- When selecting S.POP.LGF: backend returns S.POP.BAS.015 (normalizing LGF to BAS)
- When selecting S.POP.JZZ: backend returns S.POP.BAS.016 (normalizing JZZ to BAS)

## Root Cause Analysis

1. The frontend taxonomy definitions in `enriched_nna_layer_taxonomy_v1.3.json` include multiple valid subcategories for S.POP
2. The backend API validation/processing logic:
   - Now correctly accepts and preserves HPM as a valid subcategory
   - Still normalizes all other subcategories to "BAS"
3. Sequential numbering works correctly for each unique taxonomy path (S.POP.BAS vs S.POP.HPM)

## Enhanced Solution

### 1. Previous Solution: Special Case for HPM

The previous special case for S.POP.HPM is no longer needed since the backend now accepts HPM directly:

```typescript
// This code is now obsolete and can be removed:
// If this is an S.POP.HPM case, use BAS instead which should work with the backend
if (assetData.layer === 'S' && assetData.category === 'POP' && assetData.subcategory === 'HPM') {
  console.log('CRITICAL FIX: Detected S.POP.HPM case - using BAS subcategory for backend compatibility');
  console.log('The MFA will still be displayed as 2.001.007.001 but backend will use S.POP.BAS');
  subcategoryToSend = 'BAS'; // Use BAS (Base) which should be universally accepted
}
```

### 2. New Solution: Frontend Display Override for All Subcategories

To provide a consistent user experience until the backend is fixed, we'll implement a display override for all subcategories:

#### Step 1: Track Original Subcategory Selection

Update `TaxonomySelection.tsx` to store the originally selected subcategory:

```typescript
// Add state tracking for the originally selected subcategory
const [originalSubcategory, setOriginalSubcategory] = useState<string>('');

// Update subcategory selection handler
const handleSubcategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const selectedSubcategory = event.target.value;
  setSubcategory(selectedSubcategory);
  setOriginalSubcategory(selectedSubcategory); // Store original selection
  
  // Existing code...
};

// Pass the original subcategory to parent component
useEffect(() => {
  if (onChange) {
    onChange({
      layer,
      category,
      subcategory,
      originalSubcategory, // Add this to the data passed to parent
      // ...other properties
    });
  }
}, [layer, category, subcategory, originalSubcategory, onChange]);
```

#### Step 2: Update RegisterAssetPage.tsx

Modify `RegisterAssetPage.tsx` to use the original subcategory for display:

```typescript
// Add state for original subcategory
const [originalTaxonomyData, setOriginalTaxonomyData] = useState({
  layer: '',
  category: '',
  subcategory: '',
});

// Update taxonomy handler
const handleTaxonomyChange = (data: TaxonomySelectionData) => {
  setTaxonomyData(data);
  setOriginalTaxonomyData({
    layer: data.layer,
    category: data.category,
    subcategory: data.subcategory,
  });
  // Existing code...
};

// Add a utility function to override the displayed HFN for subcategories that get normalized
const getDisplayHFN = (backendHFN: string): string => {
  // Only apply override for cases where we know backend normalizes subcategories
  // HPM is already preserved correctly, so we don't need to override it
  if (
    originalTaxonomyData.subcategory && 
    originalTaxonomyData.subcategory !== 'HPM' && 
    originalTaxonomyData.subcategory !== 'BAS'
  ) {
    // Parse the backend HFN (e.g., "S.POP.BAS.015")
    const parts = backendHFN.split('.');
    if (parts.length === 4 && parts[2] === 'BAS') {
      // Replace BAS with the original subcategory
      parts[2] = originalTaxonomyData.subcategory;
      return parts.join('.');
    }
  }
  return backendHFN;
};

// Update the success screen component
return (
  <div>
    <Typography variant="h6">Asset Successfully Registered</Typography>
    <Typography>
      Human-Friendly Name: {getDisplayHFN(createdAsset.name || '')}
      {originalTaxonomyData.subcategory !== 'HPM' && 
       originalTaxonomyData.subcategory !== 'BAS' && (
        <Tooltip title="Subcategory display adjusted from backend value">
          <InfoIcon fontSize="small" color="info" />
        </Tooltip>
      )}
    </Typography>
    <Typography>
      Machine-Friendly Address: {createdAsset.nnaAddress || ''}
    </Typography>
    {/* Other asset details */}
  </div>
);
```

#### Step 3: Add User Warning for Non-HPM Subcategories (Optional)

Optionally add a warning to inform users about the backend behavior:

```typescript
// In TaxonomySelection.tsx, add warning for non-HPM subcategories
{subcategory && subcategory !== 'HPM' && subcategory !== 'BAS' && (
  <Alert severity="info" sx={{ mt: 1 }}>
    Note: While you've selected {subcategory}, the system will internally use "BAS" 
    for storage. This is a temporary limitation that will be addressed in a future update.
  </Alert>
)}
```

## Implementation Notes

1. This enhanced solution:
   - Removes the now-obsolete special case for S.POP.HPM
   - Adds display override for all other subcategories
   - Maintains frontend/backend compatibility
   - Provides a better user experience

2. The key improvements are:
   - Users see their originally selected subcategory in the success screen
   - The backend still receives and processes the subcategory normally (it will normalize non-HPM to BAS)
   - No manual special cases are needed for individual subcategories

3. This is a temporary solution until the backend can be fixed to preserve all subcategories

## Testing Plan

1. Verify that HPM subcategory works correctly (backend should preserve it)
2. Test other subcategories (LGF, JZZ) and verify the display override works
3. Confirm the override doesn't affect backend storage or retrieval
4. Verify the sequential numbering continues to work correctly

## Future Work

Once the backend is fixed to preserve all subcategories, this frontend workaround can be removed entirely. The backend fix should:

1. Preserve all valid subcategories as selected by the user
2. Maintain proper sequential numbering for each valid taxonomy path
3. Ensure compatibility with existing assets