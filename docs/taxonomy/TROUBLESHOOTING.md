# Taxonomy System Troubleshooting Guide

This guide provides solutions for common issues with the taxonomy system.

## Table of Contents

1. [Taxonomy Data Issues](#taxonomy-data-issues)
2. [UI Component Issues](#ui-component-issues)
3. [HFN/MFA Conversion Issues](#hfnmfa-conversion-issues)
4. [Performance Issues](#performance-issues)
5. [Debugging Tools](#debugging-tools)

## Taxonomy Data Issues

### Categories Not Loading

**Symptoms:**
- Empty category list
- "No categories found" message
- Console errors about missing categories

**Possible Causes:**
1. Layer code is incorrect
2. Taxonomy data is not loaded
3. Error in taxonomy service
4. Network issues (if data is loaded remotely)

**Solutions:**
1. Verify the layer code is correct (`W`, `S`, etc.)
2. Check if taxonomy initialization completed successfully
3. Look for errors in the console related to taxonomy loading
4. Try reloading the page or application
5. Check if fallback data is correctly configured

**Code Example:**

```tsx
// Check if taxonomy initialization is complete
import { isTaxonomyInitialized } from '../../services/taxonomyInitializer';

if (!isTaxonomyInitialized()) {
  console.warn('Taxonomy is not initialized');
}

// Try loading categories directly
import { taxonomyService } from '../../services/simpleTaxonomyService';

try {
  const categories = taxonomyService.getCategories('W');
  console.log('Categories:', categories);
} catch (error) {
  console.error('Error loading categories:', error);
}
```

### Subcategories Not Loading

**Symptoms:**
- Empty subcategory list
- "No subcategories found" message
- Console errors about missing subcategories

**Possible Causes:**
1. Category code is incorrect
2. Subcategory data is missing for the category
3. Error in taxonomy service

**Solutions:**
1. Verify the category code is correct
2. Check if the category has any subcategories defined
3. Look for errors in the console related to subcategory loading
4. Try selecting a different category
5. Check if fallback data is correctly configured

**Code Example:**

```tsx
// Try loading subcategories directly
import { taxonomyService } from '../../services/simpleTaxonomyService';

try {
  const subcategories = taxonomyService.getSubcategories('W', 'BCH');
  console.log('Subcategories:', subcategories);
} catch (error) {
  console.error('Error loading subcategories:', error);
}
```

## UI Component Issues

### Layer Selection Not Working

**Symptoms:**
- Clicking on layer cards has no effect
- No visual feedback when selecting a layer
- Layer selection callback not triggered

**Possible Causes:**
1. Event handler not properly attached
2. CSS issues blocking clicks
3. React state not updating
4. Component props incorrectly passed

**Solutions:**
1. Check the onLayerSelect callback function
2. Ensure there are no CSS issues blocking clicks
3. Verify state updates are working correctly
4. Check component props

**Code Example:**

```tsx
// Test layer selection directly
import { taxonomyService } from '../../services/simpleTaxonomyService';

const layer = 'W';
console.log(`Testing layer: ${layer}`);
try {
  const categories = taxonomyService.getCategories(layer);
  console.log(`Found ${categories.length} categories for layer ${layer}`);
} catch (error) {
  console.error(`Error testing layer ${layer}:`, error);
}
```

### Category/Subcategory Selection Not Working

**Symptoms:**
- Clicking on categories or subcategories has no effect
- No visual feedback when selecting
- Selection callback not triggered

**Possible Causes:**
1. Event handler not properly attached
2. CSS issues blocking clicks
3. React state not updating
4. Component props incorrectly passed

**Solutions:**
1. Check the selection callback functions
2. Ensure there are no CSS issues blocking clicks
3. Verify state updates are working correctly
4. Check component props

**Code Example:**

```tsx
// Manual test of category/subcategory selection
const category = 'BCH';
console.log(`Testing category: ${category}`);
try {
  const subcategories = taxonomyService.getSubcategories('W', category);
  console.log(`Found ${subcategories.length} subcategories for W.${category}`);
} catch (error) {
  console.error(`Error testing category W.${category}:`, error);
}
```

## HFN/MFA Conversion Issues

### Incorrect HFN to MFA Conversion

**Symptoms:**
- MFA value is incorrect or empty
- Console errors about HFN conversion
- Special cases not working correctly

**Possible Causes:**
1. Invalid HFN format
2. Missing mappings in lookup tables
3. Special case not properly defined
4. Error in conversion logic

**Solutions:**
1. Verify the HFN format is correct
2. Check if all components of the HFN exist in the taxonomy
3. Ensure special cases are properly defined in lookup tables
4. Test the conversion directly with the taxonomy service

**Code Example:**

```tsx
// Test HFN to MFA conversion directly
import { taxonomyService } from '../../services/simpleTaxonomyService';

const hfn = 'W.BCH.SUN.001';
console.log(`Testing HFN: ${hfn}`);
try {
  const mfa = taxonomyService.convertHFNtoMFA(hfn);
  console.log(`Converted to MFA: ${mfa}`);
  console.log(`Expected: 5.004.003.001`);
  console.log(`Result: ${mfa === '5.004.003.001' ? 'SUCCESS' : 'FAILED'}`);
} catch (error) {
  console.error(`Error converting HFN ${hfn}:`, error);
}
```

### Missing Special Case Handling

**Symptoms:**
- Special cases like W.BCH.SUN not converting correctly
- Inconsistent MFA values for certain HFNs
- Console errors about invalid mappings

**Solutions:**
1. Check the lookup tables for special case definitions
2. Add missing special cases to the lookup tables
3. Run tests to verify special case handling
4. Use the TaxonomyDebugger to test specific cases

**Code Example:**

```tsx
// Check lookup table for special case
import { W_LAYER_LOOKUP } from '../../taxonomyLookup/W_layer';

console.log('Special case check:');
console.log('W.BCH.SUN mapping:', W_LAYER_LOOKUP['BCH.SUN']);
```

## Performance Issues

### Slow Loading of Taxonomy Data

**Symptoms:**
- Long loading times for taxonomy data
- UI freezes when loading taxonomy
- Timeouts or performance warnings

**Possible Causes:**
1. Large taxonomy data size
2. Inefficient lookup operations
3. Excessive rerenders
4. Network latency (if loaded remotely)

**Solutions:**
1. Use memoization for expensive operations
2. Implement virtualization for large lists
3. Optimize lookup operations
4. Consider lazy loading or code splitting
5. Add caching for common operations

**Code Example:**

```tsx
// Use memoization for expensive operations
import { useMemo } from 'react';
import { taxonomyService } from '../../services/simpleTaxonomyService';

const MyComponent = ({ layer }) => {
  // Memoize categories to prevent unnecessary recomputation
  const categories = useMemo(() => {
    return taxonomyService.getCategories(layer);
  }, [layer]);
  
  // Component code...
};
```

### Memory Usage Concerns

**Symptoms:**
- High memory usage
- Performance degradation over time
- Browser warnings about memory

**Solutions:**
1. Implement data pagination or virtualization
2. Clean up unused data and event listeners
3. Optimize state management
4. Consider using lazy loading or code splitting

## Debugging Tools

### Using the TaxonomyDebugger

The TaxonomyDebugger is a powerful tool for diagnosing taxonomy issues:

1. Navigate to /debug/taxonomy in development mode
2. Use the Layer, Category, and Subcategory fields to test specific cases
3. Use the HFN/MFA converter to test conversion
4. Run the "Run All Tests" function to test the entire taxonomy system

### Using the LogViewer

The LogViewer provides detailed logs for debugging:

1. Enable the LogViewer in development mode
2. Set the log level to DEBUG
3. Filter logs by category (e.g., TAXONOMY)
4. Look for errors or warnings related to taxonomy operations

### Using Browser DevTools

Browser DevTools can help diagnose issues:

1. Use the Console to check for errors
2. Use the Network tab to monitor data loading
3. Use the Performance tab to identify bottlenecks
4. Use the React DevTools extension to inspect component state

### Manual Testing with Console

You can manually test the taxonomy system using the console:

```javascript
// Get a reference to the taxonomy service
const taxonomyService = window.debugTools.taxonomyService;

// Test layer categories
const categories = taxonomyService.getCategories('W');
console.log('W layer categories:', categories);

// Test category subcategories
const subcategories = taxonomyService.getSubcategories('W', 'BCH');
console.log('W.BCH subcategories:', subcategories);

// Test HFN to MFA conversion
const mfa = taxonomyService.convertHFNtoMFA('W.BCH.SUN.001');
console.log('W.BCH.SUN.001 -> MFA:', mfa);
```

## Still Stuck?

If you've tried all the solutions above and are still having issues:

1. Check the GitHub repository for known issues
2. Run the automated tests to see if they pass
3. Use the TaxonomyDebugger to isolate the problem
4. Create detailed logs of the issue
5. Consider filing a bug report with reproduction steps