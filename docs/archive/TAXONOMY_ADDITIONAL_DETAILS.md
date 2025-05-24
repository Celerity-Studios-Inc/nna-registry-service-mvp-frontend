# Additional Context for Claude on NNA Registry Taxonomy Issues

## NNA Registry System Context

The NNA (Naming, Numbering, and Addressing) Registry Service is a platform for managing digital assets within a structured taxonomy system. It uses a dual addressing approach:

1. **Human-Friendly Names (HFN)**: Readable codes like `W.BCH.SUN.001` 
   - W = World layer
   - BCH = Beach category
   - SUN = Sunset subcategory
   - 001 = Sequential number

2. **Machine-Friendly Addresses (MFA)**: Numeric codes like `5.004.003.001`
   - 5 = World layer numeric code
   - 004 = Beach category numeric code
   - 003 = Sunset subcategory numeric code
   - 001 = Same sequential number

## Original Working System

In the originally working system, these mappings were primarily handled by a comprehensive JSON taxonomy file (`enriched_nna_layer_taxonomy_v1.3.json`). This file contained:

- All layers (G, S, L, M, W, B, P, T, C, R)
- All categories within each layer
- All subcategories within each category
- Both alphabetic codes and numeric codes

The UI would display proper human-readable names (like "Beach" and "Sunset") rather than just the codes.

## Specific Example of W.BCH.SUN Issue

The specific issue with W.BCH.SUN was:

1. When creating a World (W) layer asset with Beach (BCH) category and Sunset (SUN) subcategory:
   - The expected mapping: W.BCH.SUN → 5.004.003
   - The actual mapping: W.BCH.SUN → 5.004.077 (using hash-based fallback)

2. This occurred because:
   - The system couldn't find the SUN subcategory in the Beach category
   - It fell back to a hash-based algorithm that calculated "77" for "SUN"
   - This created an invalid MFA address

## Current UI Display Issues

The screenshots show several UI problems:

1. **Wrong Categories Showing**: 
   - We saw "Dance_Clubs", "Concert_Stages", etc. under World layer
   - We saw "Name", "Categories", etc. instead of proper category names

2. **Missing or Corrupted Data**:
   - Many categories and subcategories entirely missing
   - Some showing numeric codes instead of names

3. **Structural Issues**:
   - The hierarchical relationship between layers, categories, and subcategories is broken
   - Category codes and names don't match what's expected

## Technical Implementation Details

The taxonomy system is implemented through several key files:

1. `src/assets/enriched_nna_layer_taxonomy_v1.3.json` - The data source
2. `src/api/taxonomyService.ts` - Core service that loads and processes taxonomy data
3. `src/api/codeMapping.ts` - Handles special mappings and conversions
4. `src/components/asset/TaxonomySelection.tsx` - UI component for displaying and selecting taxonomies

The most critical change that broke functionality was in commit 94adbf6, where the JSON file was replaced with a minimal version. This commit intended to:

1. Make the system more "data-driven" with explicit mappings
2. Fix the W.BCH.SUN issue specifically
3. Remove the error-prone hash-based fallback

But it inadvertently:
1. Removed most of the taxonomy data
2. Left the UI components without the necessary data
3. Created an inconsistent state between data and code approaches

## Reproduction Steps

To reproduce the issue:
1. Go to "Register Asset" page
2. Select "World" layer
3. Observe incorrect categories (showing mixed codes and names)
4. Try to select "Beach" and "Sunset" - incorrect mappings occur

## Complete Fix Requirements

A complete fix needs to:

1. Restore the full taxonomy JSON data with all categories
2. Keep the W.BCH.SUN mapping fix without breaking other mappings
3. Remove the hash-based fallback mechanism
4. Maintain a clean separation between data and special case handling
5. Keep the UI components working with correct display names
6. Ensure stable MFA generation for all valid HFN codes

This additional context should help Claude understand the detailed nature of the problem and guide us toward an effective solution.