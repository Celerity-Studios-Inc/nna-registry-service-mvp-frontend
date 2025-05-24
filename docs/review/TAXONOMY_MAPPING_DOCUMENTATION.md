# Taxonomy Mapping Documentation

## Overview

This document explains the approach used for mapping and displaying taxonomy codes in the NNA Registry Service. The system handles two types of addresses:

1. **Human-Friendly Names (HFN)**: Uses three-letter uppercase alphabetic codes (e.g., POP, ROK, HPM)
2. **Machine-Friendly Addresses (MFA)**: Uses three-digit numeric codes (e.g., 001, 002, 007)

## Key Components

The taxonomy mapping system consists of three primary components:

1. **Taxonomy Data**: Stored in `src/assets/enriched_nna_layer_taxonomy_v1.3.json`
2. **Taxonomy Service**: Provides access to the taxonomy data and handles code conversions
3. **UI Components**: Display taxonomy items with appropriate codes in the interface

## Layer-Specific Mapping System

The most important enhancement to the taxonomy mapping is the introduction of **layer-specific mappings**. Different layers use different code mappings:

```typescript
// Layer-specific mappings for categories
const layerSpecificMappings: Record<string, Record<string, string>> = {
  // Song layer mappings
  'G': {
    '001': 'POP', // Pop
    '002': 'ROK', // Rock
    // ... other song categories
  },

  // Star layer mappings
  'S': {
    '001': 'POP', // Pop Star
    '002': 'ROK', // Rock Star
    // ... other star categories
  },

  // World layer mappings
  'W': {
    '001': 'CLB', // Dance Clubs
    '002': 'STG', // Concert Stages
    '003': 'URB', // Urban
    '004': 'BCH', // Beach
    // ... other world categories
  },

  // Move layer mappings
  'M': {
    '001': 'DNC', // Dance
    '002': 'POS', // Pose
    // ... other move categories
  }
};
```

This allows each layer to have its own mapping between numeric and alphabetic codes, ensuring that:

1. The same numeric code can map to different alphabetic codes in different layers
2. The same alphabetic code can map to different numeric codes in different layers
3. Each layer maintains the correct code mappings according to the NNA Framework specifications

## Subcategory-Specific Mappings

Similarly, subcategories have layer and category-specific mappings:

```typescript
// Layer-category-specific mappings for subcategories
const layerCategorySpecificMappings: Record<string, Record<string, Record<string, string>>> = {
  // World layer has special subcategories
  'W': {
    // Dance Clubs subcategories
    '001': {
      '001': 'BAS', // Base
      '002': 'NEO', // Neon
      '003': 'BLK', // Black
      // ... other Dance Clubs subcategories
    },
    // Beach subcategories
    '004': {
      '001': 'BAS', // Base
      '002': 'TRO', // Tropical
      '003': 'SUN', // Sunset
      // ... other Beach subcategories
    }
  },
  // Star layer subcategories
  'S': {
    // Pop Star subcategories
    '001': {
      '001': 'BAS', // Base
      '002': 'DIV', // Pop Diva Female Stars
      '007': 'HPM', // Pop Hipster Male Stars
      // ... other Pop Star subcategories
    }
  }
};
```

## Code Conversion and Display

### Conversion Flow

The system follows this priority order when converting between numeric and alphabetic codes:

1. Check layer-specific mappings first
2. Then check layer-category-specific mappings for subcategories
3. Fall back to generic mappings if no specific mapping exists
4. Generate a code from the name as a last resort

### Handling Special Cases

Rather than using special case handling with if/else conditions, we've incorporated all special cases into the mapping tables. This provides several benefits:

1. **Centralized management**: All mappings are defined in one place
2. **Better maintainability**: Easy to add new mappings without changing code logic
3. **Consistency**: All code conversions follow the same pattern
4. **Readability**: The mapping tables clearly document the relationship between codes

### Critical Special Cases

Key special cases handled by the mapping system:

1. **W.BCH.SUN (World.Beach.Sunset)**:
   - Must map to `5.004.003` in MFA format
   - World layer (W) → 5, Beach category (BCH) → 004, Sunset subcategory (SUN) → 003

2. **S.POP.HPM (Star.Pop.Hipster_Male)**:
   - Must map to `3.001.007` in MFA format
   - Star layer (S) → 3, Pop category (POP) → 001, Hipster Male subcategory (HPM) → 007

## Implementation Details

### Key Methods

#### `getAlphabeticCode(numericCode, layer)`

Converts a numeric code to its alphabetic equivalent with layer context:

```typescript
function getAlphabeticCode(numericCode: string, layer?: string): string {
  if (!numericCode) return '';

  // Standardize input
  const standardNumeric = numericCode.padStart(3, '0');

  // Try layer-specific mapping first
  if (layer && layerSpecificMappings[layer] && layerSpecificMappings[layer][standardNumeric]) {
    return layerSpecificMappings[layer][standardNumeric];
  }

  // Fall back to generic mapping
  if (genericMappings[standardNumeric]) {
    return genericMappings[standardNumeric];
  }

  // Generate code as last resort
  return generateCodeFromNumeric(standardNumeric);
}
```

#### `getNumericCode(alphabeticCode, layer)`

Converts an alphabetic code to its numeric equivalent with layer context:

```typescript
function getNumericCode(alphabeticCode: string, layer?: string): string {
  if (!alphabeticCode) return '';

  const standardCode = alphabeticCode.toUpperCase();

  // Try layer-specific reverse mapping first
  if (layer && reversedLayerMappings[layer] && reversedLayerMappings[layer][standardCode]) {
    return reversedLayerMappings[layer][standardCode];
  }

  // Fall back to generic mapping
  if (reversedGenericMappings[standardCode]) {
    return reversedGenericMappings[standardCode];
  }

  return '';
}
```

### UI Display Implementation

The TaxonomySelection component displays the appropriate HFN codes by using the category and subcategory code properties directly:

```tsx
<Chip
  label={category.code}
  size="small"
  color="primary"
  variant="outlined"
  sx={{ ml: 1, mr: 1, fontSize: '0.7rem', fontWeight: 'bold' }}
/>
```

These code properties are populated by the taxonomy service when retrieving categories and subcategories, ensuring they reflect the correct HFN codes.

## Maintenance Best Practices

When maintaining the taxonomy mapping system:

1. **Add new mappings to mapping tables**:
   - Don't create one-off special case handlers with if/else conditions
   - Add new mappings to the appropriate layer-specific or subcategory-specific table

2. **Test bidirectional conversion**:
   - Ensure MFA → HFN works correctly
   - Ensure HFN → MFA works correctly
   - Verify that UI displays the correct codes

3. **Document new mappings**:
   - Update LAYER_SPECIFIC_HFN_CODES.md with any new mappings
   - Add special notes for critical cases

4. **Keep mappings centralized**:
   - All mappings should live in the taxonomyService.ts file
   - Avoid duplicating mapping logic across components

This approach ensures that taxonomy codes are always displayed in the correct format while maintaining the integrity of the taxonomy data.