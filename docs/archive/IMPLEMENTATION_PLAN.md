# NNA Registry Service Fix Implementation Plan

## Current Status: May 13, 2025

We've identified and documented a subcategory normalization issue where the backend API normalizes most subcategories to "Base" (BAS) during asset registration. Several detailed documents outline the issue:

1. `BACKEND_SUBCATEGORY_ISSUE.md` - Analysis with test results
2. `BACKEND_FIX_PLAN.md` - Technical plan for backend solution
3. `SUBCATEGORY_COMPATIBILITY_FIX.md` - Frontend workaround details
4. `TAXONOMY_FIX_SUMMARY.md` - Overview of both issues and solutions

## Test Results Summary

Our testing with the production backend (registry.reviz.dev/api) confirmed the issue:

1. **Test 1 (S.POP.LGF)**: 
   - Sent: S.POP.LGF
   - Received: S.POP.BAS.014 and S.001.001.014
   - Normalized LGF to BAS

2. **Test 2 (Same S.POP.LGF again)**: 
   - Sent: S.POP.LGF
   - Received: S.POP.BAS.015 and S.001.001.015
   - Sequential number properly incremented

3. **Test 3 (S.POP.ICM - different subcategory)**: 
   - Sent: S.POP.ICM
   - Received: S.POP.BAS.016 and S.001.001.016
   - ICM was also normalized to BAS
   - Sequential number continued incrementing

## Phased Implementation Plan

### Phase 1: Frontend Workaround (Current Repository)

**Repository:** `nna-registry-service-mvp-frontend`  
**Working Directory:** `/Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend`

1. **Implement Display Override in Frontend:**
   - Modify TaxonomySelection.tsx to store the original subcategory selection
   - Update RegisterAssetPage.tsx to display the original selection in the success screen
   - Add subtle indicator to show when the display has been adjusted

2. **Test Frontend Workaround:**
   - Test with multiple subcategory combinations (LGF, ICM, JZZ)
   - Verify the display shows the original subcategory while the backend still uses BAS
   - Confirm the workaround doesn't affect asset creation or retrieval

### Phase 2: Backend Fix (Later, Different Repository)

**Repository:** `nna-registry-service`  
**Working Directory:** `/Users/ajaymadhok/nna-registry-service`  
**GitHub URL:** `https://github.com/EqualsAjayMadhok/nna-registry-service`

1. **Analyze Backend Code:**
   - Examine taxonomy.service.ts to locate the subcategory normalization logic
   - Identify why the HPM special case is handled differently

2. **Implement Backend Fix:**
   - Extend the HPM special case pattern to all valid subcategories
   - Add proper logging and validation
   - Ensure backward compatibility with existing assets

3. **Test Backend Fix:**
   - Test with various taxonomy combinations
   - Verify subcategories are preserved correctly
   - Ensure sequential numbering continues to work

## Next Steps (Immediate)

1. Begin implementing the frontend workaround (Phase 1)
2. Start with modifications to TaxonomySelection.tsx:
   - Add state for originalSubcategory
   - Update handlers to track both selected and original values
   - Modify data passed to parent component

3. Then update RegisterAssetPage.tsx:
   - Add logic to override display of backend-normalized subcategories
   - Implement visual indicator for adjusted values
   - Maintain backend compatibility

## Future Considerations

1. Consider adding a database migration plan if backend changes would impact existing assets
2. Explore improving the frontend preview to show actual sequential numbers instead of always .001
3. Update documentation when backend fix is implemented to reflect the new behavior