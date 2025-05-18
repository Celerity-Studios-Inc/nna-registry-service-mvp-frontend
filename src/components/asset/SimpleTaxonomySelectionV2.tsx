/**
 * SimpleTaxonomySelectionV2 Component
 * 
 * An improved version of the SimpleTaxonomySelection component
 * that uses the useTaxonomy hook for more reliable taxonomy selection.
 */
import React, { useState, useEffect } from 'react';
import { useTaxonomyContext } from '../../contexts/TaxonomyContext';
import { logger } from '../../utils/logger';
import '../../styles/SimpleTaxonomySelection.css';

interface SimpleTaxonomySelectionV2Props {
  layer: string;
  onCategorySelect: (category: string) => void;
  onSubcategorySelect: (subcategory: string) => void;
  selectedCategory?: string;
  selectedSubcategory?: string;
}

const SimpleTaxonomySelectionV2: React.FC<SimpleTaxonomySelectionV2Props> = ({
  layer,
  onCategorySelect,
  onSubcategorySelect,
  selectedCategory,
  selectedSubcategory
}) => {
  // Use shared taxonomy context instead of creating a new instance
  const taxonomyContext = useTaxonomyContext({ 
    componentName: 'SimpleTaxonomySelectionV2', 
    enableLogging: process.env.NODE_ENV === 'development'
  });
  
  const {
    categories,
    isLoadingCategories,
    categoryError,
    selectCategory,
    reloadCategories,
    
    subcategories,
    isLoadingSubcategories,
    subcategoryError,
    selectSubcategory,
    reloadSubcategories,

    selectLayer
  } = taxonomyContext;
  
  // Initial setup - run only once
  useEffect(() => {
    if (layer) {
      logger.info(`SimpleTaxonomySelectionV2: Initial setup for layer ${layer}`);
      // Clear any previous state
      selectLayer(layer);
      
      // Force reload immediately
      setTimeout(() => {
        reloadCategories();
        logger.info(`Initial load of categories for layer: ${layer}`);
      }, 0);
      
      // If category is also provided, load subcategories
      if (selectedCategory) {
        setTimeout(() => {
          selectCategory(selectedCategory);
          reloadSubcategories();
          logger.info(`Initial load of subcategories for ${layer}.${selectedCategory}`);
        }, 100);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run once on mount
  
  // When layer changes, update the selected layer in the taxonomy hook
  useEffect(() => {
    if (layer) {
      logger.info(`SimpleTaxonomySelectionV2: Setting layer to ${layer}`);
      selectLayer(layer);
      
      // Force an immediate reload of categories
      setTimeout(() => {
        if (layer) {
          reloadCategories();
          logger.info(`Automatically loading categories for layer: ${layer}`);
        }
      }, 50);
    }
  }, [layer, selectLayer, reloadCategories]);
  
  const [activeCategory, setActiveCategory] = useState<string | null>(selectedCategory || null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(selectedSubcategory || null);
  
  // When layer changes, reset active category and subcategory
  useEffect(() => {
    setActiveCategory(null);
    setActiveSubcategory(null);
  }, [layer]);
  
  // When selectedCategory changes, update the active category
  // FIXED: Don't call selectCategory to prevent circular updates with parent
  useEffect(() => {
    if (selectedCategory && selectedCategory !== activeCategory) {
      setActiveCategory(selectedCategory);
      // We don't call selectCategory here to prevent circular updates
      // but we do need to trigger subcategory loading
      
      // Force an immediate reload of subcategories if passed from parent
      setTimeout(() => {
        if (layer && selectedCategory) {
          selectCategory(selectedCategory); // Need to set in context
          reloadSubcategories();
          logger.info(`Automatically loading subcategories for ${layer}.${selectedCategory} (from parent)`);
        }
      }, 50);
    }
  }, [selectedCategory, activeCategory, layer, selectCategory, reloadSubcategories]);
  
  // When selectedSubcategory changes, update the active subcategory
  // FIXED: Don't call selectSubcategory to prevent circular updates with parent
  useEffect(() => {
    if (selectedSubcategory && selectedSubcategory !== activeSubcategory) {
      setActiveSubcategory(selectedSubcategory);
      // We don't call selectSubcategory here to prevent circular updates
      // selectSubcategory(selectedSubcategory); - This was causing infinite loops
    }
  }, [selectedSubcategory, activeSubcategory]);
  
  // Handle category selection
  const handleCategorySelect = (category: string) => {
    // FIXED: Prevent duplicate selections
    if (category === activeCategory) return;
    
    logger.info(`Category selected: ${category}`);
    setActiveCategory(category);
    setActiveSubcategory(null);
    selectCategory(category);
    onCategorySelect(category);
    
    // Force an immediate reload of subcategories
    setTimeout(() => {
      if (layer && category) {
        reloadSubcategories();
        logger.info(`Automatically loading subcategories for ${layer}.${category}`);
      }
    }, 50);
  };
  
  // Handle subcategory selection
  const handleSubcategorySelect = (subcategory: string) => {
    // FIXED: Prevent duplicate selections
    if (subcategory === activeSubcategory) return;
    
    logger.info(`Subcategory selected: ${subcategory}`);
    setActiveSubcategory(subcategory);
    selectSubcategory(subcategory);
    onSubcategorySelect(subcategory);
  };
  
  return (
    <div className="simple-taxonomy-selection">
      <div className="taxonomy-section">
        <h3 className="taxonomy-section-title">
          Select Category
          {layer && <span className="layer-indicator">Layer: {layer}</span>}
        </h3>
        
        {isLoadingCategories ? (
          <div className="taxonomy-loading">Loading categories...</div>
        ) : categoryError ? (
          <div className="taxonomy-error">
            <p>{String(categoryError)}</p>
            <button 
              onClick={() => {
                // First ensure the layer is set, then reload categories
                if (layer) {
                  selectLayer(layer);
                  // Add a small delay to ensure layer is set before reloading
                  setTimeout(() => reloadCategories(), 50);
                  logger.info(`Retrying category load for layer: ${layer}`);
                }
              }} 
              className="retry-button"
            >
              Retry
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div className="taxonomy-empty">
            <p>No categories found for layer {layer}</p>
            <button 
              onClick={() => {
                // First ensure the layer is set, then reload categories
                if (layer) {
                  selectLayer(layer);
                  // Add a small delay to ensure layer is set before reloading
                  setTimeout(() => reloadCategories(), 50);
                  logger.info(`Retrying category load for layer: ${layer}`);
                }
              }} 
              className="retry-button"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="taxonomy-items">
            {categories.map(category => (
              <div
                key={category.code}
                className={`taxonomy-item ${activeCategory === category.code ? 'active' : ''}`}
                onClick={() => handleCategorySelect(category.code)}
                data-testid={`category-${category.code}`}
              >
                <div className="taxonomy-item-code">{category.code}</div>
                <div className="taxonomy-item-numeric">{category.numericCode}</div>
                <div className="taxonomy-item-name">{category.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {activeCategory && (
        <div className="taxonomy-section">
          <h3 className="taxonomy-section-title">
            Select Subcategory
            {activeCategory && <span className="category-indicator">Category: {activeCategory}</span>}
          </h3>
          
          {isLoadingSubcategories ? (
            <div className="taxonomy-loading">Loading subcategories...</div>
          ) : subcategoryError ? (
            <div className="taxonomy-error">
              <p>{String(subcategoryError)}</p>
              <button 
                onClick={() => {
                  // Ensure layer and category are set before reloading
                  if (layer && activeCategory) {
                    selectLayer(layer);
                    selectCategory(activeCategory);
                    // Add a small delay to ensure selections are set before reloading
                    setTimeout(() => reloadSubcategories(), 50);
                    logger.info(`Retrying subcategory load for ${layer}.${activeCategory}`);
                  }
                }} 
                className="retry-button"
              >
                Retry
              </button>
            </div>
          ) : subcategories.length === 0 ? (
            <div className="taxonomy-empty">
              <p>No subcategories found for {layer}.{activeCategory}</p>
              <div style={{ fontSize: '12px', color: '#666', margin: '10px 0', padding: '8px', backgroundColor: '#f9f9f9', border: '1px solid #eee' }}>
                <p>Debug Info: {JSON.stringify({
                  layer,
                  activeCategory,
                  subcategoriesState: subcategories.length,
                  contextSubcategories: subcategories,
                  isLoadingSubcategories,
                  hasSubcategoryError: !!subcategoryError,
                  error: subcategoryError ? String(subcategoryError) : null
                }, null, 2)}</p>
              </div>
              <button 
                onClick={() => {
                  // Ensure layer and category are set before reloading
                  if (layer && activeCategory) {
                    selectLayer(layer);
                    selectCategory(activeCategory);
                    // Add a small delay to ensure selections are set before reloading
                    setTimeout(() => reloadSubcategories(), 50);
                    logger.info(`Retrying subcategory load for ${layer}.${activeCategory}`);
                  }
                }} 
                className="retry-button"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="taxonomy-items">
              {subcategories.map(subcategory => (
                <div
                  key={subcategory.code}
                  className={`taxonomy-item ${activeSubcategory === subcategory.code ? 'active' : ''}`}
                  onClick={() => handleSubcategorySelect(subcategory.code)}
                  data-testid={`subcategory-${subcategory.code}`}
                >
                  <div className="taxonomy-item-code">{subcategory.code}</div>
                  <div className="taxonomy-item-numeric">{subcategory.numericCode}</div>
                  <div className="taxonomy-item-name">{subcategory.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeCategory && activeSubcategory && (
        <div className="taxonomy-selection-summary">
          <p>
            Selected: <strong>{layer}.{activeCategory}.{activeSubcategory}</strong>
          </p>
        </div>
      )}
      
      {/* Debug information */}
      {process.env.NODE_ENV === 'development' && (
        <div className="taxonomy-debug">
          <p>Layer: {layer}</p>
          <p>Categories: {categories.length} available</p>
          <p>Selected Category: {activeCategory}</p>
          <p>Subcategories: {subcategories.length} available</p>
          <p>Selected Subcategory: {activeSubcategory}</p>
          
          <details>
            <summary>Advanced Taxonomy State</summary>
            <pre style={{ fontSize: '11px' }}>
              {JSON.stringify({
                component: {
                  props: { layer, selectedCategory, selectedSubcategory },
                  state: { activeCategory, activeSubcategory }
                },
                context: {
                  selectedLayer: taxonomyContext?.selectedLayer,
                  selectedCategory: taxonomyContext?.selectedCategory,
                  selectedSubcategory: taxonomyContext?.selectedSubcategory,
                  hfn: taxonomyContext?.hfn,
                  mfa: taxonomyContext?.mfa
                },
                serviceState: {
                  categories: categories.length,
                  subcategories: subcategories.length,
                  isLoadingCategories,
                  isLoadingSubcategories,
                  categoryError: categoryError ? String(categoryError) : null,
                  subcategoryError: subcategoryError ? String(subcategoryError) : null
                }
              }, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default SimpleTaxonomySelectionV2;