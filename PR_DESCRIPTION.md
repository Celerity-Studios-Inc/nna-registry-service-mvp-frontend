# Implement Dropdown-Based Taxonomy Selector

This PR replaces the card-based taxonomy selector with a dropdown-based implementation to address persistent issues with subcategories disappearing during selection. The dropdown approach provides a more stable UI while maintaining full compatibility with existing code.

## Changes

- Created new `DropdownBasedTaxonomySelector` component that uses dropdown menus instead of cards
- Updated `RegisterAssetPage` to use the new dropdown selector
- Created a test page to compare card vs. dropdown implementations
- Added validation script to verify the implementation
- Documented the changes in `DROPDOWN_TAXONOMY_IMPLEMENTATION.md`

## Motivation

The card-based taxonomy selector in `SimpleTaxonomySelectionV2` has been experiencing issues where subcategories disappear after selection, causing disruption to the asset registration workflow. This implementation follows the advice to "work with dropdowns" as discussed with the team.

## Implementation Details

The new dropdown-based selector:

1. Uses Material UI's Select components for stable dropdown UI
2. Maintains compatibility with existing taxonomy services
3. Properly handles special cases like S.POP.HPM and W.BCH.SUN
4. Uses enhanced address formatter for consistent HFN/MFA generation
5. Provides clearer visual feedback during selection

## Testing

The implementation includes:

1. A validation script (`scripts/validate-dropdown-taxonomy.js`)
2. A dedicated test page for comparing selectors side-by-side
3. Integration with the existing asset registration workflow

## References

Based on working implementation from CI/CD #139 (Commit 3521e3f).