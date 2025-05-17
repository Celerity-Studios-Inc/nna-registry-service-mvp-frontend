# Taxonomy UI Components User Guide

This guide explains how to use the taxonomy UI components to build user interfaces for taxonomy selection.

## Available Components

The taxonomy system provides these key UI components:

1. **LayerSelectorV2**: For selecting a taxonomy layer
2. **SimpleTaxonomySelectionV2**: For selecting categories and subcategories
3. **TaxonomyExample**: An example component showing a complete selection workflow
4. **TaxonomyDebugger**: A debugging tool for testing taxonomy operations

## LayerSelectorV2

The LayerSelectorV2 component displays a grid of layer cards and allows the user to select a layer.

### Props

```typescript
interface LayerSelectorV2Props {
  onLayerSelect: (layer: string) => void;
  onLayerDoubleClick?: (layer: string) => void;
  initialLayer?: string;
}
```

### Usage Example

```tsx
import React, { useState } from 'react';
import LayerSelector from '../../components/asset/LayerSelectorV2';

const MyComponent: React.FC = () => {
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  
  const handleLayerSelect = (layer: string) => {
    setSelectedLayer(layer);
    console.log(`Layer selected: ${layer}`);
  };
  
  const handleLayerDoubleClick = (layer: string) => {
    setSelectedLayer(layer);
    console.log(`Layer double-clicked: ${layer}`);
    // Proceed to next step
  };
  
  return (
    <div className="my-component">
      <h2>Select a Layer</h2>
      
      <LayerSelector
        onLayerSelect={handleLayerSelect}
        onLayerDoubleClick={handleLayerDoubleClick}
        initialLayer={selectedLayer}
      />
      
      {selectedLayer && (
        <div className="selection-info">
          Selected Layer: {selectedLayer}
        </div>
      )}
    </div>
  );
};
```

### Features

- Layer Cards: Displays each layer as a card with icon and name
- Selection State: Highlights the currently selected layer
- Double-Click Support: Optional double-click handler for quick selection
- Responsive Design: Adapts to different screen sizes

## SimpleTaxonomySelectionV2

The SimpleTaxonomySelectionV2 component displays categories and subcategories for a selected layer.

### Props

```typescript
interface SimpleTaxonomySelectionV2Props {
  layer: string;
  onCategorySelect?: (category: string) => void;
  onSubcategorySelect?: (subcategory: string) => void;
  initialCategory?: string;
  initialSubcategory?: string;
}
```

### Usage Example

```tsx
import React, { useState } from 'react';
import SimpleTaxonomySelection from '../../components/asset/SimpleTaxonomySelectionV2';

const MyComponent: React.FC = () => {
  const [layer] = useState<string>('W');
  const [category, setCategory] = useState<string | null>(null);
  const [subcategory, setSubcategory] = useState<string | null>(null);
  
  const handleCategorySelect = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setSubcategory(null);
    console.log(`Category selected: ${selectedCategory}`);
  };
  
  const handleSubcategorySelect = (selectedSubcategory: string) => {
    setSubcategory(selectedSubcategory);
    console.log(`Subcategory selected: ${selectedSubcategory}`);
  };
  
  return (
    <div className="my-component">
      <h2>Select Category and Subcategory</h2>
      
      <SimpleTaxonomySelection
        layer={layer}
        onCategorySelect={handleCategorySelect}
        onSubcategorySelect={handleSubcategorySelect}
        initialCategory={category}
        initialSubcategory={subcategory}
      />
      
      {category && subcategory && (
        <div className="selection-info">
          Selected: {layer}.{category}.{subcategory}
        </div>
      )}
    </div>
  );
};
```

### Features

- Category Grid: Displays categories for the selected layer
- Subcategory Grid: Displays subcategories for the selected category
- Loading States: Shows loading indicators during data fetching
- Error Handling: Displays error messages with retry options
- Selection Summary: Shows the complete selection path
- Responsive Design: Adapts to different screen sizes

## Combining Components

For a complete selection workflow, combine the two components:

