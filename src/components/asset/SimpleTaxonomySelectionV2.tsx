/**
 * SimpleTaxonomySelectionV2 Component
 * 
 * An improved version of the SimpleTaxonomySelection component
 * that uses the useTaxonomy hook for more reliable taxonomy selection.
 */
import React, { useState, useEffect } from 'react';
import { useTaxonomyContext } from '../../contexts/TaxonomyContext';
import { logger } from '../../utils/logger';
import { taxonomyService } from '../../services/simpleTaxonomyService';
import '../../styles/SimpleTaxonomySelection.css';

interface SimpleTaxonomySelectionV2Props {
  layer: string;
  onCategorySelect: (category: string, isDoubleClick?: boolean) => void;
  onSubcategorySelect: (subcategory: string, isDoubleClick?: boolean) => void;
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
    onCategorySelect(category, false);
    
    // Direct service call to load subcategories
    try {
      const subcats = taxonomyService.getSubcategories(layer, category);
      console.log(`Directly loaded subcategories for ${layer}.${category}:`, subcats);
      
      // Set subcategories in context
      selectCategory(category);
      if (subcats.length > 0) {
        console.log('Subcategories loaded successfully:', subcats.length);
      }
    } catch (error) {
      console.error('Error loading subcategories directly:', error);
    }
    
