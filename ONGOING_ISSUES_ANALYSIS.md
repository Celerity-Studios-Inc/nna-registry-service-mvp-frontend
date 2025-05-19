# Ongoing Issues Analysis

After reviewing the test results from CI/CD #282 (Commit 143bd0a), the following issues have been identified:

## 1. HFN Format Discrepancy on Success Page

### Issue:
The success page is displaying the HFN in an incorrect format: `S.HIP_HOP.BASE.001` instead of the expected `S.HIP.BAS.001`.

### Root Cause:
The issue stems from how category and subcategory codes are handled during formatting:

1. When receiving data from the form, the category name `Hip_Hop` is passed directly to the formatter instead of its code `HIP`.
2. The formatter is correctly uppercasing these values (`HIP_HOP`), but it's not mapping them to their canonical codes.
3. The error message is telling: "Error converting HFN to MFA: Category not found: S.HIP_HOP".

The taxonomy mapping requires the official code (`HIP`), not the formatted display name (`HIP_HOP`).

## 2. Subcategory Grid Layout Issues

### Issue:
Subcategory cards are still displaying in a vertical column instead of a grid layout, despite our CSS changes.

### Root Cause:
While we added high-specificity CSS rules, they may be:
1. Being overridden by more specific rules elsewhere
2. Not properly applied to the DOM elements due to class name mismatches
3. Potentially affected by dynamic styles applied through JavaScript/React

Examining the screenshot shows the subcategory cards stack vertically in a single column despite our grid definitions.

## 3. Duplicate NNA Address Card in Review/Submit

### Issue:
The review/submit page (Step 4) shows two identical NNA address cards.

### Root Cause:
The `ReviewSubmit.tsx` component likely has a redundant rendering of the NNA address section, possibly from previous refactoring.

## 4. Inconsistent Sequential Number Display

### Issue:
The sequential number `.000` is displayed inconsistently across different screens.

### Root Cause:
Different components handle the sequential number display differently:
1. Some show it as `.000` (placeholder)
2. Others may hide it entirely
3. The success page shows the actual sequential number from the backend

## 5. Next Button State Management

### Issue:
The Next button doesn't properly update its state (active/inactive) throughout the workflow.

### Root Cause:
The button state management likely needs to be tied to form validation state more effectively.

## 6. Slow File Upload UI Rendering

### Issue:
After file upload completes, there's a noticeable delay in UI rendering/updating.

### Root Cause:
This is likely due to inefficient rendering or excessive re-renders triggered by state updates. The component may not be optimized for performance when handling uploaded files.

## Implementation Plan

### Priority 1: Fix HFN Format on Success Page
- Modify the `taxonomyFormatter` to properly map display names to their canonical codes
- Ensure the RegisterAssetPage passes the correct category and subcategory codes (not names) to the formatter
- Add specific handling for Hip_Hop to HIP mapping

### Priority 2: Fix Subcategory Grid Layout
- Implement a completely different approach to the CSS for subcategory cards
- Use inline styles or a different class naming strategy to avoid specificity conflicts
- Consider using Material UI's Grid component instead of CSS grid if appropriate

### Priority 3: Address Duplicate NNA Card
- Identify and remove the duplicate rendering of the NNA address card in ReviewSubmit.tsx

### Priority 4: Standardize Sequential Number Display
- Implement consistent formatting of sequential numbers across all screens
- Decide whether to show `.000` as a placeholder or hide it until an actual number is assigned

These changes will be implemented sequentially to ensure each fix is properly validated.