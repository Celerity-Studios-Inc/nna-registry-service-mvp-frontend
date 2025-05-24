# Double-Click Navigation Fix Implementation

## Problem Description
Double-clicking a layer card in Step 1 of the asset registration process was not correctly advancing to Step 2 as expected. This issue was identified as a priority item for fixing after the subcategory selection implementation was completed.

## Root Cause Analysis
The issue was analyzed and the following root causes were identified:

1. **Event Propagation Issue**: The double-click event in the `LayerSelectorV2` component did not properly handle event propagation, potentially causing the click event to fire immediately after the double-click.

2. **Callback Handling**: While there was a mechanism to pass an `isDoubleClick` flag to the parent component, there was also a separate `onLayerDoubleClick` callback that wasn't being properly utilized in the `RegisterAssetPage`.

3. **Timing Issue**: The double-click event handling and the navigation to the next step weren't properly synchronized, causing potential race conditions.

## Solution Implemented

### 1. LayerSelectorV2.tsx Fixes
- Enhanced the `handleLayerDoubleClick` function with improved logging
- Added proper event handling with `e.preventDefault()` and `e.stopPropagation()` to prevent event bubbling
- Added additional logging to help diagnose if onLayerDoubleClick is provided or not

```tsx
// Handle layer double-click
const handleLayerDoubleClick = useCallback((layer: string) => {
  logger.info(`Layer double-clicked: ${layer}`);
  setActiveLayer(layer);
  selectLayer(layer);
  
  // First call the parent with isDoubleClick=true
  console.log(`Sending layer double-click to parent: ${layer}, isDoubleClick=true`);
  onLayerSelect(layer, true);

  // Also call the optional onLayerDoubleClick callback if provided
  if (onLayerDoubleClick) {
    console.log(`Calling onLayerDoubleClick for ${layer}`);
    onLayerDoubleClick(layer);
  } else {
    console.log(`No onLayerDoubleClick provided for ${layer}`);
  }
}, [selectLayer, onLayerSelect, onLayerDoubleClick]);
```

```tsx
// In the JSX component render
onDoubleClick={(e) => {
  // Prevent event bubbling to avoid triggering click right after double-click
  e.preventDefault();
  e.stopPropagation();
  handleLayerDoubleClick(layer);
}}
```

### 2. RegisterAssetPage.tsx Fixes
- Added the missing `onLayerDoubleClick` prop to the `LayerSelector` component
- Implemented a direct call to `handleNext()` in the `onLayerDoubleClick` handler
- Enhanced the existing `handleLayerSelect` function to better handle the double-click case with improved logging
- Added a setTimeout to ensure the layer selection is processed before navigation

```tsx
<LayerSelector
  selectedLayer={watchLayer}
  onLayerSelect={(layer, isDoubleClick) => {
    console.log(`RegisterAssetPage received layer select: ${layer}, isDoubleClick=${isDoubleClick}`);
    // Get the layer name based on the code
    const layerNames: Record<string, string> = {
      'G': 'Songs', 'S': 'Stars', 'L': 'Looks', 'M': 'Moves', 'W': 'Worlds',
      'B': 'Branded Assets', 'P': 'Patterns', 'T': 'Training Data', 'C': 'Composites', 'R': 'Rights'
    };
    const name = layerNames[layer] || '';
    
    // Call the handler with proper LayerOption object and isDoubleClick flag
    handleLayerSelect({ code: layer, name, id: layer }, isDoubleClick);
  }}
  onLayerDoubleClick={(layer) => {
    console.log(`RegisterAssetPage received layer double-click: ${layer}`);
    // Advance to the next step automatically on double-click
    handleNext();
  }}
/>
```

## Verification Steps
To verify this fix, perform the following tests:

1. Go to the Register Asset page
2. Double-click on any layer card
3. Confirm that the application automatically advances to Step 2 (Choose Taxonomy)
4. Check the console logs to see proper event handling logs

## Future Considerations

1. **Consistent Double-Click Handling**: This same pattern could be applied to the category and subcategory selection components for a more consistent UX.

2. **Visual Feedback**: Consider adding a visual indication (like a ripple effect) when a user clicks or double-clicks items to provide better feedback.

3. **Accessibility**: Ensure keyboard navigation works properly alongside mouse interactions for better accessibility.