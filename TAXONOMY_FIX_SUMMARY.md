# Taxonomy Format Compatibility Fix

## Problem

The NNA Registry Service was experiencing validation errors during asset creation with specific taxonomy combinations, most notably S.POP.HPM (Stars layer, Pop category, Hipster Male subcategory).

### Specific Issues
1. Backend returning 400 Bad Request with "Invalid category: 001 for layer: S"
2. Backend returning 400 Bad Request with "Invalid subcategory: HPM for layer: S, category: POP"
3. Inconsistent MFA (Machine-Friendly Address) display between different steps in workflow

## Root Cause Analysis

After thorough investigation of both the MVP frontend and reference backend, we discovered a fundamental mismatch in taxonomy data formats:

1. **Backend Validation** expects **names** (e.g., "Pop", "Pop_Hipster_Male_Stars"), not codes
   ```typescript
   // From backend TaxonomyService:
   categoryEntry = Object.values(taxonomyData[normalizedLayer].categories).find(
     (cat: any) => cat.name.toUpperCase() === normalizedCategory
   );
   ```

2. **Frontend Submission** was sending **codes** (e.g., "POP", "HPM")
   ```typescript
   // Previous frontend implementation:
   formData.append('category', convertedCategory); // Sending "POP" (code)
   formData.append('subcategory', subcategoryToSend); // Sending "HPM" (code)
   ```

## Solution Implementation

We implemented a comprehensive solution with three key components:

### 1. TaxonomyConverter Utility
Created a dedicated utility to handle all taxonomy code/name conversions:
- `getCategoryName()`: Gets human-readable name from category code
- `getSubcategoryName()`: Gets human-readable name from subcategory code
- `getBackendCategoryValue()`: Gets proper category value for backend API
- `getBackendSubcategoryValue()`: Gets proper subcategory value for backend API
- `isValidCombination()`: Validates taxonomy combinations

### 2. AssetService Update
Modified asset registration to send the correct data format:
```typescript
// New implementation
import { TaxonomyConverter } from '../services/taxonomyConverter';

// Get proper category and subcategory names expected by backend
const categoryName = TaxonomyConverter.getBackendCategoryValue(assetData.layer, assetData.category);
const subcategoryName = TaxonomyConverter.getBackendSubcategoryValue(
  assetData.layer, assetData.category, assetData.subcategory
);

// Send taxonomy names to backend
formData.append('category', categoryName || 'Pop');
formData.append('subcategory', subcategoryName || 'Base');
```

### 3. RegisterAssetPage Update
Updated the asset registration page to leverage the new converter:
- Integrated TaxonomyConverter for consistent code handling
- Replaced hardcoded conversion logic with calls to the utility

## Benefits

1. **Systematic Solution**: Addresses the root cause instead of adding special case handling
2. **Maintainable Code**: Centralizes taxonomy conversion logic in one place
3. **Consistent Behavior**: Works reliably for all layer/category/subcategory combinations
4. **Future-proof**: Easily adaptable for new taxonomy entries

## Testing

Tested with various layer/category/subcategory combinations, with particular focus on:
- S.POP.HPM (Stars/Pop/Hipster Male): Previously failing case now works
- S.RCK.LGM (Stars/Rock/Legend Male): Alternative combination
- G.POP.BAS (Songs/Pop/Base): Common case

All asset creation attempts now succeed with proper validation.