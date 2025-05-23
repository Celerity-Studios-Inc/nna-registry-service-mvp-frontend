/**
 * useTaxonomy Hook
 *
 * A React hook that provides access to taxonomy data with built-in
 * loading states, error handling, and retry mechanisms.
 *
 * Features:
 * - Automatic loading of categories and subcategories
 * - Error handling with fallback data
 * - Selection state management
 * - HFN/MFA conversion
 * - User feedback through notifications
 *
 * @module useTaxonomy
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { taxonomyService } from '../services/simpleTaxonomyService';
import { waitForTaxonomyInit } from '../services/taxonomyInitializer';
import { taxonomyErrorRecovery } from '../services/taxonomyErrorRecovery';
import { debugLog } from '../utils/logger';
import { 
  logger, 
  LogLevel, 
  LogCategory,
  STANDARD_LAYER_NAMES,
  verboseLog
} from '../utils/logger';
import { useFeedback } from '../contexts/FeedbackContext';

interface TaxonomyCategory {
  code: string;
  numericCode: string;
  name: string;
}

interface TaxonomySubcategory {
  code: string;
  numericCode: string;
  name: string;
}

interface UseTaxonomyOptions {
  autoLoad?: boolean;
  showFeedback?: boolean;
}

interface UseTaxonomyResult {
  // Layer data
  layers: string[];
  selectedLayer: string | null;
  selectLayer: (layer: string) => void;

  // Category data
  categories: TaxonomyCategory[];
  isLoadingCategories: boolean;
  categoryError: Error | null;
  selectedCategory: string | null;
  selectCategory: (category: string) => void;
  reloadCategories: () => void;

  // Subcategory data
  subcategories: TaxonomySubcategory[];
  isLoadingSubcategories: boolean;
  subcategoryError: Error | null;
  selectedSubcategory: string | null;
  selectSubcategory: (subcategory: string) => void;
  reloadSubcategories: () => void;

  // HFN/MFA conversion
  hfn: string;
  mfa: string;
  updateSequential: (sequential: string) => void;
  updateFileType: (fileType: string | null) => void;

  // Reset functionality
  reset: () => void;
  resetCategoryData: () => void; // New method for targeted reset during layer changes

  // Validation
  validateSelections: () => boolean;
}

// Default layer list
const DEFAULT_LAYERS = ['G', 'S', 'L', 'M', 'W', 'B', 'P', 'T', 'C', 'R'];

/**
 * Returns a hook for working with taxonomy data
 * @param options - Configuration options for the hook
 * @returns An object with taxonomy data and functions
 */
