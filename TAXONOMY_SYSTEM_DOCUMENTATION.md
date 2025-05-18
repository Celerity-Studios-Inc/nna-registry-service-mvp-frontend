# Taxonomy System Documentation

## Overview

The Taxonomy System is a core component of the NNA Registry Service frontend. It manages the handling of the dual addressing system (Human-Friendly Names and Machine-Friendly Addresses) for digital assets across various layers.

## Key Components

### 1. TaxonomyInitProvider

**Purpose**: Ensures taxonomy data is properly initialized before rendering the application.

**Features**:
- Loads taxonomy data only once at application startup
- Provides loading and error states with retry capabilities
- Validates critical data mappings at initialization

**Usage**:
```jsx
// Wrap your application with the provider
<TaxonomyInitProvider>
  <App />
</TaxonomyInitProvider>
```

### 2. useTaxonomy Hook

**Purpose**: Provides a consistent interface for working with taxonomy data throughout the application.

**Features**:
- Loading states for categories and subcategories
- Error handling with user-friendly feedback
- HFN to MFA conversion
- Fallback data for critical paths
- Validation functions

**Usage**:
```jsx
const {
  // Layer data
  layers,
  selectedLayer,
  selectLayer,

  // Category data
  categories,
  isLoadingCategories,
  categoryError,
  selectedCategory,
  selectCategory,
  reloadCategories,

  // Subcategory data
  subcategories,
  isLoadingSubcategories,
  subcategoryError,
  selectedSubcategory,
  selectSubcategory,
  reloadSubcategories,

  // HFN/MFA conversion
  hfn,
  mfa,
  updateSequential,
  updateFileType,

  // Reset
  reset,

  // Validation
  validateSelections
} = useTaxonomy({ autoLoad: true, showFeedback: true });
```

**Options**:
- `autoLoad`: Automatically load categories and subcategories when a layer or category is selected (default: true)
- `showFeedback`: Show feedback messages to the user (default: true)

### 3. TaxonomyErrorRecovery Service

**Purpose**: Provides fallback data and recovery strategies when taxonomy data fails to load.

**Features**:
- Fallback data for critical layers, categories, and subcategories
- Special case handling for W.BCH.SUN and S.POP.HPM
- User-friendly error messages
- Retry tracking to prevent repeated error messages

**Usage**:
```javascript
// Get fallback categories for a layer
const fallbackCategories = taxonomyErrorRecovery.getFallbackCategories('S');

// Get fallback subcategories for a category
const fallbackSubcategories = taxonomyErrorRecovery.getFallbackSubcategories('S', 'POP');

// Get fallback MFA mapping
const fallbackMFA = taxonomyErrorRecovery.getFallbackMFA('W', 'BCH', 'SUN', '001', 'png');

// Get user-friendly error message
const message = taxonomyErrorRecovery.getUserFriendlyErrorMessage(error, 'categories');
```

### 4. SimpleTaxonomyService

**Purpose**: Provides a simplified interface to taxonomy data with lookup tables.

**Features**:
- Efficient HFN to MFA conversion using lookup tables
- Methods to get categories and subcategories for layers
- Validation for HFN codes

**Usage**:
```javascript
// Get categories for a layer
const categories = taxonomyService.getCategories('W');

// Get subcategories for a category
const subcategories = taxonomyService.getSubcategories('W', 'BCH');

// Convert HFN to MFA
const mfa = taxonomyService.convertHFNtoMFA('W.BCH.SUN.001');

// Validate an HFN
const isValid = taxonomyService.validateHFN('W.BCH.SUN.001');
```

## UI Components

### 1. LayerSelectorV2

**Purpose**: Allows users to select a layer from the available options.

**Features**:
- Grid layout for easy selection
- Visual indicators for the selected layer
- Support for both click and double-click actions
- Integration with the useTaxonomy hook

**Usage**:
```jsx
<LayerSelectorV2 
  onLayerSelect={(layer, isDoubleClick) => {
    console.log(`Layer ${layer} selected`, isDoubleClick);
  }}
  onLayerDoubleClick={(layer) => {
    console.log(`Layer ${layer} double-clicked`);
  }}
  selectedLayer={currentLayer}
/>
```

### 2. SimpleTaxonomySelectionV2

**Purpose**: Allows users to select categories and subcategories for a given layer.

**Features**:
- Progressive disclosure (show subcategories only after a category is selected)
- Loading states with retry capabilities
- Error handling with user-friendly feedback
- Integration with the useTaxonomy hook

**Usage**:
```jsx
<SimpleTaxonomySelectionV2
  layer={selectedLayer}
  onCategorySelect={(category) => {
    console.log(`Category ${category} selected`);
  }}
  onSubcategorySelect={(subcategory) => {
    console.log(`Subcategory ${subcategory} selected`);
  }}
  selectedCategory={currentCategory}
  selectedSubcategory={currentSubcategory}
/>
```

## Special Cases

The taxonomy system handles several special cases:

1. **W.BCH.SUN.001** → **5.004.003.001**: Special mapping for World layer, Beach category, Sunset subcategory
2. **S.POP.HPM.001** → **2.004.003.001**: Special mapping for Song layer, Pop category, Hip Pop Music subcategory

These mappings are guaranteed to work even if the taxonomy service fails to load properly.

## Error Handling

The taxonomy system provides multiple levels of error handling:

1. **TaxonomyInitProvider**: Catches initialization errors with a retry button
2. **useTaxonomy Hook**: Provides error states and fallback data
3. **TaxonomyErrorRecovery**: Manages fallback data and retry mechanisms
4. **Components**: Show user-friendly error messages with retry options

## Testing

The taxonomy system is tested using:

1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test interactions between components
3. **Mock Data**: Test both success and error scenarios

## Best Practices

1. **Always wrap the application in TaxonomyInitProvider**:
   ```jsx
   <TaxonomyInitProvider>
     <App />
   </TaxonomyInitProvider>
   ```

2. **Use the useTaxonomy hook for all taxonomy operations**:
   ```jsx
   const { selectedLayer, selectLayer } = useTaxonomy();
   ```

3. **Provide fallback UI for loading and error states**:
   ```jsx
   {isLoadingCategories ? (
     <LoadingIndicator />
   ) : categoryError ? (
     <ErrorMessage error={categoryError} onRetry={reloadCategories} />
   ) : (
     <CategorySelector categories={categories} />
   )}
   ```

4. **Always validate selections before submitting**:
   ```jsx
   const isValid = validateSelections();
   if (isValid) {
     submitForm();
   }
   ```

5. **Use the taxonomyErrorRecovery service for custom error handling**:
   ```jsx
   const fallbackData = taxonomyErrorRecovery.getFallbackCategories(layer);
   ```

## Extending the System

To add new layers, categories, or subcategories to the system:

1. Update the lookup tables in the taxonomyLookup directory
2. Add fallback data to the TaxonomyErrorRecovery service
3. Update any special case mappings in both services
4. Add unit tests for the new mappings