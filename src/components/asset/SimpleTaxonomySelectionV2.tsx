/**
 * SimpleTaxonomySelectionV2 Component
 * 
 * An improved version of the SimpleTaxonomySelection component
 * that uses the useTaxonomy hook for more reliable taxonomy selection.
 * Optimized for performance with memoization and reduced re-renders.
 */
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTaxonomyContext } from '../../contexts/TaxonomyContext';
import { logger } from '../../utils/logger';
import { taxonomyService } from '../../services/simpleTaxonomyService';
import { TaxonomyItem } from '../../types/taxonomy.types';
import '../../styles/SimpleTaxonomySelection.css';

interface SimpleTaxonomySelectionV2Props {
  layer: string;
  onCategorySelect: (category: string, isDoubleClick?: boolean) => void;
  onSubcategorySelect: (subcategory: string, isDoubleClick?: boolean) => void;
  selectedCategory?: string;
  selectedSubcategory?: string;
}

// Memoized TaxonomyItem component to prevent unnecessary re-renders
const TaxonomyItemComponent = React.memo(({ 
  item, 
  isActive, 
  onClick, 
  onDoubleClick, 
  dataTestId 
}: { 
  item: TaxonomyItem; 
  isActive: boolean; 
  onClick: () => void; 
  onDoubleClick?: () => void;
  dataTestId: string;
}) => {
  return (
    <div
      className={`taxonomy-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      data-testid={dataTestId}
    >
      <div className="taxonomy-item-code">{item.code}</div>
      <div className="taxonomy-item-numeric">{item.numericCode}</div>
      <div className="taxonomy-item-name">{item.name}</div>
    </div>
  );
});

// Memoized Category Card Grid component
const CategoriesGrid = React.memo(({
  categories,
  activeCategory,
  handleCategorySelect
}: {
  categories: TaxonomyItem[];
  activeCategory: string | null;
  handleCategorySelect: (category: string) => void;
}) => {
  return (
    <div className="taxonomy-items">
      {categories.map(category => (
        <TaxonomyItemComponent
          key={category.code}
          item={category}
          isActive={activeCategory === category.code}
          onClick={() => handleCategorySelect(category.code)}
          dataTestId={`category-${category.code}`}
        />
      ))}
    </div>
  );
});

// Memoized Subcategory Card Grid component
const SubcategoriesGrid = React.memo(({
  subcategories,
  activeSubcategory,
  handleSubcategorySelect
}: {
  subcategories: TaxonomyItem[];
  activeSubcategory: string | null;
  handleSubcategorySelect: (subcategory: string, isDoubleClick?: boolean) => void;
}) => {
  return (
    <div className="taxonomy-items">
      {subcategories.map(subcategory => (
        <TaxonomyItemComponent
          key={subcategory.code}
          item={subcategory}
          isActive={activeSubcategory === subcategory.code}
          onClick={() => handleSubcategorySelect(subcategory.code)}
          onDoubleClick={() => handleSubcategorySelect(subcategory.code, true)}
          dataTestId={`subcategory-${subcategory.code}`}
        />
      ))}
    </div>
  );
});

// Loading state component
const LoadingState = React.memo(({ message }: { message: string }) => (
  <div className="taxonomy-loading">{message}</div>
));

// Error state component with retry button
const ErrorState = React.memo(({ 
  error, 
  onRetry 
}: { 
  error: Error | null; 
  onRetry: () => void;
}) => (
  <div className="taxonomy-error">
    <p>{String(error)}</p>
    <button onClick={onRetry} className="retry-button">
      Retry
    </button>
  </div>
));

// Empty state component with retry button
const EmptyState = React.memo(({ 
  message, 
  onRetry,
  debugInfo
}: { 
  message: string; 
  onRetry: () => void;
  debugInfo?: React.ReactNode;
}) => (
  <div className="taxonomy-empty">
    <p>{message}</p>
    {debugInfo}
    <button onClick={onRetry} className="retry-button">
      Retry
    </button>
  </div>
));

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
  
  // Only use state when we need to track changes not in context
  const [activeCategory, setActiveCategory] = useState<string | null>(selectedCategory || null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(selectedSubcategory || null);
  
  // Local backup storage for subcategories
  const [localSubcategories, setLocalSubcategories] = useState<TaxonomyItem[]>([]);
  const subcategoriesRef = useRef<TaxonomyItem[]>([]);
  
  // Prevent duplicate data loads with a ref
  const initialSetupRef = useRef<boolean>(false);
  const isInitialCategoryLoadRef = useRef<boolean>(true);
  
  // Debounce timer references
  const categoryDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const subcategoryDebounceRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initial setup - run only once and optimize with ref check
  useEffect(() => {
    if (layer && !initialSetupRef.current) {
      initialSetupRef.current = true;
      logger.info(`SimpleTaxonomySelectionV2: Initial setup for layer ${layer}`);
      
      // Clear any previous state
      selectLayer(layer);
      
      // Force reload immediately
      const timer = setTimeout(() => {
        // Try to load categories directly first for immediate response
        try {
          const directCategories = taxonomyService.getCategories(layer);
          if (directCategories && directCategories.length > 0) {
            logger.info(`Direct category load successful: ${directCategories.length} categories`);
          }
        } catch (error) {
          console.error('Error during direct category load:', error);
        }
        
        // Also use context for consistency
        reloadCategories();
        logger.info(`Initial load of categories for layer: ${layer}`);
        
        // If category is also provided, load subcategories
        if (selectedCategory) {
          selectCategory(selectedCategory);
          reloadSubcategories();
          logger.info(`Initial load of subcategories for ${layer}.${selectedCategory}`);
        }
        
        // Set up an auto-retry timer if categories don't load within a reasonable time
        const retryTimer = setTimeout(() => {
          if (categories.length === 0) {
            logger.info('Auto-retry: No categories loaded, trying again...');
            reloadCategories();
          }
        }, 500);
        
        return () => clearTimeout(retryTimer);
      }, 0);
      
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer]); // Only depends on layer changing
  
  // When layer changes, update the selected layer in the taxonomy hook
  // Use debouncing to prevent rapid/multiple calls
  useEffect(() => {
    if (layer) {
      // Clear any previous debounce timer
      if (categoryDebounceRef.current) {
        clearTimeout(categoryDebounceRef.current);
      }
      
      logger.info(`SimpleTaxonomySelectionV2: Setting layer to ${layer}`);
      selectLayer(layer);
      
      // Debounce the categories reload to prevent multiple rapid calls
      categoryDebounceRef.current = setTimeout(() => {
        if (layer) {
          // Try direct service call first for immediate response
          try {
            const directCategories = taxonomyService.getCategories(layer);
            console.log(`Directly loaded ${directCategories.length} categories for layer ${layer}`);
            // If categories are already loaded, we don't need to do anything else
            if (categories.length > 0) {
              console.log('Categories already loaded in context, skipping reload');
              return;
            }
          } catch (error) {
            console.error('Error during debounced direct category load:', error);
          }
          
          // Fall back to context reload
          reloadCategories();
          // Only log the first time to reduce console noise
          if (isInitialCategoryLoadRef.current) {
            logger.info(`Loading categories for layer: ${layer}`);
            isInitialCategoryLoadRef.current = false;
          }
          
          // Set up an auto-retry if categories don't load
          const retryTimer = setTimeout(() => {
            if (categories.length === 0) {
              logger.info('Auto-retry: Still no categories, trying again...');
              reloadCategories();
            }
          }, 300);
          
          // Clean up retry timer
          return () => clearTimeout(retryTimer);
        }
      }, 50);
    }
    
    return () => {
      if (categoryDebounceRef.current) {
        clearTimeout(categoryDebounceRef.current);
      }
    };
  }, [layer, selectLayer, reloadCategories, categories.length]);
  
  // When layer changes, reset active category and subcategory states
  useEffect(() => {
    setActiveCategory(null);
    setActiveSubcategory(null);
  }, [layer]);
  
  // When selectedCategory changes from props, update the active category
  // FIXED: Don't call selectCategory to prevent circular updates with parent
  useEffect(() => {
    if (selectedCategory && selectedCategory !== activeCategory) {
      setActiveCategory(selectedCategory);
      
      // Clear any previous debounce timer
      if (subcategoryDebounceRef.current) {
        clearTimeout(subcategoryDebounceRef.current);
      }
      
      // Debounce the subcategories reload
      subcategoryDebounceRef.current = setTimeout(() => {
        if (layer && selectedCategory) {
          selectCategory(selectedCategory); // Need to set in context
          reloadSubcategories();
          logger.info(`Loading subcategories for ${layer}.${selectedCategory} (from parent)`);
        }
      }, 100);
    }
    
    return () => {
      if (subcategoryDebounceRef.current) {
        clearTimeout(subcategoryDebounceRef.current);
      }
    };
  }, [selectedCategory, activeCategory, layer, selectCategory, reloadSubcategories]);
  
  // When selectedSubcategory changes from props, update the active subcategory
  useEffect(() => {
    if (selectedSubcategory && selectedSubcategory !== activeSubcategory) {
      setActiveSubcategory(selectedSubcategory);
    }
  }, [selectedSubcategory, activeSubcategory]);
  
  // Memoize the direct categories/subcategories fetch to prevent re-calculation on every render
  const getDirectCategories = useCallback((layer: string) => {
    if (!layer) return [];
    try {
      return taxonomyService.getCategories(layer);
    } catch (error) {
      console.error('Error getting direct categories:', error);
      return [];
    }
  }, []);
  
  const getDirectSubcategories = useCallback((layer: string, category: string | null) => {
    if (!layer || !category) return [];
    try {
      return taxonomyService.getSubcategories(layer, category);
    } catch (error) {
      console.error('Error getting direct subcategories:', error);
      return [];
    }
  }, []);
  
  // Memoize the subcategories based on the activeCategory
  const directSubcategories = useMemo(() => {
    if (!activeCategory) return [];
    return getDirectSubcategories(layer, activeCategory);
  }, [layer, activeCategory, getDirectSubcategories]);
  
  // Handle category selection with debouncing to prevent multiple rapid selections
  const handleCategorySelect = useCallback((category: string) => {
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
      
      // Store subcategories in local backup storage
      setLocalSubcategories(subcats);
      subcategoriesRef.current = subcats;
      
      // Set subcategories in context
      selectCategory(category);
    } catch (error) {
      console.error('Error loading subcategories directly:', error);
    }
    
    // Keep the original method as a fallback, but with debouncing
    if (subcategoryDebounceRef.current) {
      clearTimeout(subcategoryDebounceRef.current);
    }
    
    subcategoryDebounceRef.current = setTimeout(() => {
      if (layer && category) {
        reloadSubcategories();
      }
    }, 50);
  }, [activeCategory, layer, onCategorySelect, reloadSubcategories, selectCategory]);
  
  // Handle subcategory selection - TARGETED FIX FOR DISAPPEARING SUBCATEGORIES
  const handleSubcategorySelect = useCallback((subcategory: string, isDoubleClick?: boolean) => {
    // FIXED: Prevent duplicate selections
    if (subcategory === activeSubcategory) return;
    
    logger.info(`Subcategory selected: ${subcategory}`);
    
    // 1. Update local state first
    setActiveSubcategory(subcategory);

    // 2. Update context
    selectSubcategory(subcategory);

    // 3. Notify parent
    onSubcategorySelect(subcategory, isDoubleClick);

    // 4. Create a local cache of subcategories to prevent disappearance
    if (subcategories.length > 0) {
      setLocalSubcategories(subcategories);
      subcategoriesRef.current = subcategories;
    }
  }, [activeSubcategory, onSubcategorySelect, selectSubcategory, subcategories]);
  
  // Memoize the retry handlers to prevent recreation on every render
  const handleCategoryRetry = useCallback(() => {
    if (layer) {
      selectLayer(layer);
      // Add a small delay to ensure layer is set before reloading
      setTimeout(() => reloadCategories(), 50);
      logger.info(`Retrying category load for layer: ${layer}`);
    }
  }, [layer, reloadCategories, selectLayer]);
  
  const handleSubcategoryRetry = useCallback(() => {
    if (layer && activeCategory) {
      selectLayer(layer);
      selectCategory(activeCategory);
      
      // First try direct service call
      try {
        const directSubcats = taxonomyService.getSubcategories(layer, activeCategory);
        console.log(`Retry: Directly loaded ${directSubcats.length} subcategories for ${layer}.${activeCategory}`);
        
        // Store in local backup
        setLocalSubcategories(directSubcats);
        subcategoriesRef.current = directSubcats;
      } catch (error) {
        console.error('Error in direct subcategory load during retry:', error);
      }
      
      // Then also try the context approach as fallback
      setTimeout(() => reloadSubcategories(), 50);
      logger.info(`Retrying subcategory load for ${layer}.${activeCategory}`);
    }
  }, [activeCategory, layer, reloadSubcategories, selectCategory, selectLayer]);
  
  // Memoized determination of which subcategories to display, with fallbacks
  const displaySubcategoriesData = useMemo(() => {
    // If context has subcategories, use them
    if (subcategories.length > 0) {
      return { displaySubcategories: subcategories, dataSource: 'context', useDirectData: false };
    }
    
    // If context is empty, try local backup options in order of preference
    // First prefer direct service call (most reliable)
    if (directSubcategories.length > 0) {
      // Update our backup stores if needed
      if (localSubcategories.length === 0) {
        setLocalSubcategories(directSubcategories);
        subcategoriesRef.current = directSubcategories;
      }
      return { 
        displaySubcategories: directSubcategories, 
        dataSource: 'direct', 
        useDirectData: true 
      };
    }
    
    // Then try local state backup
    if (localSubcategories.length > 0) {
      return { 
        displaySubcategories: localSubcategories, 
        dataSource: 'local', 
        useDirectData: true 
      };
    }
    
    // Finally try reference backup
    if (subcategoriesRef.current.length > 0) {
      return { 
        displaySubcategories: subcategoriesRef.current, 
        dataSource: 'ref', 
        useDirectData: true 
      };
    }
    
    // No subcategories available from any source
    return { 
      displaySubcategories: [], 
      dataSource: 'none', 
      useDirectData: false 
    };
  }, [subcategories, directSubcategories, localSubcategories]);
  
  // Create a debug info element for empty subcategories state
  const subcategoryDebugInfo = useMemo(() => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return (
      <div style={{ fontSize: '12px', color: '#666', margin: '10px 0', padding: '8px', backgroundColor: '#f9f9f9', border: '1px solid #eee' }}>
        <p>Debug Info: {JSON.stringify({
          layer,
          activeCategory,
          subcategoriesState: subcategories.length,
          directSubcategories: directSubcategories.length,
          localBackup: localSubcategories.length,
          refBackup: subcategoriesRef.current.length,
          isLoadingSubcategories,
          hasSubcategoryError: !!subcategoryError,
          error: subcategoryError ? String(subcategoryError) : null
        }, null, 2)}</p>
      </div>
    );
  }, [
    layer, 
    activeCategory, 
    subcategories.length, 
    directSubcategories.length,
    localSubcategories.length, 
    isLoadingSubcategories, 
    subcategoryError
  ]);
  
  return (
    <div className="simple-taxonomy-selection">
      <div className="taxonomy-section">
        <h3 className="taxonomy-section-title">
          Select Category
          {layer && <span className="layer-indicator">Layer: {layer}</span>}
        </h3>
        
        {isLoadingCategories ? (
          <LoadingState message="Loading categories..." />
        ) : categoryError ? (
          <ErrorState 
            error={categoryError}
            onRetry={handleCategoryRetry}
          />
        ) : categories.length === 0 ? (
          <EmptyState 
            message={`No categories found for layer ${layer}`}
            onRetry={handleCategoryRetry}
          />
        ) : (
          <React.Fragment>
            <CategoriesGrid 
              categories={categories}
              activeCategory={activeCategory}
              handleCategorySelect={handleCategorySelect}
            />
            {categories.length === 0 && (
              <div style={{ textAlign: 'center', padding: '10px', fontSize: '12px', color: '#666' }}>
                Attempting to load categories directly...
              </div>
            )}
          </React.Fragment>
        )}
      </div>
      
      {activeCategory && (
        <div className="taxonomy-section">
          <h3 className="taxonomy-section-title">
            Select Subcategory
            {activeCategory && <span className="category-indicator">Category: {activeCategory}</span>}
          </h3>
          
          {isLoadingSubcategories ? (
            <LoadingState message="Loading subcategories..." />
          ) : subcategoryError ? (
            <ErrorState 
              error={subcategoryError}
              onRetry={handleSubcategoryRetry}
            />
          ) : displaySubcategoriesData.displaySubcategories.length === 0 ? (
            <EmptyState 
              message={`No subcategories found for ${layer}.${activeCategory}`}
              onRetry={handleSubcategoryRetry}
              debugInfo={subcategoryDebugInfo}
            />
          ) : (
            <div className={`taxonomy-items ${displaySubcategoriesData.useDirectData ? 'using-direct-data' : ''}`}>
              <SubcategoriesGrid
                subcategories={displaySubcategoriesData.displaySubcategories}
                activeSubcategory={activeSubcategory}
                handleSubcategorySelect={handleSubcategorySelect}
              />
              
              {displaySubcategoriesData.useDirectData && (
                <div style={{ 
                  fontSize: '11px', 
                  color: '#666', 
                  margin: '8px 0', 
                  padding: '4px', 
                  backgroundColor: '#f0f8ff', 
                  border: '1px solid #d0e0ff', 
                  borderRadius: '4px',
                  textAlign: 'center'
                }}>
                  Using {displaySubcategoriesData.dataSource} data source (fallback mode)
                </div>
              )}
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
      
      {/* Debug information - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <details className="taxonomy-debug">
          <summary>Debug Information</summary>
          <p>Layer: {layer}</p>
          <p>Categories: {categories.length} available</p>
          <p>Selected Category: {activeCategory}</p>
          <p>Subcategories: {subcategories.length} available (Context)</p>
          <p>Direct Subcategories: {directSubcategories.length} available</p>
          <p>Local Backup: {localSubcategories.length} available</p>
          <p>Selected Subcategory: {activeSubcategory}</p>
          <p>Data Source: {displaySubcategoriesData.dataSource}</p>
        </details>
      )}
    </div>
  );
};

export default React.memo(SimpleTaxonomySelectionV2);