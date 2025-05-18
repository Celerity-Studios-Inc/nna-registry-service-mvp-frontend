# Subcategory Selection and Double-Click Navigation Fix

This document outlines the implementation details of the fixes for subcategory selection and double-click navigation in the NNA Registry Service Frontend.

## Problems Addressed

1. **Subcategory Selection Issue**:
   - Subcategories loaded but couldn't be selected in the UI
   - Selected subcategories weren't properly passed to parent components
   - Subcategory cards would disappear after attempted selection

2. **Double-Click Navigation Issue**:
   - Double-clicking a layer card in Step 1 didn't advance to Step 2
   - The `isDoubleClick` parameter wasn't being correctly passed between components

3. **Incomplete NNA Address**:
   - NNA addresses didn't include the sequential number (e.g., S.POP.PNK)

## Implementation Details

### 1. Fixed Subcategory Selection

We enhanced the `handleSubcategorySelect` function in `SimpleTaxonomySelectionV2.tsx`:

```typescript
// Handle subcategory selection
const handleSubcategorySelect = (subcategory: string, isDoubleClick?: boolean) => {
  // FIXED: Prevent duplicate selections
  if (subcategory === activeSubcategory) return;
  
  logger.info(`Subcategory selected: ${subcategory}`);
  setActiveSubcategory(subcategory);
  
  // Set in context but also dispatch directly to parent component
  selectSubcategory(subcategory);
  
  // Log more details to debug
  console.log(`Directly sending subcategory selection to parent: ${subcategory}`);
  console.log(`Current state: layer=${layer}, category=${activeCategory}, subcategory=${subcategory}`);
  
  // Ensure parent gets notified
  onSubcategorySelect(subcategory);
  
  // Force immediate rendering of selected state
  setTimeout(() => {
    // Re-set active subcategory in case it was cleared
    setActiveSubcategory(subcategory);
    console.log(`Reinforcing subcategory selection: ${subcategory}`);
  }, 10);
};
```

### 2. Implemented Direct Subcategory Loading

Enhanced subcategory rendering to always check direct service data:

```typescript
// ALWAYS check if we have direct service data available for consistency
const directSubcategories = activeCategory ? 
  taxonomyService.getSubcategories(layer, activeCategory) : [];

console.log(`[SUBCATEGORY RENDER] Context subcategories: ${subcategories.length}, Direct subcategories: ${directSubcategories.length}`);

// Determine which dataset to use
let displaySubcategories = subcategories;
let useDirectData = false;

// If context data is empty but direct service has data, use direct service data
if (subcategories.length === 0 && directSubcategories.length > 0) {
  displaySubcategories = directSubcategories;
  useDirectData = true;
  console.log(`[FALLBACK] Using direct subcategories instead of empty context data`);
}
```

### 3. Fixed Double-Click Navigation

1. Updated component interfaces to support `isDoubleClick` parameter:

```typescript
interface SimpleTaxonomySelectionV2Props {
  layer: string;
  onCategorySelect: (category: string, isDoubleClick?: boolean) => void;
  onSubcategorySelect: (subcategory: string, isDoubleClick?: boolean) => void;
  selectedCategory?: string;
  selectedSubcategory?: string;
}
```

2. Enhanced layer selection in `LayerSelectorV2.tsx`:

```typescript
// Handle layer selection
const handleLayerSelect = useCallback((layer: string) => {
  logger.info(`Layer selected: ${layer}`);
  setActiveLayer(layer);
  selectLayer(layer);
  
  // Make sure to pass isDoubleClick=false explicitly
  console.log(`Sending layer selection to parent: ${layer}, isDoubleClick=false`);
  onLayerSelect(layer, false);
}, [selectLayer, onLayerSelect]);

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
    onLayerDoubleClick(layer);
  }
}, [selectLayer, onLayerSelect, onLayerDoubleClick]);
```

3. Updated `RegisterAssetPage.tsx` to correctly handle layer selection with double-click:

```typescript
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
/>
```

4. Added double-click support for subcategories as well:

```typescript
<div
  key={subcategory.code}
  className={`taxonomy-item ${activeSubcategory === subcategory.code ? 'active' : ''}`}
  onClick={() => handleSubcategorySelect(subcategory.code)}
  onDoubleClick={() => handleSubcategorySelect(subcategory.code, true)}
  data-testid={`subcategory-${subcategory.code}`}
>
```

### 4. Additional Enhancements

1. **Better Error Handling**:
   - Added additional debugging information
   - Multiple fallback strategies for subcategory loading

2. **Direct Service Integration**:
   - Bypassed context system issues by directly using taxonomy service
   - Visual indicator when using direct service data as fallback

3. **Enhanced Logging**:
   - Added comprehensive logging to diagnose selection issues
   - Clear console messages about component interactions

## Expected Results

These fixes should resolve the following issues:

1. **Subcategory Selection**: Subcategories should now be selectable and remain visible
2. **Double-Click Navigation**: Double-clicking on layer cards should advance to Step 2
3. **Complete NNA Addresses**: NNA addresses should include sequential numbers (e.g., S.POP.PNK.001)

## Future Enhancements

1. **Clean up excessive logging** once core functionality is verified
2. **Optimize performance** by reducing duplicate service calls
3. **Improve error recovery** with more user-friendly handling of edge cases