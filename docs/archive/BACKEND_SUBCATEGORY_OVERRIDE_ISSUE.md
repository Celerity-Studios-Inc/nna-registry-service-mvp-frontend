# Backend Subcategory Override Issue

## Problem Description

During testing of the asset registration workflow, we discovered that the backend consistently overrides the selected subcategory with "Base" (BAS) regardless of which subcategory is selected by the user.

## Observed Behavior

1. User selects a subcategory (e.g., "Experimental" (EXP) for the Stars layer)
2. Frontend correctly processes this selection and sends it to the backend:
   ```
   Asset data provided: {name: 'BW.S1.L2', layer: 'S', category: 'DNC', subcategory: 'EXP', ...}
   ```
3. Backend returns a response with the subcategory changed to "Base":
   ```
   Asset created successfully: {layer: 'S', category: 'Dance_Electronic', subcategory: 'Base', name: 'S.DNC.BAS.004', ...}
   ```
4. The frontend displays this discrepancy to the user and maintains the correct HFN/MFA based on the user's original selection:
   ```
   Note: You selected subcategory EXP but the backend stored it as Base.
   The system is displaying the correct HFN (S.DNC.EXP.004) and MFA (2.005.011.004) based on your selection.
   ```

## Frontend Handling

To ensure a good user experience despite this backend issue, the frontend:

1. Uses the SubcategoryDiscrepancyAlert component to inform users about the discrepancy
2. Maintains the correct HFN and MFA based on the user's original selection 
3. Preserves the user's selection in session storage for future reference
4. Ensures all displays and exports use the correct subcategory as selected by the user

## Technical Investigation

### Backend Code Analysis

After thorough investigation, we've identified specific components in the backend code that cause this issue:

1. **Incomplete Mapping Tables**:
   - The `subcategoryCodeMap` in `taxonomy.service.ts` only contains explicit mappings for special cases like HPM (Hipster Male)
   - Other subcategories don't have entries and fall back to a default value
   - Example of existing mapping:
   ```typescript
   private subcategoryCodeMap: Record<string, Record<string, Record<string, string>>> = {
     'S': {
       'POP': {
         '007': 'HPM', // Numeric to alphabetic
         'HPM': '007', // Alphabetic to numeric
         // ... other preserved mappings
       }
     }
   };
   ```

2. **Default Normalization**:
   - In `getHumanFriendlyCodes()`, when a subcategory is not found in the mappings, it defaults to 'Base'
   - This explains why most subcategories are normalized despite being valid selections

3. **Validation vs. Normalization**:
   - The `validateTaxonomy()` method appears to accept the subcategory values
   - But subsequent processing in `getNnaCodes()` and `getHumanFriendlyCodes()` normalizes most to 'Base'

4. **Special Case Exception**:
   - The S.POP.HPM combination is explicitly mapped and works correctly
   - This confirms that the system can properly handle subcategories when mapped

## Impact

This issue affects:

1. Data consistency between frontend and backend
2. User trust in the system when they see discrepancies
3. Potential confusion for users who see different values than what they selected
4. Inability to use subcategories other than "Base" in backend data storage

## Recommendations

### Backend Fix (Preferred Solution)

1. **Complete the Mapping Tables**:
   - Extend `subcategoryCodeMap` to include all valid subcategories
   - Ensure bidirectional mapping for both alphabetic and numeric codes
   - Example implementation:
   ```typescript
   private subcategoryCodeMap: Record<string, Record<string, Record<string, string>>> = {
     'S': {
       'POP': {
         '007': 'HPM', // Numeric to alphabetic
         'HPM': '007', // Alphabetic to numeric
         '002': 'LGF',
         'LGF': '002',
         // ... additional mappings for all valid subcategories
       },
       'DNC': {
         '011': 'EXP',
         'EXP': '011',
         // ... additional mappings
       }
       // ... other categories
     },
     // ... other layers
   };
   ```

2. **Fix Normalization Logic**:
   - Modify `getHumanFriendlyCodes()` to preserve valid subcategory selections
   - Add proper logging to trace code path for subcategory processing
   - Ensure validation and normalization logic are aligned

3. **Add Warning System**:
   - For invalid combinations, return clear error messages
   - For valid combinations, preserve the selection exactly as submitted
   - Add specific error codes for better frontend handling

### Enhanced Frontend Workarounds

1. **Display Override**:
   - Further enhance the SubcategoryDiscrepancyAlert with more details
   - Add visual indicator when frontend is correcting backend response
   - Consider overlaying or replacing the displayed HFN/MFA when viewing assets

2. **Special Case Documentation**:
   - Document which subcategories are preserved vs. normalized
   - Add UI hints when users select subcategories known to be normalized
   - Create a reference guide for users and developers

3. **Subcategory Preservation System**:
   - Enhance the session storage mechanism to store complete taxonomy selections
   - Implement a robust recovery system for when users return to partially completed forms
   - Add validation to ensure consistent display across all steps of the workflow

## Status

- Current status: Active issue, backend code pathway identified
- Frontend workaround: Implemented and enhanced with SubcategoryDiscrepancyAlert
- Backend fix: Not yet implemented, specific code recommendations provided
- Documentation: Complete technical analysis available for backend team

## Implementation Plan

1. **Coordinate with Backend Team**:
   - Share this detailed documentation with backend developers
   - Provide specific code paths and suggested changes
   - Prioritize fixing the mapping tables and normalization logic

2. **Enhance Frontend Workaround**:
   - Improve the existing SubcategoryDiscrepancyAlert component
   - Add more robust session storage handling
   - Consider implementing a "view as intended" toggle for asset display

3. **Testing Plan**:
   - Create comprehensive test cases covering all layers and subcategories
   - Document which combinations preserve subcategories vs. normalize to Base
   - Develop automated tests to verify behavior with backend changes

4. **Documentation Updates**:
   - Update user documentation to explain the current behavior
   - Provide guidance on subcategory selection best practices
   - Document workarounds for power users

## Related Logs

```
RegisterAssetPage.tsx:415 Form data for asset creation: {layer: 'S', categoryCode: 'DNC', subcategoryCode: 'EXP', hfn: 'S.DNC.EXP.000', mfa: '2.004.011.000', …}
assetService.ts:919 Creating asset...
assetService.ts:920 Asset data provided: {name: 'BW.S1.L2', layer: 'S', category: 'DNC', subcategory: 'EXP', description: '', …}
assetService.ts:1079 Asset created successfully: {layer: 'S', category: 'Dance_Electronic', subcategory: 'Base', name: 'S.DNC.BAS.004', nna_address: 'S.005.001.004', …}
```