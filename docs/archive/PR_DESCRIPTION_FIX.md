# Fix Taxonomy UI Issues and Data Loading

## Summary
This PR adds fixes for the taxonomy UI issues identified in the Vercel deployment, particularly focusing on:
1. Non-clickable layer selection cards in the RegisterAssetPage
2. Missing category data in the Star layer (showing only 3 of the expected categories)
3. Incomplete subcategory data for certain categories
4. Special mapping fixes for W.BCH.SUN.001 and S.POP.HPM.001

## Changes Made

### Bug Fixes
- Fixed the layer selection UI by adding improved click handling and visual feedback
- Enhanced error handling in the taxonomy service to better diagnose data loading issues
- Added extensive debugging to taxonomy components for easier troubleshooting
- Fixed CSS styles to make UI components more interactive and accessible

### Debugging Tools
- Created a new TaxonomyDebugPage accessible at `/taxonomy-debug` to test layer, category, and subcategory selection
- Added a TaxonomyDebug component that shows detailed information about the taxonomy structure
- Added `scripts/debug-taxonomy-lookups.js` to validate the taxonomy lookup tables
- Added extensive logging to simpleTaxonomyService.ts to trace data loading issues

### Testing
- Verified that the key special cases (W.BCH.SUN.001 and S.POP.HPM.001) map correctly
- Confirmed all layer lookup tables are properly structured
- Tested the UI components to ensure they work correctly with the fixed implementation

## Testing Instructions
1. Navigate to the `/taxonomy-debug` route to test layer selection and taxonomy component
2. Use the UI to select different layers and verify that all expected categories and subcategories appear
3. Check the browser console for debugging information
4. Run `node scripts/debug-taxonomy-lookups.js` to validate the taxonomy structure

## Screenshots
N/A - Please test the live deployment after merging

## Related Issues
- Fixes layer selection not working in Vercel deployment
- Fixes incomplete taxonomy data in RegisterAssetPage
- Ensures W.BCH.SUN.001 and S.POP.HPM.001 special mappings work correctly