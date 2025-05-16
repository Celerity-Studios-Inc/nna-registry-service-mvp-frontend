# Taxonomy Mapping Documentation

## Overview

This document explains the approach used for mapping and displaying taxonomy codes in the NNA Registry Service. The system handles two types of addresses:

1. **Human-Friendly Names (HFN)**: Uses three-letter uppercase alphabetic codes (e.g., POP, ROK, HPM)
2. **Machine-Friendly Addresses (MFA)**: Uses three-digit numeric codes (e.g., 001, 002, 007)

## Key Components

The taxonomy mapping system consists of three primary components:

1. **Taxonomy Data**: Stored in `src/assets/enriched_nna_layer_taxonomy_v1.3.json`
2. **Taxonomy Service**: Provides access to the taxonomy data and handles code conversions
3. **Taxonomy Mapper**: Provides additional mapping functions for specific use cases

## Code Conversion and Display

### Categories and Subcategories

The system handles several scenarios for category and subcategory codes:

1. **Direct Alphabetic Codes**: Some categories in the taxonomy data already use alphabetic codes (e.g., "POP", "ROK")
2. **Numeric Codes with Code Property**: Some use numeric keys with a code property (e.g., "001" with code: "POP")
3. **Pure Numeric Codes**: Some use numeric keys without a code property (e.g., "001" without explicit mapping)

For proper display, we:

1. Use the `code` property if available
2. Generate alphabetic codes from names if no code is provided
3. Apply standard mappings for common numeric codes:
   - 001 → POP (Pop)
   - 002 → ROK (Rock)
   - 003 → HIP (Hip Hop)
   - etc.

### Special Cases

The system handles several special cases:

1. **Stars.POP.HPM**: Ensures "S.POP.HPM" maps to "2.001.007" in MFA format
2. **World Layer Categories**: Maps Beach (BCH) to 003 numeric code

## Implementation Details

### Category Code Generation

When a category uses a numeric code without an explicit alphabetic mapping, we generate a code by:

1. Using the `code` property if it exists
2. Extracting letters from the category name:
   - For multi-word names: Using first letter of each word (e.g., "Hip Hop" → "HIP")
   - For single words: Using first 3 letters (e.g., "Rock" → "ROK")
3. Falling back to standard mappings for common numeric codes

### Subcategory Code Generation

Similar to categories, we generate subcategory codes by:

1. Using the `code` property if it exists
2. Extracting letters from the subcategory name
3. Using special mappings for certain combinations (e.g., Stars.POP subcategories)

## Maintaining Consistency

The system maintains consistency by:

1. Using direct lookups from taxonomy data whenever possible
2. Applying consistent generation rules when direct mappings aren't available
3. Caching results to improve performance

This approach ensures that taxonomy codes are always displayed in the correct format, while still leveraging the canonical taxonomy data.