# Taxonomy System Developer Guide

This guide provides detailed information for developers who need to work with or extend the taxonomy system.

## Architecture Details

### 1. Taxonomy Data Structure

The taxonomy data is stored in flattened lookup tables:

```typescript
// src/taxonomyLookup/W_layer.ts
export const W_LAYER_LOOKUP = {
  // Categories
  "BCH": {
    "numericCode": "004",
    "name": "Beach"
  },
  // ...
  
  // Subcategories - with full path as key
  "BCH.SUN": {
    "numericCode": "003",
    "name": "Sunset"
  },
  // ...
};

// Category to subcategory mapping
export const W_SUBCATEGORIES = {
  "BCH": [
    "BCH.SUN",
    "BCH.FES",
    "BCH.TRO"
  ],
  // ...
};
```

### 2. Initialization Process

The taxonomy system uses a dedicated initialization process to ensure data is available before components use it:

- `TaxonomyInitProvider` wraps the application
- `taxonomyInitializer.ts` validates critical mappings and layer data
- Components wait for initialization to complete

### 3. Hook-based Access

The `useTaxonomy` hook provides a React-friendly way to access the taxonomy:

- Handles loading states
- Provides error handling
- Manages selections
- Includes fallback mechanisms

### 4. UI Components

Two key UI components are provided:

- `LayerSelectorV2` - For selecting a taxonomy layer
- `SimpleTaxonomySelectionV2` - For selecting categories and subcategories

## Implementation Guide

### 1. Adding a New Layer

Here's a step-by-step guide for adding a new layer (e.g., X):

#### Step 1: Create the lookup table

Create a file at `src/taxonomyLookup/X_layer.ts`:

```typescript
export const X_LAYER_LOOKUP = {
  // Categories
  "CAT1": {
    "numericCode": "001",
    "name": "Category 1"
  },
  "CAT2": {
    "numericCode": "002",
    "name": "Category 2"
  },
  
  // Subcategories
  "CAT1.SUB1": {
    "numericCode": "001",
    "name": "Subcategory 1"
  },
  "CAT1.SUB2": {
    "numericCode": "002",
    "name": "Subcategory 2"
  },
  "CAT2.SUB1": {
    "numericCode": "001",
    "name": "Subcategory 1"
  }
};

export const X_SUBCATEGORIES = {
  "CAT1": [
    "CAT1.SUB1",
    "CAT1.SUB2"
  ],
  "CAT2": [
    "CAT2.SUB1"
  ]
};
```

#### Step 2: Update the index.ts file

Update `src/taxonomyLookup/index.ts`:

```typescript
export * from './W_layer';
export * from './S_layer';
// ... other existing layers
export * from './X_layer'; // Add the new layer
```

#### Step 3: Update the simpleTaxonomyService.ts file

Update `src/services/simpleTaxonomyService.ts`:

```typescript
import {
  W_LAYER_LOOKUP, W_SUBCATEGORIES,
  S_LAYER_LOOKUP, S_SUBCATEGORIES,
  // ... other existing layers
  X_LAYER_LOOKUP, X_SUBCATEGORIES // Add the new layer
} from '../taxonomyLookup';

// Layer numeric codes mapping
const LAYER_NUMERIC_CODES: Record<string, string> = {
  'G': '1', 'S': '2', 'L': '3', 'M': '4', 'W': '5',
  'B': '6', 'P': '7', 'T': '8', 'C': '9', 'R': '10',
  'X': '11' // Add the new layer code
};

// Layer lookups mapping
const LAYER_LOOKUPS: Record<string, Record<string, { numericCode: string, name: string }>> = {
  'W': W_LAYER_LOOKUP,
  'S': S_LAYER_LOOKUP,
  // ... other existing layers
  'X': X_LAYER_LOOKUP // Add the new layer
};

// Layer subcategories mapping
const LAYER_SUBCATEGORIES: Record<string, Record<string, string[]>> = {
  'W': W_SUBCATEGORIES,
  'S': S_SUBCATEGORIES,
  // ... other existing layers
  'X': X_SUBCATEGORIES // Add the new layer
};
```

