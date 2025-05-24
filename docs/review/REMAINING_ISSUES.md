# Remaining Issues and Fixes for NNA Registry Frontend

## Overview

After implementing our enhanced error handling improvements in `AssetRegistrationWrapper.tsx`, we've identified several remaining issues that need to be addressed. This document outlines these issues and proposes solutions.

## Issues Identified

### 1. Categories Not Loading in UI

**Symptoms:**
- Console shows "Found 16 categories for S layer" but UI displays "No categories found for layer S"
- The Retry button doesn't resolve the issue

**Root Causes:**
- Disconnection between the `taxonomyService.getCategories()` function and the component display logic
- The SimpleTaxonomySelectionV2 component is initialized with useTaxonomy but doesn't properly pass the layer selection

### 2. Missing Layer Icons

**Symptoms:**
- Layer cards in the layer selection step lack proper icons
- Basic color circles are displayed instead of meaningful icons

**Root Cause:**
- Icon assets may be missing or the paths may be incorrect in the build

### 3. Double-Click Functionality Not Working

**Symptoms:**
- Double-clicking on layer cards doesn't advance to the next step

**Root Cause:**
- The event handling for double-click in the LayerSelectorV2 component may not be properly implemented or bound

### 4. Debug UI Elements (Green Checkboxes)

**Symptoms:**
- Green boxes with checkmarks and crosses are visible on the right side of the UI

**Root Cause:**
- These appear to be testing/QA elements that were accidentally left visible in the production build

### 5. Retry Button Not Working for Categories

**Symptoms:**
- When "No categories found" is displayed, clicking Retry doesn't resolve the issue

**Root Cause:**
- The reloadCategories function in the useTaxonomy hook may not be correctly handling the layer parameter or error recovery

## Detailed Analysis

### Category Loading Problem

The key issue appears to be in how the layer selection is passed between components. In RegisterAssetPage.tsx, it does this:

```jsx
<SimpleTaxonomySelection
  layer={watchLayer}
  selectedCategory={watchCategoryCode}
  selectedSubcategory={watchSubcategoryCode}
  onCategorySelect={(categoryCode) => {
    // ...
  }}
  onSubcategorySelect={(subcategoryCode) => {
    // ...
  }}
/>
```

But when we look at SimpleTaxonomySelectionV2.tsx:

```jsx
const {
  categories,
  isLoadingCategories,
  categoryError,
  selectCategory,
  reloadCategories,
  // ...
} = useTaxonomy();
```

It uses useTaxonomy() with no parameters, so it doesn't know which layer to use. The layer prop is never passed to the useTaxonomy hook.

### Debug UI Elements

The green checkboxes appear to be a testing/verification framework that should be disabled in production builds. This likely resides in the main application container or a debug component that's left enabled.

## Recommended Fixes

### 1. Fix Category Loading in SimpleTaxonomySelectionV2

```jsx
// Update the useTaxonomy hook call to:
const {
  categories,
  isLoadingCategories,
  categoryError,
  selectCategory,
  reloadCategories,
  // ...
} = useTaxonomy();

// Add a useEffect to select the layer when it changes:
useEffect(() => {
  if (layer) {
    selectLayer(layer);
  }
}, [layer, selectLayer]);
```

### 2. Fix Layer Icons

Check for icon assets in the build and ensure they're properly included in the bundle. We should verify the LayerSelectorV2 component is correctly referencing the icon paths.

### 3. Fix Double-Click Functionality

Review the event handling in LayerSelectorV2:

```jsx
// Make sure double-click event is properly bound:
const handleDoubleClick = (layerCode) => {
  handleLayerSelect(layerCode, true);
};
```

### 4. Hide Debug UI Elements

Find and disable the debug UI component that's showing the green checkboxes. This might be in a test framework or debug overlay component.

### 5. Fix Retry Button Functionality

Update the retry handler in SimpleTaxonomySelectionV2:

```jsx
// Update the retry button onClick handler:
<button onClick={() => reloadCategories()} className="retry-button">
  Retry
</button>
```

Also ensure the reloadCategories function in useTaxonomy properly handles the current layer.

## Implementation Plan

1. Start by fixing the category loading issue in SimpleTaxonomySelectionV2
2. Address the retry functionality to ensure it correctly reloads categories
3. Fix the layer icon display in LayerSelectorV2
4. Disable or hide the debug UI elements
5. Fix the double-click functionality in LayerSelectorV2

Each fix should be implemented and tested independently to ensure it resolves the specific issue without introducing new problems.