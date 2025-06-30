# Flattened Taxonomy System Documentation

## Overview

The NNA Registry Service uses a dual addressing system for digital assets:

1. **Human-Friendly Names (HFN)**: Readable codes like `W.BCH.SUN.001.mp4`
   - W = World layer
   - BCH = Beach category
   - SUN = Sunset subcategory
   - 001 = Sequential number
   - mp4 = File type

2. **Machine-Friendly Addresses (MFA)**: Numeric codes like `5.004.003.001.mp4`
   - 5 = World layer numeric code
   - 004 = Beach category numeric code
   - 003 = Sunset subcategory numeric code
   - 001 = Same sequential number
   - mp4 = Same file type

This document explains the flattened taxonomy approach implemented to manage these mappings efficiently.

## Flattened Approach

The flattened approach simplifies the dual addressing system by:

1. **Using lookup tables** instead of complex nested structures
2. **Direct mapping** between codes and their numeric equivalents
3. **No special case handling** in code - all mappings are data-driven
4. **Better performance** with O(1) lookups instead of traversal

## Implementation Components

### 1. Lookup Tables

Each layer has its own lookup table file in `src/taxonomyLookup/`:

```typescript
// Example: W_layer.ts
export const W_LAYER_LOOKUP = {
  // Categories
  "BCH": {
    "numericCode": "004",
    "name": "Beach"
  },
  
  // Subcategories (with full codes)
  "BCH.SUN": {
    "numericCode": "003",
    "name": "Sunset"
  }
};

// Mapping from categories to their subcategories
export const W_SUBCATEGORIES = {
  "BCH": [
    "BCH.SUN",
    "BCH.FES",
    "BCH.TRO"
  ]
};
```

### 2. SimpleTaxonomyService

The `SimpleTaxonomyService` provides methods for:

- Getting categories for a layer
- Getting subcategories for a category
- Converting HFN to MFA using direct lookups
- Validating HFN format and codes

```typescript
// Key method for HFN to MFA conversion
public convertHFNtoMFA(hfn: string): string {
  const parts = hfn.split('.');
  const [layer, categoryCode, subcategoryCode, sequential, ...rest] = parts;
  
  // Get layer numeric code
  const layerNumeric = LAYER_NUMERIC_CODES[layer];
  
  // Get category and subcategory info from lookup tables
  const categoryInfo = LAYER_LOOKUPS[layer][categoryCode];
  const subcategoryInfo = LAYER_LOOKUPS[layer][`${categoryCode}.${subcategoryCode}`];
  
  // Build MFA
  const suffix = rest.length > 0 ? '.' + rest.join('.') : '';
  return `${layerNumeric}.${categoryInfo.numericCode}.${subcategoryInfo.numericCode}.${sequential}${suffix}`;
}
```

### 3. UI Components

- **SimpleTaxonomySelection**: Component for selecting category and subcategory
- **LayerSelector**: Component for selecting a layer with descriptions
- **TaxonomyValidator**: Component for testing and validating mappings

## Generating Lookup Tables

Lookup tables can be updated using the `taxonomyFlattener.js` script:

```bash
npm run flatten-taxonomy
```

This script:
1. Reads the full taxonomy JSON data
2. Generates flattened lookup tables for each layer
3. Writes them to the `src/taxonomyLookup/` directory

## Special Case: W.BCH.SUN

The W.BCH.SUN mapping is a specific case that needed fixing. Using the flattened approach:

- W.BCH.SUN.001 correctly maps to 5.004.003.001
- This is achieved by explicitly setting the numericCode in the lookup table
- No special code is needed - it works through the standard lookup process

## Special Case: S.POP.HPM

Similar to W.BCH.SUN, the S.POP.HPM mapping needed special attention:

- S.POP.HPM.001 correctly maps to 2.001.007.001
- This is handled through the same lookup mechanism
- No code-level special casing is required

## Supported Layers

The system supports all 10 MVP layers:

1. G - Song (1)
2. S - Star (2)
3. L - Look (3)
4. M - Moves (4)
5. W - World (5)
6. B - Branded (6)
7. P - Personalize (7)
8. T - Training_Data (8)
9. C - Composites (9)
10. R - Rights (10)

## Maintenance

To add or update mappings:

1. Update the taxonomy data or edit the lookup tables directly
2. Run the flattener script to regenerate all tables
3. Verify the mappings with the testing scripts

## Best Practices

1. Always use the SimpleTaxonomyService for HFN/MFA operations
2. Keep taxonomy data and lookup tables in sync
3. Use the TaxonomyValidator to test any changes
4. Maintain consistency across all layers

## Performance Considerations

The flattened approach provides significant performance improvements:

- **Lookup Speed**: O(1) direct lookup instead of traversal through nested objects
- **Memory Usage**: Slightly higher memory usage for caching lookups, but worth the performance gain
- **Complexity**: Much simpler code with fewer edge cases and special handling

## Error Handling

The taxonomy service includes robust error handling:

- Validation to ensure layers, categories, and subcategories exist
- Graceful error reporting with specific messages
- Fallback mechanisms when possible

## Testing

To verify the system is working correctly:

1. Use `scripts/test-all-mappings.js` to test all mappings programmatically
2. Use the TaxonomyValidator component to test specific mappings
3. Run the full application and test the asset registration flow

## Future Enhancements

Potential future improvements:

1. Automated validation for taxonomy updates
2. Version control for taxonomy data
3. API endpoint for verifying mappings
4. Migration tools for updating legacy data