```tsx
import React, { useState } from 'react';
import LayerSelector from '../../components/asset/LayerSelectorV2';
import SimpleTaxonomySelection from '../../components/asset/SimpleTaxonomySelectionV2';

const AssetSelector: React.FC = () => {
  const [layer, setLayer] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [subcategory, setSubcategory] = useState<string | null>(null);
  
  const handleLayerSelect = (selectedLayer: string) => {
    setLayer(selectedLayer);
    setCategory(null);
    setSubcategory(null);
  };
  
  const handleCategorySelect = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setSubcategory(null);
  };
  
  const handleSubcategorySelect = (selectedSubcategory: string) => {
    setSubcategory(selectedSubcategory);
  };
  
  return (
    <div className="asset-selector">
      <h2>Select Asset Type</h2>
      
      <div className="selector-step">
        <h3>Step 1: Select Layer</h3>
        <LayerSelector
          onLayerSelect={handleLayerSelect}
          initialLayer={layer}
        />
      </div>
      
      {layer && (
        <div className="selector-step">
          <h3>Step 2: Select Category and Subcategory</h3>
          <SimpleTaxonomySelection
            layer={layer}
            onCategorySelect={handleCategorySelect}
            onSubcategorySelect={handleSubcategorySelect}
            initialCategory={category}
            initialSubcategory={subcategory}
          />
        </div>
      )}
      
      {layer && category && subcategory && (
        <div className="selection-summary">
          <h3>Selection Summary</h3>
          <p>
            <strong>Layer:</strong> {layer}<br />
            <strong>Category:</strong> {category}<br />
            <strong>Subcategory:</strong> {subcategory}
          </p>
          <p>
            <strong>HFN:</strong> {layer}.{category}.{subcategory}.001
          </p>
        </div>
      )}
    </div>
  );
};
```

## Using the useTaxonomy Hook Directly

For more control, you can use the useTaxonomy hook directly:

```tsx
import React from 'react';
import { useTaxonomy } from '../../hooks/useTaxonomy';

const CustomTaxonomySelector: React.FC = () => {
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
    
    // Subcategory data
    subcategories,
    isLoadingSubcategories,
    subcategoryError,
    selectedSubcategory,
    selectSubcategory,
    
    // HFN/MFA conversion
    hfn,
    mfa,
    
    // Reset
    reset
  } = useTaxonomy();
  
  return (
    <div className="custom-taxonomy-selector">
      <h2>Custom Taxonomy Selector</h2>
      
      {/* Custom Layer Selection UI */}
      <div className="custom-layer-selection">
        {layers.map(layer => (
          <button
            key={layer}
            onClick={() => selectLayer(layer)}
            className={selectedLayer === layer ? 'active' : ''}
          >
            {layer}
          </button>
        ))}
      </div>
      
      {/* Custom Category Selection UI */}
      {isLoadingCategories ? (
        <div>Loading categories...</div>
      ) : categoryError ? (
        <div>Error: {categoryError.message}</div>
      ) : (
        <div className="custom-category-selection">
          {categories.map(category => (
            <button
              key={category.code}
              onClick={() => selectCategory(category.code)}
              className={selectedCategory === category.code ? 'active' : ''}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}
      
      {/* Custom Subcategory Selection UI */}
      {selectedCategory && (
        isLoadingSubcategories ? (
          <div>Loading subcategories...</div>
        ) : subcategoryError ? (
          <div>Error: {subcategoryError.message}</div>
        ) : (
          <div className="custom-subcategory-selection">
            {subcategories.map(subcategory => (
              <button
                key={subcategory.code}
                onClick={() => selectSubcategory(subcategory.code)}
                className={selectedSubcategory === subcategory.code ? 'active' : ''}
              >
                {subcategory.name}
              </button>
            ))}
          </div>
        )
      )}
      
      {/* Result Display */}
      {hfn && (
        <div className="result-display">
          <p><strong>HFN:</strong> {hfn}</p>
          <p><strong>MFA:</strong> {mfa}</p>
        </div>
      )}
      
      {/* Reset Button */}
      <button onClick={reset} className="reset-button">
        Reset
      </button>
    </div>
  );
};
```

## Styling and Customization

Both components accept a `className` prop for custom styling:

```tsx
<LayerSelector
  onLayerSelect={handleLayerSelect}
  className="custom-layer-selector"
/>

<SimpleTaxonomySelection
  layer={layer}
  onCategorySelect={handleCategorySelect}
  onSubcategorySelect={handleSubcategorySelect}
  className="custom-taxonomy-selection"
/>
```

You can override the default styles by targeting the component's CSS classes:

```css
/* Custom layer selector styles */
.custom-layer-selector .layer-card {
  border-radius: 12px;
  border: 2px solid #eaeaea;
  transition: all 0.3s ease;
}

.custom-layer-selector .layer-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.custom-layer-selector .layer-card.active {
  border-color: #4a90e2;
  background-color: #e3f2fd;
}

/* Custom taxonomy selection styles */
.custom-taxonomy-selection .taxonomy-item {
  border-radius: 8px;
  padding: 12px;
}

.custom-taxonomy-selection .taxonomy-item.active {
  background-color: #4a90e2;
  color: white;
}
```

## Accessibility Considerations

The components are built with accessibility in mind:

- Keyboard Navigation: All interactive elements are focusable
- Screen Reader Support: Appropriate ARIA labels and roles
- Color Contrast: Meets WCAG AA standards
- Error Messaging: Clear error messages for failed operations

## Example Component

For a complete example, check out the TaxonomyExample component:

```tsx
import TaxonomyExample from '../../components/examples/TaxonomyExample';

// In your component
<TaxonomyExample />
```

This component demonstrates a complete taxonomy selection workflow with all features enabled.