# Comprehensive Taxonomy Alignment Plan

## Root Cause Analysis

After thoroughly analyzing the codebase, I've identified the fundamental issue with the S.POP.HPM validation errors:

1. **Taxonomy Validation Mismatch**: 
   - The backend validates taxonomy by checking:
     ```typescript
     await this.taxonomyService.validateTaxonomy(layer, category, subcategory);
     ```
   - This validation checks if `subcategory` is a valid name in the taxonomy's list of subcategories for the given layer and category.
   - It normalizes all inputs to uppercase during validation.

2. **Backend Expects Category/Subcategory Names, Not Codes**: 
   - When examining the `createAsset` method in the backend, it's clear that `category` and `subcategory` parameters should be the **name values** (like "Pop", "Pop_Hipster_Male_Stars"), not the **code values** (like "POP", "HPM").
   - The backend does the code conversion itself using `getNnaCodes` and `getHumanFriendlyCodes`.

3. **Frontend Confusion**: 
   - Our frontend is sending code values (like "POP", "HPM") in the API request.
   - But the backend expects name values (like "Pop", "Pop_Hipster_Male_Stars").
   - This explains why all subcategory values are being rejected - we're sending the wrong format.

4. **Reference Frontend Mismatch**:
   - The reference frontend implementation has the same issue!
   - It's sending `subcategory: assetData.subcategory` which is the code, not the name.
   - This suggests the API might have evolved since the reference was created.

## Comprehensive Solution

Instead of hardcoding special cases, we need a systematic approach that aligns with the backend's expectations:

1. **Taxonomy Format Conversion**:
   - Create a robust conversion layer that transforms between UI representation (codes) and API representation (names).
   - Add methods to convert between code-based and name-based formats.

2. **API Request Transformation**:
   - Update the asset creation endpoint to convert codes to names before sending to the backend.
   - Ensure all taxonomy-related fields follow this pattern.

3. **Consistent Taxonomy Handling**:
   - Centralize taxonomy code in a service that handles all conversions.
   - Eliminate hardcoded special cases.
   - Add proper validation before API calls.

## Implementation Plan

### 1. Create a TaxonomyConverter Utility

```typescript
// src/utils/taxonomyConverter.ts
import { taxonomyData } from '../assets/enriched_nna_layer_taxonomy_v1.3.json';

export class TaxonomyConverter {
  /**
   * Converts a category code to its corresponding name
   * @param layer Layer code (e.g., 'S')
   * @param categoryCode Category code (e.g., 'POP')
   * @returns Category name (e.g., 'Pop')
   */
  static getCategoryName(layer: string, categoryCode: string): string {
    // Look up by numeric code first
    if (/^\d+$/.test(categoryCode)) {
      if (taxonomyData[layer]?.categories[categoryCode]) {
        return taxonomyData[layer].categories[categoryCode].name;
      }
    }
    
    // Look up by alphabetic code
    for (const key in taxonomyData[layer]?.categories) {
      if (taxonomyData[layer].categories[key].code === categoryCode) {
        return taxonomyData[layer].categories[key].name;
      }
    }
    
    return categoryCode; // Fallback to the code itself
  }
  
  /**
   * Converts a subcategory code to its corresponding name
   * @param layer Layer code (e.g., 'S')
   * @param categoryCode Category code (e.g., 'POP')
   * @param subcategoryCode Subcategory code (e.g., 'HPM')
   * @returns Subcategory name (e.g., 'Pop_Hipster_Male_Stars')
   */
  static getSubcategoryName(layer: string, categoryCode: string, subcategoryCode: string): string {
    // Find the category entry first
    let categoryEntry = null;
    
    // Look up by numeric code first
    if (/^\d+$/.test(categoryCode)) {
      categoryEntry = taxonomyData[layer]?.categories[categoryCode];
    } else {
      // Look up by alphabetic code
      for (const key in taxonomyData[layer]?.categories) {
        if (taxonomyData[layer].categories[key].code === categoryCode) {
          categoryEntry = taxonomyData[layer].categories[key];
          break;
        }
      }
    }
    
    if (!categoryEntry) {
      return subcategoryCode; // Cannot find category, return original code
    }
    
    // Now look up subcategory within the found category
    if (/^\d+$/.test(subcategoryCode)) {
      // Numeric subcategory code
      if (categoryEntry.subcategories[subcategoryCode]) {
        return categoryEntry.subcategories[subcategoryCode].name;
      }
    } else {
      // Alphabetic subcategory code
      for (const key in categoryEntry.subcategories) {
        if (categoryEntry.subcategories[key].code === subcategoryCode) {
          return categoryEntry.subcategories[key].name;
        }
      }
    }
    
    return subcategoryCode; // Fallback to the code itself
  }
  
  /**
   * Prepares taxonomy data for backend API requests
   * @param layer Layer code (e.g., 'S')
   * @param categoryCode Category code (e.g., 'POP')
   * @param subcategoryCode Subcategory code (e.g., 'HPM')
   * @returns Object with name-based values for backend API
   */
  static prepareForApi(layer: string, categoryCode: string, subcategoryCode: string) {
    return {
      layer,
      category: this.getCategoryName(layer, categoryCode),
      subcategory: this.getSubcategoryName(layer, categoryCode, subcategoryCode)
    };
  }
}
```

