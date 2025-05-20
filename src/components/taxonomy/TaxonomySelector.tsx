import React, { useCallback, useMemo, useEffect } from 'react';
import { useTaxonomyData } from '../../providers/taxonomy/TaxonomyDataProvider';
import LayerGrid from './LayerGrid';
import CategoryGrid from './CategoryGrid';
import SubcategoryGrid from './SubcategoryGrid';
import './TaxonomySelector.css';
import { debugLog, logger, LogLevel } from '../../utils/logger';
import { EventCoordinator } from '../../utils/eventCoordinator';

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
    
    // Use EventCoordinator for layer selection
    EventCoordinator.clear(); // Clear any pending events
    
    // Visual feedback event
    EventCoordinator.enqueue('visual-feedback-layer', () => {
      console.log(`[TaxonomySelector] Providing visual feedback for layer: ${layer}`);
    });
    
    // Layer selection event
    EventCoordinator.enqueue('select-layer', () => {
      onLayerSelect(layer);
      console.log(`[TaxonomySelector] Layer selection propagated to parent: ${layer}`);
    }, 10);
    
    // Verification event
    EventCoordinator.enqueue('verify-layer', () => {
      console.log(`[TaxonomySelector] Verification - Selected layer should be: ${layer}`);
    }, 100);
    
  }, [onLayerSelect]);
  
  const handleCategorySelect = useCallback((category: string) => {
    // Log the selection clearly
    console.log(`[TaxonomySelector] Category SELECTED: ${selectedLayer}.${category}`);
    logger.taxonomy(LogLevel.INFO, `Category selected: ${selectedLayer}.${category}`);
    
    // Make sure we pass the category to the parent handler
    try {
      // Step 1: Clear any pending events to prevent race conditions
      EventCoordinator.clear();
      
      // Step 2: Schedule updates in correct sequence using EventCoordinator
      // Visual feedback event (would normally update UI state)
      EventCoordinator.enqueue('visual-feedback', () => {
        console.log(`[TaxonomySelector] Providing visual feedback for category: ${category}`);
        // In a stateful component, you'd update local state here for immediate visual feedback
      });
      
      // Layer validation event
      EventCoordinator.enqueue('validate-layer', () => {
        if (!selectedLayer) {
          console.warn(`[TaxonomySelector] Cannot select category: No layer selected`);
          return;
        }
        console.log(`[TaxonomySelector] Layer validation passed: ${selectedLayer}`);
      });
      
      // Category selection event
      EventCoordinator.enqueue('select-category', () => {
        // Only proceed if we have a valid layer
        if (selectedLayer) {
          onCategorySelect(category);
          console.log(`[TaxonomySelector] Category selection propagated to parent: ${category}`);
        }
      }, 10); // Small delay to ensure state updates have time to process
      
      // Verification event
      EventCoordinator.enqueue('verify-selection', () => {
        console.log(`[TaxonomySelector] Verification check - Selected category should be: ${category}`);
      }, 100); // Longer delay for verification
      
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
    
    // Use EventCoordinator for subcategory selection
    EventCoordinator.clear(); // Clear any pending events
    
    // Visual feedback event
    EventCoordinator.enqueue('visual-feedback-subcategory', () => {
      console.log(`[TaxonomySelector] Providing visual feedback for subcategory: ${subcategory}`);
    });
    
    // Validation event
    EventCoordinator.enqueue('validate-category', () => {
      if (!selectedLayer || !selectedCategory) {
        console.warn('[TaxonomySelector] Cannot select subcategory: Layer or category not selected');
        return;
      }
      console.log(`[TaxonomySelector] Category validation passed: ${selectedLayer}.${selectedCategory}`);
    });
    
    // Subcategory selection event
    EventCoordinator.enqueue('select-subcategory', () => {
      if (selectedLayer && selectedCategory) {
        onSubcategorySelect(subcategory, isDoubleClick);
      }
    }, 10);
    
    // Verification event
    EventCoordinator.enqueue('verify-subcategory', () => {
      console.log(`[TaxonomySelector] Verification - Full selection: ${selectedLayer}.${selectedCategory}.${subcategory}`);
    }, 100);
    
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

// Add cleanup for EventCoordinator when component unmounts
const TaxonomySelectorWithCleanup: React.FC<TaxonomySelectorProps> = (props) => {
  // Clear pending events when component unmounts
  useEffect(() => {
    return () => {
      EventCoordinator.clear();
      console.log('[TaxonomySelector] Cleared event queue on unmount');
    };
  }, []);

  return <TaxonomySelector {...props} />;
};

export default React.memo(TaxonomySelectorWithCleanup, arePropsEqual);