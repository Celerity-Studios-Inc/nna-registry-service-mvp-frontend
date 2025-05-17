/**
 * SimpleTaxonomySelectionV2 Component
 * 
 * An improved version of the SimpleTaxonomySelection component
 * that uses the useTaxonomy hook for more reliable taxonomy selection.
 */
import React, { useState, useEffect } from 'react';
import { useTaxonomy } from '../../hooks/useTaxonomy';
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
    reloadSubcategories
  } = useTaxonomy();
  
  const [activeCategory, setActiveCategory] = useState<string | null>(selectedCategory || null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(selectedSubcategory || null);
  
  // When layer changes, reset active category and subcategory
  useEffect(() => {
    setActiveCategory(null);
    setActiveSubcategory(null);
  }, [layer]);
  
  // When selectedCategory changes, update the active category
  useEffect(() => {
    if (selectedCategory && selectedCategory !== activeCategory) {
      setActiveCategory(selectedCategory);
      selectCategory(selectedCategory);
    }
  }, [selectedCategory, activeCategory, selectCategory]);
  
  // When selectedSubcategory changes, update the active subcategory
  useEffect(() => {
    if (selectedSubcategory && selectedSubcategory !== activeSubcategory) {
      setActiveSubcategory(selectedSubcategory);
      selectSubcategory(selectedSubcategory);
    }
  }, [selectedSubcategory, activeSubcategory, selectSubcategory]);
  
  // Handle category selection
  const handleCategorySelect = (category: string) => {
    logger.info(`Category selected: ${category}`);
    setActiveCategory(category);
    setActiveSubcategory(null);
    selectCategory(category);
    onCategorySelect(category);
  };
  
  // Handle subcategory selection
  const handleSubcategorySelect = (subcategory: string) => {
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
            <p>{categoryError.message}</p>
            <button onClick={reloadCategories} className="retry-button">
              Retry
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div className="taxonomy-empty">
            <p>No categories found for layer {layer}</p>
            <button onClick={reloadCategories} className="retry-button">
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
              <p>{subcategoryError.message}</p>
              <button onClick={reloadSubcategories} className="retry-button">
                Retry
              </button>
            </div>
          ) : subcategories.length === 0 ? (
            <div className="taxonomy-empty">
              <p>No subcategories found for {layer}.{activeCategory}</p>
              <button onClick={reloadSubcategories} className="retry-button">
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
        </div>
      )}
    </div>
  );
};

export default SimpleTaxonomySelectionV2;