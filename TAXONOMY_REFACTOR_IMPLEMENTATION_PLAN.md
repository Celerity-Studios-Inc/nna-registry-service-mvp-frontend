# Taxonomy System Refactor Implementation Plan

Based on the analysis from Claude and our previous investigation, we need a complete architectural refactor of the taxonomy selection system rather than adding more patches to the existing implementation. This document outlines a structured approach to implementing this refactor while ensuring the current system remains functional until the new implementation is ready.

## Goals of the Refactor

1. Eliminate race conditions and async loading issues
2. Simplify state management with a single source of truth
3. Improve component lifecycle management
4. Clean separation of concerns between data loading and presentation
5. Create a more maintainable and testable architecture

## Implementation Strategy

### Phase 1: Create New Branch and Setup Initial Structure

1. Create a new branch from `main` called `taxonomy-refactor`
2. Set up folder structure for new components:
   ```
   /src
     /providers
       /taxonomy
         TaxonomyDataProvider.tsx
         types.ts
     /components
       /taxonomy
         TaxonomySelector.tsx
         TaxonomySelector.css
         CategoryGrid.tsx
         SubcategoryGrid.tsx
   ```

### Phase 2: Build the TaxonomyDataProvider

1. Define comprehensive types for the taxonomy data structure
2. Implement the TaxonomyDataProvider component that:
   - Loads all taxonomy data at application startup
   - Provides a React context for components to access the data
   - Handles loading states and errors gracefully
   - Implements caching for performance optimization
3. Write utility functions for common taxonomy operations