### 2. Update Asset Service

```typescript
// src/api/assetService.ts
import { TaxonomyConverter } from '../utils/taxonomyConverter';

// ...

async createAsset(assetData: AssetCreateRequest): Promise<Asset> {
  try {
    // ...
    
    // Convert taxonomy codes to names for backend API
    const taxonomy = TaxonomyConverter.prepareForApi(
      assetData.layer,
      assetData.category,
      assetData.subcategory
    );
    
    // Create FormData with names instead of codes
    const formData = new FormData();
    // Add file
    if (assetData.files && assetData.files.length > 0) {
      const file = assetData.files[0];
      formData.append('file', file);
    }
    
    // Add taxonomy data using names, not codes
    formData.append('layer', taxonomy.layer);
    formData.append('category', taxonomy.category);
    formData.append('subcategory', taxonomy.subcategory);
    
    // Add other required fields
    formData.append('source', assetData.source || 'ReViz');
    formData.append('description', assetData.description || 
                  `Asset ${assetData.name} (${taxonomy.layer}.${taxonomy.category}.${taxonomy.subcategory})`);
    
    // Other fields...
    // ...
    
    // Make the API request
    const assetEndpoint = '/api/assets';
    const response = await fetch(assetEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: formData
    });
    
    // ...
  } catch (error) {
    // ...
  }
}
```

### 3. Update UI Components to Display Consistent Information

Ensure all UI components use the TaxonomyConverter consistently:

```typescript
// In TaxonomySelection.tsx and other relevant components
import { TaxonomyConverter } from '../utils/taxonomyConverter';

// When displaying taxonomy info to users, continue using codes
// When preparing data for API, use the converter
const handleSubmit = (data) => {
  const apiData = {
    // UI data uses codes
    uiData: {
      layer: data.layer,
      categoryCode: data.categoryCode,
      subcategoryCode: data.subcategoryCode,
      // ...
    },
    
    // Convert to API format (names)
    apiData: TaxonomyConverter.prepareForApi(
      data.layer,
      data.categoryCode,
      data.subcategoryCode
    ),
    
    // Rest of the data
    // ...
  };
  
  // Use apiData for backend communication
  // Use uiData for UI display
};
```

## Testing Strategy

1. **Unit Tests**:
   - Create unit tests for the TaxonomyConverter methods
   - Test all edge cases (numeric codes, alphabetic codes, missing entries)

2. **Integration Tests**:
   - Test the asset creation flow end-to-end
   - Verify all taxonomy combinations work properly

3. **Manual Testing**:
   - Test with the S.POP.HPM case specifically
   - Test with other taxonomy combinations

## Documentation

Update documentation to clearly explain:
1. The difference between taxonomy codes and names
2. How the frontend and backend communicate
3. The conversion process

## Benefits of This Approach

1. **Systematic Solution**: Addresses the root cause instead of adding one-off fixes.
2. **Maintainable**: Single point of change for taxonomy handling.
3. **Future-Proof**: Aligned with backend's validation logic.
4. **Consistent**: Provides predictable behavior across all taxonomy combinations.

By implementing this plan, we'll fix not just the S.POP.HPM issue, but ensure correct handling of all taxonomy combinations, eliminating the need for special case handling.