#### Step 4: Add layer icon (optional)

Create an SVG icon for the layer at `src/assets/layer-icons/x.svg` or run the icon generator:

```bash
npm run generate-layer-icons
```

#### Step 5: Add tests for the new layer

Update test files to include the new layer:

```typescript
// src/tests/utils/taxonomyTestUtils.ts
export const GENERAL_HFN_MFA_TEST_CASES: HfnMfaTestCase[] = [
  // ... existing test cases
  {
    hfn: 'X.CAT1.SUB1.001',
    expectedMfa: '11.001.001.001',
    description: 'X layer test case'
  }
];
```

### 2. Handling Special Cases

For special cases that need custom handling:

#### Step 1: Identify the special case

Determine the HFN and expected MFA:

- HFN: X.CAT1.SUB2.001
- Expected MFA: 11.001.999.001

#### Step 2: Add explicit mapping in the lookup table

Update the lookup table with the explicit mapping:

```typescript
export const X_LAYER_LOOKUP = {
  // ... other mappings
  
  "CAT1.SUB2": {
    "numericCode": "999", // Special numeric code
    "name": "Subcategory 2"
  }
};
```

#### Step 3: Add a test case

Add a test case to verify the special mapping:

```typescript
// src/tests/utils/taxonomyTestUtils.ts
export const SPECIAL_HFN_MFA_TEST_CASES: HfnMfaTestCase[] = [
  // ... existing test cases
  {
    hfn: 'X.CAT1.SUB2.001',
    expectedMfa: '11.001.999.001',
    description: 'X.CAT1.SUB2 special case'
  }
];
```

### 3. Adding Fallback Data

To add fallback data for a layer in the `useTaxonomy` hook:

```typescript
// Inside loadCategories function in useTaxonomy.ts
try {
  // ... existing code
} catch (error) {
  // ... existing error handling
  
  // Add fallback data for critical layers
  if (layer === 'X') {
    setCategories([
      { code: 'CAT1', numericCode: '001', name: 'Category 1' },
      { code: 'CAT2', numericCode: '002', name: 'Category 2' }
    ]);
  }
}

// Inside loadSubcategories function
try {
  // ... existing code
} catch (error) {
  // ... existing error handling
  
  // Add fallback data for critical categories
  if (layer === 'X' && category === 'CAT1') {
    setSubcategories([
      { code: 'SUB1', numericCode: '001', name: 'Subcategory 1' },
      { code: 'SUB2', numericCode: '999', name: 'Subcategory 2' }
    ]);
  }
}
```

## Advanced Topics

### 1. Taxonomy Data Generation

The `taxonomyFlattener.js` script can convert a nested JSON taxonomy into flattened lookup tables:

```bash
# Run the flattener script
npm run flatten-taxonomy
```

### 2. Debugging Strategies

When debugging taxonomy issues:

- Use the TaxonomyDebugger at /debug/taxonomy
- Enable debug logging with `logger.setLogLevel(LogLevel.DEBUG)`
- Check the LogViewer for taxonomy-related logs
- Run tests to verify functionality

### 3. Performance Considerations

For better performance:

- Use `memo` or `useMemo` for expensive calculations
- Virtualize large category/subcategory lists
- Consider lazy loading taxonomy data
- Cache common HFN to MFA conversions

### 4. Error Handling and Recovery

The taxonomy system includes several layers of error handling:

1. **Service-level**: The taxonomy service catches and logs errors
2. **Hook-level**: The useTaxonomy hook provides fallback data
3. **Component-level**: UI components show error states and retry options
4. **Application-level**: ErrorBoundary catches uncaught errors

When extending the system, follow these principles:

1. Always catch exceptions and provide meaningful error messages
2. Include fallback behavior when possible
3. Log errors for debugging
4. Provide retry mechanisms in the UI