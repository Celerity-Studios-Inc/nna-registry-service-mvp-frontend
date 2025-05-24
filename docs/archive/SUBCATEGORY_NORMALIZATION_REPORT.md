# Subcategory Normalization Issue Report

## Issue Summary

Despite the backend changes documented in the `/nna-registry-service/SUBCATEGORY_NORMALIZATION_FIX.md` file, our testing reveals that subcategories are still being normalized to "Base" (BAS) on the backend. The logs from our test of the deployed fix show:

```
assetService.ts:877 Asset created successfully: {layer: 'S', category: 'Pop', subcategory: 'Base', name: 'S.POP.BAS.026', nna_address: 'S.001.001.026', …}
```

When we submitted a request with `subcategory: 'HPM'`, the backend normalized it to `subcategory: 'Base'`.

## Expectations vs. Reality

**Expected**: When sending the S.POP.HPM combination to the backend, we expect to receive the same subcategory in the response.

**Reality**: The backend still normalizes subcategories to "Base", requiring the frontend to use display overrides:

```
RegisterAssetPage.tsx:1426 DISPLAY OVERRIDE: Replacing backend HFN S.POP.BAS.026 with original subcategory version S.POP.HPM.026
```

## Root Cause Analysis

Based on our findings and the existing documentation:

1. **Backend Fix Implementation**: The backend fix has been deployed as documented in `SUBCATEGORY_NORMALIZATION_FIX.md`, but it may not be working as expected.

2. **Possible Issues**:
   - The fix might not have been correctly implemented or deployed to the production environment
   - There might be edge cases or specific paths in the backend code that are not covered by the fix
   - There could be multiple normalization points in the backend, and only one was fixed

3. **Critical Finding**: Even though the `stable-backend-new-key` branch contains the fix, the deployed backend at `https://registry.reviz.dev/api` still exhibits the subcategory normalization behavior.

## Frontend Status

Our frontend currently has workarounds in place to handle this issue:

1. **Display Override**: The frontend stores the original subcategory selection and overrides the display of the backend-returned HFN:
   ```javascript
   // In RegisterAssetPage.tsx:
   DISPLAY OVERRIDE: Replacing backend HFN S.POP.BAS.026 with original subcategory version S.POP.HPM.026
   ```

2. **Code Modifications**: We have removed special case handling for S.POP.HPM in `assetService.ts`, `codeMapping.ts`, and `taxonomyService.ts`, making the code more generic and maintainable.

## Recommendations for Backend

1. **Verify Deployment**: 
   - Check if the fixed version is actually deployed to the production endpoint
   - Ensure that the `stable-backend-new-key` branch was correctly merged and deployed

2. **Add Comprehensive Logging**:
   - Add detailed logging in the backend code to track the subcategory handling flow
   - Focus on the `getNnaCodes()` function and any other normalization points

3. **Expand Test Coverage**:
   - Test with various layer/category/subcategory combinations
   - Test with both alphabetic and numeric codes

4. **Fix Implementation**:
   - Review and compare the implementation with the plan in `BACKEND_FIX_PLAN.md`
   - Ensure that the mapping tables for all subcategories are complete and accurate

## Recommendations for Frontend Enhancement

While waiting for the backend fix to be properly implemented, we can enhance the frontend to be more robust:

1. **Formalize Display Override Mechanism**:
   - Create a dedicated utility function for subcategory display overrides
   - Apply the override consistently across all UI components

2. **Improve User Feedback**:
   - Add a subtle indicator when subcategories are being display-overridden
   - Provide clearer information about which subcategories may be normalized

3. **Robust Error Handling**:
   - Add more comprehensive error handling for subcategory normalization edge cases
   - Implement fallback strategies for unexpected backend responses

4. **Enhance Testing**:
   - Create automated tests that verify the display override behavior
   - Add test cases for all known subcategory combinations

## Next Steps

1. **Short-term (Frontend)**:
   - Implement the frontend enhancement recommendations
   - Fix the build and deployment issues with GitHub Actions

2. **Medium-term (Backend)**:
   - Coordinate with the backend team to investigate why the fix isn't working
   - Provide detailed information on the observed behavior and logs

3. **Long-term (Full Solution)**:
   - Implement a comprehensive backend fix that addresses all normalization points
   - Remove the frontend display override once the backend fix is confirmed working

## Testing Verification

To verify any changes, we should:

1. Test asset registration with a variety of subcategories
2. Verify that both UI display and API calls are consistent
3. Check sequential numbering behavior for various subcategory combinations
4. Test both alphabetic and numeric code formats

This approach ensures a comprehensive solution that provides a good user experience regardless of backend behavior.