    // Keep the original method as a fallback
    setTimeout(() => {
      if (layer && category) {
        reloadSubcategories();
        logger.info(`Automatically loading subcategories for ${layer}.${category}`);
      }
    }, 50);
  };
  
  // Handle subcategory selection
  const handleSubcategorySelect = (subcategory: string, isDoubleClick?: boolean) => {
    // FIXED: Prevent duplicate selections
    if (subcategory === activeSubcategory) return;
    
    logger.info(`Subcategory selected: ${subcategory}`);
    setActiveSubcategory(subcategory);
    
    // Set in context but also dispatch directly to parent component
    selectSubcategory(subcategory);
    
    // Log more details to debug
    console.log(`Directly sending subcategory selection to parent: ${subcategory}`);
    console.log(`Current state: layer=${layer}, category=${activeCategory}, subcategory=${subcategory}`);
    
    // Ensure parent gets notified
    onSubcategorySelect(subcategory);
    
    // Force immediate rendering of selected state
    setTimeout(() => {
      // Re-set active subcategory in case it was cleared
      setActiveSubcategory(subcategory);
      console.log(`Reinforcing subcategory selection: ${subcategory}`);
    }, 10);
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
          
          {/* Add diagnostic logging before rendering subcategories */}
          {(() => {
            console.log('About to render subcategories:', {
              layer,
              activeCategory,
              subcategoriesFromContext: subcategories,
              directSubcategories: activeCategory ? taxonomyService.getSubcategories(layer, activeCategory) : []
            });
            return null;
          })()}
          
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
                    
                    // First try direct service call
                    try {
                      const directSubcats = taxonomyService.getSubcategories(layer, activeCategory);
                      console.log(`Retry: Directly loaded ${directSubcats.length} subcategories for ${layer}.${activeCategory}`);
                    } catch (error) {
                      console.error('Error in direct subcategory load during retry:', error);
                    }
                    
                    // Then also try the context approach as fallback
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
            (() => {
              // Try to get subcategories directly from the service if context is empty
              // IMPORTANT: Always call getSubcategories directly to ensure we get fresh data
              const directSubcategories = activeCategory ? 
                taxonomyService.getSubcategories(layer, activeCategory) : [];
              
              console.log(`[DIRECT] Got ${directSubcategories.length} subcategories for ${layer}.${activeCategory}`);
              
              // If we got subcategories directly, use them instead of showing empty state
              if (directSubcategories.length > 0) {
                console.log(`Using direct subcategories (${directSubcategories.length}) as fallback for ${layer}.${activeCategory}`);
                console.log(`First subcategory: ${directSubcategories[0].code} - ${directSubcategories[0].name}`);
                
                // Use the subcategories directly 
                // We don't have a direct method to set subcategories in context
                
                return (
                  <div className="taxonomy-items direct-fallback">
                    {/* Render subcategories directly from taxonomyService */}
                    {directSubcategories.map(subcategory => (
                      <div
                        key={subcategory.code}
                        className={`taxonomy-item ${activeSubcategory === subcategory.code ? 'active' : ''}`}
                        onClick={() => handleSubcategorySelect(subcategory.code)}
                        onDoubleClick={() => handleSubcategorySelect(subcategory.code, true)}
                        data-testid={`subcategory-${subcategory.code}`}
                      >
                        <div className="taxonomy-item-code">{subcategory.code}</div>
                        <div className="taxonomy-item-numeric">{subcategory.numericCode}</div>
                        <div className="taxonomy-item-name">{subcategory.name}</div>
                      </div>
                    ))}
                  </div>
                );
              }
              
              // Otherwise show the empty state
              return (
                <div className="taxonomy-empty">
                  <p>No subcategories found for {layer}.{activeCategory}</p>
                  <div style={{ fontSize: '12px', color: '#666', margin: '10px 0', padding: '8px', backgroundColor: '#f9f9f9', border: '1px solid #eee' }}>
                    <p>Debug Info: {JSON.stringify({
                      layer,
                      activeCategory,
                      subcategoriesState: subcategories.length,
                      contextSubcategories: subcategories,
                      directSubcategories: directSubcategories,
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
                        
                        // First try direct service call
                        try {
                          const directSubcats = taxonomyService.getSubcategories(layer, activeCategory);
                          console.log(`Retry: Directly loaded ${directSubcats.length} subcategories for ${layer}.${activeCategory}`);
                        } catch (error) {
                          console.error('Error in direct subcategory load during retry:', error);
                        }
                        
                        // Then also try the context approach as fallback
                        setTimeout(() => reloadSubcategories(), 50);
                        logger.info(`Retrying subcategory load for ${layer}.${activeCategory}`);
                      }
                    }} 
                    className="retry-button"
                  >
                    Retry
                  </button>
                </div>
              );
            })()
          ) : (
            (() => {
              // ALWAYS check if we have direct service data available for consistency
              const directSubcategories = activeCategory ? 
                taxonomyService.getSubcategories(layer, activeCategory) : [];
              
              console.log(`[SUBCATEGORY RENDER] Context subcategories: ${subcategories.length}, Direct subcategories: ${directSubcategories.length}`);
              
              // Determine which dataset to use
              let displaySubcategories = subcategories;
              let useDirectData = false;
              
              // If context data is empty but direct service has data, use direct service data
              if (subcategories.length === 0 && directSubcategories.length > 0) {
                displaySubcategories = directSubcategories;
                useDirectData = true;
                console.log(`[FALLBACK] Using direct subcategories instead of empty context data`);
              }
              
              // Return the actual subcategory rendering UI
              return (
                <div className={`taxonomy-items ${useDirectData ? 'using-direct-data' : ''}`}>
                  {displaySubcategories.map(subcategory => (
                    <div
                      key={subcategory.code}
                      className={`taxonomy-item ${activeSubcategory === subcategory.code ? 'active' : ''}`}
                      onClick={() => handleSubcategorySelect(subcategory.code)}
                      onDoubleClick={() => handleSubcategorySelect(subcategory.code, true)}
                      data-testid={`subcategory-${subcategory.code}`}
                    >
                      <div className="taxonomy-item-code">{subcategory.code}</div>
                      <div className="taxonomy-item-numeric">{subcategory.numericCode}</div>
                      <div className="taxonomy-item-name">{subcategory.name}</div>
                    </div>
                  ))}
                  {useDirectData && (
                    <div style={{ fontSize: '11px', color: '#666', margin: '8px 0', padding: '4px', backgroundColor: '#f0f8ff', border: '1px solid #d0e0ff', borderRadius: '4px' }}>
                      Using direct service data (fallback mode)
                    </div>
                  )}
                </div>
              );
            })()
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