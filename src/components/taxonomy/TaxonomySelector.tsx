import React, { useCallback, useMemo } from 'react';
import { useTaxonomyData } from '../../providers/taxonomy/TaxonomyDataProvider';
import LayerGrid from './LayerGrid';
import CategoryGrid from './CategoryGrid';
import SubcategoryGrid from './SubcategoryGrid';
import './TaxonomySelector.css';
import { debugLog, logger, LogLevel } from '../../utils/logger';

export interface TaxonomySelectorProps {
  selectedLayer: string;
  selectedCategory: string;
  selectedSubcategory: string;
  onLayerSelect: (layer: string) => void;
  onCategorySelect: (category: string) => void;
  onSubcategorySelect: (subcategory: string, isDoubleClick?: boolean) => void;
}

/**
 * Main taxonomy selector component
 * This is a stateless component that uses the TaxonomyDataProvider
 */
const TaxonomySelector: React.FC<TaxonomySelectorProps> = ({
  selectedLayer,
  selectedCategory,
  selectedSubcategory,
  onLayerSelect,
  onCategorySelect,
  onSubcategorySelect
}) => {
  // Get taxonomy data state
  const { 
    taxonomyData, 
    loadingState, 
    error, 
    refreshTaxonomyData 
  } = useTaxonomyData();
  
  // Memoized handlers for child components
  const handleLayerSelect = useCallback((layer: string) => {
    debugLog(`[TaxonomySelector] Layer selected: ${layer}`);
    logger.taxonomy(LogLevel.INFO, `Layer selected: ${layer}`);
    onLayerSelect(layer);
  }, [onLayerSelect]);
  
  const handleCategorySelect = useCallback((category: string) => {
    // Log the selection clearly
    console.log(`[TaxonomySelector] Category SELECTED: ${selectedLayer}.${category}`);
    logger.taxonomy(LogLevel.INFO, `Category selected: ${selectedLayer}.${category}`);
    
    // Make sure we pass the category to the parent handler
    try {
      onCategorySelect(category);
      console.log(`[TaxonomySelector] Category selection propagated to parent: ${category}`);
    } catch (error) {
      console.error(`[TaxonomySelector] Error in category selection handler:`, error);
    }
  }, [selectedLayer, onCategorySelect]);
  
  const handleSubcategorySelect = useCallback((subcategory: string, isDoubleClick?: boolean) => {
    debugLog(
      `[TaxonomySelector] Subcategory selected: ${selectedLayer}.${selectedCategory}.${subcategory} (double-click: ${Boolean(isDoubleClick)})`
    );
    logger.taxonomy(
      LogLevel.INFO, 
      `Complete taxonomy selection: ${selectedLayer}.${selectedCategory}.${subcategory}`,
      { isDoubleClick }
    );
    onSubcategorySelect(subcategory, isDoubleClick);
  }, [selectedLayer, selectedCategory, onSubcategorySelect]);

  // Handle loading state
  if (loadingState === 'loading') {
    return (
      <div className="taxonomy-loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading taxonomy data...</div>
      </div>
    );
  }

  // Handle error state
  if (loadingState === 'error' || error) {
    return (
      <div className="taxonomy-error">
        <div className="error-message">
          Error loading taxonomy data: {error?.message || 'Unknown error'}
        </div>
        <button className="retry-button" onClick={() => refreshTaxonomyData()}>
          Retry
        </button>
      </div>
    );
  }

  // Handle case where taxonomy data is not available
  if (!taxonomyData) {
    return (
      <div className="taxonomy-error">
        <div className="error-message">No taxonomy data available</div>
        <button className="retry-button" onClick={() => refreshTaxonomyData()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="taxonomy-selector">
      {/* Layer selection section */}
      <div className="taxonomy-section">
        <h3 className="section-title">Select Layer</h3>
        <LayerGrid 
          selectedLayer={selectedLayer} 
          onLayerSelect={handleLayerSelect} 
        />
      </div>

      {/* Category selection section (only shown when a layer is selected) */}
      {selectedLayer && (
        <div className="taxonomy-section">
          <h3 className="section-title">
            Select Category
            <span className="indicator">Layer: {selectedLayer}</span>
          </h3>
          <CategoryGrid
            layer={selectedLayer}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />
        </div>
      )}

      {/* Subcategory selection section (only shown when a category is selected) */}
      {selectedLayer && selectedCategory && (
        <div className="taxonomy-section">
          <h3 className="section-title">
            Select Subcategory
            <span className="indicator">Category: {selectedCategory}</span>
          </h3>
          <SubcategoryGrid
            layer={selectedLayer}
            category={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onSubcategorySelect={handleSubcategorySelect}
          />
        </div>
      )}

      {/* Selection summary (only shown when a full selection is made) */}
      {selectedLayer && selectedCategory && selectedSubcategory && (
        <div className="taxonomy-selection-summary">
          <p>
            Selected: <strong>{selectedLayer}.{selectedCategory}.{selectedSubcategory}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

// Custom comparison function for memoization
const arePropsEqual = (prevProps: TaxonomySelectorProps, nextProps: TaxonomySelectorProps) => {
  // Compare all selection state
  return (
    prevProps.selectedLayer === nextProps.selectedLayer &&
    prevProps.selectedCategory === nextProps.selectedCategory &&
    prevProps.selectedSubcategory === nextProps.selectedSubcategory
    // Handler functions are intentionally excluded as they should be stable references from parent
  );
};

// Add displayName for debugging in React DevTools
TaxonomySelector.displayName = 'TaxonomySelector';

export default React.memo(TaxonomySelector, arePropsEqual);