# Taxonomy Compatibility Fix Summary

## Previous Issue (Resolved)

The NNA Registry Service was experiencing validation errors during asset creation with specific taxonomy combinations, most notably S.POP.HPM (Stars layer, Pop category, Hipster Male subcategory).

### Initial Issues (Resolved)
1. Backend returning 400 Bad Request with "Invalid category: 001 for layer: S"
2. Backend returning 400 Bad Request with "Invalid subcategory: HPM for layer: S, category: POP"
3. Inconsistent MFA (Machine-Friendly Address) display between different steps in workflow

## Current Issue (May 2025)

After restoring the frontend to a stable state and connecting to the production backend, we've discovered a new issue with subcategory normalization:

### Current Issues
1. Most subcategories are normalized to "BAS" (Base) by the backend
2. Only S.POP.HPM is preserved correctly in the backend response
3. Sequential numbering works correctly for each unique taxonomy path
4. The frontend always displays .001 in the preview, regardless of actual sequential number

## Previous Root Cause (Resolved)

The initial issue was caused by a fundamental mismatch in taxonomy data formats:

1. **Backend Validation** expected **names** (e.g., "Pop", "Pop_Hipster_Male_Stars"), not codes
2. **Frontend Submission** was sending **codes** (e.g., "POP", "HPM")

## Previous Solution (Implemented)

We implemented a solution with three key components:

1. **TaxonomyConverter Utility**: Centralized all taxonomy code/name conversions
2. **AssetService Update**: Modified asset registration to send the correct data format
3. **RegisterAssetPage Update**: Integrated the converter for consistent code handling

This solution resolved the initial validation errors and allowed asset creation to work properly.

## Current Issue Analysis

Our recent testing with the restored frontend (commit 461b17f) connected to the production backend (registry.reviz.dev/api) has revealed a new issue:

1. **Test Results (May 2025):**
   - Test Case 1: Creating an asset with S.POP.LGF results in S.POP.BAS.015
   - Test Case 2: Creating another asset with S.POP.LGF results in S.POP.BAS.016 (sequential number increments)
   - Test Case 3: Creating an asset with S.POP.JZZ results in S.POP.BAS.017 (different subcategory also normalizes to BAS)
   - Test Case 4: Creating an asset with S.POP.HPM results in S.POP.HPM.003 (HPM is preserved correctly)

2. **Root Cause:**
   - The frontend correctly sends the selected subcategory to the backend
   - The backend appears to have a special case for HPM that preserves it correctly
   - All other subcategories are being normalized to "BAS" in the backend
   - This normalization happens in the backend's taxonomy processing logic

## Detailed Documentation

We've created three detailed documents to address this issue:

1. [**BACKEND_SUBCATEGORY_ISSUE.md**](./BACKEND_SUBCATEGORY_ISSUE.md) - Comprehensive analysis with test results
2. [**BACKEND_FIX_PLAN.md**](./BACKEND_FIX_PLAN.md) - Technical plan for implementing a backend fix
3. [**SUBCATEGORY_COMPATIBILITY_FIX.md**](./SUBCATEGORY_COMPATIBILITY_FIX.md) - Frontend workaround implementation details

## Proposed Solutions

### Option 1: Backend Fix (Preferred)
- Modify the backend to preserve all valid subcategories, not just HPM
- Extend the special case handling that works for HPM to all subcategories
- Maintain proper sequential numbering for each taxonomy path
- Estimated implementation time: 4-8 hours

### Option 2: Frontend Workaround (Temporary)
- Store the originally selected subcategory in component state
- Override the displayed HFN in the success screen with the original subcategory
- Add a subtle indicator when the display has been adjusted
- Maintain compatibility with the backend (no changes to API calls)
- Estimated implementation time: 2-4 hours

## Implementation Recommendations

1. **Short-term**: Implement the frontend workaround (Option 2) for immediate improvement
2. **Long-term**: Fix the backend (Option 1) for a proper solution
3. **Both in parallel**: Implement the workaround while working on the backend fix

## Next Steps

1. Share these findings with the backend team
2. Determine implementation timeline for the backend fix
3. Decide whether to implement the frontend workaround in the interim
4. Schedule follow-up testing to verify any implemented solutions

## Impact Assessment

1. **User Experience**: Moderate impact - users see incorrect subcategories in asset details
2. **Data Integrity**: Low impact - sequential numbering works correctly despite normalization
3. **Search/Filtering**: Moderate impact - subcategory filtering may be less effective
4. **Overall**: Medium priority issue with available workarounds