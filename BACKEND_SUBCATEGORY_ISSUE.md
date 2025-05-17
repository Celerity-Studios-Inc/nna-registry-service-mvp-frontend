# Backend Subcategory Normalization Issue Documentation

## Date: May 13, 2025

## Issue Summary

Despite frontend fixes, the backend is still normalizing subcategories to "Base" (BAS) in most cases instead of preserving the originally selected subcategory. This document details our investigation and findings.

## Testing Methodology

We've conducted testing on the restored frontend (commit 461b17f) connected to the backend at registry.reviz.dev/api with the following approach:

1. Create assets with different taxonomy combinations
2. Monitor what the frontend sends vs. what the backend returns
3. Verify subcategory preservation and sequential numbering
4. Test multiple scenarios with the same and different subcategories

## Observed Behavior

### Test Case 1: Stars/Pop/Legend Female (S.POP.LGF)

**Frontend sends:**
- Layer: S (Stars)
- Category: POP (Pop)
- Subcategory: LGF (Legend Female)
- HFN preview: S.POP.LGF.001
- MFA preview: 2.001.004.001

**Backend returns:**
- Layer: S (Stars)
- Category: Pop (Pop)
- Subcategory: Base (BAS)
- HFN: S.POP.BAS.013
- MFA: S.001.001.013

**Relevant log entries:**
```javascript
assetService.ts:738 Asset data provided: {name: 'S5.Haley', layer: 'S', category: 'POP', subcategory: 'LGF', description: '400 x 400 Headshot', …}
assetService.ts:885 Asset created successfully: {layer: 'S', category: 'Pop', subcategory: 'Base', name: 'S.POP.BAS.013', nna_address: 'S.001.001.013', …}
```

### Additional Tests

We've conducted additional tests to verify backend behavior:

#### Test Case 2: Sequential Numbering with Same Taxonomy
**Testing methodology**: Create another asset with the same Layer/Category/Subcategory selection

**Frontend sends:**
- Layer: S (Stars)
- Category: POP (Pop)
- Subcategory: LGF (Legend Female)
- HFN preview: S.POP.LGF.001
- MFA preview: 2.001.004.001

**Backend returns:**
- HFN: S.POP.BAS.014
- MFA: S.001.001.014

**Observations:**
- Sequential number incremented from .013 to .014
- Subcategory still normalized to BAS
- This confirms sequential numbers are properly incremented for assets with the same taxonomy

#### Test Case 3: Different Subcategory
**Testing methodology**: Create an asset with a previously unused subcategory

**Frontend sends:**
- Layer: S (Stars)
- Category: POP (Pop)
- Subcategory: JZZ (Jazz)
- HFN preview: S.POP.JZZ.001
- MFA preview: 2.001.008.001

**Backend returns:**
- HFN: S.POP.BAS.015
- MFA: S.001.001.015

**Observations:**
- Another subcategory (JZZ) also normalized to BAS
- Sequential number continued to increment
- This confirms the normalization issue affects multiple subcategories

#### Test Case 4: HPM Subcategory Handling
**Testing methodology**: Create an asset with HPM subcategory

**Frontend sends:**
- Layer: S (Stars)
- Category: POP (Pop)
- Subcategory: HPM (Hip-hop Male)
- HFN preview: S.POP.HPM.001
- MFA preview: 2.001.002.001

**Backend returns:**
- HFN: S.POP.HPM.003
- MFA: S.001.002.003

**Observations:**
- HPM subcategory is preserved correctly (not normalized to BAS)
- Sequential numbering for this taxonomy path is at .003
- This confirms our hypothesis that the HPM subcategory has special handling

## Analysis

1. **Subcategory Normalization**
   - The frontend correctly sends the selected subcategory (e.g., LGF, JZZ) 
   - The backend normalizes most subcategories to "Base" (BAS) in its response
   - This occurs in the taxonomy processing logic in the backend
   - **Confirmed Exception**: HPM subcategory is preserved correctly, showing S.POP.HPM instead of S.POP.BAS

2. **Sequential Numbering**
   - Sequential numbers are incremented correctly for each taxonomy path:
     - S.POP.BAS is now at .015 (incrementing with each new asset)
     - S.POP.HPM is at .003
   - Sequential numbering is based on a counter for each unique taxonomy path (Layer.Category.Subcategory)
   - When subcategories are normalized to BAS, they share the same counter
   - **Frontend Limitation**: The frontend preview always shows ".001" as the sequential number regardless of the actual counter value

3. **Taxonomy Code Patterns**
   - HFN (Human-Friendly Name): S.POP.BAS.015 pattern
   - MFA (Machine-Friendly Address): S.001.001.015 pattern
   - The second segment in MFA (001) corresponds to the category
   - The third segment in MFA (001/002) corresponds to the subcategory:
     - 001 for BAS (normalized subcategory)
     - 002 for HPM (preserved subcategory)
   - The fourth segment matches the sequential counter

## Diagnosis

The issue is in the backend's taxonomy validation and processing logic, likely in the taxonomy.service.ts file:

1. A validation or normalization function is converting most subcategories to "Base" (BAS)
2. The HPM subcategory has a special exception or hardcoded handling
3. The backend correctly maintains separate sequential counters for each unique taxonomy path
4. The backend uses numeric codes in MFA (S.001.001.015) that correspond to the alphanumeric codes in HFN (S.POP.BAS.015)

The root cause appears to be either:
- A deliberate decision to force most subcategories to "Base" with specific exceptions
- A bug in the taxonomy validation that incorrectly invalidates most subcategories except HPM
- Incomplete implementation of subcategory support in the backend

## Recommendations

### Backend Fix Requirements

The backend should be modified to:
1. Preserve all valid subcategories as selected by the user
2. Add validation for subcategory compatibility with selected layer/category
3. Maintain proper sequential numbering for each valid taxonomy path
4. Ensure proper mapping between alphanumeric codes (HFN) and numeric codes (MFA)
5. Verify compatibility with existing assets (migration plan if needed)

### Temporary Frontend Workarounds

If the backend cannot be fixed immediately, we can implement frontend workarounds:

1. **Override Display Option**
   - Store the originally selected subcategory in component state or context
   - After asset creation, override the displayed HFN/MFA with the original subcategory
   - Add a note indicating this is a display adjustment

2. **User Notification Option**
   - Display a warning when users select non-HPM subcategories
   - Explain that the backend will normalize to "Base" despite the selection
   - Clearly show both the selected value and the expected stored value

3. **Frontend Mapping**
   - Implement a mapping function to convert between BAS and the originally selected subcategory
   - Use this for display purposes while maintaining compatibility with the backend

## Implementation Plan

1. **Backend Fix (Preferred Solution)**
   - Locate the subcategory normalization code in the backend
   - Modify it to preserve all valid subcategories
   - Test with existing assets to ensure compatibility
   - Deploy the updated backend

2. **Frontend Workaround (If Backend Fix Delayed)**
   - Implement the "Override Display Option" in RegisterAssetPage.tsx
   - Add state tracking for the original subcategory selection
   - Update the success display to show the originally selected subcategory

## Next Steps

1. Share these detailed findings with the backend team
2. Determine timeline for implementing backend fix
3. Decide whether to implement frontend workaround in the interim
4. Create specific technical requirements for either approach

---

*This document will be updated with results from additional tests.*