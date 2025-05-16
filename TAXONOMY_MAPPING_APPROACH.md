# Robust Taxonomy Mapping Approach

## Overview

The NNA Registry Service uses a sophisticated approach to taxonomy mapping that prioritizes resilience, consistency, and graceful fallbacks over hardcoded special cases. This document outlines the principles and implementation of our taxonomy mapping system, which ensures that all layer-category-subcategory combinations work correctly without requiring explicit special case handling.

## Core Principles

1. **No Hardcoded Mappings**: The system avoids hardcoded special cases for specific combinations (e.g., W.BCH.SUN) which are fragile and difficult to maintain.

2. **Resilient Fallbacks**: Multiple fallback strategies are implemented to gracefully handle edge cases, missing data, or ambiguous inputs.

3. **Bidirectional Conversion**: The system provides consistent conversion between all formats (name, code, numeric) in both directions.

4. **Multiple Matching Strategies**: When exact matches fail, the system tries increasingly flexible matching strategies (case-insensitive matching, partial name matching, etc.).

5. **Consistent Caching**: Performance optimization through appropriate caching while ensuring cache coherence.

## Implementation Details

### Fallback Hierarchy for Subcategory Numeric Code Resolution

When mapping from a human-friendly subcategory code (like "SUN") to a machine-friendly numeric code (like "003"), the system uses the following fallback hierarchy:

1. **Direct Lookup**: Attempt to find the subcategory directly using the exact codes provided.

2. **Case-Insensitive Matching**: If not found, try matching with case-insensitivity (e.g., "sun" would match "SUN").

3. **Name Matching**: Try matching by the full name of the subcategory instead of its code.

4. **Partial Name Matching**: Try matching by checking if the provided string is contained within or contains the subcategory name.

5. **Numeric Code as Fallback**: If the subcategory code is numeric, try using it directly as the numeric code.

6. **Hash-Based Fallback**: As a last resort, generate a consistent hash-based code from the string to ensure deterministic behavior.

### Example: How W.BCH.SUN → 003 is Resolved

For the specific W.BCH.SUN case, here's how the system resolves to the numeric code 003:

1. The system retrieves subcategories for W.BCH from the taxonomy data.
2. It looks for a subcategory with the exact code "SUN".
3. If not found with exact code, it checks if any subcategory has the name that matches "SUN" (e.g., "Sunset").
4. The matching subcategory has a numericCode of 3.
5. This is returned as the result, correctly mapping W.BCH.SUN → 003.

This approach works without needing any special case handling specifically for W.BCH.SUN.

## Benefits of This Approach

1. **Scalability**: The system automatically handles new taxonomy combinations without code changes.

2. **Maintainability**: No need to update the code when taxonomy definitions change.

3. **Consistency**: All mappings follow the same logic, reducing complexity and potential for bugs.

4. **Resilience**: Even with incomplete or ambiguous data, the system produces reasonable results.

5. **Extensibility**: Easy to add new matching strategies without disrupting existing functionality.

## Implementation Classes

### TaxonomyService

The central service that manages access to taxonomy data and provides methods for working with taxonomy objects.

Key methods:
- `getSubcategoryNumericCode`: Resolves subcategory numeric codes with multiple fallback strategies
- `getTaxonomyPath`: Builds human-readable taxonomy paths
- `getSubcategory`: Retrieves subcategory objects with fallback strategies

### TaxonomyMapper

A helper class that provides bidirectional conversion between different taxonomy formats.

Key methods:
- `convertHFNToMFA`: Converts human-friendly NNA addresses to machine-friendly addresses
- `convertMFAToHFN`: Converts machine-friendly NNA addresses to human-friendly addresses
- `getSubcategoryNumericCode`: Maps subcategory codes to numeric codes using taxonomyService

## Conclusion

By implementing this robust taxonomy mapping approach with multiple fallback strategies, we ensure that all taxonomy combinations are handled correctly without the need for special case handling. This improves maintainability, reduces bugs, and makes the system more resilient against changes in the taxonomy structure.