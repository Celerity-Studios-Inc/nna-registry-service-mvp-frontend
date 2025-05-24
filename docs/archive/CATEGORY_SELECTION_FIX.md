# Category Selection Fix for Taxonomy Error

## Issue Summary

After selecting the Star (S) Layer and then clicking on POP category, a "Taxonomy Error Detected" screen appeared. This happened despite fixing the previous React Error #301 issue.

## Root Causes

After analyzing the code, several issues were found:

1. **Double Category Selection**: In `handleCategorySelect`, we were calling `selectCategory(category)` twice - once directly and once after trying to load subcategories, causing state consistency issues.

2. **Missing Error Handling**: The category selection handler wasn't wrapped in a try/catch block, allowing errors to crash the component.

3. **No Throttling for Categories**: While we implemented throttling for layer selection, we didn't have similar protection for category selection, allowing rapid clicks to cause race conditions.

4. **Incomplete Recovery Mechanism**: The taxonomy recovery process didn't properly clean up throttling locks or pre-load essential data.

5. **Special Case Handling**: The Star layer with POP category requires special handling that wasn't properly implemented in the recovery process.

## Implemented Fixes

### 1. Fixed Double Selection Issue

Removed the duplicate call to `selectCategory()`:

```typescript
// BEFORE:
selectCategory(category);
// ... code ...
selectCategory(category); // Duplicate call causing issues

// AFTER:
// Call context update ONCE (not twice as before)
console.log(`[CATEGORY SELECT ${operationId}] Updating context with: ${category}`);
selectCategory(category);
```

### 2. Added Comprehensive Error Handling

Wrapped the entire `handleCategorySelect` function in a try/catch block:

```typescript
try {
  // Category selection logic
} catch (error) {
  // Global error handler for the entire function
  console.error('[CATEGORY SELECT] Critical error in category selection:', error);
}
```

### 3. Added Category Selection Throttling

Implemented throttling similar to layer selection:

```typescript
// CRITICAL FIX: Add throttling for category selection like we did for layer selection
const now = Date.now();
const throttleTime = 500; // 500ms cooldown between category selections
const categoryThrottleKey = '__categorySelectionTimestamp';

// Check if this category selection is happening too quickly after the last one
const lastTimestamp = window[categoryThrottleKey] || 0;
if (now - lastTimestamp < throttleTime) {
  console.log(
    `[CATEGORY SELECT] Throttled - ignoring category selection too soon after previous (${now - lastTimestamp}ms)`
  );
  return; // Ignore this selection
}

// Update throttle timestamp
window[categoryThrottleKey] = now;
```

### 4. Enhanced Recovery Mechanism

Improved the `performFullRecovery` function to clear throttling locks and preload key data:

```typescript
// CRITICAL FIX: Reset any pending selection throttles to ensure we can make new selections
try {
  // Clear all throttle keys to ensure we can make new selections after recovery
  if (window.__layerSelectionLock) {
    console.log('[TAXONOMY RECOVERY] Clearing layer selection lock');
    window.__layerSelectionLock = false;
  }
  if (window.__categorySelectionTimestamp) {
    console.log('[TAXONOMY RECOVERY] Clearing category selection timestamp');
    window.__categorySelectionTimestamp = 0;
  }
} catch (e) {
  console.warn('[TAXONOMY RECOVERY] Error clearing throttle keys:', e);
}
```

### 5. Added Special Case Handling for Star Layer

Added specific handling for the Star layer and POP category:

```typescript
// CRITICAL FIX: Perform additional recovery steps for the Star layer
// because it has special handling needs for POP category
if (layer === 'S') {
  console.log(`[TAXONOMY RECOVERY ${recoveryId}] Special recovery for Star layer`);
  
  try {
    // Direct service call to prefetch categories for the Star layer
    const taxonomyService = require('../services/simpleTaxonomyService').taxonomyService;
    const starCategories = taxonomyService.getCategories('S');
    
    if (starCategories && starCategories.length > 0) {
      console.log(`[TAXONOMY RECOVERY ${recoveryId}] Pre-loaded ${starCategories.length} Star categories`);
      
      // Store in session storage for faster access
      try {
        sessionStorage.setItem('directCategories_S', JSON.stringify(starCategories));
        
        // Also specifically pre-load POP category subcategories since that's a common issue
        const popSubcategories = taxonomyService.getSubcategories('S', 'POP');
        if (popSubcategories && popSubcategories.length > 0) {
          console.log(`[TAXONOMY RECOVERY ${recoveryId}] Pre-loaded ${popSubcategories.length} POP subcategories`);
          sessionStorage.setItem('subcategoriesList_S_POP', JSON.stringify(popSubcategories));
        }
      } catch (e) {
        console.warn(`[TAXONOMY RECOVERY ${recoveryId}] Session storage error:`, e);
      }
    }
  } catch (e) {
    console.warn(`[TAXONOMY RECOVERY ${recoveryId}] Special Star layer recovery error:`, e);
  }
}
```

### 6. Improved Subcategory Loading Process

Enhanced the subcategory loading in `handleCategorySelect`:

```typescript
// CRITICAL FIX: Make direct subcategory loading more robust
console.log(`[CATEGORY SELECT ${operationId}] Loading subcategories for: ${layer}.${category}`);
try {
  // Pre-fetch subcategories directly from the service for immediate feedback
  const subcats = taxonomyService.getSubcategories(layer, category);
  
  if (subcats && subcats.length > 0) {
    console.log(`[CATEGORY SELECT ${operationId}] Direct load successful: ${subcats.length} subcategories`);
    
    // Store in multiple backup locations for resilience
    subcategoriesRef.current = [...subcats]; // update ref first (synchronous)
    
    // Update local state (asynchronous)
    setLocalSubcategories(prevSubcats => {
      // Only update if we have items or if previous state was empty
      if (subcats.length > 0 || prevSubcats.length === 0) {
        return [...subcats];
      }
      return prevSubcats;
    });
    
    // Store in session storage as ultimate backup
    try {
      sessionStorage.setItem(
        `subcategoriesList_${layer}_${category}`,
        JSON.stringify(subcats)
      );
    } catch (e) {
      console.warn(`[CATEGORY SELECT ${operationId}] Session storage update failed:`, e);
    }
    
    // Dispatch event to notify any listeners
    const subcategoryEvent = new CustomEvent('taxonomySubcategoriesLoaded', {
      detail: {
        layer,
        category,
        subcategories: subcats,
        source: 'direct-prefetch',
        operationId
      }
    });
    window.dispatchEvent(subcategoryEvent);
  }
}
```

## TypeScript Integration

Added new global type definitions to support the throttling mechanism:

```typescript
// CRITICAL FIX: Add global type declarations for event handler tracking and throttling
interface Window {
  __layerChangeHandlers?: Record<string, EventListener>;
  __layerSelectionLock?: boolean;
  __categorySelectionTimestamp?: number;
}
```

## Expected Results

The fix should resolve the "Taxonomy Error Detected" screen when:
1. Selecting the Star layer 
2. Clicking on the POP category

This is achieved through:
1. Eliminating duplicate context updates
2. Adding comprehensive error handling
3. Implementing throttling for category selection
4. Enhancing recovery with special case handling for Star+POP combination
5. Implementing multi-tier backup mechanisms for subcategory data