export const useTaxonomy = (
  options: UseTaxonomyOptions = {}
): UseTaxonomyResult => {
  const { autoLoad = true, showFeedback = true } = options;
  const feedback = useFeedback();

  // Generate a stable context ID for this hook instance
  const contextId = useRef<string>(`ctx_${Math.random().toString(36).substr(2, 9)}`).current;
  
  // Layer state
  const [layers] = useState<string[]>(DEFAULT_LAYERS);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const selectedLayerRef = useRef<string | null>(selectedLayer);

  // Category state
  const [categories, setCategories] = useState<TaxonomyCategory[]>([]);
  const categoriesRef = useRef<TaxonomyCategory[]>(categories);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);
  const [categoryError, setCategoryError] = useState<Error | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const selectedCategoryRef = useRef<string | null>(selectedCategory);

  // Subcategory state
  const [subcategories, setSubcategories] = useState<TaxonomySubcategory[]>([]);
  const subcategoriesRef = useRef<TaxonomySubcategory[]>(subcategories);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState<boolean>(false);
  const [subcategoryError, setSubcategoryError] = useState<Error | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const selectedSubcategoryRef = useRef<string | null>(selectedSubcategory);

  // HFN/MFA state
  const [sequential, setSequential] = useState<string>('001');
  const [fileType, setFileType] = useState<string | null>(null);
  const [hfn, setHfn] = useState<string>('');
  const [mfa, setMfa] = useState<string>('');
  
  // Update refs when state changes to keep them in sync
  useEffect(() => {
    selectedLayerRef.current = selectedLayer;
  }, [selectedLayer]);
  
  useEffect(() => {
    categoriesRef.current = categories;
  }, [categories]);
  
  useEffect(() => {
    selectedCategoryRef.current = selectedCategory;
  }, [selectedCategory]);
  
  useEffect(() => {
    subcategoriesRef.current = subcategories;
  }, [subcategories]);
  
  useEffect(() => {
    selectedSubcategoryRef.current = selectedSubcategory;
  }, [selectedSubcategory]);

  // Helper for showing user-friendly feedback messages
  const showErrorFeedback = useCallback(
    (message: string, error?: any) => {
      if (showFeedback) {
        feedback.addFeedback('error', message, 5000);
        logger.taxonomy(LogLevel.ERROR, message, error);
      } else {
        logger.taxonomy(LogLevel.ERROR, message, error);
      }
    },
    [feedback, showFeedback]
  );

  const showSuccessFeedback = useCallback(
    (message: string) => {
      if (showFeedback) {
        feedback.addFeedback('success', message, 3000);
        logger.taxonomy(LogLevel.INFO, message);
      } else {
        logger.taxonomy(LogLevel.INFO, message);
      }
    },
    [feedback, showFeedback]
  );

  // Load categories for a layer - ENHANCED with more robust error recovery
  const loadCategories = useCallback(
    async (layer: string) => {
      if (!layer) return;

      // Generate a unique load ID for tracking
      const loadId = `load_${Date.now().toString(36)}`;
      // Only log in development with explicit logger flag enabled
      if (process.env.NODE_ENV === 'development' && localStorage.getItem('verbose_taxonomy_logging') === 'true') {
        debugLog(`[CONTEXT ${loadId}] Starting category load for layer: ${layer}`);
      }

      setIsLoadingCategories(true);
      setCategoryError(null);

      try {
        // Check if we have categories in session storage first (fastest source)
        let layerCategories: TaxonomyCategory[] = [];
        let dataSource = 'primary';

        try {
          const sessionData = sessionStorage.getItem(
            `directCategories_${layer}`
          );
          if (sessionData) {
            const storedCategories = JSON.parse(sessionData);
            if (storedCategories && storedCategories.length > 0) {
              // Only log in development with explicit logger flag enabled
              if (process.env.NODE_ENV === 'development' && localStorage.getItem('verbose_taxonomy_logging') === 'true') {
                debugLog(`[CONTEXT ${loadId}] Found ${storedCategories.length} categories in session storage`);
              }
              layerCategories = storedCategories;
              dataSource = 'session';
            }
          }
        } catch (e) {
          // Only log critical errors even without flag
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[CONTEXT ${loadId}] Failed to check session storage:`, e);
          }
        }

        // If not found in session, proceed with regular load
        if (layerCategories.length === 0) {
          // Wait for taxonomy initialization to complete (skipped in test)
          if (process.env.NODE_ENV !== 'test') {
            await waitForTaxonomyInit();
          }

          layerCategories = taxonomyService.getCategories(layer);
          // Only log in development with explicit logger flag enabled
          if (process.env.NODE_ENV === 'development' && localStorage.getItem('verbose_taxonomy_logging') === 'true') {
            debugLog(
              `[CONTEXT ${loadId}] Loaded ${layerCategories.length} categories from taxonomy service`
            );
          }
          logger.taxonomy(
            LogLevel.INFO,
            `Loaded ${layerCategories.length} categories for layer ${layer}`
          );
        }

        // Store the result in state
        setCategories(layerCategories);

        // Also save to session storage for emergency recovery
        try {
          if (layerCategories.length > 0) {
            sessionStorage.setItem(
              `directCategories_${layer}`,
              JSON.stringify(layerCategories)
            );
          }
        } catch (e) {
          // Ignore storage errors
        }

        // If no categories were found, throw an error
        if (layerCategories.length === 0) {
          throw new Error(`No categories found for layer ${layer}`);
        }

        // Show success feedback for non-empty results
        if (layerCategories.length > 0 && showFeedback) {
          if (dataSource === 'session') {
            showSuccessFeedback(
              `Loaded ${layerCategories.length} categories for ${layer} (from cache)`
            );
          } else {
            showSuccessFeedback(
              `Loaded ${layerCategories.length} categories for ${layer}`
            );
          }
        }

        // Only log in development with explicit logger flag enabled
        if (process.env.NODE_ENV === 'development' && localStorage.getItem('verbose_taxonomy_logging') === 'true') {
          debugLog(
            `[CONTEXT ${loadId}] Category load successful: ${layerCategories.length} items from ${dataSource}`
          );
        }
      } catch (error) {
        const errorMessage = `Failed to load categories for layer ${layer}`;
        logger.taxonomy(LogLevel.ERROR, errorMessage, error);
        // Critical errors should always be logged
        if (process.env.NODE_ENV === 'development') {
          console.error(`[CONTEXT ${loadId}] ${errorMessage}:`, error);
        }
        setCategoryError(
          error instanceof Error ? error : new Error(String(error))
        );

        // Show error feedback
        showErrorFeedback(
          `${errorMessage}. Using fallback data if available.`,
          error
        );

        // Multi-tiered fallback approach
        // Only log in development with explicit logger flag enabled
        if (process.env.NODE_ENV === 'development' && localStorage.getItem('verbose_taxonomy_logging') === 'true') {
          debugLog(`[CONTEXT ${loadId}] Attempting multi-tiered fallback recovery`);
        }

        // Tier 1: Check session storage again (in case it failed earlier)
        try {
          const sessionData = sessionStorage.getItem(
            `directCategories_${layer}`
          );
          if (sessionData) {
            const storedCategories = JSON.parse(sessionData);
            if (storedCategories && storedCategories.length > 0) {
              debugLog(
                `[CONTEXT ${loadId}] Fallback Tier 1: Found ${storedCategories.length} categories in session`
              );
              setCategories(storedCategories);
              showSuccessFeedback(
                `Using cached data for ${layer} layer categories`
              );
              return; // Exit early if successful
            }
          }
        } catch (e) {
          console.warn(`[CONTEXT ${loadId}] Fallback Tier 1 failed:`, e);
        }

        // Tier 2: Try the taxonomyErrorRecovery service
        const fallbackCategories =
          taxonomyErrorRecovery.getFallbackCategories(layer);
        if (fallbackCategories.length > 0) {
          debugLog(
            `[CONTEXT ${loadId}] Fallback Tier 2: Using ${fallbackCategories.length} categories from error recovery service`
          );
          setCategories(fallbackCategories);
          showSuccessFeedback(
            `Using fallback data for ${layer} layer categories`
          );
          return; // Exit early if successful
        }

        // Tier 3: Last resort - create synthetic categories based on layer
        debugLog(
          `[CONTEXT ${loadId}] Fallback Tier 3: Creating synthetic categories for ${layer}`
        );
        const syntheticCategories: TaxonomyCategory[] = [];

        // Different synthetic categories based on layer
        if (layer === 'G') {
          // Songs
          syntheticCategories.push({
            code: 'POP',
            name: 'Pop',
            numericCode: '001',
          });
          syntheticCategories.push({
            code: 'ROCK',
            name: 'Rock',
            numericCode: '002',
          });
          syntheticCategories.push({
            code: 'JAZZ',
            name: 'Jazz',
            numericCode: '003',
          });
        } else if (layer === 'S') {
          // Stars
          syntheticCategories.push({
            code: 'POP',
            name: 'Pop',
            numericCode: '001',
          });
          syntheticCategories.push({
            code: 'ROCK',
            name: 'Rock',
            numericCode: '002',
          });
          syntheticCategories.push({
            code: 'JAZZ',
            name: 'Jazz',
            numericCode: '003',
          });
        } else {
          // Generic categories for other layers
          syntheticCategories.push({
            code: 'CAT1',
            name: 'Category 1',
            numericCode: '001',
          });
          syntheticCategories.push({
            code: 'CAT2',
            name: 'Category 2',
            numericCode: '002',
          });
          syntheticCategories.push({
            code: 'CAT3',
            name: 'Category 3',
            numericCode: '003',
          });
        }

        if (syntheticCategories.length > 0) {
          debugLog(
            `[CONTEXT ${loadId}] Using ${syntheticCategories.length} synthetic categories`
          );
          setCategories(syntheticCategories);
          showSuccessFeedback(
            `Using emergency fallback data for ${layer} layer`
          );
        }
      } finally {
        setIsLoadingCategories(false);

        // Final verification log
        // Only log in development with explicit logger flag enabled
        if (process.env.NODE_ENV === 'development' && localStorage.getItem('verbose_taxonomy_logging') === 'true') {
          debugLog(
            `[CONTEXT ${loadId}] Category load complete for ${layer}, final state: ${categories.length} items`
          );
        }
      }
    },
    [showErrorFeedback, showSuccessFeedback, showFeedback, categories.length]
  );

  // Load subcategories for a category
  const loadSubcategories = useCallback(
    async (layer: string, category: string) => {
      if (!layer || !category) return;

      setIsLoadingSubcategories(true);
      setSubcategoryError(null);

      try {
        // Wait for taxonomy initialization to complete (skipped in test)
        if (process.env.NODE_ENV !== 'test') {
          await waitForTaxonomyInit();
        }

        const categorySubcategories = taxonomyService.getSubcategories(
          layer,
          category
        );
        logger.taxonomy(
          LogLevel.INFO,
          `Loaded ${categorySubcategories.length} subcategories for ${layer}.${category}`
        );

        setSubcategories(categorySubcategories);

        // If no subcategories were found, throw an error
        if (categorySubcategories.length === 0) {
          throw new Error(`No subcategories found for ${layer}.${category}`);
        }

        // Show success feedback for non-empty results
        if (categorySubcategories.length > 0 && showFeedback) {
          showSuccessFeedback(
            `Loaded ${categorySubcategories.length} subcategories for ${layer}.${category}`
          );
        }
      } catch (error) {
        const errorMessage = `Failed to load subcategories for ${layer}.${category}`;
        logger.taxonomy(LogLevel.ERROR, errorMessage, error);
        setSubcategoryError(
          error instanceof Error ? error : new Error(String(error))
        );

        // Show error feedback
        showErrorFeedback(
          `${errorMessage}. Using fallback data if available.`,
          error
        );

        // Use the error recovery service to get fallback data
        const fallbackSubcategories =
          taxonomyErrorRecovery.getFallbackSubcategories(layer, category);

        if (fallbackSubcategories.length > 0) {
          setSubcategories(fallbackSubcategories);
          showSuccessFeedback(`Using fallback data for subcategories`);
        }
      } finally {
        setIsLoadingSubcategories(false);
      }
    },
    [showErrorFeedback, showSuccessFeedback, showFeedback]
  );

  // Update HFN and MFA when selections change
  // FIXED: Removed unnecessary dependencies from dependency array to prevent re-renders
  useEffect(() => {
    if (selectedLayer && selectedCategory && selectedSubcategory) {
      const newHfn = `${selectedLayer}.${selectedCategory}.${selectedSubcategory}.${sequential}${
        fileType ? `.${fileType}` : ''
      }`;
      setHfn(newHfn);

      try {
        const newMfa = taxonomyService.convertHFNtoMFA(newHfn);
        setMfa(newMfa);

        // Optional success feedback on successful MFA conversion
        // This is commented out because it might be too chatty
        // if (showFeedback && newMfa) {
        //   showSuccessFeedback(`Valid NNA Address generated: ${newMfa}`);
        // }
      } catch (error) {
        const errorMessage = `Failed to convert HFN to MFA for ${newHfn}`;
        logger.taxonomy(LogLevel.ERROR, errorMessage, error);

        // Show error feedback for MFA conversion failures
        if (showFeedback) {
          showErrorFeedback(
            `${errorMessage}. Using fallback mapping if available.`,
            error
          );
        }

        // Use the error recovery service to get fallback MFA
        const fallbackMfa = taxonomyErrorRecovery.getFallbackMFA(
          selectedLayer,
          selectedCategory,
          selectedSubcategory,
          sequential,
          fileType || undefined
        );

        if (fallbackMfa) {
          setMfa(fallbackMfa);

          // Get names for better user feedback
          const categoryName =
            categories.find(cat => cat.code === selectedCategory)?.name ||
            selectedCategory;
          const subcategoryName =
            subcategories.find(subcat => subcat.code === selectedSubcategory)
              ?.name || selectedSubcategory;

          showSuccessFeedback(
            `Using fallback mapping for ${categoryName}.${subcategoryName}`
          );
        } else {
          setMfa('');
          showErrorFeedback(
            'Could not generate a valid NNA Address for the selected combination'
          );
        }
      }
    } else {
      setHfn('');
      setMfa('');
    }
  }, [
    selectedLayer,
    selectedCategory,
    selectedSubcategory,
    sequential,
    fileType,
  ]);

  // Load categories when layer changes
  useEffect(() => {
    if (selectedLayer && autoLoad) {
      loadCategories(selectedLayer);
    }
  }, [selectedLayer, loadCategories, autoLoad]);

  // Load subcategories when category changes
  useEffect(() => {
    if (selectedLayer && selectedCategory && autoLoad) {
      loadSubcategories(selectedLayer, selectedCategory);
    }
  }, [selectedLayer, selectedCategory, loadSubcategories, autoLoad]);

  // Select a layer - ENHANCED with improved diagnostic logging, layer switching, and state synchronization
  const selectLayer = useCallback(
    (layer: string) => {
      // Generate a unique operation ID to track this layer change across logs
      const operationId = `ctx_${Date.now().toString(36)}_${Math.random()
        .toString(36)
        .substr(2, 5)}`;
      debugLog(`[CONTEXT ${contextId}:${operationId}] Selecting layer: ${layer}`);

      // CRITICAL FIX: If we're changing from one layer to another, first clear all existing data
      if (selectedLayerRef.current !== layer) {
        debugLog(
          `[CONTEXT ${contextId}:${operationId}] Layer change detected from ${
            selectedLayerRef.current || 'null'
          } to ${layer}`
        );

        // Log the current taxonomy state before changes
        debugLog(
          `[CONTEXT ${contextId}:${operationId}] Before reset - categories: ${categoriesRef.current.length} items`
        );
        if (categoriesRef.current.length > 0) {
          debugLog(
            `[CONTEXT ${contextId}:${operationId}] Category codes: ${JSON.stringify(
              categoriesRef.current.map(c => c.code)
            )}`
          );
        }

        // First explicitly clear categories and subcategories to prevent stale data
        setCategories([]);
        setSubcategories([]);

        // Reset all related state
        setSelectedCategory(null);
        setSelectedSubcategory(null);
        setCategoryError(null);
        setSubcategoryError(null);
        setHfn('');
        setMfa('');

        debugLog(`[CONTEXT ${contextId}:${operationId}] State cleared for layer change`);
      }

      // Update the ref immediately for synchronous operations
      selectedLayerRef.current = layer;
      
      // Now set the new layer
      setSelectedLayer(layer);
      
      // Immediately invoke useEffect behavior to load categories
      // This ensures categories start loading right away, avoiding state batch update delays
      if (autoLoad) {
        debugLog(`[CONTEXT ${contextId}:${operationId}] Proactively loading categories for ${layer}`);
        // Use setTimeout with 0ms to ensure this runs after the current synchronous code block
        setTimeout(() => {
          if (selectedLayerRef.current === layer) {
            loadCategories(layer);
          }
        }, 0);
      }

      // Optional feedback when layer is selected
      if (showFeedback) {
        // Use the standardized layer names for consistent feedback
        const layerName = STANDARD_LAYER_NAMES[layer] || layer;
        showSuccessFeedback(`Selected ${layerName} layer`);
      }

      // Store the layer selection timestamp for debugging
      try {
        sessionStorage.setItem(
          'lastLayerChange',
          JSON.stringify({
            layer,
            timestamp: Date.now(),
            operationId,
            contextId
          })
        );
      } catch (e) {
        // Ignore storage errors
      }

      debugLog(
        `[CONTEXT ${contextId}:${operationId}] Layer selection complete: ${layer}`
      );

      // Schedule verification logs to track state changes over time
      setTimeout(() => {
        debugLog(
          `[CONTEXT ${contextId}:${operationId}] Verification after 100ms - selectedLayer: ${selectedLayerRef.current}`
        );
      }, 100);
      
      setTimeout(() => {
        debugLog(
          `[CONTEXT ${contextId}:${operationId}] Verification after 300ms - categories: ${categoriesRef.current.length} items`
        );
      }, 300);
    },
    [selectedLayer, autoLoad, loadCategories, contextId, showFeedback, showSuccessFeedback]
  );

  // Select a category - ENHANCED with ref updates and state verification
  const selectCategory = useCallback(
    (category: string) => {
      // Generate a unique operation ID to track this action across logs
      const operationId = `cat_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`;
      debugLog(`[CONTEXT ${contextId}:${operationId}] Selecting category: ${category}`);
      
      // FIXED: Prevent duplicate selections to avoid unnecessary re-renders
      if (category === selectedCategoryRef.current) {
        debugLog(`[CONTEXT ${contextId}:${operationId}] Category ${category} already selected, skipping`); 
        return;
      }

      // Update ref immediately for synchronous operations
      selectedCategoryRef.current = category;
      
      // Update state
      setSelectedCategory(category);
      setSelectedSubcategory(null);
      
      // Immediately invoke useEffect behavior to load subcategories
      // This ensures subcategories start loading right away, avoiding state batch update delays
      if (autoLoad && selectedLayerRef.current) {
        debugLog(`[CONTEXT ${contextId}:${operationId}] Proactively loading subcategories for ${selectedLayerRef.current}.${category}`);
        // Use setTimeout with 0ms to ensure this runs after the current synchronous code block
        setTimeout(() => {
          if (selectedCategoryRef.current === category) {
            loadSubcategories(selectedLayerRef.current!, category);
          }
        }, 0);
      }

      // Find full category name and display in feedback
      if (showFeedback && selectedLayerRef.current) {
        const categoryObj = categoriesRef.current.find(cat => cat.code === category);
        if (categoryObj) {
          showSuccessFeedback(`Selected ${categoryObj.name} category`);
        }
      }
      
      // Schedule verification logs to track state changes
      setTimeout(() => {
        debugLog(
          `[CONTEXT ${contextId}:${operationId}] Verification after 100ms - selectedCategory: ${selectedCategoryRef.current}`
        );
      }, 100);
    },
    [
      contextId,
      autoLoad,
      loadSubcategories,
      showFeedback,
      showSuccessFeedback,
    ]
  );

  // Select a subcategory - ENHANCED with ref updates and better state verification
  const selectSubcategory = useCallback(
    (subcategory: string) => {
      // Generate a unique operation ID to track this action across logs
      const operationId = `subcat_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`;
      debugLog(`[CONTEXT ${contextId}:${operationId}] Selecting subcategory: ${subcategory}`);
      
      // FIXED: Prevent duplicate selections to avoid unnecessary re-renders
      if (subcategory === selectedSubcategoryRef.current) {
        debugLog(`[CONTEXT ${contextId}:${operationId}] Subcategory ${subcategory} already selected, skipping`);
        return;
      }

      // Update ref immediately for synchronous operations
      selectedSubcategoryRef.current = subcategory;
      
      // Update state
      setSelectedSubcategory(subcategory);

      // Find full subcategory name and display in feedback
      if (showFeedback && selectedLayerRef.current && selectedCategoryRef.current) {
        const subcategoryObj = subcategoriesRef.current.find(
          subcat => subcat.code === subcategory
        );
        if (subcategoryObj) {
          showSuccessFeedback(`Selected ${subcategoryObj.name} subcategory`);
        }
      }
      
      // Schedule verification log to track state changes
      setTimeout(() => {
        debugLog(
          `[CONTEXT ${contextId}:${operationId}] Verification after 100ms - selectedSubcategory: ${selectedSubcategoryRef.current}`
        );
      }, 100);
    },
    [
      contextId,
      showFeedback,
      showSuccessFeedback,
    ]
  );

  // Update sequential number
  const updateSequential = useCallback(
    (newSequential: string) => {
      setSequential(newSequential);

      // Optional feedback when sequential number is updated
      if (showFeedback) {
        showSuccessFeedback(`Updated sequential number to ${newSequential}`);
      }
    },
    [showFeedback, showSuccessFeedback]
  );

  // Update file type
  const updateFileType = useCallback(
    (newFileType: string | null) => {
      setFileType(newFileType);

      // Optional feedback when file type is updated
      if (showFeedback && newFileType) {
        showSuccessFeedback(`Updated file type to ${newFileType}`);
      }
    },
    [showFeedback, showSuccessFeedback]
  );

  // Reset all selections - ENHANCED for better layer switching
  const reset = useCallback(() => {
    debugLog('[CONTEXT] Resetting all taxonomy state');

    // Clear selection state
    setSelectedLayer(null);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSequential('001');
    setFileType(null);

    // CRITICAL FIX: Also explicitly clear data collections
    // This ensures that old categories/subcategories don't remain visible
    setCategories([]);
    setSubcategories([]);
    setCategoryError(null);
    setSubcategoryError(null);
    setIsLoadingCategories(false);
    setIsLoadingSubcategories(false);
    setHfn('');
    setMfa('');

    // Optional feedback when reset is called
    if (showFeedback) {
      showSuccessFeedback('Reset all taxonomy selections');
    }

    debugLog('[CONTEXT] Taxonomy state reset complete');
  }, [showFeedback, showSuccessFeedback]);

  // Additional method to reset just category data (useful when changing layers)
  const resetCategoryData = useCallback(() => {
    debugLog('[CONTEXT] Resetting category data');
    setCategories([]);
    setSelectedCategory(null);
    setCategoryError(null);
    setIsLoadingCategories(false);

    // Also reset subcategory data as it depends on category
    setSubcategories([]);
    setSelectedSubcategory(null);
    setSubcategoryError(null);
    setIsLoadingSubcategories(false);
    setHfn('');
    setMfa('');

    debugLog('[CONTEXT] Category data reset complete');
  }, []);

  // Force reload categories - ENHANCED with diagnostic logging
  const reloadCategories = useCallback(() => {
    // Generate a unique operation ID for tracking
    const reloadId = `reload_${Date.now().toString(36)}`;

    if (selectedLayer) {
      debugLog(
        `[CONTEXT ${reloadId}] Reloading categories for layer: ${selectedLayer}`
      );
      debugLog(
        `[CONTEXT ${reloadId}] Current categories before reload: ${categories.length} items`
      );

      // Track timing for debugging
      const startTime = performance.now();

      // First attempt to load from taxonomyService directly for immediate feedback
      try {
        const taxonomyService =
          require('../services/simpleTaxonomyService').taxonomyService;
        const directCategories = taxonomyService.getCategories(selectedLayer);

        debugLog(
          `[CONTEXT ${reloadId}] Direct service returned ${
            directCategories.length
          } categories in ${Math.round(performance.now() - startTime)}ms`
        );

        // If we got categories directly and our state is empty, update immediately
        if (directCategories.length > 0 && categories.length === 0) {
          debugLog(
            `[CONTEXT ${reloadId}] Setting categories from direct service call`
          );
          setCategories(directCategories);

          // Also store in session storage as backup
          try {
            sessionStorage.setItem(
              `directCategories_${selectedLayer}`,
              JSON.stringify(directCategories)
            );
          } catch (e) {
            // Ignore storage errors
          }
        }
      } catch (e) {
        console.warn(`[CONTEXT ${reloadId}] Direct service call failed:`, e);
      }

      // Then always use the full loadCategories method as backup
      loadCategories(selectedLayer);

      // Optional feedback when categories are reloaded
      if (showFeedback) {
        showSuccessFeedback(`Reloading categories for ${selectedLayer}`);
      }

      // Schedule a verification log
      setTimeout(() => {
        debugLog(
          `[CONTEXT ${reloadId}] After reload (100ms): ${categories.length} categories available`
        );
        if (categories.length > 0) {
          debugLog(
            `[CONTEXT ${reloadId}] Category codes: ${JSON.stringify(
              categories.map(c => c.code)
            )}`
          );
        }
      }, 100);
    } else {
      console.warn(
        `[CONTEXT ${reloadId}] Cannot reload categories: No layer selected`
      );

      // Show error if no layer is selected
      if (showFeedback) {
        showErrorFeedback('Cannot reload categories: No layer selected');
      }
    }
  }, [
    selectedLayer,
    categories,
    loadCategories,
    showFeedback,
    showSuccessFeedback,
    showErrorFeedback,
  ]);

  // Force reload subcategories
  const reloadSubcategories = useCallback(() => {
    if (selectedLayer && selectedCategory) {
      loadSubcategories(selectedLayer, selectedCategory);

      // Optional feedback when subcategories are reloaded
      if (showFeedback) {
        showSuccessFeedback(
          `Reloading subcategories for ${selectedLayer}.${selectedCategory}`
        );
      }
    } else {
      // Show error if no layer or category is selected
      if (showFeedback) {
        showErrorFeedback(
          'Cannot reload subcategories: No layer or category selected'
        );
      }
    }
  }, [
    selectedLayer,
    selectedCategory,
    loadSubcategories,
    showFeedback,
    showSuccessFeedback,
    showErrorFeedback,
  ]);

  // Validate current selections
  const validateSelections = useCallback((): boolean => {
    // Check if all required selections are made
    if (!selectedLayer) {
      if (showFeedback) {
        showErrorFeedback('Please select a layer');
      }
      return false;
    }

    if (!selectedCategory) {
      if (showFeedback) {
        showErrorFeedback('Please select a category');
      }
      return false;
    }

    if (!selectedSubcategory) {
      if (showFeedback) {
        showErrorFeedback('Please select a subcategory');
      }
      return false;
    }

    // Check if MFA conversion succeeded
    if (!mfa) {
      if (showFeedback) {
        showErrorFeedback(
          'Invalid taxonomy selection - could not generate NNA Address'
        );
      }
      return false;
    }

    // All validations passed
    if (showFeedback) {
      showSuccessFeedback('Taxonomy selections are valid');
    }
    return true;
  }, [
    selectedLayer,
    selectedCategory,
    selectedSubcategory,
    mfa,
    showFeedback,
    showErrorFeedback,
    showSuccessFeedback,
  ]);

  return {
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
    reloadCategories,

    // Subcategory data
    subcategories,
    isLoadingSubcategories,
    subcategoryError,
    selectedSubcategory,
    selectSubcategory,
    reloadSubcategories,

    // HFN/MFA conversion
    hfn,
    mfa,
    updateSequential,
    updateFileType,

    // Reset functionality - enhanced for better layer switching
    reset,
    resetCategoryData,

    // Validation
    validateSelections,
  };
};
