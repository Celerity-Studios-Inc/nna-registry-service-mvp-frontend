# Sequential Number Fix for NNA Registry Service

## Overview
This fix addresses the user experience issue with sequential numbering in the NNA Address preview by replacing actual sequential numbers with a `.000` placeholder. This helps set the correct expectation that the sequential number is determined by the backend after submission.

## Changes Made

1. **`NNAAddressPreview.tsx`**:
   - Replaced the actual sequential number with `.000` in the preview
   - Added an explanatory tooltip that informs users the sequential number will be assigned on submission

2. **`codeMapping.ts`**:
   - Updated `formatNNAAddress` to handle `000` as a special display value
   - Modified `convertHFNToMFA` to correctly process addresses with `.000` placeholders

3. **`TaxonomySelection.tsx`**:
   - Added clarifying comments about the dual nature of the preview vs. actual form data
   - Updated log messages to indicate that preview displays differ from form state values

## Why This Change Is Important

Previously, the asset registration form would display a sequential number (e.g., `.001`) in the preview step, but this created two issues:

1. Users would see `.001` during registration but could potentially get a different sequential number (e.g., `.005`) after submission, causing confusion
2. The preview implied certainty about the sequential number assignment when it's actually determined by the backend

By displaying `.000` as a placeholder, we correctly indicate that the actual sequential number will be determined when the asset is submitted.

## Testing The Change

To test this change:
1. Go to the asset registration flow
2. Select a layer, category, and subcategory
3. Verify that the NNA Address preview shows `.000` as the sequential number
4. Complete the asset registration
5. Verify that the actual assigned sequential number appears in the success screen

## Technical Implementation

The implementation maintains the correct behavior by:
- Only changing the display in the preview step
- Keeping the actual sequential number in the form state for backend API calls
- Adding explanatory text to inform users about how sequential numbers are assigned

This approach requires minimal changes to the existing code while significantly improving the user experience.