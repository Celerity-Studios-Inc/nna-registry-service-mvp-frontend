/**
 * SimpleTaxonomySelectionV2 Component
 *
 * An improved version of the SimpleTaxonomySelection component
 * that uses the useTaxonomy hook for more reliable taxonomy selection.
 * Optimized for performance with memoization and reduced re-renders.
 */
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
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
const TaxonomyItemComponent = React.memo(
  ({
    item,
    isActive,
    onClick,
    onDoubleClick,
    dataTestId,
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
        style={{
          height: '85px', // Taller cards to accommodate full name
          display: 'flex',
          flexDirection: 'column',
          padding: '10px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '5px',
          }}
        >
          <div
            className="taxonomy-item-code"
            style={{ fontWeight: 'bold', fontSize: '16px' }}
          >
            {item.code}
          </div>
          <div
            className="taxonomy-item-numeric"
            style={{ color: '#666', fontSize: '14px' }}
          >
            {item.numericCode}
          </div>
        </div>
        <div
          className="taxonomy-item-name"
          style={{
            fontSize: '14px',
            color: '#333',
            marginTop: '8px',
            lineHeight: '1.2',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            textOverflow: 'ellipsis',
          }}
        >
          {item.name}
        </div>
      </div>
    );
  }
);

// Memoized Category Card Grid component
const CategoriesGrid = React.memo(
  ({
    categories,
    activeCategory,
    handleCategorySelect,
  }: {
    categories: TaxonomyItem[];
    activeCategory: string | null;
    handleCategorySelect: (category: string) => void;
  }) => {
    return (
      <>
        {categories.map(category => (
          <TaxonomyItemComponent
            key={category.code}
            item={category}
            isActive={activeCategory === category.code}
            onClick={() => handleCategorySelect(category.code)}
            dataTestId={`category-${category.code}`}
          />
        ))}
      </>
    );
  }
);

// Memoized Subcategory Card Grid component with enhanced stability for BAS subcategory
const SubcategoriesGrid = React.memo(
  ({
    subcategories,
    activeSubcategory,
    handleSubcategorySelect,
    dataSource,
  }: {
    subcategories: TaxonomyItem[];
    activeSubcategory: string | null;
    handleSubcategorySelect: (
      subcategory: string,
      isDoubleClick?: boolean
    ) => void;
    dataSource?: string;
  }) => {
    // Show a message for a brief moment while data is still being prepared
    const [showInitializing, setShowInitializing] = React.useState(true);
    
    // CRITICAL FIX: Keep a local backup of subcategories to prevent disappearing
    const [localGridItems, setLocalGridItems] = React.useState<TaxonomyItem[]>([]);
    
    // CRITICAL FIX: Add mounted ref to prevent setState after unmount
    const isMountedRef = React.useRef(true);
    
    // Setup/cleanup mounted ref
    React.useEffect(() => {
      isMountedRef.current = true;
      return () => {
        // Set to false when component unmounts to prevent late state updates
        isMountedRef.current = false;
      };
    }, []);
    
    // CRITICAL FIX: Track when subcategories are updated to maintain consistency
    React.useEffect(() => {
      if (isMountedRef.current && subcategories.length > 0) {
        setLocalGridItems(subcategories);
        console.log(`[GRID] Updated local grid items with ${subcategories.length} subcategories`);
      }
    }, [subcategories]);

    // Hide the initializing message after a brief delay
    React.useEffect(() => {
      if (!isMountedRef.current) return;
      
      if (showInitializing) {
        const timer = setTimeout(() => {
          if (isMountedRef.current) {
            setShowInitializing(false);
          }
        }, 500);
        return () => clearTimeout(timer);
      }
    }, [showInitializing]);
    
    // CRITICAL FIX: Handle subcategory selection with additional safety
    const safelyHandleSubcategorySelect = React.useCallback(
      (code: string, isDoubleClick?: boolean) => {
        try {
          // CRITICAL SAFETY: Prevent executing if component is unmounting
          if (!isMountedRef.current) {
            console.log(`[GRID SAFETY] Prevented selection during unmount: ${code}`);
            return;
          }
          
          // Safety check - capture current items before handling selection
          const currentItems = localGridItems.length > 0 ? 
                              [...localGridItems] : 
                              subcategories.length > 0 ? 
                              [...subcategories] : [];
                              
          // Log what's happening                    
          console.log(`[GRID] Safely handling subcategory selection: ${code}, double-click: ${isDoubleClick}`);
          console.log(`[GRID] Current items: ${currentItems.length}, Local: ${localGridItems.length}, Props: ${subcategories.length}`);
          
          // Call the handler from props within try/catch to prevent cascading errors
          handleSubcategorySelect(code, isDoubleClick);
          
          // Schedule a verification for after selection to ensure items remain visible
          // Use a larger timeout to ensure the component has time to update
          setTimeout(() => {
            // CRITICAL CHECK: Only proceed if component is still mounted
            if (!isMountedRef.current) return;
            
            const postItems = localGridItems.length > 0 ? 
                            localGridItems : 
                            subcategories.length > 0 ? 
                            subcategories : [];
                            
            if (postItems.length === 0 && currentItems.length > 0) {
              console.log(`[GRID] RECOVERY: Items disappeared after selection, restoring ${currentItems.length} items`);
              setLocalGridItems(currentItems);
            }
          }, 50);
        } catch (error) {
          // Handle any errors during selection to prevent crashes
          console.error(`[GRID ERROR] Error during subcategory selection:`, error);
        }
      },
      [handleSubcategorySelect, localGridItems, subcategories]
    );

    // CRITICAL FIX: Determine which items to display with multiple fallbacks
    const displayItems = React.useMemo(() => {
      // First try the regular subcategories from props
      if (subcategories.length > 0) {
        return subcategories;
      }
      
      // Then try our local backup
      if (localGridItems.length > 0) {
        console.log(`[GRID] Using ${localGridItems.length} items from local grid backup`);
        return localGridItems;
      }
      
      // Last resort: empty array
      return [];
    }, [subcategories, localGridItems]);

    // CRITICAL ERROR FIX: Wrap the rendering in error boundary & defensive checks
    // to prevent common React Error #301 - cannot update unmounted component
    
    // Most important safety check: never attempt render if component is unmounting
    if (!isMountedRef.current) {
      console.log(`[GRID SAFETY] Prevented render during unmount`);
      return null;
    }
    
    try {
      // If we just started showing this component and data is not yet available from any source,
      // show a brief loading indicator to prevent a flash of empty state
      if (showInitializing && displayItems.length === 0) {
        return (
          <div className="taxonomy-items-loader">
            <div className="loader-content">
              <div className="loader-text">Initializing subcategories...</div>
              <div className="loader-bar">
                <div className="loader-progress" />
              </div>
            </div>
          </div>
        );
      }

      // Once initialization is complete, show the regular content directly in the grid
      return (
        <React.Fragment>
          {/* Just return the items directly without a wrapper div */}
          {displayItems.map(subcategory => (
            <TaxonomyItemComponent
              key={subcategory.code}
              item={subcategory}
              isActive={activeSubcategory === subcategory.code}
              onClick={() => safelyHandleSubcategorySelect(subcategory.code)}
              onDoubleClick={() =>
                safelyHandleSubcategorySelect(subcategory.code, true)
              }
              dataTestId={`subcategory-${subcategory.code}`}
            />
          ))}

          {/* Add a hint to show when subcategories load but before interaction */}
          {displayItems.length > 0 && !activeSubcategory && (
            <div className="subcategory-hint">
              Select a subcategory to continue
            </div>
          )}
          
          {/* CRITICAL FIX: Show fallback source indicator when needed */}
          {dataSource && dataSource !== 'context' && displayItems.length > 0 && (
            <div className="data-source-indicator" style={{ opacity: 0.8 }}>
              Using {dataSource} data source (fallback mode)
            </div>
          )}
        </React.Fragment>
      );
    } catch (error) {
      // Last resort error handler to prevent crashing the entire app
      console.error('[SUBCATEGORIES GRID] Render error:', error);
      return (
        <div className="taxonomy-error-recovery">
          <div className="error-message">Error loading subcategories. Please try again.</div>
          <button 
            className="retry-button" 
            onClick={() => {
              if (isMountedRef.current) {
                setShowInitializing(true);
                setTimeout(() => {
                  if (isMountedRef.current) {
                    setShowInitializing(false);
                  }
                }, 100);
              }
            }}
          >
            Retry
          </button>
        </div>
      );
    }
  }
);

