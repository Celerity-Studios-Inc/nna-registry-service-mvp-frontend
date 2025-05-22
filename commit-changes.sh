#!/bin/bash

# Stage all changed and new files
git add src/components/asset/SimpleTaxonomySelectionV3.tsx
git add src/components/asset/TaxonomySelection.tsx
git add src/pages/TaxonomySelectorV3Test.tsx
git add src/utils/taxonomyErrorRecovery.ts
git add src/services/taxonomyFallbackData.ts
git add src/App.tsx
git add src/pages/TaxonomyComparisonTest.tsx

# Commit the changes
git commit -m "Implement enhanced taxonomy system with V3 selection component

- Create new SimpleTaxonomySelectionV3 with multi-tiered fallback system
- Add enhanced error handling and debugging capabilities
- Expand fallback data for problematic layer/category combinations
- Fix TypeScript errors in TaxonomySelection component
- Create test page for the enhanced component
- Update taxonomyErrorRecovery utility for V3 support"

echo "Changes committed successfully!"