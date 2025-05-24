# Layer Selection Circular Reference Fix

## Issue Summary

When selecting the Star layer and then choosing Pop from the category grid, the application was experiencing React Error #301. Logs showed extremely high numbers of layer selection events occurring in rapid succession (over 940 individual events). This resulted in components attempting to update state after unmounting.

## Root Causes

1. **Circular Reference Pattern**: Components were re-triggering layer selection events in a feedback loop:
   - RegisterAssetPage dispatched a 'layerChanged' event 
   - SimpleTaxonomySelectionV2 listened for this event and called selectLayer() again
   - This created a circular pattern, causing many layer selections in quick succession

2. **Ineffective Throttling**: The existing throttling mechanism only prevented rapid selections of the *same* layer, but didn't prevent rapid selection of *different* layers.

3. **Duplicate Event Listeners**: Multiple event listeners were being registered for the 'layerChanged' event without proper cleanup, leading to multiple handlers executing for every event.

## Implemented Fixes

### 1. Break the Circular Reference Loop

Modified SimpleTaxonomySelectionV2.tsx to stop calling `selectLayer()` when it receives a 'layerChanged' event:

```typescript
// CRITICAL FIX: Don't call selectLayer again as it creates a circular update pattern
// The parent already called this, we just need to handle our local component state
// selectLayer(newLayer); // Removed to prevent circular layer selection
```

And also in the useEffect:

```typescript
// STEP 2: Don't update context here - this would cause a circular update
// The layer is already set in taxonomyContext by the parent component
// selectLayer(layer); // Removed to prevent circular updates
```

### 2. Enhanced Event Listener Management

Added a global registry to prevent duplicate event listeners:

```typescript
// CRITICAL FIX: We need to check for existing listeners to prevent duplicates
// Use a unique persistent ID for this component instance
const componentId = useRef(`tsx_${Math.random().toString(36).substring(2, 9)}`).current;

// Only add the event listener if we don't already have one for this component
if (!window.__layerChangeHandlers) {
  window.__layerChangeHandlers = {};
}

// Remove any existing handler for this component
if (window.__layerChangeHandlers[componentId]) {
  window.removeEventListener('layerChanged', window.__layerChangeHandlers[componentId]);
}

// Store the handler reference and add the listener
window.__layerChangeHandlers[componentId] = handleLayerChangeEvent as EventListener;
window.addEventListener(
  'layerChanged',
  window.__layerChangeHandlers[componentId]
);
```

With proper cleanup:

```typescript
// CRITICAL FIX: Also specifically remove our handler from the global registry
if (window.__layerChangeHandlers?.[componentId]) {
  window.removeEventListener('layerChanged', window.__layerChangeHandlers[componentId]);
  delete window.__layerChangeHandlers[componentId];
}
```

### 3. More Aggressive Throttling

Enhanced the throttling mechanism in RegisterAssetPage.tsx to be more aggressive:

1. Increased throttle time from 300ms to 500ms
2. Now throttles ALL layer selections, not just duplicate selections of the same layer
3. Added a global lock to prevent multiple layer selection operations:

```typescript
// Enhanced throttling - now check for ANY layer selection being too quick, not just duplicates
if (now - layerSelectionThrottleRef.current.lastTimestamp < throttleTime) {
  console.log(
    `[LAYER SELECT] Throttled - ignoring layer selection request as previous selection was only ${Date.now() - layerSelectionThrottleRef.current.lastTimestamp}ms ago`
  );
  return; // Ignore this selection completely
}

// Add a global lock to prevent ANY layer-related operations during this throttle period
const globalLockKey = '__layerSelectionLock';
if (window[globalLockKey]) {
  console.log(`[LAYER SELECT] Throttled - global lock is active`);
  return; // Another layer selection is in progress
}

// Set global lock
window[globalLockKey] = true;
```

### 4. TypeScript Global Declarations

Added proper TypeScript declarations to ensure the global properties are properly typed:

```typescript
// CRITICAL FIX: Add global type declarations for event handler tracking and throttling
interface Window {
  __layerChangeHandlers?: Record<string, EventListener>;
  __layerSelectionLock?: boolean;
}
```

## Expected Results

1. Layer selection events are properly throttled, preventing rapid multiple selections
2. Event listeners are properly managed without duplicates
3. No circular update pattern that triggers multiple layer selections
4. Layer switching works correctly without React Error #301
5. Better user experience as the system responds more predictably to user input

## Testing Notes

The fix should be tested by:
1. Clicking on different layer cards (especially Star)
2. Selecting categories (especially Pop in the Star layer)
3. Rapid clicking multiple times to attempt to trigger throttling
4. Checking browser console logs for any warning messages or errors