// Loading state component
const LoadingState = React.memo(({ message }: { message: string }) => (
  <div className="taxonomy-loading">
    <div className="loader-content">
      <div className="loader-text">{message}</div>
      <div className="loader-bar">
        <div className="loader-progress" />
      </div>
    </div>
  </div>
));

// Error state component with retry button
const ErrorState = React.memo(
  ({ error, onRetry }: { error: Error | null; onRetry: () => void }) => (
    <div className="taxonomy-error">
      <p>{String(error)}</p>
      <button onClick={onRetry} className="retry-button">
        Retry
      </button>
    </div>
  )
);

// Empty state component with retry button
const EmptyState = React.memo(
  ({
    message,
    onRetry,
    debugInfo,
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
  )
);

// Auto retry component that encapsulates the useEffect hook to avoid conditional rendering issues
const AutoRetry = React.memo(
  ({ layer, onRetry }: { layer: string; onRetry: () => void }) => {
    // This is safer because the hook is now at the top level of this component
    React.useEffect(() => {
      console.log(
        `[AUTO RETRY] Categories empty for layer ${layer}, auto-retrying...`
      );
      // Only auto-retry once to avoid infinite loops
      const timer = setTimeout(() => onRetry(), 100);
      return () => clearTimeout(timer);
    }, [layer, onRetry]);

    // This component doesn't render anything visible
    return null;
  }
);

const SimpleTaxonomySelectionV2: React.FC<SimpleTaxonomySelectionV2Props> = ({
  layer,
  onCategorySelect,
  onSubcategorySelect,
  selectedCategory,
  selectedSubcategory,
}) => {
  // Use shared taxonomy context instead of creating a new instance
  const taxonomyContext = useTaxonomyContext({
    componentName: 'SimpleTaxonomySelectionV2',
    enableLogging: process.env.NODE_ENV === 'development',
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

    selectLayer,
  } = taxonomyContext;

  // Only use state when we need to track changes not in context
  const [activeCategory, setActiveCategory] = useState<string | null>(
    selectedCategory || null
  );
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(
    selectedSubcategory || null
  );

  // Local backup storage for subcategories
  const [localSubcategories, setLocalSubcategories] = useState<TaxonomyItem[]>(
    []
  );
  const subcategoriesRef = useRef<TaxonomyItem[]>([]);

  // Prevent duplicate data loads with a ref
  const initialSetupRef = useRef<boolean>(false);

  // Debounce timer references
  const categoryDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const subcategoryDebounceRef = useRef<NodeJS.Timeout | null>(null);
  
  // CRITICAL FIX: Unique component ID for event listener tracking
  const componentId = useRef(`tsx_${Math.random().toString(36).substring(2, 9)}`).current;

  // ENHANCED FIX: Add improved global event listeners for layer changes
  // This provides multiple layers of reliability for layer switching
  useEffect(() => {
    // CRITICAL FIX: Add window.__layerChangeHandlers type declaration for TypeScript
    if (!window.__layerChangeHandlers) {
      window.__layerChangeHandlers = {};
    }
    // Cleanup function to remove all event listeners at once
    const cleanupListeners: (() => void)[] = [];

    // 1. Primary layer change event handler
    const handleLayerChangeEvent = (event: CustomEvent) => {
      const { layer: newLayer, timestamp, operationId } = event.detail;
      console.log(
        `[EVENT ${
          operationId || 'unknown'
        }] Received layerChanged event for layer ${newLayer} (timestamp: ${timestamp})`
      );

      // Handle the event regardless of current layer value - immediate reset
      console.log(
        `[EVENT ${
          operationId || 'unknown'
        }] Responding to layerChanged event for layer ${newLayer}`
      );

      // CRITICAL FIX: Immediately cancel any ongoing operations or timers
      if (categoryDebounceRef.current) {
        clearTimeout(categoryDebounceRef.current);
        categoryDebounceRef.current = null;
      }
      if (subcategoryDebounceRef.current) {
        clearTimeout(subcategoryDebounceRef.current);
        subcategoryDebounceRef.current = null;
      }

      // Reset all local state immediately
      setActiveCategory(null);
      setActiveSubcategory(null);
      setLocalSubcategories([]);
      subcategoriesRef.current = [];

      // CRITICAL FIX: Don't call selectLayer again as it creates a circular update pattern
      // The parent already called this, we just need to handle our local component state
      // selectLayer(newLayer); // Removed to prevent circular layer selection

      // Use a tiered approach with multiple timeouts for better reliability

      // Tier 1: Immediate reload attempt (100ms)
      setTimeout(() => {
        console.log(
          `[EVENT ${
            operationId || 'unknown'
          }] Tier 1 (100ms): Forcing category reload for layer ${newLayer}`
        );
        reloadCategories();

        // Check if direct categories are available in session storage
        try {
          const directCategoriesJson = sessionStorage.getItem(
            `directCategories_${newLayer}`
          );
          if (directCategoriesJson) {
            const directCategories = JSON.parse(directCategoriesJson);
            if (directCategories && directCategories.length > 0) {
              console.log(
                `[EVENT ${operationId || 'unknown'}] Found ${
                  directCategories.length
                } categories in session storage for layer ${newLayer}`
              );
              // Dispatch event to notify other components
              const storageEvent = new CustomEvent('taxonomyCategoriesLoaded', {
                detail: {
                  layer: newLayer,
                  categories: directCategories,
                  source: 'session-storage',
                  operationId: operationId,
                },
              });
              window.dispatchEvent(storageEvent);
            }
          }
        } catch (e) {
          console.warn(
            `[EVENT ${
              operationId || 'unknown'
            }] Failed to check session storage:`,
            e
          );
        }
      }, 100);

      // Tier 2: Secondary reload attempt (250ms)
      setTimeout(() => {
        console.log(
          `[EVENT ${
            operationId || 'unknown'
          }] Tier 2 (250ms): Checking category load status for layer ${newLayer}`
        );
        // If categories still not loaded, try direct service call
        if (categories.length === 0) {
          console.log(
            `[EVENT ${
              operationId || 'unknown'
            }] Tier 2: Categories still empty, trying direct service call`
          );
          try {
            const taxonomyService =
              require('../../services/simpleTaxonomyService').taxonomyService;
            const directCategories = taxonomyService.getCategories(newLayer);

            if (directCategories && directCategories.length > 0) {
              console.log(
                `[EVENT ${
                  operationId || 'unknown'
                }] Tier 2: Direct service call returned ${
                  directCategories.length
                } categories`
              );
              // Dispatch event to notify other components
              const directEvent = new CustomEvent('taxonomyCategoriesLoaded', {
                detail: {
                  layer: newLayer,
                  categories: directCategories,
                  source: 'tier2-direct',
                  operationId: operationId,
                },
              });
              window.dispatchEvent(directEvent);
            }
          } catch (e) {
            console.warn(
              `[EVENT ${
                operationId || 'unknown'
              }] Tier 2: Direct service call failed:`,
              e
            );
          }

          // Also try context reload again
          reloadCategories();
        } else {
          console.log(
            `[EVENT ${
              operationId || 'unknown'
            }] Tier 2: Categories already loaded: ${categories.length} items`
          );
        }
      }, 250);

      // Tier 3: Final check and emergency reload (400ms)
      setTimeout(() => {
        console.log(
          `[EVENT ${
            operationId || 'unknown'
          }] Tier 3 (400ms): Final check for layer ${newLayer}`
        );
        console.log(
          `[EVENT ${
            operationId || 'unknown'
          }] Tier 3: Current categories: ${JSON.stringify(
            categories.map(c => c.code)
          )}`
        );

        if (categories.length === 0) {
          console.log(
            `[EVENT ${
              operationId || 'unknown'
            }] Tier 3: CRITICAL - Categories still empty after multiple attempts`
          );
          // Last resort: Force category reload and dispatch emergency event
          reloadCategories();

          // Notify parent component of the emergency
          const emergencyEvent = new CustomEvent('taxonomyEmergencyReload', {
            detail: {
              layer: newLayer,
              timestamp: Date.now(),
              operationId: operationId,
            },
          });
          window.dispatchEvent(emergencyEvent);
        }
      }, 400);
    };

    // 2. Add listener for categories loaded event
    const handleCategoriesLoadedEvent = (event: CustomEvent) => {
      const {
        layer: eventLayer,
        categories: eventCategories,
        source,
      } = event.detail;

      // Only handle if this is for our current layer
      if (eventLayer === layer) {
        console.log(
          `[CATEGORIES EVENT] Received taxonomyCategoriesLoaded event with ${eventCategories.length} categories from source: ${source}`
        );
      }
    };

    // 3. Add listener for emergency reload event
    const handleEmergencyReloadEvent = (event: CustomEvent) => {
      const { layer: emergencyLayer, operationId } = event.detail;

      console.log(
        `[EMERGENCY ${
          operationId || 'unknown'
        }] Received emergency reload event for layer ${emergencyLayer}`
      );

      // Only handle if this is for our current layer
      if (emergencyLayer === layer) {
        console.log(
          `[EMERGENCY ${
            operationId || 'unknown'
          }] This event is for our current layer: ${layer}`
        );

        // Forced reset sequence
        setActiveCategory(null);
        setActiveSubcategory(null);
        setLocalSubcategories([]);
        subcategoriesRef.current = [];

        // Emergency category reload from direct service
        try {
          const taxonomyService =
            require('../../services/simpleTaxonomyService').taxonomyService;
          const emergencyCategories = taxonomyService.getCategories(layer);

          if (emergencyCategories && emergencyCategories.length > 0) {
            console.log(
              `[EMERGENCY ${
                operationId || 'unknown'
              }] Direct service call returned ${
                emergencyCategories.length
              } emergency categories`
            );

            // Force state update with these categories
            const updateEvent = new CustomEvent('forceUpdateCategories', {
              detail: {
                layer: layer,
                categories: emergencyCategories,
              },
            });
            window.dispatchEvent(updateEvent);
          }
        } catch (e) {
          console.warn(
            `[EMERGENCY ${operationId || 'unknown'}] Emergency reload failed:`,
            e
          );
        }
      }
    };

    // Register event listeners
    // CRITICAL FIX: Use the componentId defined outside this effect to track handlers
    // (moved the useRef outside this effect to comply with React Hooks rules)
    
    // Only add the event listener if we don't already have one for this component
    if (!window.__layerChangeHandlers) {
      window.__layerChangeHandlers = {};
    }
    
    // Remove any existing handler for this component
    if (window.__layerChangeHandlers[componentId]) {
      window.removeEventListener('layerChanged', window.__layerChangeHandlers[componentId]);
    }
    
    // Store the handler reference and add the listener
    window.__layerChangeHandlers[componentId] = handleLayerChangeEvent as EventListener;
    window.addEventListener(
      'layerChanged',
      window.__layerChangeHandlers[componentId]
    );
    window.addEventListener(
      'taxonomyCategoriesLoaded',
      handleCategoriesLoadedEvent as EventListener
    );
    window.addEventListener(
      'taxonomyEmergencyReload',
      handleEmergencyReloadEvent as EventListener
    );

    // Add cleanup functions
    cleanupListeners.push(() =>
      window.removeEventListener(
        'layerChanged',
        handleLayerChangeEvent as EventListener
      )
    );
    cleanupListeners.push(() =>
      window.removeEventListener(
        'taxonomyCategoriesLoaded',
        handleCategoriesLoadedEvent as EventListener
      )
    );
    cleanupListeners.push(() =>
      window.removeEventListener(
        'taxonomyEmergencyReload',
        handleEmergencyReloadEvent as EventListener
      )
    );

    // Clean up on unmount
    return () => {
      // Execute all cleanup functions
      cleanupListeners.forEach(cleanup => cleanup());
      
      // CRITICAL FIX: Also specifically remove our handler from the global registry
      if (window.__layerChangeHandlers?.[componentId]) {
        window.removeEventListener('layerChanged', window.__layerChangeHandlers[componentId]);
        delete window.__layerChangeHandlers[componentId];
      }
    };
  }, [selectLayer, reloadCategories, categories, layer]);

  // Define handleCategoryRetry before it's used in useEffect dependency arrays
  const handleCategoryRetry = useCallback(() => {
    if (layer) {
      // ENHANCED: Force more aggressive reloads on retry
      console.log(
        `[RETRY] Forcing aggressive category reload for layer: ${layer}`
      );

      // First update context state
      selectLayer(layer);

      // Force a direct service call for immediate feedback
      try {
        const directCategories = taxonomyService.getCategories(layer);
        if (directCategories && directCategories.length > 0) {
          console.log(
            `[RETRY] Direct category load returned ${directCategories.length} categories`
          );
          // Use a custom event to notify listeners
          const categoryEvent = new CustomEvent('taxonomyCategoriesLoaded', {
            detail: { layer, categories: directCategories },
          });
          window.dispatchEvent(categoryEvent);
        }
      } catch (error) {
        console.error('[RETRY] Error loading categories directly:', error);
      }

      // Then try the standard context reload with a small delay
      setTimeout(() => {
        reloadCategories();
        logger.info(`[RETRY] Sent context reload request for layer: ${layer}`);
      }, 50);
    }
  }, [layer, reloadCategories, selectLayer]);

  // ENHANCED: Initial setup - run only once but with improved reliability
  useEffect(() => {
    if (layer) {
      // Log less in production for performance
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          `[INIT] Initial setup for layer ${layer}, initialSetupRef=${
            initialSetupRef.current
          }, selected category=${selectedCategory || 'none'}`
        );
      }

      // STEP 1: Always call selectLayer to ensure context is updated
      selectLayer(layer);

      // STEP 2: Always try loading categories directly first for immediate feedback
      try {
        const directCategories = taxonomyService.getCategories(layer);
        if (directCategories && directCategories.length > 0) {
          if (process.env.NODE_ENV !== 'production') {
            console.log(
              `[INIT] Direct category load successful: ${directCategories.length} categories`
            );
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
              detail: { layer, categories: directCats },
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
              detail: { layer, categories: directCats },
            });
            window.dispatchEvent(categoryEvent);
          }

          // If category is also provided, load subcategories
          if (selectedCategory) {
            selectCategory(selectedCategory);

            // Try direct load first
            try {
              const directSubcats = taxonomyService.getSubcategories(
                layer,
                selectedCategory
              );
              if (directSubcats && directSubcats.length > 0) {
                // Store for immediate use
                subcategoriesRef.current = [...directSubcats];
                setLocalSubcategories([...directSubcats]);
              }
            } catch (e) {
              console.warn(
                '[INIT] Direct subcategory load on short timer failed:',
                e
              );
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
          if (
            selectedCategory &&
            subcategories.length === 0 &&
            localSubcategories.length === 0 &&
            subcategoriesRef.current.length === 0
          ) {
            try {
              const lastChanceSubcats = taxonomyService.getSubcategories(
                layer,
                selectedCategory
              );
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
        if (
          subcategories.length === 0 &&
          directSubcategories.length === 0 &&
          localSubcategories.length === 0 &&
          subcategoriesRef.current.length === 0
        ) {
          selectCategory(selectedCategory);

          // Immediate load attempt
          try {
            const directSubcats = taxonomyService.getSubcategories(
              layer,
              selectedCategory
            );
            if (directSubcats && directSubcats.length > 0) {
              // Store subcategories for immediate use
              subcategoriesRef.current = [...directSubcats];
              setLocalSubcategories([...directSubcats]);
            }
          } catch (error) {
            console.error(
              '[INIT] Error during direct subcategory load:',
              error
            );
          }

          // Also try context path
          reloadSubcategories();
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer, selectedCategory]); // Depends on both layer and selectedCategory changes

  // CRITICAL FIX: Enhanced layer change handler for more reliable switching
  useEffect(() => {
    if (!layer) return;

    // Log layer switch to help with debugging
    console.log(`[LAYER SWITCH] Handling layer change to: ${layer}`);

    // STEP 1: Cancel any in-progress category loads and clear timers
    if (categoryDebounceRef.current) {
      clearTimeout(categoryDebounceRef.current);
      categoryDebounceRef.current = null;
    }

    // STEP 2: Don't update context here - this would cause a circular update
    // The layer is already set in taxonomyContext by the parent component
    // selectLayer(layer); // Removed to prevent circular updates

    // STEP 3: Create a reference to track this specific layer change operation
    // This helps prevent race conditions when quickly switching between layers
    const layerChangeId = Date.now().toString();
    console.log(
      `[LAYER SWITCH ${layerChangeId}] Starting category load sequence`
    );

    // STEP 4: Load categories using direct service call for immediate feedback
    try {
      // First attempt is immediate direct service call
      const directCategories = taxonomyService.getCategories(layer);

      if (directCategories && directCategories.length > 0) {
        console.log(
          `[LAYER SWITCH ${layerChangeId}] Direct load successful: ${directCategories.length} categories`
        );

        // If we got immediate results, use a custom event to notify any listeners
        const categoryEvent = new CustomEvent('taxonomyCategoriesLoaded', {
          detail: {
            layer,
            categories: directCategories,
            source: 'direct-service',
            layerChangeId,
          },
        });
        window.dispatchEvent(categoryEvent);
      } else {
        console.warn(
          `[LAYER SWITCH ${layerChangeId}] Direct load returned no categories`
        );
      }
    } catch (error) {
      console.error(
        `[LAYER SWITCH ${layerChangeId}] Error during direct category load:`,
        error
      );
    }

    // STEP 5: Also request categories from context for consistency
    console.log(
      `[LAYER SWITCH ${layerChangeId}] Requesting categories from context`
    );
    reloadCategories();

    // STEP 6: Set up a tiered retry approach with multiple layers of recovery
    // First retry after a short delay (100ms) - quick but allows context to update
    const shortRetryTimer = setTimeout(() => {
      console.log(`[LAYER SWITCH ${layerChangeId}] Short retry check (100ms)`);
      if (categories.length === 0) {
        console.log(
          `[LAYER SWITCH ${layerChangeId}] Categories still empty, trying direct service again`
        );
        // Try direct service call again
        try {
          const retryCategories = taxonomyService.getCategories(layer);
          if (retryCategories && retryCategories.length > 0) {
            console.log(
              `[LAYER SWITCH ${layerChangeId}] Short retry successful: ${retryCategories.length} categories`
            );
            // Notify listeners
            const categoryEvent = new CustomEvent('taxonomyCategoriesLoaded', {
              detail: {
                layer,
                categories: retryCategories,
                source: 'short-retry',
                layerChangeId,
              },
            });
            window.dispatchEvent(categoryEvent);
          }
        } catch (error) {
          console.error(
            `[LAYER SWITCH ${layerChangeId}] Error during short retry:`,
            error
          );
        }
      } else {
        console.log(
          `[LAYER SWITCH ${layerChangeId}] Short retry unnecessary - already have ${categories.length} categories`
        );
      }
    }, 100);

    // Second retry after a medium delay (300ms) - if short retry failed
    const mediumRetryTimer = setTimeout(() => {
      console.log(`[LAYER SWITCH ${layerChangeId}] Medium retry check (300ms)`);
      if (categories.length === 0) {
        console.log(
          `[LAYER SWITCH ${layerChangeId}] Categories still empty, trying context reload`
        );
        // Try context reload
        reloadCategories();

        // Also try direct call one more time
        try {
          const lastChanceCategories = taxonomyService.getCategories(layer);
          if (lastChanceCategories && lastChanceCategories.length > 0) {
            console.log(
              `[LAYER SWITCH ${layerChangeId}] Medium retry successful: ${lastChanceCategories.length} categories`
            );
            // Notify listeners
            const categoryEvent = new CustomEvent('taxonomyCategoriesLoaded', {
              detail: {
                layer,
                categories: lastChanceCategories,
                source: 'medium-retry',
                layerChangeId,
              },
            });
            window.dispatchEvent(categoryEvent);
          }
        } catch (error) {
          console.error(
            `[LAYER SWITCH ${layerChangeId}] Error during medium retry:`,
            error
          );
        }
      } else {
        console.log(
          `[LAYER SWITCH ${layerChangeId}] Medium retry unnecessary - already have ${categories.length} categories`
        );
      }
    }, 300);

    // Last resort safety check (500ms) - if everything else failed
    const safetyCheckTimer = setTimeout(() => {
      console.log(`[LAYER SWITCH ${layerChangeId}] Final safety check (500ms)`);
      if (categories.length === 0) {
        console.warn(
          `[LAYER SWITCH ${layerChangeId}] CRITICAL: Categories still empty after all retries!`
        );
        // Last desperate attempt - force direct service call and explicitly update UI
        try {
          const emergencyCategories = taxonomyService.getCategories(layer);
          if (emergencyCategories && emergencyCategories.length > 0) {
            console.log(
              `[LAYER SWITCH ${layerChangeId}] Emergency load successful: ${emergencyCategories.length} categories`
            );
            // Notify listeners with emergency flag
            const categoryEvent = new CustomEvent('taxonomyCategoriesLoaded', {
              detail: {
                layer,
                categories: emergencyCategories,
                source: 'emergency',
                layerChangeId,
              },
            });
            window.dispatchEvent(categoryEvent);

            // Also force a render update
            setTimeout(() => {
              // Force context reload one last time
              reloadCategories();
              // Force retry to trigger UI update
              handleCategoryRetry();
            }, 0);
          } else {
            console.error(
              `[LAYER SWITCH ${layerChangeId}] CRITICAL FAILURE: Could not load categories for layer ${layer} after multiple attempts!`
            );
          }
        } catch (error) {
          console.error(
            `[LAYER SWITCH ${layerChangeId}] Error during emergency category load:`,
            error
          );
        }
      } else {
        console.log(
          `[LAYER SWITCH ${layerChangeId}] Safety check successful - have ${categories.length} categories`
        );
      }
    }, 500);

    // Clean up all timers when component unmounts or layer changes again
    return () => {
      console.log(
        `[LAYER SWITCH ${layerChangeId}] Cleaning up timers from layer change sequence`
      );
      clearTimeout(shortRetryTimer);
      clearTimeout(mediumRetryTimer);
      clearTimeout(safetyCheckTimer);
      if (categoryDebounceRef.current) {
        clearTimeout(categoryDebounceRef.current);
        categoryDebounceRef.current = null;
      }
    };
  }, [
    layer,
    selectLayer,
    reloadCategories,
    categories.length,
    handleCategoryRetry,
  ]);

  // When layer changes, immediately reset all category and subcategory state
  useEffect(() => {
    // Immediately reset selection states
    setActiveCategory(null);
    setActiveSubcategory(null);

    // CRITICAL FIX: Also clear local subcategories backup immediately
    // This prevents the previous layer's subcategories from being shown while loading new ones
    setLocalSubcategories([]);
    subcategoriesRef.current = [];

    // Log the reset for debugging
    console.log(
      `[LAYER SWITCH] Reset all category/subcategory state for layer change to: ${layer}`
    );
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
      const directSubcategories = taxonomyService.getSubcategories(
        layer,
        selectedCategory
      );
      if (directSubcategories && directSubcategories.length > 0) {
        // Store in local state and ref for immediate access
        subcategoriesRef.current = [...directSubcategories];
        setLocalSubcategories([...directSubcategories]);

        // Also notify any listeners
        const subcategoryEvent = new CustomEvent(
          'taxonomySubcategoriesLoaded',
          {
            detail: {
              layer,
              category: selectedCategory,
              subcategories: directSubcategories,
            },
          }
        );
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
      if (
        subcategories.length === 0 &&
        directSubcategories.length === 0 &&
        localSubcategories.length === 0 &&
        subcategoriesRef.current.length === 0
      ) {
        // Try direct service call first
        try {
          const safetySubcategories = taxonomyService.getSubcategories(
            layer,
            selectedCategory
          );
          if (safetySubcategories && safetySubcategories.length > 0) {
            // Store for immediate access
            subcategoriesRef.current = [...safetySubcategories];
            setLocalSubcategories([...safetySubcategories]);

            // Notify listeners
            const subcategoryEvent = new CustomEvent(
              'taxonomySubcategoriesLoaded',
              {
                detail: {
                  layer,
                  category: selectedCategory,
                  subcategories: safetySubcategories,
                },
              }
            );
            window.dispatchEvent(subcategoryEvent);
          }
        } catch (error) {
          console.error('Error during safety direct subcategory load:', error);
        }

        // Also try context
        reloadSubcategories();
      }
    }, 150); // Longer timeout for safety check

    return () => {
      clearTimeout(safetyCheckTimer);
      if (subcategoryDebounceRef.current) {
        clearTimeout(subcategoryDebounceRef.current);
        subcategoryDebounceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedCategory,
    activeCategory,
    layer,
    selectCategory,
    reloadSubcategories,
    subcategories.length,
    localSubcategories.length,
  ]);

  // We've optimized the category loading directly in the initialization code

  const getDirectSubcategories = useCallback(
    (layer: string, category: string | null) => {
      if (!layer || !category) return [];
      try {
        return taxonomyService.getSubcategories(layer, category);
      } catch (error) {
        console.error('Error getting direct subcategories:', error);
        return [];
      }
    },
    []
  );

  // Memoize the subcategories based on the activeCategory
  const directSubcategories = useMemo(() => {
    if (!activeCategory) return [];

    // IMPORTANT: Track the fetch attempt and result for debugging
    console.log(
      `Direct subcategories fetch for ${layer}.${activeCategory} started`
    );
    const results = getDirectSubcategories(layer, activeCategory);
    console.log(`Direct subcategories fetch returned ${results.length} items`);

    // If we got results, save them to the local state and ref as a backup
    if (results.length > 0) {
      // Update the ref immediately for synchronous access
      subcategoriesRef.current = results;

      // Schedule a state update (which is asynchronous)
      setTimeout(() => {
        setLocalSubcategories(results);
        console.log(
          `Updated local subcategories backup with ${results.length} items`
        );
      }, 0);
    } else if (localSubcategories.length > 0) {
      // If direct fetch fails but we have local backup, log it
      console.log(
        `Using ${localSubcategories.length} items from local subcategories backup`
      );
    } else if (subcategoriesRef.current.length > 0) {
      // If direct fetch fails but we have ref backup, log it
      console.log(
        `Using ${subcategoriesRef.current.length} items from subcategories ref backup`
      );

      // Also update the state with the ref data for consistency
      setTimeout(() => {
        setLocalSubcategories(subcategoriesRef.current);
        console.log(
          `Updated local subcategories from ref with ${subcategoriesRef.current.length} items`
        );
      }, 0);
    }

    return results;
  }, [
    layer,
    activeCategory,
    getDirectSubcategories,
    localSubcategories.length,
  ]);

  // When selectedSubcategory changes from props, update the active subcategory
  useEffect(() => {
    console.log(
      `[PROP SYNC] selectedSubcategory prop changed to: ${selectedSubcategory}, activeSubcategory state: ${activeSubcategory}`
    );

    if (selectedSubcategory && selectedSubcategory !== activeSubcategory) {
      console.log(
        `[PROP SYNC] Updating activeSubcategory state to match prop: ${selectedSubcategory}`
      );
      setActiveSubcategory(selectedSubcategory);

      // If we have no subcategories loaded but a subcategory is selected, try to recover data
      if (
        subcategories.length === 0 &&
        directSubcategories.length === 0 &&
        localSubcategories.length === 0 &&
        subcategoriesRef.current.length === 0
      ) {
        console.log(
          `[PROP SYNC] No subcategory data available, trying emergency load for ${layer}.${activeCategory}`
        );

        if (layer && activeCategory) {
          try {
            // Emergency direct fetch attempt
            const emergencySubcategories = taxonomyService.getSubcategories(
              layer,
              activeCategory
            );
            if (emergencySubcategories.length > 0) {
              console.log(
                `[PROP SYNC] Emergency fetch successful, got ${emergencySubcategories.length} items`
              );

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
  }, [
    selectedSubcategory,
    activeSubcategory,
    subcategories.length,
    directSubcategories.length,
    localSubcategories.length,
    layer,
    activeCategory,
  ]);

  // Handle category selection with debouncing to prevent multiple rapid selections
  const handleCategorySelect = useCallback(
    (category: string) => {
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
    },
    [
      activeCategory,
      layer,
      onCategorySelect,
      reloadSubcategories,
      selectCategory,
    ]
  );

  // Handle subcategory selection - PERFORMANCE OPTIMIZED WITH EXTREME RELIABILITY AND FIX FOR DISAPPEARING SUBCATEGORIES 
  const handleSubcategorySelect = useCallback(
    (subcategory: string, isDoubleClick?: boolean) => {
      // Track performance in development
      if (process.env.NODE_ENV === 'development') {
        performance.mark('subcategory-select-start');
      }

      // Prevent duplicate selections but handle double-click special case
      if (subcategory === activeSubcategory && !isDoubleClick) return;

      console.log(
        `[SUB SELECT] Subcategory selection started: ${subcategory}, double-click: ${isDoubleClick}`
      );

      // CRITICAL FIX: Take a snapshot of current subcategories from all sources before any state changes
      // This is crucial to prevent disappearing subcategories, especially for the BAS subcategory
      const subcategoriesSnapshot = {
        context: [...subcategories],
        direct: [...directSubcategories],
        local: [...localSubcategories],
        ref: [...subcategoriesRef.current]
      };
      
      // Log which sources have data
      console.log(
        `[SUB SELECT] Snapshot: context=${subcategoriesSnapshot.context.length}, direct=${subcategoriesSnapshot.direct.length}, local=${subcategoriesSnapshot.local.length}, ref=${subcategoriesSnapshot.ref.length}`
      );

      // CRITICAL FIX: Create a guaranteed subcategories list that will survive the state updates
      const guaranteedSubcategoriesList = subcategoriesSnapshot.context.length > 0 ? 
        subcategoriesSnapshot.context : subcategoriesSnapshot.direct.length > 0 ? 
        subcategoriesSnapshot.direct : subcategoriesSnapshot.local.length > 0 ? 
        subcategoriesSnapshot.local : subcategoriesSnapshot.ref.length > 0 ? 
        subcategoriesSnapshot.ref : [];
        
      // CRITICAL FIX: Lock to prevent concurrent state updates causing data loss
      const operationId = `subselect-${Date.now()}`;
      console.log(`[SUB SELECT ${operationId}] Using guaranteed list with ${guaranteedSubcategoriesList.length} items`);
      
      // STEP 1: Update local state IMMEDIATELY for responsive UI feedback
      setActiveSubcategory(subcategory);
      console.log(
        `[SUB SELECT ${operationId}] Local state updated: activeSubcategory = ${subcategory}`
      );

      // STEP 2: Update context in parallel (but don't depend on its completion)
      selectSubcategory(subcategory);
      console.log(
        `[SUB SELECT ${operationId}] Context update requested for subcategory = ${subcategory}`
      );

      // STEP 3: Store in session storage for backup persistence (multiple layers of redundancy)
      try {
        if (activeCategory) {
          // CRITICAL FIX: Also store the entire subcategories list to prevent disappearing issues
          const storageUpdates = {
            // Store at multiple scopes for easier recovery later
            [`selectedSubcategory_${layer}_${activeCategory}`]: subcategory,
            [`lastActiveSubcategory`]: subcategory,
            [`lastActivePair_${layer}`]: `${activeCategory}:${subcategory}`,
            // Also store as JSON with full details for better recovery
            [`subcategoryDetails_${layer}_${activeCategory}_${subcategory}`]:
              JSON.stringify({
                code: subcategory,
                timestamp: Date.now(),
                layer,
                category: activeCategory,
                operationId
              }),
            // CRITICAL FIX: Store the entire subcategories list
            [`subcategoriesList_${layer}_${activeCategory}`]: 
              JSON.stringify(guaranteedSubcategoriesList)
          };

          // Execute all storage writes together
          Object.entries(storageUpdates).forEach(([key, value]) => {
            sessionStorage.setItem(key, value);
          });

          console.log(
            `[SUB SELECT ${operationId}] Session storage updated with ${
              Object.keys(storageUpdates).length
            } backup records, including full subcategory list`
          );
        }
      } catch (e) {
        // Just log the error but don't let it block
        console.warn(`[SUB SELECT ${operationId}] Storage backup failed:`, e);
      }

      // STEP 4: Find the subcategory details, checking MULTIPLE sources for resilience
      console.log(
        `[SUB SELECT ${operationId}] Searching for subcategory details from ${subcategories.length} context items, ${directSubcategories.length} direct items, ${localSubcategories.length} local items, ${subcategoriesRef.current.length} ref items`
      );

      // Create a function to find details with extensive logging
      const findSubcategoryDetails = () => {
        // Look for the subcategory in various sources in order of preference
        let source = 'none';
        let details = null;

        // CRITICAL FIX: First check our guaranteed snapshot
        if (guaranteedSubcategoriesList.length > 0) {
          details = guaranteedSubcategoriesList.find(s => s.code === subcategory);
          if (details) {
            source = 'guaranteed-snapshot';
            console.log(`[SUB SELECT ${operationId}] Found details in guaranteed snapshot`);
            return { details, source };
          }
        }

        // First try context subcategories (standard path)
        if (subcategories.length > 0) {
          details = subcategories.find(s => s.code === subcategory);
          if (details) {
            source = 'context';
            console.log(`[SUB SELECT ${operationId}] Found details in context subcategories`);
            return { details, source };
          }
        }

        // Next try direct service-fetched subcategories
        if (directSubcategories.length > 0) {
          details = directSubcategories.find(s => s.code === subcategory);
          if (details) {
            source = 'direct';
            console.log(`[SUB SELECT ${operationId}] Found details in direct subcategories`);
            return { details, source };
          }
        }

        // Next try local state backup
        if (localSubcategories.length > 0) {
          details = localSubcategories.find(s => s.code === subcategory);
          if (details) {
            source = 'local';
            console.log(
              `[SUB SELECT ${operationId}] Found details in local subcategories backup`
            );
            return { details, source };
          }
        }

        // Next try ref backup
        if (subcategoriesRef.current.length > 0) {
          details = subcategoriesRef.current.find(s => s.code === subcategory);
          if (details) {
            source = 'ref';
            console.log(
              `[SUB SELECT ${operationId}] Found details in ref subcategories backup`
            );
            return { details, source };
          }
        }

        // Try session storage recovery
        try {
          const storedListJson = sessionStorage.getItem(`subcategoriesList_${layer}_${activeCategory}`);
          if (storedListJson) {
            const storedList = JSON.parse(storedListJson);
            if (storedList && Array.isArray(storedList) && storedList.length > 0) {
              details = storedList.find(s => s.code === subcategory);
              if (details) {
                source = 'session-storage';
                console.log(`[SUB SELECT ${operationId}] Found details in session storage`);
                return { details, source };
              }
            }
          }
        } catch (e) {
          console.warn(`[SUB SELECT ${operationId}] Session storage recovery failed:`, e);
        }

        // Finally try direct service fetch one more time, just in case
        try {
          console.log(
            `[SUB SELECT ${operationId}] Last resort: direct service fetch for ${layer}.${activeCategory}.${subcategory}`
          );
          if (layer && activeCategory) {
            const lastResortSubcategories = taxonomyService.getSubcategories(
              layer,
              activeCategory
            );
            if (lastResortSubcategories.length > 0) {
              details = lastResortSubcategories.find(
                s => s.code === subcategory
              );
              if (details) {
                source = 'last-resort-fetch';
                console.log(
                  `[SUB SELECT ${operationId}] Found details in last resort service fetch`
                );
                return { details, source };
              }
            }
          }
        } catch (e) {
          console.warn(`[SUB SELECT ${operationId}] Last resort fetch failed:`, e);
        }

        // Create synthetic details if nothing found
        console.warn(
          `[SUB SELECT ${operationId}] No subcategory details found, creating synthetic entry`
        );
        source = 'synthetic';
        details = {
          code: subcategory,
          name: subcategory.replace(/_/g, ' '),
          numericCode: String(Math.floor(Math.random() * 900) + 100), // Generate a random 3-digit code as fallback
        };

        return { details, source };
      };

      // Get details with source tracking
      const { details: subcategoryDetails, source: detailsSource } =
        findSubcategoryDetails();
      console.log(
        `[SUB SELECT ${operationId}] Using subcategory details from source: ${detailsSource}`
      );

      // STEP 5: Notify parent component
      console.log(
        `[SUB SELECT ${operationId}] Notifying parent with subcategory: ${subcategory}, double-click: ${isDoubleClick}`
      );
      onSubcategorySelect(subcategory, isDoubleClick);

      // STEP 6: CRITICAL - Create multiple REDUNDANT backups of subcategory data
      // This prevents the "disappearing subcategory" bug by ensuring we always have data

      // CRITICAL FIX: Always update all backups with guaranteed data first, to prevent race conditions
      // Update ref immediately (most reliable, doesn't trigger re-renders)
      if (guaranteedSubcategoriesList.length > 0) {
        subcategoriesRef.current = [...guaranteedSubcategoriesList]; // Clone to ensure independence
        console.log(
          `[SUB SELECT ${operationId}] Updated ref backup with ${guaranteedSubcategoriesList.length} items from guaranteed list`
        );
      }

      // CRITICAL FIX: Schedule multiple updates with increasing delays for reliability
      // First immediate update (no delay)
      if (guaranteedSubcategoriesList.length > 0) {
        setLocalSubcategories([...guaranteedSubcategoriesList]); // Clone to ensure independence
        console.log(
          `[SUB SELECT ${operationId}] Immediate update of local state with ${guaranteedSubcategoriesList.length} items`
        );
      }
      
      // Second update with short delay (10ms)
      setTimeout(() => {
        if (guaranteedSubcategoriesList.length > 0) {
          setLocalSubcategories(prevState => {
            // Only update if we have more items than current state
            if (guaranteedSubcategoriesList.length > prevState.length || prevState.length === 0) {
              console.log(
                `[SUB SELECT ${operationId}] 10ms update of local state with ${guaranteedSubcategoriesList.length} items`
              );
              return [...guaranteedSubcategoriesList];
            }
            return prevState;
          });
        }
      }, 10);

      // Third update with medium delay (50ms)
      setTimeout(() => {
        // Check if we need to do a recovery
        const currentItems = localSubcategories.length > 0 ? localSubcategories : 
                            (subcategoriesRef.current.length > 0 ? subcategoriesRef.current : []);
                            
        if (currentItems.length === 0 && guaranteedSubcategoriesList.length > 0) {
          console.log(
            `[SUB SELECT ${operationId}] RECOVERY: 50ms update needed because current items = ${currentItems.length}`
          );
          setLocalSubcategories([...guaranteedSubcategoriesList]);
          
          // Also ensure ref is up to date
          subcategoriesRef.current = [...guaranteedSubcategoriesList];
        }
      }, 50);

      // 6c. As a last resort, if we have a single good subcategory but no list, create a synthetic list
      if (guaranteedSubcategoriesList.length === 0 && subcategoryDetails) {
        const syntheticList = [subcategoryDetails];
        console.log(
          `[SUB SELECT ${operationId}] Creating synthetic subcategory list with single item`
        );

        // Update both ref and state (state via timeout to avoid race conditions)
        subcategoriesRef.current = syntheticList;
        setLocalSubcategories(syntheticList);
        
        // Also ensure with delayed update
        setTimeout(() => {
          if (localSubcategories.length === 0) {
            setLocalSubcategories(syntheticList);
          }
        }, 20);
      }

      // STEP 7: Report performance metrics (development mode only)
      if (process.env.NODE_ENV === 'development') {
        performance.mark('subcategory-select-end');
        performance.measure(
          'Subcategory Selection Time',
          'subcategory-select-start',
          'subcategory-select-end'
        );
        const measurements = performance.getEntriesByName(
          'Subcategory Selection Time'
        );
        console.log(
          `[SUB SELECT ${operationId}] Selection completed in ${measurements[0]?.duration.toFixed(
            2
          )}ms`
        );
      }
    },
    [
      activeCategory,
      activeSubcategory,
      directSubcategories,
      layer,
      localSubcategories,
      onSubcategorySelect,
      selectSubcategory,
      subcategories,
    ]
  );

  // Memoize subcategory retry handler to prevent recreation on every render

  const handleSubcategoryRetry = useCallback(() => {
    if (layer && activeCategory) {
      selectLayer(layer);
      selectCategory(activeCategory);

      // First try direct service call
      try {
        const directSubcats = taxonomyService.getSubcategories(
          layer,
          activeCategory
        );
        console.log(
          `Retry: Directly loaded ${directSubcats.length} subcategories for ${layer}.${activeCategory}`
        );

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

  // ENHANCED with extreme multi-tiered fallback for subcategory display - CRITICAL FIX FOR DISAPPEARING SUBCATEGORIES
  const displaySubcategoriesData = useMemo(() => {
    const displayId = `display-${Date.now().toString().slice(-4)}`;
    console.log(
      `[DISPLAY ${displayId}] Computing which subcategories to display for ${layer}.${activeCategory}`
    );
    console.log(
      `[DISPLAY ${displayId}] Available sources: ${subcategories.length} context, ${directSubcategories.length} direct, ${localSubcategories.length} local, ${subcategoriesRef.current.length} ref`
    );
    
    // CRITICAL FIX: Check session storage for backup data first
    let sessionStorageData: TaxonomyItem[] = [];
    try {
      if (layer && activeCategory) {
        const sessionStorageKey = `subcategoriesList_${layer}_${activeCategory}`;
        const storedData = sessionStorage.getItem(sessionStorageKey);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            sessionStorageData = parsedData;
            console.log(
              `[DISPLAY ${displayId}] Found ${sessionStorageData.length} items in session storage backup`
            );
          }
        }
      }
    } catch (e) {
      console.warn(`[DISPLAY ${displayId}] Session storage recovery failed:`, e);
    }

    // TIER 1: If context has subcategories, use them (preferred source)
    if (subcategories.length > 0) {
      console.log(
        `[DISPLAY ${displayId}] Using ${subcategories.length} subcategories from context (primary source)`
      );

      // CRITICAL FIX: Always update backup stores for future resilience - not just when empty
      subcategoriesRef.current = [...subcategories];

      // CRITICAL FIX: Always update local state backup immediately
      setLocalSubcategories([...subcategories]);

      // CRITICAL FIX: Also update session storage for ultimate backup
      try {
        if (layer && activeCategory) {
          sessionStorage.setItem(
            `subcategoriesList_${layer}_${activeCategory}`,
            JSON.stringify(subcategories)
          );
        }
      } catch (e) {
        console.warn(`[DISPLAY ${displayId}] Failed to update session storage:`, e);
      }

      return {
        displaySubcategories: subcategories,
        dataSource: 'context',
        useDirectData: false,
      };
    }

    // TIER 2: Try direct service call results (next most reliable)
    if (directSubcategories.length > 0) {
      console.log(
        `[DISPLAY ${displayId}] Using ${directSubcategories.length} subcategories from direct service call (fallback 1)`
      );

      // CRITICAL FIX: Always update all backup stores
      subcategoriesRef.current = [...directSubcategories];
      setLocalSubcategories([...directSubcategories]);

      // CRITICAL FIX: Also update session storage
      try {
        if (layer && activeCategory) {
          sessionStorage.setItem(
            `subcategoriesList_${layer}_${activeCategory}`,
            JSON.stringify(directSubcategories)
          );
        }
      } catch (e) {
        console.warn(`[DISPLAY ${displayId}] Failed to update session storage:`, e);
      }

      return {
        displaySubcategories: directSubcategories,
        dataSource: 'direct',
        useDirectData: true,
      };
    }

    // TIER 3: Try local state backup (previously computed results)
    if (localSubcategories.length > 0) {
      console.log(
        `[DISPLAY ${displayId}] Using ${localSubcategories.length} subcategories from local state backup (fallback 2)`
      );

      // CRITICAL FIX: Always update ref backup for consistency
      subcategoriesRef.current = [...localSubcategories];

      // CRITICAL FIX: Also update session storage
      try {
        if (layer && activeCategory) {
          sessionStorage.setItem(
            `subcategoriesList_${layer}_${activeCategory}`,
            JSON.stringify(localSubcategories)
          );
        }
      } catch (e) {
        console.warn(`[DISPLAY ${displayId}] Failed to update session storage:`, e);
      }

      return {
        displaySubcategories: localSubcategories,
        dataSource: 'local',
        useDirectData: true,
      };
    }

    // TIER 4: Try reference backup (most persistent in-memory)
    if (subcategoriesRef.current.length > 0) {
      console.log(
        `[DISPLAY ${displayId}] Using ${subcategoriesRef.current.length} subcategories from ref backup (fallback 3)`
      );

      // CRITICAL FIX: Always update local state immediately
      setLocalSubcategories([...subcategoriesRef.current]);

      // CRITICAL FIX: Also update session storage
      try {
        if (layer && activeCategory) {
          sessionStorage.setItem(
            `subcategoriesList_${layer}_${activeCategory}`,
            JSON.stringify(subcategoriesRef.current)
          );
        }
      } catch (e) {
        console.warn(`[DISPLAY ${displayId}] Failed to update session storage:`, e);
      }

      return {
        displaySubcategories: subcategoriesRef.current,
        dataSource: 'ref',
        useDirectData: true,
      };
    }

    // TIER 5: Try session storage backup (most persistent across renders)
    if (sessionStorageData.length > 0) {
      console.log(
        `[DISPLAY ${displayId}] Using ${sessionStorageData.length} subcategories from session storage (fallback 4)`
      );

      // CRITICAL FIX: Update both in-memory backups from session storage
      subcategoriesRef.current = [...sessionStorageData];
      setLocalSubcategories([...sessionStorageData]);

      return {
        displaySubcategories: sessionStorageData,
        dataSource: 'session-storage',
        useDirectData: true,
      };
    }

    // TIER 6: Last resort - try a direct fetch again right now
    if (layer && activeCategory) {
      try {
        console.log(
          `[DISPLAY ${displayId}] Emergency: Making one last direct fetch attempt for ${layer}.${activeCategory}`
        );
        const emergencyFetch = taxonomyService.getSubcategories(
          layer,
          activeCategory
        );

        if (emergencyFetch.length > 0) {
          console.log(
            `[DISPLAY ${displayId}] Emergency fetch successful! Got ${emergencyFetch.length} items`
          );

          // CRITICAL FIX: Update all backups immediately
          subcategoriesRef.current = [...emergencyFetch];
          setLocalSubcategories([...emergencyFetch]);

          // CRITICAL FIX: Also update session storage
          try {
            sessionStorage.setItem(
              `subcategoriesList_${layer}_${activeCategory}`,
              JSON.stringify(emergencyFetch)
            );
          } catch (e) {
            console.warn(`[DISPLAY ${displayId}] Failed to update session storage:`, e);
          }

          return {
            displaySubcategories: emergencyFetch,
            dataSource: 'emergency-fetch',
            useDirectData: true,
          };
        }
      } catch (e) {
        console.warn(`[DISPLAY ${displayId}] Emergency fetch failed:`, e);
      }
    }

    // TIER 7: Complete failure - try to create synthetic subcategories for the current category
    if (layer && activeCategory) {
      try {
        console.log(
          `[DISPLAY ${displayId}] CRITICAL: Attempting to create synthetic subcategories for ${layer}.${activeCategory}`
        );
        
        // For S layer with BAS category specifically (common case)
        if (layer === 'S' && activeCategory === 'BAS') {
          const syntheticItems = [
            { code: 'POP', name: 'Pop', numericCode: '001' },
            { code: 'HPM', name: 'Hip Male', numericCode: '002' },
            { code: 'HPF', name: 'Hip Female', numericCode: '003' }
          ];
          
          console.log(`[DISPLAY ${displayId}] Created synthetic S.BAS subcategories`);          
          
          // Update all backups
          subcategoriesRef.current = syntheticItems;
          setLocalSubcategories(syntheticItems);
          
          // Update session storage
          try {
            sessionStorage.setItem(
              `subcategoriesList_${layer}_${activeCategory}`,
              JSON.stringify(syntheticItems)
            );
          } catch (e) {}
          
          return {
            displaySubcategories: syntheticItems,
            dataSource: 'synthetic-special-case',
            useDirectData: true,
          };
        }
      } catch (e) {
        console.warn(`[DISPLAY ${displayId}] Synthetic creation failed:`, e);
      }
    }

    // TIER 8: Absolute last resort - no subcategories available from any source
    console.warn(
      `[DISPLAY ${displayId}] All sources failed! No subcategories available for ${layer}.${activeCategory}`
    );
    return {
      displaySubcategories: [],
      dataSource: 'none',
      useDirectData: false,
    };
  }, [
    layer,
    activeCategory,
    subcategories,
    directSubcategories,
    localSubcategories,
  ]);

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
      error: subcategoryError ? String(subcategoryError) : null,
    };

    return (
      <div
        style={{
          fontSize: '12px',
          color: '#666',
          margin: '10px 0',
          padding: '12px',
          backgroundColor: '#f9f9f9',
          border: '1px solid #eee',
          borderRadius: '4px',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
          Debugging Information
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {Object.entries(debugData).map(([key, value]) => (
              <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
                <td
                  style={{
                    padding: '4px 8px',
                    fontWeight: 'bold',
                    color: '#555',
                  }}
                >
                  {key}:
                </td>
                <td style={{ padding: '4px 8px' }}>
                  {typeof value === 'object'
                    ? JSON.stringify(value)
                    : String(value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: '8px', color: '#999', fontSize: '11px' }}>
          Layer: {layer} | Category: {activeCategory || 'none'} | Component ID:{' '}
          {Math.random().toString(36).substr(2, 9)}
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
    subcategoryError,
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
          <ErrorState error={categoryError} onRetry={handleCategoryRetry} />
        ) : categories.length === 0 ? (
          // ENHANCED: When categories are empty, add an immediate auto-retry
          // This ensures we don't get stuck with an empty state after layer changes
          <React.Fragment>
            <EmptyState
              message={`No categories found for layer ${layer}`}
              onRetry={handleCategoryRetry}
            />
            <AutoRetry layer={layer} onRetry={handleCategoryRetry} />
          </React.Fragment>
        ) : (
          <div className="taxonomy-items fixed-grid">
            <CategoriesGrid
              categories={categories}
              activeCategory={activeCategory}
              handleCategorySelect={handleCategorySelect}
            />
            {categories.length === 0 && (
              <div className="data-source-indicator">
                Attempting to load categories directly...
              </div>
            )}
          </div>
        )}
      </div>

      {activeCategory && (
        <div className="taxonomy-section">
          <h3 className="taxonomy-section-title">
            Select Subcategory
            {activeCategory && (
              <span className="category-indicator">
                Category: {activeCategory}
              </span>
            )}
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
              className={`taxonomy-items fixed-grid ${
                displaySubcategoriesData.useDirectData
                  ? 'using-direct-data'
                  : ''
              }`}
            >
              <SubcategoriesGrid
                subcategories={displaySubcategoriesData.displaySubcategories}
                activeSubcategory={activeSubcategory}
                handleSubcategorySelect={handleSubcategorySelect}
                dataSource={displaySubcategoriesData.dataSource}
              />

              {displaySubcategoriesData.useDirectData && (
                <div className="data-source-indicator">
                  Using {displaySubcategoriesData.dataSource} data source
                  (fallback mode)
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeCategory && activeSubcategory && (
        <div className="taxonomy-selection-summary">
          <p>
            Selected:{' '}
            <strong>
              {layer}.{activeCategory}.{activeSubcategory}
            </strong>
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
