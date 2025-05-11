# NNA Registry MFA Standard Implementation

This document outlines the standard implementation for Machine-Friendly Address (MFA) handling in the NNA Registry Service.

## Overview of NNA Addressing

The NNA Registry uses a dual addressing system:
1. **Human-Friendly Name (HFN)**: Uses alphabetic codes like `S.POP.HPM.001`
2. **Machine-Friendly Address (MFA)**: Uses numeric codes like `2.001.007.001`

These are structured as:
- Layer (e.g., S/2 for Stars)
- Category (e.g., POP/001 for Pop)
- Subcategory (e.g., HPM/007 for Pop_Hipster_Male_Stars)
- Sequential number (e.g., 001, 002, etc.)

## Standard Implementation Guidelines

### 1. Use Taxonomy Data for Mappings

The system should rely on the taxonomy data (`enriched_nna_layer_taxonomy_v1.3.json`) for all mappings between alphabetic and numeric codes. This data already defines:
- Layer mappings (e.g., S maps to 2)
- Category mappings (e.g., POP maps to 001)
- Subcategory mappings (e.g., HPM maps to 007)

### 2. No Special Case Handling

Special case handling should be avoided. For example, `S.POP.HPM` should not have special handling - it should simply follow the standard mapping defined in the taxonomy data where HPM maps to 007.

### 3. Consistent Metadata Storage

When storing asset metadata, include both formats with consistent field names:
- `humanFriendlyName` or `hfn` for the HFN
- `machineFriendlyAddress` or `mfa` for the MFA
- `nnaAddress` as the primary field for the MFA at the asset root level

### 4. Proper Fallbacks Without Defaults

When extracting MFA values, use proper fallbacks:
```typescript
// Extract MFA with proper fallbacks - no hardcoded defaults
const mfa = asset.nnaAddress || 
            asset.metadata?.machineFriendlyAddress || 
            asset.metadata?.mfa;
```

Avoid hardcoded defaults like "0.000.000.001" as these aren't valid MFAs according to the taxonomy.

### 5. Consistent Conversion Functions

Conversion functions should be bi-directional and follow a consistent approach:
- `convertHFNToMFA()`: Converts from HFN to MFA format using taxonomy mappings
- `convertMFAToHFN()`: Converts from MFA to HFN format using taxonomy mappings

## Component Implementation

### 1. TaxonomySelection Component

The TaxonomySelection component should:
- Use the taxonomy service to get available layers, categories, and subcategories
- Generate HFN and MFA values using the standard conversion functions
- Propagate both values for use in the rest of the application

### 2. Asset Detail Page

The Asset Detail page should:
- Extract HFN and MFA values from the asset metadata with proper fallbacks
- Display both values in the UI
- Log the values for debugging

### 3. Asset Creation Flow

During asset creation:
- Generate HFN and MFA values consistently based on the selected taxonomy
- Store both values in the asset metadata
- Ensure the `nnaAddress` field contains the MFA value at the asset root level

## Troubleshooting

If MFA values are not displaying correctly:
1. Check the taxonomy service initialization
2. Verify the conversion functions are using the correct mappings
3. Ensure values are properly extracted from asset metadata
4. Add logging to trace the flow of MFA values through the application

Remember that HPM should map to 007 according to the standard taxonomy data, without requiring any special case handling.