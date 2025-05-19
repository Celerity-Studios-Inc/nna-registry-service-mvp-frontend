# Layer Switching Fix Documentation

## Issue Summary

When switching between layers in Step 1 of the asset registration flow, the UI would continue to display category cards from the previously selected layer. This created confusion for users and caused functionality issues:

1. Users would see incorrect categories that didn't belong to the newly selected layer
2. The "Retry" button for subcategories wouldn't work because the layer+category combination was invalid
3. The UI would eventually update correctly if the user went back and reselected the layer multiple times

## Root Causes

Our investigation identified several underlying issues that contributed to this problem:

1. **Insufficient State Clearing**: When changing layers, the previous categories weren't being fully cleared from memory and UI state
2. **Race Conditions**: New category data sometimes loaded before old data was cleared, causing state conflicts
3. **Context Update Timing**: Components were relying on React Context updates which happened asynchronously
4. **Local Caching Issues**: Locally cached subcategories weren't being cleared when the layer changed
5. **Lack of Coordination**: Multiple components had their own state that wasn't being synchronized during layer changes

## Implementation Details

We implemented a comprehensive solution that addresses all of these issues:

### 1. Enhanced SimpleTaxonomySelectionV2 Component

The core display component was enhanced with better layer change handling:

```typescript
// When layer changes, immediately reset all category and subcategory state
useEffect(() => {
  // Immediately reset selection states
  setActiveCategory(null);
  setActiveSubcategory(null);
  
  // CRITICAL FIX: Also clear local subcategories backup immediately
  // This prevents the previous layer's subcategories from being shown while loading new ones
  setLocalSubcategories([]);
  subcategoriesRef.current = [];
  
  // Log the reset for debugging
  console.log(`[LAYER SWITCH] Reset all category/subcategory state for layer change to: ${layer}`);
}, [layer]);
```

We also added a multi-tiered retry approach to ensure categories load properly:

1. First attempt: Immediate direct service call 
2. Short retry (100ms): Second attempt if first fails
3. Medium retry (300ms): Third attempt with context reload
4. Safety check (500ms): Last resort with emergency data recovery

Additionally, we implemented:
- Custom events for cross-component communication
- Comprehensive error handling and recovery
- Enhanced logging for debugging and verification

### 2. TaxonomyContext and useTaxonomy Hook Improvements

We improved the central taxonomy state management with targeted enhancements:

1. Added a new `resetCategoryData()` method for fine-grained state clearing:

```typescript
// Additional method to reset just category data (useful when changing layers)
const resetCategoryData = useCallback(() => {
  console.log('[CONTEXT] Resetting category data');
  setCategories([]);
  setSelectedCategory(null);
  setCategoryError(null);
  setIsLoadingCategories(false);
  
  // Also reset subcategory data as it depends on category
  setSubcategories([]);
  setSelectedSubcategory(null);
  setSubcategoryError(null);
  setIsLoadingSubcategories(false);
  setHfn('');
  setMfa('');
  
  console.log('[CONTEXT] Category data reset complete');
}, []);
```

2. Enhanced the `selectLayer()` method to aggressively clear related state:

```typescript
// Select a layer - ENHANCED for better layer switching
const selectLayer = useCallback((layer: string) => {
  console.log(`[CONTEXT] Selecting layer: ${layer}`);
  
  // CRITICAL FIX: If we're changing from one layer to another, first clear all existing data
  if (selectedLayer !== layer) {
    console.log(`[CONTEXT] Layer change detected from ${selectedLayer || 'null'} to ${layer}`);
    
    // First explicitly clear categories and subcategories to prevent stale data
    setCategories([]);
    setSubcategories([]);
    
    // Reset all related state
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setCategoryError(null);
    setSubcategoryError(null);
    setHfn('');
    setMfa('');
  }
  
  // Now set the new layer
  setSelectedLayer(layer);
  
  // ... feedback code ...
  
  console.log(`[CONTEXT] Layer selection complete: ${layer}`);
}, [selectedLayer, showFeedback, showSuccessFeedback]);
```

### 3. Improved RegisterAssetPage Layer Selection Handler

The main page component was updated with more thorough state management:

```typescript
// Handle layer selection - CRITICAL FIX for layer switching issue
const handleLayerSelect = (layer: LayerOption, isDoubleClick?: boolean) => {
  console.log(`[LAYER SELECT] Called with layer=${layer.code}, isDoubleClick=${isDoubleClick}`);
  
  // STEP 1: First update the form values with the new layer
  setValue('layer', layer.code, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  setValue('layerName', layer.name, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  
  // STEP 2: Update special layer type flags
  const isTraining = layer.code === 'T';
  setIsTrainingLayer(isTraining);
  
  const isComposite = layer.code === 'C';
  setIsCompositeLayer(isComposite);
  
  // STEP 3: CRITICAL FIX - Thoroughly reset all taxonomy-related form values 
  // ... form value reset code ...
  
  // STEP 4: Clear any stored subcategory data in session storage
  // ... session storage cleanup code ...
  
  // STEP 5: Also make sure taxonomy context is updated
  taxonomyContext.selectLayer(layer.code);
  taxonomyContext.reset(); // This ensures all context state is properly reset
  
  // STEP 6: Emit an event to notify components of the layer change
  // ... event emission code ...
  
  // Handle double-click behavior
  // ... double-click handling code ...
};
```

We also added comprehensive session storage cleanup and diagnostic tools:

1. Session storage cleanup to remove stale data
2. Global diagnostic function exposed as `window.reportTaxonomyState()`
3. Layer switch tracking for debugging

## Testing and Verification

The fix was thoroughly tested to ensure it resolves all aspects of the issue:

1. **Manual Testing**: Verified that switching between all layer combinations correctly shows the appropriate categories
2. **Debugging Tools**: Implemented enhanced logging and diagnostic functions
3. **State Validation**: Added verification checks at different time intervals (100ms, 300ms, 500ms)
4. **Custom Event System**: Created a custom event system to verify that all components respond to layer changes

## Lessons Learned

This issue highlighted several important lessons for future development:

1. **State Synchronization**: When multiple components share state, explicit coordination is crucial
2. **Aggressive Cleanup**: When changing fundamental state (like layer), aggressive cleanup of dependent state is necessary
3. **Tiered Recovery**: Implementing multiple recovery mechanisms makes the system more resilient
4. **Diagnostic Tooling**: Having robust debugging tools is essential for troubleshooting complex state issues
5. **Context Limitations**: React Context updates are asynchronous and require special handling for time-sensitive operations

## Future Considerations

While this fix addresses the immediate issue, there are opportunities for further improvements:

1. **State Management Library**: Consider using a more robust state management library like Redux for complex state
2. **Testing Improvements**: Add automated tests specifically for layer switching scenarios
3. **Performance Optimization**: Current fix adds some additional overhead that could be optimized
4. **Refactoring**: The TaxonomyContext and related components could benefit from refactoring for better separation of concerns

## Conclusion

The layer switching fix implements a comprehensive solution to a complex state management issue. By addressing each root cause with targeted improvements, we've created a more robust and reliable user experience during the asset registration process.