```tsx
// src/providers/taxonomy/types.ts
export interface TaxonomyItem {
  code: string;
  name: string;
  numericCode: string;
}

export interface FullTaxonomyData {
  layers: {
    [layer: string]: {
      categories: {
        [categoryCode: string]: {
          code: string;
          name: string;
          numericCode: string;
          subcategories: {
            [subcategoryCode: string]: {
              code: string;
              name: string;
              numericCode: string;
            }
          }
        }
      }
    }
  }
}

// src/providers/taxonomy/TaxonomyDataProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { taxonomyService } from '../../services/simpleTaxonomyService';
import { FullTaxonomyData, TaxonomyItem } from './types';

interface TaxonomyContextType {
  taxonomyData: FullTaxonomyData | null;
  isLoading: boolean;
  error: Error | null;
  getCategories: (layer: string) => TaxonomyItem[];
  getSubcategories: (layer: string, category: string) => TaxonomyItem[];
  convertHFNtoMFA: (hfn: string) => string;
  convertMFAtoHFN: (mfa: string) => string;
}

const TaxonomyContext = createContext<TaxonomyContextType>({
  taxonomyData: null,
  isLoading: true,
  error: null,
  getCategories: () => [],
  getSubcategories: () => [],
  convertHFNtoMFA: () => '',
  convertMFAtoHFN: () => ''
});

export const TaxonomyDataProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [taxonomyData, setTaxonomyData] = useState<FullTaxonomyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load all taxonomy data at application startup
  useEffect(() => {
    const loadAllTaxonomyData = async () => {
      try {
        setIsLoading(true);
        console.log('[TAXONOMY PROVIDER] Starting to load all taxonomy data');
        
        const data: FullTaxonomyData = { layers: {} };
        
        // Define all available layers
        const layers = ['S', 'W', 'G', 'L', 'M', 'B', 'P', 'T', 'C', 'R'];
        
        // For each layer, load all categories and subcategories
        for (const layer of layers) {
          console.log(`[TAXONOMY PROVIDER] Loading data for layer: ${layer}`);
          data.layers[layer] = { categories: {} };
          
          try {
            const categories = taxonomyService.getCategories(layer);
            
            for (const category of categories) {
              data.layers[layer].categories[category.code] = {
                code: category.code,
                name: category.name,
                numericCode: category.numericCode,
                subcategories: {}
              };
              
              try {
                const subcategories = taxonomyService.getSubcategories(layer, category.code);
                
                for (const subcategory of subcategories) {
                  data.layers[layer].categories[category.code].subcategories[subcategory.code] = {
                    code: subcategory.code,
                    name: subcategory.name,
                    numericCode: subcategory.numericCode
                  };
                }
                
                console.log(`[TAXONOMY PROVIDER] Loaded ${subcategories.length} subcategories for ${layer}.${category.code}`);
              } catch (err) {
                console.error(`[TAXONOMY PROVIDER] Error loading subcategories for ${layer}.${category.code}:`, err);
              }
            }
            
            console.log(`[TAXONOMY PROVIDER] Loaded ${categories.length} categories for layer ${layer}`);
          } catch (err) {
            console.error(`[TAXONOMY PROVIDER] Error loading categories for layer ${layer}:`, err);
          }
        }
        
        // Store the complete taxonomy data
        setTaxonomyData(data);
        console.log('[TAXONOMY PROVIDER] Successfully loaded all taxonomy data');
        
        // Store in session storage for backup/faster reloads
        try {
          sessionStorage.setItem('fullTaxonomyData', JSON.stringify(data));
          console.log('[TAXONOMY PROVIDER] Taxonomy data cached in session storage');
        } catch (e) {
          console.warn('[TAXONOMY PROVIDER] Could not cache taxonomy data in session storage:', e);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('[TAXONOMY PROVIDER] Critical error loading taxonomy data:', err);
        setError(err instanceof Error ? err : new Error('Unknown error loading taxonomy data'));
        setIsLoading(false);
      }
    };
    
    // Try to load from session storage first for faster startup
    try {
      const cachedData = sessionStorage.getItem('fullTaxonomyData');
      if (cachedData) {
        const parsedData = JSON.parse(cachedData) as FullTaxonomyData;
        setTaxonomyData(parsedData);
        setIsLoading(false);
        console.log('[TAXONOMY PROVIDER] Loaded taxonomy data from session storage cache');
        
        // Still load fresh data in the background
        loadAllTaxonomyData();
      } else {
        // No cached data, load directly
        loadAllTaxonomyData();
      }
    } catch (e) {
      console.warn('[TAXONOMY PROVIDER] Error loading from cache, loading fresh data:', e);
      loadAllTaxonomyData();
    }
  }, []);
  
  // Utility functions that wrap the taxonomy service but use our cached data when possible
  const getCategories = (layer: string): TaxonomyItem[] => {
    if (!taxonomyData || !taxonomyData.layers[layer]) {
      return taxonomyService.getCategories(layer);
    }
    
    return Object.values(taxonomyData.layers[layer].categories).map(category => ({
      code: category.code,
      name: category.name,
      numericCode: category.numericCode
    }));
  };
  
  const getSubcategories = (layer: string, category: string): TaxonomyItem[] => {
    if (!taxonomyData || !taxonomyData.layers[layer] || !taxonomyData.layers[layer].categories[category]) {
      return taxonomyService.getSubcategories(layer, category);
    }
    
    return Object.values(taxonomyData.layers[layer].categories[category].subcategories);
  };
  
  const convertHFNtoMFA = (hfn: string): string => {
    try {
      return taxonomyService.convertHFNtoMFA(hfn);
    } catch (err) {
      console.error('[TAXONOMY PROVIDER] Error converting HFN to MFA:', err);
      return '';
    }
  };
  
  const convertMFAtoHFN = (mfa: string): string => {
    try {
      return taxonomyService.convertMFAtoHFN(mfa);
    } catch (err) {
      console.error('[TAXONOMY PROVIDER] Error converting MFA to HFN:', err);
      return '';
    }
  };
  
  const contextValue = {
    taxonomyData,
    isLoading,
    error,
    getCategories,
    getSubcategories,
    convertHFNtoMFA,
    convertMFAtoHFN
  };
  
  return (
    <TaxonomyContext.Provider value={contextValue}>
      {children}
    </TaxonomyContext.Provider>
  );
};

export const useTaxonomyData = () => useContext(TaxonomyContext);
```

### Phase 3: Build Stateless Presentation Components

1. Implement pure presentational components that don't manage data loading
2. Use the TaxonomyDataProvider as the single source of truth
3. Create clean CSS without specificity issues

