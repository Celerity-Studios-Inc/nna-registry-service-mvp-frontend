# Taxonomy Implementation Documentation

## Overview

The taxonomy system has been refactored to use flattened taxonomy lookup tables directly, eliminating the need for special case handling. This approach makes the code more maintainable, efficient, and robust.

## Key Components

### 1. Flattened Taxonomy Structure

The taxonomy data is stored in flattened lookup tables in the `taxonomyLookup` directory:

- `constants.ts`: Contains the main lookup tables `LAYER_LOOKUPS` and `LAYER_SUBCATEGORIES`
- Layer-specific files (e.g., `S_layer.ts`, `W_layer.ts`): Contain detailed mapping data for each layer

### 2. SimpleTaxonomyService

Located in `src/services/simpleTaxonomyService.ts`, this service provides:

- Direct lookups from flattened taxonomy tables
- Bidirectional conversion between HFN (Human-Friendly Names) and MFA (Machine-Friendly Addresses)
- Functions to list categories and subcategories for any layer

Example usage:
```typescript
// Convert HFN to MFA
const mfa = taxonomyService.convertHFNtoMFA('W.BCH.SUN.001'); // Returns '5.004.003.001'

// Convert MFA to HFN
const hfn = taxonomyService.convertMFAtoHFN('2.001.007.001'); // Returns 'S.POP.HPM.001'

// Get categories for a layer
const categories = taxonomyService.getCategories('W');

// Get subcategories for a category
const subcategories = taxonomyService.getSubcategories('S', 'POP');
```

### 3. TaxonomyMapper

Located in `src/api/taxonomyMapper.ts`, this component:

- Provides a consistent interface for the UI components to access taxonomy data
- Implements caching for performance optimization
- Formats addresses for display in the UI

## Implementation Details

### HFN to MFA Conversion

Human-Friendly Names (HFN) like `W.BCH.SUN.001` are converted to Machine-Friendly Addresses (MFA) like `5.004.003.001` using direct lookups:

1. Split the HFN into parts: layer, category, subcategory, sequential
2. Look up the layer numeric code (e.g., 'W' → '5')
3. Look up the category numeric code from `LAYER_LOOKUPS` (e.g., 'BCH' → '004')
4. Look up the subcategory numeric code from `LAYER_LOOKUPS` (e.g., 'SUN' → '003')
5. Combine with the sequential number to form the MFA

### MFA to HFN Conversion

Machine-Friendly Addresses (MFA) like `5.004.003.001` are converted to Human-Friendly Names (HFN) like `W.BCH.SUN.001` by:

1. Split the MFA into parts: layerNumeric, categoryNumeric, subcategoryNumeric, sequential
2. Look up the layer alphabetic code (e.g., '5' → 'W')
3. Find the category code that matches the numeric code in `LAYER_LOOKUPS`
4. Find the subcategory code that matches the numeric code in `LAYER_LOOKUPS`
5. Combine with the sequential number to form the HFN

## Testing

The implementation is tested via:

- Unit tests in `src/services/__tests__/simpleTaxonomyService.test.ts`
- Integration tests in `src/api/taxonomyMapper.test.ts`

To run the tests:
```bash
npm test -- --testPathPattern=simpleTaxonomyService
npm test -- --testPathPattern=taxonomyMapper
```

## Maintenance

To add or modify taxonomy data:

1. Update the corresponding layer file in the `taxonomyLookup` directory
2. Ensure both `LAYER_LOOKUPS` and `LAYER_SUBCATEGORIES` are updated consistently
3. Run the tests to verify that your changes work as expected

No special case handling should be added to the code. All mappings should work directly from the flattened taxonomy files.