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

// Memoized Subcategory Card Grid component with initializing indicator
const SubcategoriesGrid = React.memo(({
  subcategories,
  activeSubcategory,
  handleSubcategorySelect,
  dataSource
}: {
  subcategories: TaxonomyItem[];
  activeSubcategory: string | null;
  handleSubcategorySelect: (subcategory: string, isDoubleClick?: boolean) => void;
  dataSource?: string;
}) => {
  // Show a message for a brief moment while data is still being prepared
  const [showInitializing, setShowInitializing] = React.useState(true);
  
  // Hide the initializing message after a brief delay
  React.useEffect(() => {
    if (showInitializing) {
      const timer = setTimeout(() => {
        setShowInitializing(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showInitializing]);
  
  // If we just started showing this component and data is not yet available from any source,
  // show a brief loading indicator to prevent a flash of empty state
  if (showInitializing && subcategories.length === 0) {
    return (
      <div className="taxonomy-items initializing" style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gridTemplateRows: 'auto',
        gap: '12px',
        width: '100%'
      }}>
        <div style={{ 
          textAlign: 'center', 
          padding: '20px', 
          color: '#666',
          width: '100%',
          gridColumn: '1 / -1'  // Span all columns
        }}>
          <div style={{ fontSize: '14px', marginBottom: '10px' }}>
            Initializing subcategories...
          </div>
          <div style={{ 
            width: '50px', 
            height: '6px', 
            background: '#f0f0f0', 
            borderRadius: '3px',
            margin: '0 auto',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '30%',
              background: '#1976d2',
              borderRadius: '3px',
              animation: 'loadingAnimation 1.5s infinite ease-in-out'
            }} />
          </div>
          <style>{`
            @keyframes loadingAnimation {
              0% { left: -30%; }
              100% { left: 100%; }
            }
          `}</style>
        </div>
      </div>
    );
  }
  
  // Once initialization is complete, show the regular content with explicit grid layout
  return (
    <div className="taxonomy-items" style={{ 
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
      gridTemplateRows: 'auto',
      gridAutoFlow: 'row',
      gridAutoRows: 'auto',
      gap: '12px',
      width: '100%'
    }}>
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
      
      {/* Add a hint to show when subcategories load but before interaction */}
      {subcategories.length > 0 && !activeSubcategory && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          right: '10px',
          background: 'rgba(25, 118, 210, 0.1)',
          color: '#1976d2',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '13px',
          fontWeight: 'bold',
          textAlign: 'center',
          pointerEvents: 'none', // Don't block clicks
          zIndex: 1
        }}>
          Select a subcategory to continue
        </div>
      )}
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
  
  // Debounce timer references
  const categoryDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const subcategoryDebounceRef = useRef<NodeJS.Timeout | null>(null);
  
  // ENHANCED: Initial setup - run only once but with improved reliability
  useEffect(() => {
    if (layer) {
      // Log less in production for performance
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[INIT] Initial setup for layer ${layer}, initialSetupRef=${initialSetupRef.current}, selected category=${selectedCategory || 'none'}`);
      }
      
      // STEP 1: Always call selectLayer to ensure context is updated
      selectLayer(layer);
      
      // STEP 2: Always try loading categories directly first for immediate feedback
      try {
        const directCategories = taxonomyService.getCategories(layer);
        if (directCategories && directCategories.length > 0) {
          if (process.env.NODE_ENV !== 'production') {
            console.log(`[INIT] Direct category load successful: ${directCategories.length} categories`);
          }
        }
      } catch (error) {
        console.error('[INIT] Error during direct category load:', error);
      }
      
      // STEP 3: Always reload categories from context to ensure consistency
      reloadCategories();
      
      // STEP 4: Immediate initialization with direct service calls
      const loadCategoriesDirectly = () => {
        try {
          const directCats = taxonomyService.getCategories(layer);
          if (directCats && directCats.length > 0) {
            // Force render update with direct categories
            // This is what prevents needing to click "Retry"
            const categoryEvent = new CustomEvent('taxonomyCategoriesLoaded', {
              detail: { layer, categories: directCats }
            });
            window.dispatchEvent(categoryEvent);
            return directCats;
          }
        } catch (e) {
          console.warn('[INIT] Direct category load failed:', e);
        }
        return [];
      };
      
      // Always load categories directly for immediate response
      const directCats = loadCategoriesDirectly();
      
      // STEP 5: If first time initialization or forced refresh needed
      if (!initialSetupRef.current) {
        initialSetupRef.current = true;
        
        // Use tiered approach with multiple fallbacks
        // Tier 1: Immediate load (already done above)
        // Tier 2: Short timeout for context to catch up
        const shortTimer = setTimeout(() => {
          // If categories still not loaded in context but we have direct ones, use them
          if (categories.length === 0 && directCats.length > 0) {
            // Force another render update with direct categories
            const categoryEvent = new CustomEvent('taxonomyCategoriesLoaded', {
              detail: { layer, categories: directCats }
            });
            window.dispatchEvent(categoryEvent);
          }
          
          // If category is also provided, load subcategories
          if (selectedCategory) {
            selectCategory(selectedCategory);
            
            // Try direct load first
            try {
              const directSubcats = taxonomyService.getSubcategories(layer, selectedCategory);
              if (directSubcats && directSubcats.length > 0) {
                // Store for immediate use
                subcategoriesRef.current = [...directSubcats];
                setLocalSubcategories([...directSubcats]);
              }
            } catch (e) {
              console.warn('[INIT] Direct subcategory load on short timer failed:', e);
            }
            
            // Also try context path
            reloadSubcategories();
          }
        }, 50);
        
        // Tier 3: Medium timeout as final safety check
        const mediumTimer = setTimeout(() => {
          // Last chance to ensure categories are loaded
          if (categories.length === 0) {
            // Try one more direct load
            const lastChanceCats = loadCategoriesDirectly();
            
            // If still nothing from direct load, force a context reload
            if (lastChanceCats.length === 0) {
              reloadCategories();
            }
          }
          
          // Same for subcategories if needed
          if (selectedCategory && subcategories.length === 0 && 
              localSubcategories.length === 0 && subcategoriesRef.current.length === 0) {
            try {
              const lastChanceSubcats = taxonomyService.getSubcategories(layer, selectedCategory);
              if (lastChanceSubcats && lastChanceSubcats.length > 0) {
                subcategoriesRef.current = [...lastChanceSubcats];
                setLocalSubcategories([...lastChanceSubcats]);
              }
            } catch (e) {
              console.warn('[INIT] Last chance subcategory load failed:', e);
            }
            
            // Force a final context reload
            reloadSubcategories();
          }
        }, 150);
        
        // Clean up timers
        return () => {
          clearTimeout(shortTimer);
          clearTimeout(mediumTimer);
        };
      } 
      // STEP 6: If not first time but selectedCategory provided, ensure subcategories
      else if (selectedCategory) {
        // Check if subcategories need to be loaded
        if (subcategories.length === 0 && directSubcategories.length === 0 && 
            localSubcategories.length === 0 && subcategoriesRef.current.length === 0) {
          
          selectCategory(selectedCategory);
          
          // Immediate load attempt
          try {
            const directSubcats = taxonomyService.getSubcategories(layer, selectedCategory);
            if (directSubcats && directSubcats.length > 0) {
              // Store subcategories for immediate use
              subcategoriesRef.current = [...directSubcats];
              setLocalSubcategories([...directSubcats]);
            }
          } catch (error) {
            console.error('[INIT] Error during direct subcategory load:', error);
          }
          
          // Also try context path
          reloadSubcategories();
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer, selectedCategory]); // Depends on both layer and selectedCategory changes
  
  // Improved layer change handler - more reliable, less debouncing
  useEffect(() => {
    if (!layer) return;
    
    // STEP 1: Cancel any in-progress category loads
    if (categoryDebounceRef.current) {
      clearTimeout(categoryDebounceRef.current);
      categoryDebounceRef.current = null;
    }
    
    // STEP 2: Update context immediately
    selectLayer(layer);
    
    // STEP 3: Load categories using direct service call for immediate feedback
    try {
      const directCategories = taxonomyService.getCategories(layer);
      if (directCategories && directCategories.length > 0) {
        // If we got immediate results, use a custom event to notify any listeners
        const categoryEvent = new CustomEvent('taxonomyCategoriesLoaded', {
          detail: { layer, categories: directCategories }
        });
        window.dispatchEvent(categoryEvent);
        
        // If we already have categories in context, we don't need to continue
        if (categories.length > 0) {
          return;
        }
      }
    } catch (error) {
      console.error('Error during direct category load:', error);
    }
    
    // STEP 4: Also request categories from context for consistency
    reloadCategories();
    
    // STEP 5: Set up a safety check to ensure categories are loaded
    const safetyCheckTimer = setTimeout(() => {
      // If still no categories, try again using both approaches
      if (categories.length === 0) {
        // Try direct service call first
        try {
          const safetyCategories = taxonomyService.getCategories(layer);
          if (safetyCategories && safetyCategories.length > 0) {
            // Notify listeners
            const categoryEvent = new CustomEvent('taxonomyCategoriesLoaded', {
              detail: { layer, categories: safetyCategories }
            });
            window.dispatchEvent(categoryEvent);
          }
        } catch (error) {
          console.error('Error during safety direct category load:', error);
        }
        
        // Also try context
        reloadCategories();
      }
    }, 150);  // Longer timeout for safety check
    
    return () => {
      clearTimeout(safetyCheckTimer);
      if (categoryDebounceRef.current) {
        clearTimeout(categoryDebounceRef.current);
        categoryDebounceRef.current = null;
      }
    };
  }, [layer, selectLayer, reloadCategories, categories.length]);
  
  // When layer changes, reset active category and subcategory states
  useEffect(() => {
    setActiveCategory(null);
    setActiveSubcategory(null);
  }, [layer]);
  
  // Improved selectedCategory change handler with immediate loading
  useEffect(() => {
    if (!selectedCategory || selectedCategory === activeCategory) return;
    
    // STEP 1: Update local state immediately
    setActiveCategory(selectedCategory);
    
    // STEP 2: Cancel any in-progress subcategory loads
    if (subcategoryDebounceRef.current) {
      clearTimeout(subcategoryDebounceRef.current);
      subcategoryDebounceRef.current = null;
    }
    
    // Only continue if we have both layer and selectedCategory
    if (!layer) return;
    
    // STEP 3: Update context
    selectCategory(selectedCategory);
    
    // STEP 4: Try direct service call for immediate feedback
    try {
      const directSubcategories = taxonomyService.getSubcategories(layer, selectedCategory);
      if (directSubcategories && directSubcategories.length > 0) {
        // Store in local state and ref for immediate access
        subcategoriesRef.current = [...directSubcategories];
        setLocalSubcategories([...directSubcategories]);
        
        // Also notify any listeners
        const subcategoryEvent = new CustomEvent('taxonomySubcategoriesLoaded', {
          detail: { layer, category: selectedCategory, subcategories: directSubcategories }
        });
        window.dispatchEvent(subcategoryEvent);
      }
    } catch (error) {
      console.error('Error during direct subcategory load:', error);
    }
    
    // STEP 5: Also request subcategories from context for consistency
    reloadSubcategories();
    
    // STEP 6: Set up a safety check to ensure subcategories are loaded
    const safetyCheckTimer = setTimeout(() => {
      // If still no subcategories from any source, try again
      if (subcategories.length === 0 && directSubcategories.length === 0 && 
          localSubcategories.length === 0 && subcategoriesRef.current.length === 0) {
        
        // Try direct service call first
        try {
          const safetySubcategories = taxonomyService.getSubcategories(layer, selectedCategory);
          if (safetySubcategories && safetySubcategories.length > 0) {
            // Store for immediate access
            subcategoriesRef.current = [...safetySubcategories];
            setLocalSubcategories([...safetySubcategories]);
            
            // Notify listeners
            const subcategoryEvent = new CustomEvent('taxonomySubcategoriesLoaded', {
              detail: { layer, category: selectedCategory, subcategories: safetySubcategories }
            });
            window.dispatchEvent(subcategoryEvent);
          }
        } catch (error) {
          console.error('Error during safety direct subcategory load:', error);
        }
        
        // Also try context
        reloadSubcategories();
      }
    }, 150);  // Longer timeout for safety check
    
    return () => {
      clearTimeout(safetyCheckTimer);
      if (subcategoryDebounceRef.current) {
        clearTimeout(subcategoryDebounceRef.current);
        subcategoryDebounceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, activeCategory, layer, selectCategory, reloadSubcategories, subcategories.length, localSubcategories.length]);
  
  // We've optimized the category loading directly in the initialization code
  
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
    
    // IMPORTANT: Track the fetch attempt and result for debugging
    console.log(`Direct subcategories fetch for ${layer}.${activeCategory} started`);
    const results = getDirectSubcategories(layer, activeCategory);
    console.log(`Direct subcategories fetch returned ${results.length} items`);
    
    // If we got results, save them to the local state and ref as a backup
    if (results.length > 0) {
      // Update the ref immediately for synchronous access
      subcategoriesRef.current = results;
      
      // Schedule a state update (which is asynchronous)
      setTimeout(() => {
        setLocalSubcategories(results);
        console.log(`Updated local subcategories backup with ${results.length} items`);
      }, 0);
    } else if (localSubcategories.length > 0) {
      // If direct fetch fails but we have local backup, log it
      console.log(`Using ${localSubcategories.length} items from local subcategories backup`);
    } else if (subcategoriesRef.current.length > 0) {
      // If direct fetch fails but we have ref backup, log it
      console.log(`Using ${subcategoriesRef.current.length} items from subcategories ref backup`);
      
      // Also update the state with the ref data for consistency
      setTimeout(() => {
        setLocalSubcategories(subcategoriesRef.current);
        console.log(`Updated local subcategories from ref with ${subcategoriesRef.current.length} items`);
      }, 0);
    }
    
    return results;
  }, [layer, activeCategory, getDirectSubcategories, localSubcategories.length]);

  // When selectedSubcategory changes from props, update the active subcategory
  useEffect(() => {
    console.log(`[PROP SYNC] selectedSubcategory prop changed to: ${selectedSubcategory}, activeSubcategory state: ${activeSubcategory}`);
    
    if (selectedSubcategory && selectedSubcategory !== activeSubcategory) {
      console.log(`[PROP SYNC] Updating activeSubcategory state to match prop: ${selectedSubcategory}`);
      setActiveSubcategory(selectedSubcategory);
      
      // If we have no subcategories loaded but a subcategory is selected, try to recover data
      if (subcategories.length === 0 && directSubcategories.length === 0 &&
          localSubcategories.length === 0 && subcategoriesRef.current.length === 0) {
        console.log(`[PROP SYNC] No subcategory data available, trying emergency load for ${layer}.${activeCategory}`);
        
        if (layer && activeCategory) {
          try {
            // Emergency direct fetch attempt 
            const emergencySubcategories = taxonomyService.getSubcategories(layer, activeCategory);
            if (emergencySubcategories.length > 0) {
              console.log(`[PROP SYNC] Emergency fetch successful, got ${emergencySubcategories.length} items`);
              
              // Update backup stores - use setTimeout for state to avoid render cycles
              subcategoriesRef.current = [...emergencySubcategories];
              setTimeout(() => {
                setLocalSubcategories([...emergencySubcategories]);
              }, 0);
            }
          } catch (e) {
            console.warn(`[PROP SYNC] Emergency fetch failed:`, e);
          }
        }
      }
    }
  }, [selectedSubcategory, activeSubcategory, subcategories.length, directSubcategories.length, 
      localSubcategories.length, layer, activeCategory]);
  
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
  
  // Handle subcategory selection - PERFORMANCE OPTIMIZED WITH EXTREME RELIABILITY
  const handleSubcategorySelect = useCallback((subcategory: string, isDoubleClick?: boolean) => {
    // Track performance in development
    if (process.env.NODE_ENV === 'development') {
      performance.mark('subcategory-select-start');
    }
    
    // Prevent duplicate selections but handle double-click special case
    if (subcategory === activeSubcategory && !isDoubleClick) return;
    
    console.log(`[SUB SELECT] Subcategory selection started: ${subcategory}, double-click: ${isDoubleClick}`);
    
    // STEP 1: Update local state IMMEDIATELY for responsive UI feedback
    setActiveSubcategory(subcategory);
    console.log(`[SUB SELECT] Local state updated: activeSubcategory = ${subcategory}`);

    // STEP 2: Update context in parallel (but don't depend on its completion)
    selectSubcategory(subcategory);
    console.log(`[SUB SELECT] Context update requested for subcategory = ${subcategory}`);
    
    // STEP 3: Store in session storage for backup persistence (multiple layers of redundancy)
    try {
      if (activeCategory) {
        // Batch write multiple related keys at once for better efficiency
        const storageUpdates = {
          // Store at multiple scopes for easier recovery later
          [`selectedSubcategory_${layer}_${activeCategory}`]: subcategory,
          [`lastActiveSubcategory`]: subcategory,
          [`lastActivePair_${layer}`]: `${activeCategory}:${subcategory}`,
          // Also store as JSON with full details for better recovery
          [`subcategoryDetails_${layer}_${activeCategory}_${subcategory}`]: JSON.stringify({
            code: subcategory,
            timestamp: Date.now(),
            layer,
            category: activeCategory
          })
        };
        
        // Execute all storage writes together
        Object.entries(storageUpdates).forEach(([key, value]) => {
          sessionStorage.setItem(key, value);
        });
        
        console.log(`[SUB SELECT] Session storage updated with ${Object.keys(storageUpdates).length} backup records`);
      }
    } catch (e) {
      // Just log the error but don't let it block
      console.warn('[SUB SELECT] Storage backup failed:', e);
    }

    // STEP 4: Find the subcategory details, checking MULTIPLE sources for resilience
    console.log(`[SUB SELECT] Searching for subcategory details from ${subcategories.length} context items, ${directSubcategories.length} direct items, ${localSubcategories.length} local items, ${subcategoriesRef.current.length} ref items`);
    
    // Create a function to find details with extensive logging
    const findSubcategoryDetails = () => {
      // Look for the subcategory in various sources in order of preference
      let source = "none";
      let details = null;
      
      // First try context subcategories (standard path)
      if (subcategories.length > 0) {
        details = subcategories.find(s => s.code === subcategory);
        if (details) {
          source = "context";
          console.log(`[SUB SELECT] Found details in context subcategories`);
          return {details, source};
        }
      }
      
      // Next try direct service-fetched subcategories 
      if (directSubcategories.length > 0) {
        details = directSubcategories.find(s => s.code === subcategory);
        if (details) {
          source = "direct";
          console.log(`[SUB SELECT] Found details in direct subcategories`);
          return {details, source};
        }
      }
      
      // Next try local state backup
      if (localSubcategories.length > 0) {
        details = localSubcategories.find(s => s.code === subcategory);
        if (details) {
          source = "local";
          console.log(`[SUB SELECT] Found details in local subcategories backup`);
          return {details, source};
        }
      }
      
      // Next try ref backup
      if (subcategoriesRef.current.length > 0) {
        details = subcategoriesRef.current.find(s => s.code === subcategory);
        if (details) {
          source = "ref";
          console.log(`[SUB SELECT] Found details in ref subcategories backup`);
          return {details, source};
        }
      }
      
      // Finally try direct service fetch one more time, just in case
      try {
        console.log(`[SUB SELECT] Last resort: direct service fetch for ${layer}.${activeCategory}.${subcategory}`);
        if (layer && activeCategory) {
          const lastResortSubcategories = taxonomyService.getSubcategories(layer, activeCategory);
          if (lastResortSubcategories.length > 0) {
            details = lastResortSubcategories.find(s => s.code === subcategory);
            if (details) {
              source = "last-resort-fetch";
              console.log(`[SUB SELECT] Found details in last resort service fetch`);
              return {details, source};
            }
          }
        }
      } catch (e) {
        console.warn('[SUB SELECT] Last resort fetch failed:', e);
      }
      
      // Create synthetic details if nothing found
      console.warn(`[SUB SELECT] No subcategory details found, creating synthetic entry`);
      source = "synthetic";
      details = {
        code: subcategory,
        name: subcategory.replace(/_/g, ' '),
        numericCode: String(Math.floor(Math.random() * 900) + 100) // Generate a random 3-digit code as fallback
      };
      
      return {details, source};
    };
    
    // Get details with source tracking
    const {details: subcategoryDetails, source: detailsSource} = findSubcategoryDetails();
    console.log(`[SUB SELECT] Using subcategory details from source: ${detailsSource}`);
    
    // STEP 5: Notify parent component 
    console.log(`[SUB SELECT] Notifying parent with subcategory: ${subcategory}, double-click: ${isDoubleClick}`);
    onSubcategorySelect(subcategory, isDoubleClick);

    // STEP 6: CRITICAL - Create multiple REDUNDANT backups of subcategory data
    // This prevents the "disappearing subcategory" bug by ensuring we always have data
    
    // 6a. Update ref first (most reliable, doesn't trigger re-renders)
    let backupSourceData: TaxonomyItem[] | null = null;
    if (subcategories.length > 0) {
      backupSourceData = subcategories;
      subcategoriesRef.current = [...subcategories]; // Clone to ensure independence
      console.log(`[SUB SELECT] Updated ref backup with ${subcategories.length} items from context`);
    } else if (directSubcategories.length > 0) {
      backupSourceData = directSubcategories;
      subcategoriesRef.current = [...directSubcategories]; // Clone to ensure independence
      console.log(`[SUB SELECT] Updated ref backup with ${directSubcategories.length} items from direct fetch`);
    } else if (localSubcategories.length > 0) {
      // If we only have local data, still keep the ref updated
      subcategoriesRef.current = [...localSubcategories]; // Clone to ensure independence
      console.log(`[SUB SELECT] Updated ref backup with ${localSubcategories.length} items from local state`);
    }
    
    // 6b. Schedule delayed local state update to ensure race conditions don't cause losses
    // This uses a timeout to decouple from the current event loop cycle
    if (backupSourceData) {
      const sourceData = backupSourceData; // Create a non-null reference
      setTimeout(() => {
        console.log(`[SUB SELECT] Executing delayed local state update with ${sourceData.length} items`);
        setLocalSubcategories([...sourceData]); // Clone to ensure independence
      }, 0);
    }
    
    // 6c. As a last resort, if we have a single good subcategory but no list, create a synthetic list
    if (!backupSourceData && subcategoryDetails) {
      const syntheticList = [subcategoryDetails];
      console.log(`[SUB SELECT] Creating synthetic subcategory list with single item`);
      
      // Update both ref and state (state via timeout to avoid race conditions)
      subcategoriesRef.current = syntheticList;
      setTimeout(() => {
        setLocalSubcategories(syntheticList);
      }, 0);
    }
    
    // STEP 7: Report performance metrics (development mode only)
    if (process.env.NODE_ENV === 'development') {
      performance.mark('subcategory-select-end');
      performance.measure('Subcategory Selection Time', 'subcategory-select-start', 'subcategory-select-end');
      const measurements = performance.getEntriesByName('Subcategory Selection Time');
      console.log(`[SUB SELECT] Selection completed in ${measurements[0]?.duration.toFixed(2)}ms`);
    }
  }, [activeCategory, activeSubcategory, directSubcategories, layer, localSubcategories, onSubcategorySelect, selectSubcategory, subcategories]);
  
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
  
  // ENHANCED with multi-tiered fallback for subcategory display
  const displaySubcategoriesData = useMemo(() => {
    console.log(`[DISPLAY] Computing which subcategories to display for ${layer}.${activeCategory}`);
    console.log(`[DISPLAY] Available sources: ${subcategories.length} context, ${directSubcategories.length} direct, ${localSubcategories.length} local, ${subcategoriesRef.current.length} ref`);
    
    // TIER 1: If context has subcategories, use them (preferred source)
    if (subcategories.length > 0) {
      console.log(`[DISPLAY] Using ${subcategories.length} subcategories from context (primary source)`);
      
      // Also update our backup stores for future resilience
      if (subcategoriesRef.current.length === 0) {
        subcategoriesRef.current = [...subcategories];
      }
      
      // Schedule a state update if needed (async to avoid render issues)
      if (localSubcategories.length === 0) {
        setTimeout(() => {
          console.log(`[DISPLAY] Updating local backup with ${subcategories.length} items from context`);
          setLocalSubcategories([...subcategories]);
        }, 0);
      }
      
      return { 
        displaySubcategories: subcategories, 
        dataSource: 'context', 
        useDirectData: false 
      };
    }
    
    // TIER 2: Try direct service call results (next most reliable)
    if (directSubcategories.length > 0) {
      console.log(`[DISPLAY] Using ${directSubcategories.length} subcategories from direct service call (fallback 1)`);
      
      // Update our backup stores for future resilience
      subcategoriesRef.current = [...directSubcategories];
      
      // Schedule a state update (async to avoid render issues)
      setTimeout(() => {
        console.log(`[DISPLAY] Updating local backup with ${directSubcategories.length} items from direct service`);
        setLocalSubcategories([...directSubcategories]);
      }, 0);
      
      return { 
        displaySubcategories: directSubcategories, 
        dataSource: 'direct', 
        useDirectData: true 
      };
    }
    
    // TIER 3: Try local state backup (previously computed results)
    if (localSubcategories.length > 0) {
      console.log(`[DISPLAY] Using ${localSubcategories.length} subcategories from local state backup (fallback 2)`);
      
      // Update ref backup for consistency
      if (subcategoriesRef.current.length === 0) {
        subcategoriesRef.current = [...localSubcategories];
      }
      
      return { 
        displaySubcategories: localSubcategories, 
        dataSource: 'local', 
        useDirectData: true 
      };
    }
    
    // TIER 4: Try reference backup (most persistent)
    if (subcategoriesRef.current.length > 0) {
      console.log(`[DISPLAY] Using ${subcategoriesRef.current.length} subcategories from ref backup (fallback 3)`);
      
      // Update local state for future consistency
      setTimeout(() => {
        console.log(`[DISPLAY] Updating local state with ${subcategoriesRef.current.length} items from ref`);
        setLocalSubcategories([...subcategoriesRef.current]);
      }, 0);
      
      return { 
        displaySubcategories: subcategoriesRef.current, 
        dataSource: 'ref', 
        useDirectData: true 
      };
    }
    
    // TIER 5: Last resort - try a direct fetch again right now (might be redundant but worth trying)
    if (layer && activeCategory) {
      try {
        console.log(`[DISPLAY] Emergency: Making one last direct fetch attempt for ${layer}.${activeCategory}`);
        const emergencyFetch = taxonomyService.getSubcategories(layer, activeCategory);
        
        if (emergencyFetch.length > 0) {
          console.log(`[DISPLAY] Emergency fetch successful! Got ${emergencyFetch.length} items`);
          
          // Update all backups
          subcategoriesRef.current = [...emergencyFetch];
          setTimeout(() => {
            setLocalSubcategories([...emergencyFetch]);
          }, 0);
          
          return {
            displaySubcategories: emergencyFetch,
            dataSource: 'emergency-fetch',
            useDirectData: true
          };
        }
      } catch (e) {
        console.warn('[DISPLAY] Emergency fetch failed:', e);
      }
    }
    
    // TIER 6: Complete failure - no subcategories available from any source
    console.warn(`[DISPLAY] All sources failed! No subcategories available for ${layer}.${activeCategory}`);
    return { 
      displaySubcategories: [], 
      dataSource: 'none', 
      useDirectData: false 
    };
  }, [layer, activeCategory, subcategories, directSubcategories, localSubcategories]);
  
  // Create a debug info element for empty subcategories state
  const subcategoryDebugInfo = useMemo(() => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    // Create a more readable debug info display
    const debugData = {
      layer,
      activeCategory,
      subcategoriesState: subcategories.length,
      directSubcategories: directSubcategories.length,
      localBackup: localSubcategories.length,
      refBackup: subcategoriesRef.current.length,
      isLoadingSubcategories,
      hasSubcategoryError: !!subcategoryError,
      error: subcategoryError ? String(subcategoryError) : null
    };
    
    return (
      <div style={{ 
        fontSize: '12px', 
        color: '#666', 
        margin: '10px 0', 
        padding: '12px', 
        backgroundColor: '#f9f9f9', 
        border: '1px solid #eee',
        borderRadius: '4px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Debugging Information</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {Object.entries(debugData).map(([key, value]) => (
              <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '4px 8px', fontWeight: 'bold', color: '#555' }}>{key}:</td>
                <td style={{ padding: '4px 8px' }}>{
                  typeof value === 'object' 
                    ? JSON.stringify(value) 
                    : String(value)
                }</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: '8px', color: '#999', fontSize: '11px' }}>
          Layer: {layer} | Category: {activeCategory || 'none'} | Component ID: {Math.random().toString(36).substr(2, 9)}
        </div>
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
            <div 
              className={`taxonomy-items ${displaySubcategoriesData.useDirectData ? 'using-direct-data' : ''}`}
              style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '12px',
                width: '100%'
              }}
            >
              <SubcategoriesGrid
                subcategories={displaySubcategoriesData.displaySubcategories}
                activeSubcategory={activeSubcategory}
                handleSubcategorySelect={handleSubcategorySelect}
                dataSource={displaySubcategoriesData.dataSource}
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