```tsx
// src/components/taxonomy/TaxonomySelector.tsx
import React from 'react';
import { useTaxonomyData } from '../../providers/taxonomy/TaxonomyDataProvider';
import './TaxonomySelector.css';
import CategoryGrid from './CategoryGrid';
import SubcategoryGrid from './SubcategoryGrid';

interface TaxonomySelectorProps {
  selectedLayer: string;
  selectedCategory: string;
  selectedSubcategory: string;
  onLayerSelect: (layer: string) => void;
  onCategorySelect: (category: string) => void;
  onSubcategorySelect: (subcategory: string) => void;
}

const TaxonomySelector: React.FC<TaxonomySelectorProps> = ({
  selectedLayer,
  selectedCategory,
  selectedSubcategory,
  onLayerSelect,
  onCategorySelect,
  onSubcategorySelect
}) => {
  const { taxonomyData, isLoading, error } = useTaxonomyData();
  
  if (isLoading) {
    return (
      <div className="taxonomy-loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading taxonomy data...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="taxonomy-error">
        <div className="error-message">Error loading taxonomy: {error.message}</div>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }
  
  if (!taxonomyData) {
    return (
      <div className="taxonomy-error">
        <div className="error-message">No taxonomy data available</div>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }
  
  // Render layers
  const renderLayers = () => {
    return Object.keys(taxonomyData.layers).map(layer => (
      <div
        key={layer}
        className={`taxonomy-item layer-card ${selectedLayer === layer ? 'active' : ''}`}
        onClick={() => onLayerSelect(layer)}
        data-testid={`layer-${layer}`}
      >
        <div className="taxonomy-item-code">{layer}</div>
        <div className="taxonomy-item-name">
          {getLayerName(layer)}
        </div>
      </div>
    ));
  };
  
  // Helper function to get layer name
  const getLayerName = (layer: string): string => {
    switch (layer) {
      case 'S': return 'Star';
      case 'W': return 'World';
      case 'G': return 'GGC';
      case 'L': return 'Look';
      case 'M': return 'Move';
      case 'B': return 'Bio';
      case 'P': return 'Prop';
      case 'T': return 'Theme';
      case 'C': return 'Character';
      case 'R': return 'Rights';
      default: return layer;
    }
  };
  
  return (
    <div className="taxonomy-selector">
      <div className="taxonomy-section">
        <h3 className="section-title">Select Layer</h3>
        <div className="taxonomy-grid">
          {renderLayers()}
        </div>
      </div>
      
      {selectedLayer && (
        <div className="taxonomy-section">
          <h3 className="section-title">
            Select Category
            {selectedLayer && <span className="layer-indicator">Layer: {selectedLayer}</span>}
          </h3>
          
          <CategoryGrid
            layer={selectedLayer}
            selectedCategory={selectedCategory}
            onCategorySelect={onCategorySelect}
          />
        </div>
      )}
      
      {selectedLayer && selectedCategory && (
        <div className="taxonomy-section">
          <h3 className="section-title">
            Select Subcategory
            {selectedCategory && <span className="category-indicator">Category: {selectedCategory}</span>}
          </h3>
          
          <SubcategoryGrid
            layer={selectedLayer}
            category={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onSubcategorySelect={onSubcategorySelect}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(TaxonomySelector);

// src/components/taxonomy/CategoryGrid.tsx
import React from 'react';
import { useTaxonomyData } from '../../providers/taxonomy/TaxonomyDataProvider';
import './TaxonomySelector.css';

interface CategoryGridProps {
  layer: string;
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
  layer,
  selectedCategory,
  onCategorySelect
}) => {
  const { getCategories } = useTaxonomyData();
  const categories = getCategories(layer);
  
  if (categories.length === 0) {
    return (
      <div className="taxonomy-empty">
        <div className="empty-message">No categories found for layer {layer}</div>
      </div>
    );
  }
  
  return (
    <div className="taxonomy-grid">
      {categories.map(category => (
        <div
          key={category.code}
          className={`taxonomy-item category-card ${selectedCategory === category.code ? 'active' : ''}`}
          onClick={() => onCategorySelect(category.code)}
          data-testid={`category-${category.code}`}
        >
          <div className="taxonomy-item-code">{category.code}</div>
          <div className="taxonomy-item-numeric">{category.numericCode}</div>
          <div className="taxonomy-item-name">{category.name}</div>
        </div>
      ))}
    </div>
  );
};

export default React.memo(CategoryGrid);

// src/components/taxonomy/SubcategoryGrid.tsx
import React from 'react';
import { useTaxonomyData } from '../../providers/taxonomy/TaxonomyDataProvider';
import './TaxonomySelector.css';

interface SubcategoryGridProps {
  layer: string;
  category: string;
  selectedSubcategory: string;
  onSubcategorySelect: (subcategory: string, isDoubleClick?: boolean) => void;
}

const SubcategoryGrid: React.FC<SubcategoryGridProps> = ({
  layer,
  category,
  selectedSubcategory,
  onSubcategorySelect
}) => {
  const { getSubcategories } = useTaxonomyData();
  const subcategories = getSubcategories(layer, category);
  
  if (subcategories.length === 0) {
    return (
      <div className="taxonomy-empty">
        <div className="empty-message">No subcategories found for {layer}.{category}</div>
      </div>
    );
  }
  
  return (
    <div className="taxonomy-grid">
      {subcategories.map(subcategory => (
        <div
          key={subcategory.code}
          className={`taxonomy-item subcategory-card ${selectedSubcategory === subcategory.code ? 'active' : ''}`}
          onClick={() => onSubcategorySelect(subcategory.code)}
          onDoubleClick={() => onSubcategorySelect(subcategory.code, true)}
          data-testid={`subcategory-${subcategory.code}`}
        >
          <div className="taxonomy-item-code">{subcategory.code}</div>
          <div className="taxonomy-item-numeric">{subcategory.numericCode}</div>
          <div className="taxonomy-item-name">{subcategory.name}</div>
        </div>
      ))}
    </div>
  );
};

export default React.memo(SubcategoryGrid);

// src/components/taxonomy/TaxonomySelector.css
.taxonomy-selector {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  margin-bottom: 24px;
}

.taxonomy-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.layer-indicator,
.category-indicator {
  font-size: 14px;
  color: #666;
  font-weight: normal;
  margin-left: 12px;
}

.taxonomy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.taxonomy-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.taxonomy-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-color: #ccc;
}

.taxonomy-item.active {
  background-color: #e3f2fd;
  border-color: #2196f3;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.taxonomy-item-code {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 4px;
}

.taxonomy-item-numeric {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.taxonomy-item-name {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.3;
}

.taxonomy-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  color: #666;
}

.loading-spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text,
.error-message,
.empty-message {
  font-size: 14px;
  text-align: center;
}

.taxonomy-error,
.taxonomy-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  color: #666;
}

.taxonomy-error .error-message {
  color: #d32f2f;
  margin-bottom: 16px;
}

.retry-button {
  background-color: #2196f3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #1976d2;
}
```

