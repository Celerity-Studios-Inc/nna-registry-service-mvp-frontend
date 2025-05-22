#!/bin/bash

# Stage the changes for step 9
git add src/pages/RegisterAssetPage.tsx
git add src/components/asset/SimpleTaxonomySelectionV3.tsx
git add src/services/enhancedTaxonomyService.ts
git add src/utils/taxonomyQuickTest.js

# Commit with a descriptive message
git commit -m "Implement Step 9: Integrate SimpleTaxonomySelectionV3 into RegisterAssetPage

- Replace TaxonomySelection with SimpleTaxonomySelectionV3 in RegisterAssetPage
- Add debug information display to track state
- Fix subcategory format handling in SimpleTaxonomySelectionV3
- Add emergency fallback for problematic combinations
- Create taxonomyQuickTest utility for verification
- Enhance error handling and diagnostics"

echo "Changes committed successfully!"