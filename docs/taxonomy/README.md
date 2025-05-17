# NNA Registry Service Taxonomy System

This documentation provides an overview of the NNA Registry Service taxonomy system, explaining how it works, how to use it, and how to extend it.

## Table of Contents

1. [Overview](#overview)
2. [Key Concepts](#key-concepts)
3. [Architecture](#architecture)
4. [Usage Guide](#usage-guide)
5. [Troubleshooting](#troubleshooting)
6. [Development](#development)
7. [Testing](#testing)

## Overview

The NNA Registry Service uses a dual addressing system:

- **Human-Friendly Names (HFN)**: Alphanumeric codes like `W.BCH.SUN.001`
- **Machine-Friendly Addresses (MFA)**: Numeric codes like `5.004.003.001`

The taxonomy system handles:

- Storing and retrieving taxonomy data
- Converting between HFN and MFA formats
- Providing UI components for taxonomy selection
- Ensuring taxonomy data consistency

## Key Concepts

### Layer Structure

The taxonomy is organized in a hierarchical structure:

1. **Layer**: The top level (e.g., `W` for Wave, `S` for Star)
2. **Category**: Groupings within a layer (e.g., `BCH` for Beach)
3. **Subcategory**: Specific types within a category (e.g., `SUN` for Sunset)
4. **Sequential**: A numeric identifier (`001`, `002`, etc.)
5. **File Type** (optional): A file extension (e.g., `.mp4`)

### HFN Format

Human-Friendly Names follow this format:
[Layer].[Category].[Subcategory].[Sequential][.FileType]

Example: `W.BCH.SUN.001.mp4`

### MFA Format

Machine-Friendly Addresses follow this format:
[LayerCode].[CategoryCode].[SubcategoryCode].[Sequential][.FileType]

Example: `5.004.003.001.mp4`

## Architecture

### Flattened Lookup Approach

The taxonomy system uses a flattened lookup approach:

- Each layer has its own lookup table (e.g., `W_layer.ts`, `S_layer.ts`)
- Direct mappings from codes to their attributes
- Separate mappings for categories and subcategories

This approach makes the system:

- More efficient (direct lookups)
- Easier to debug
- More resilient to errors
- Capable of handling special cases explicitly

### Key Components

1. **Taxonomy Initializer**: Ensures taxonomy data is loaded and valid
2. **Taxonomy Service**: Provides methods for accessing taxonomy data
3. **useTaxonomy Hook**: React hook for using taxonomy in components
4. **Taxonomy UI Components**: Layer selector and taxonomy selection components
5. **Debugging Tools**: Components for testing and debugging the taxonomy

## Usage Guide

### Using the useTaxonomy Hook

The easiest way to work with the taxonomy is to use the `useTaxonomy` hook:

```tsx
import { useTaxonomy } from '../../hooks/useTaxonomy';

const MyComponent = () => {
  const {
    // Layer data
    layers,
    selectedLayer,
    selectLayer,
    
    // Category data
    categories,
    selectedCategory,
    selectCategory,
    
    // Subcategory data
    subcategories,
    selectedSubcategory,
    selectSubcategory,
    
    // HFN/MFA conversion
    hfn,
    mfa,
    
    // Reset
    reset
  } = useTaxonomy();
  
  // Your component code...
};
```

### Using UI Components

The system provides ready-to-use UI components:

```tsx
// Layer selection
import LayerSelector from '../../components/asset/LayerSelectorV2';

<LayerSelector
  onLayerSelect={handleLayerSelect}
  onLayerDoubleClick={handleLayerDoubleClick}
  initialLayer={selectedLayer}
/>

// Taxonomy selection
import SimpleTaxonomySelection from '../../components/asset/SimpleTaxonomySelectionV2';

<SimpleTaxonomySelection
  layer={selectedLayer}
  onCategorySelect={handleCategorySelect}
  onSubcategorySelect={handleSubcategorySelect}
  initialCategory={selectedCategory}
  initialSubcategory={selectedSubcategory}
/>
```

### Direct Service Usage

For advanced use cases, you can directly use the taxonomy service:

```tsx
import { taxonomyService } from '../../services/simpleTaxonomyService';

// Get categories for a layer
const categories = taxonomyService.getCategories('W');

// Get subcategories for a category
const subcategories = taxonomyService.getSubcategories('W', 'BCH');

// Convert HFN to MFA
const mfa = taxonomyService.convertHFNtoMFA('W.BCH.SUN.001');
```

## Troubleshooting

### Common Issues

1. **Missing Categories**: If categories or subcategories aren't showing up, check:
   - Is the layer code correct?
   - Is the taxonomy data properly loaded?
   - Are there any console errors?

2. **Conversion Errors**: If HFN to MFA conversion fails, check:
   - Is the HFN format valid?
   - Do all components of the HFN exist in the taxonomy?
   - Is there a special case mapping needed?

### Debugging Tools

In development mode, you can use:

1. **Log Viewer**: View detailed logs for taxonomy operations
   - Available at the bottom of the screen in development mode

2. **Taxonomy Debugger**: Test and debug taxonomy operations
   - Available at /debug/taxonomy in development mode

3. **Taxonomy Example**: View a simple demo of the taxonomy system
   - Available at /taxonomy-example in development mode

## Development

### Adding a New Layer

To add a new layer:

1. Create a lookup table file (e.g., `src/taxonomyLookup/X_layer.ts`)
2. Define the layer data (categories and subcategories)
3. Update the `src/taxonomyLookup/index.ts` file to export the new layer
4. Update the `simpleTaxonomyService.ts` to include the new layer

### Modifying Existing Layers

When modifying an existing layer:

1. Update the corresponding lookup table file
2. Run tests to ensure compatibility with existing code
3. Update the documentation if necessary

### Special Case Handling

For special cases (like W.BCH.SUN):

1. Define the explicit mapping in the lookup table
2. Add a test case in `taxonomyTestUtils.ts`
3. Verify the special case works correctly

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

### Writing Tests

When adding new functionality:

1. Add unit tests for services
2. Add tests for hooks and components
3. Add integration tests if necessary
4. Update test utilities if needed