### Phase 4: Integrate with RegisterAssetPage

1. Update the RegisterAssetPage to use the new TaxonomySelector component
2. Ensure proper state management and form handling

```tsx
// src/pages/RegisterAssetPage.tsx
import React, { useState } from 'react';
import TaxonomySelector from '../components/taxonomy/TaxonomySelector';
// Other imports...

const RegisterAssetPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedLayer, setSelectedLayer] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [file, setFile] = useState<File | null>(null);
  // Other state...
  
  const handleLayerSelect = (layer: string) => {
    setSelectedLayer(layer);
    setSelectedCategory('');
    setSelectedSubcategory('');
  };
  
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory('');
  };
  
  const handleSubcategorySelect = (subcategory: string, isDoubleClick?: boolean) => {
    setSelectedSubcategory(subcategory);
    
    // If double-click, automatically advance to next step
    if (isDoubleClick) {
      setActiveStep(prevStep => prevStep + 1);
    }
  };
  
  // Render current step
  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <TaxonomySelector
            selectedLayer={selectedLayer}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onLayerSelect={handleLayerSelect}
            onCategorySelect={handleCategorySelect}
            onSubcategorySelect={handleSubcategorySelect}
          />
        );
      // Other steps...
    }
  };
  
  // Rest of component...
};
```

### Phase 5: Integration Testing

1. Test each component individually in isolation
2. Test the integrated components with various layer, category, and subcategory selections
3. Focus specifically on the Star layer + POP category combination
4. Verify that components handle all edge cases gracefully

### Phase 6: Main App Integration

1. Wrap the entire application with the TaxonomyDataProvider
2. Ensure all components that need taxonomy data are using the provider

```tsx
// src/App.tsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { TaxonomyDataProvider } from './providers/taxonomy/TaxonomyDataProvider';
// Other imports...

function App() {
  return (
    <TaxonomyDataProvider>
      <Router>
        {/* App content */}
      </Router>
    </TaxonomyDataProvider>
  );
}

export default App;
```

### Phase 7: Parallel Testing and Transition

1. Implement feature flags to switch between old and new implementations
2. Allow users to opt into the new implementation for testing
3. Gather feedback and make adjustments
4. Once confident, switch fully to the new implementation

### Phase 8: Cleanup

1. Remove the old implementation
2. Update documentation
3. Ensure all tests pass
4. Merge the `taxonomy-refactor` branch into `main`

## Risk Mitigation

1. Maintain the old implementation alongside the new one during development
2. Add comprehensive logging to both implementations for comparison
3. Create a feature flag system to easily switch between implementations
4. Test extensively with various browsers and devices
5. Add monitoring to track errors in production

## Timeline

1. Phase 1-2: 2 days
2. Phase 3-4: 3 days
3. Phase 5: 2 days
4. Phase 6-7: 2 days
5. Phase 8: 1 day

Total: Approximately 10 working days for the complete refactor

## Conclusion

This implementation plan addresses the fundamental issues with the current taxonomy system by completely refactoring the architecture rather than adding more patches. The new architecture eliminates race conditions, simplifies state management, and provides a more maintainable and testable solution.

The key improvements are:

1. Single source of truth for taxonomy data
2. Clean separation of concerns between data loading and presentation
3. Simplified component lifecycle management
4. Proper handling of edge cases
5. Improved error recovery and resilience

Following this plan will result in a more robust implementation that resolves the persistent issues with the taxonomy system, particularly the problematic Star layer + POP category combination.