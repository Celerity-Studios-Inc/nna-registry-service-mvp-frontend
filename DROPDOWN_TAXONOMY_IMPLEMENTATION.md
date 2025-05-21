# Dropdown-Based Taxonomy Selector Implementation

This document describes the implementation of a dropdown-based taxonomy selector for the NNA Registry Service frontend. The implementation replaces the card-based selector with a more stable dropdown-based approach while maintaining compatibility with the existing codebase.

## Overview

The previous implementation of the taxonomy selector used cards for layer, category, and subcategory selection. This approach had issues with subcategories disappearing after selection, causing usability problems. The new dropdown-based approach provides better stability while preserving all the functionality of the original implementation.

## Key Components

1. **DropdownBasedTaxonomySelector** (`src/components/taxonomy/DropdownBasedTaxonomySelector.tsx`)
   - A React component that implements dropdown-based selection for categories and subcategories
   - Integrates with existing taxonomy service for data fetching
   - Implements special case handling (S.POP.HPM, W.BCH.SUN)
   - Uses enhanced address formatting for consistent HFN/MFA generation
   - Provides a cleaner, more reliable UI than the card-based approach

2. **Integration with RegisterAssetPage** (`src/pages/RegisterAssetPage.tsx`)
   - Updated to use the new DropdownBasedTaxonomySelector instead of TaxonomySelection
   - Maintains the same callback pattern for communication between components

## Implementation Details

### Taxonomy Data Loading

The component loads taxonomy data using the existing `taxonomyService`:

```typescript
// Load categories when layer changes
useEffect(() => {
  const fetchCategories = async () => {
    if (!layerCode) {
      setCategories([]);
      return;
    }

    try {
      setLoading(prev => ({ ...prev, categories: true }));
      setError(null);
      
      // Get categories from taxonomy service
      const categoryOptions = taxonomyService.getCategories(layerCode);
      logger.debug(`Loaded ${categoryOptions.length} categories for layer ${layerCode}`);
      
      setCategories(categoryOptions);
    } catch (err) {
      // Error handling...
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  fetchCategories();
}, [layerCode]);
```

### Special Case Handling

The component handles special cases explicitly:

```typescript
// Handle special cases if automatic conversion fails
if (layerCode === 'S' && selectedCategoryCode === 'POP' && selectedSubcategoryCode === 'HPM') {
  const hfnSpecial = `${layerCode}.${selectedCategoryCode}.${selectedSubcategoryCode}.${sequential}`;
  const mfaSpecial = `2.001.007.${sequential}`;
  
  setHfn(hfnSpecial);
  setMfa(mfaSpecial);
  
  logger.info(`Applied special case handling for S.POP.HPM: HFN=${hfnSpecial}, MFA=${mfaSpecial}`);
  
  if (onNNAAddressChange) {
    onNNAAddressChange(
      hfnSpecial,
      mfaSpecial,
      parseInt(sequential, 10) || 1,
      'HPM' // Preserve the original HPM code
    );
  }
} else if (layerCode === 'W' && selectedCategoryCode === 'BCH' && selectedSubcategoryCode === 'SUN') {
  // Special case for W.BCH.SUN...
}
```

### Enhanced Address Formatting

The component uses the enhanced `formatNNAAddressForDisplay` function for consistent address formatting:

```typescript
// Use enhanced formatter from codeMapping.enhanced for consistent addressing
const { hfn: formattedHfn, mfa: formattedMfa } = formatNNAAddressForDisplay(
  layerCode,
  selectedCategoryCode,
  selectedSubcategoryCode,
  sequential
);
```

## Advantages Over Card-Based Implementation

1. **Stability**: Dropdown-based UI is more stable and less prone to state management issues
2. **Resilience**: Better error handling with fallback mechanisms for edge cases
3. **Clarity**: Clear visual indication of selected categories and subcategories
4. **Compatibility**: Same data flow and callback pattern as the original implementation
5. **Performance**: Less intensive DOM manipulation compared to card grid layouts

## Testing

The implementation includes a validation script (`scripts/validate-dropdown-taxonomy.js`) to verify the implementation and integration:

```javascript
// Run the validation script
node scripts/validate-dropdown-taxonomy.js
```

## Future Improvements

1. **Sequential Number API**: Integrate with a future API endpoint for getting the next available sequential number
2. **Pre-selection**: Add support for pre-selecting categories and subcategories based on URL parameters
3. **Search & Filter**: Add search and filter functionality to the dropdowns for large taxonomy sets
4. **Keyboard Navigation**: Enhance keyboard navigation for better accessibility