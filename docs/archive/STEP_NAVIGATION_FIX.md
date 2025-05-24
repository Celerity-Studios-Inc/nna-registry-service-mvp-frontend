# Step Navigation and Grid Layout Fix

## Overview

This document details the fixes implemented to address two related issues in the asset registration workflow:

1. **Primary Issue**: Double-clicking a layer card in Step 1 was incorrectly skipping Step 2 (Choose Taxonomy) and taking the user directly to Step 3 (Upload Files).

2. **Secondary Issue**: Subcategory cards were displaying as a vertical column instead of a proper grid layout, making selection difficult.

These issues combined to create a problematic user experience where users could not properly select category and subcategory options, resulting in validation errors at the Review & Submit step.

## Root Causes

### Step Skipping Issue

The root cause of the step navigation issue was found in the double-click handlers in multiple components:

1. In `RegisterAssetPage.tsx`, the `onLayerDoubleClick` handler was calling `handleNext()` directly, which advanced the step counter by 1.

2. Additionally, in `handleLayerSelect`, there was a second code path that also called `handleNext()` when the `isDoubleClick` parameter was true.

3. These duplicate navigation calls caused Step 2 to be skipped entirely, preventing users from selecting category and subcategory.

### Grid Layout Issue

The grid layout issue was due to insufficient CSS grid properties:

1. While the `.taxonomy-items` class had `display: grid` and `grid-template-columns` defined, it was missing explicit `grid-auto-flow` and `grid-auto-rows` properties.

2. This caused the grid items to occasionally stack vertically, especially on certain screen sizes or when grid items had varying heights.

## Solution Implementation

### Step Navigation Fix

1. **In RegisterAssetPage.tsx**:
   - Modified `onLayerDoubleClick` handler to log the event but NOT call `handleNext()`
   - Removed the auto-navigation code in `handleLayerSelect` that was previously calling `handleNext()` on double-click
   - Added explicit warning logs to make it clear that auto-advancement is intentionally disabled

```typescript
// Before:
onLayerDoubleClick={(layer) => {
  console.log(`RegisterAssetPage received layer double-click: ${layer}`);
  // Advance to the next step automatically on double-click
  handleNext();
}}

// After:
onLayerDoubleClick={(layer) => {
  console.log(`RegisterAssetPage received layer double-click: ${layer}`);
  // DO NOT advance to the next step automatically anymore
  // This was causing Step 2 to be skipped
  // Instead, handle the selection and let the normal flow continue
  console.log(`Double-click handled without auto-advancing to preserve Step 2`);
}}
```

2. **In handleLayerSelect**:
   - Removed the code that was calling `handleNext()` on double-click
   - Added clear logging to explain the fix

```typescript
// Before:
if (isDoubleClick) {
  console.log('Double-click detected in handleLayerSelect, advancing to next step');
  // Use setTimeout to ensure the layer selection is processed first
  setTimeout(() => handleNext(), 50);
}

// After:
if (isDoubleClick) {
  console.log('Double-click detected in handleLayerSelect, but NOT advancing to next step anymore');
  console.log('This fixes the issue where Step 2 was being skipped, causing validation errors');
}
```

3. **In LayerSelectorV2.tsx**:
   - Added a delay before calling the `onLayerDoubleClick` callback to ensure state updates first
   - Enhanced event handling to prevent event bubbling issues

```typescript
// Added setTimeout to ensure proper timing:
setTimeout(() => {
  // Also call the optional onLayerDoubleClick callback if provided
  if (onLayerDoubleClick) {
    console.log(`Calling onLayerDoubleClick for ${layer}`);
    onLayerDoubleClick(layer);
  } else {
    console.log(`No onLayerDoubleClick provided for ${layer}`);
  }
}, 50);
```

### Grid Layout Fix

In `SimpleTaxonomySelection.css`, enhanced the grid layout properties:

```css
// Before:
.taxonomy-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  padding: 15px;
  max-height: 400px;
  overflow-y: auto;
  min-height: 100px;
  box-sizing: border-box;
  transition: opacity 0.2s ease;
  will-change: opacity, transform;
}

// After:
.taxonomy-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  grid-auto-flow: row; /* Force grid items to flow in rows */
  grid-auto-rows: auto; /* Let rows size automatically based on content */
  gap: 12px;
  padding: 15px;
  max-height: 400px;
  overflow-y: auto;
  min-height: 100px;
  box-sizing: border-box;
  transition: opacity 0.2s ease;
  will-change: opacity, transform;
  position: relative; /* For absolute positioning of the hint */
}
```

## Testing and Verification

The fixes were tested in the following scenarios:

1. **Normal Navigation**:
   - Verified that clicking "Next" after selecting a layer properly advances to Step 2
   - Confirmed that Step 2 (Choose Taxonomy) appears with categories displayed in a grid

2. **Double-Click Behavior**:
   - Tested double-clicking a layer card to ensure it does NOT skip Step 2
   - Verified that the layer is still properly selected on double-click

3. **Grid Layout**:
   - Confirmed that category and subcategory cards appear in a proper grid layout
   - Tested at various screen sizes to ensure responsive behavior
   - Verified that cards are arranged in rows rather than stacking vertically

## Conclusion

These fixes ensure that:

1. The asset registration workflow follows the proper sequence of steps without skipping any critical steps
2. The category and subcategory selection UI displays properly with cards in a grid layout
3. The user can complete the form with all required fields properly displayed and accessible

The issue was a result of well-intentioned code that tried to speed up the workflow but ended up creating confusion and validation errors. The fix reverts to a more standard, step-by-step approach that ensures all required data is collected before proceeding.