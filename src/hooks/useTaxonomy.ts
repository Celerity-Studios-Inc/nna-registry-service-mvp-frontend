/**
 * useTaxonomy Hook
 *
 * A React hook that provides access to taxonomy data with built-in
 * loading states, error handling, and retry mechanisms.
 * Enhanced with feedback notifications for user-friendly error handling.
 */
import { useState, useEffect, useCallback } from 'react';
import { taxonomyService } from '../services/simpleTaxonomyService';
import { waitForTaxonomyInit } from '../services/taxonomyInitializer';
import { taxonomyErrorRecovery } from '../services/taxonomyErrorRecovery';
import { logger, LogLevel, LogCategory } from '../utils/logger';
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

  // Reset
  reset: () => void;

  // Validation
  validateSelections: () => boolean;
}

// Default layer list
const DEFAULT_LAYERS = ['G', 'S', 'L', 'M', 'W', 'B', 'P', 'T', 'C', 'R'];

export const useTaxonomy = (options: UseTaxonomyOptions = {}): UseTaxonomyResult => {
  const { autoLoad = true, showFeedback = true } = options;
  const feedback = useFeedback();

  // Layer state
  const [layers] = useState<string[]>(DEFAULT_LAYERS);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);

  // Category state
  const [categories, setCategories] = useState<TaxonomyCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);
  const [categoryError, setCategoryError] = useState<Error | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Subcategory state
  const [subcategories, setSubcategories] = useState<TaxonomySubcategory[]>([]);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState<boolean>(false);
  const [subcategoryError, setSubcategoryError] = useState<Error | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  // HFN/MFA state
  const [sequential, setSequential] = useState<string>('001');
  const [fileType, setFileType] = useState<string | null>(null);
  const [hfn, setHfn] = useState<string>('');
  const [mfa, setMfa] = useState<string>('');

  // Helper for showing user-friendly feedback messages
  const showErrorFeedback = useCallback((message: string, error?: any) => {
    if (showFeedback) {
      feedback.addFeedback('error', message, 5000);
      logger.taxonomy(LogLevel.ERROR, message, error);
    } else {
      logger.taxonomy(LogLevel.ERROR, message, error);
    }
  }, [feedback, showFeedback]);

  const showSuccessFeedback = useCallback((message: string) => {
    if (showFeedback) {
      feedback.addFeedback('success', message, 3000);
      logger.taxonomy(LogLevel.INFO, message);
    } else {
      logger.taxonomy(LogLevel.INFO, message);
    }
  }, [feedback, showFeedback]);

  // Load categories for a layer
  const loadCategories = useCallback(async (layer: string) => {
    if (!layer) return;

    setIsLoadingCategories(true);
    setCategoryError(null);

    try {
      // Wait for taxonomy initialization to complete
      await waitForTaxonomyInit();

      const layerCategories = taxonomyService.getCategories(layer);
      logger.taxonomy(LogLevel.INFO, `Loaded ${layerCategories.length} categories for layer ${layer}`);

      setCategories(layerCategories);

      // If no categories were found, throw an error
      if (layerCategories.length === 0) {
        throw new Error(`No categories found for layer ${layer}`);
      }

      // Show success feedback for non-empty results
      if (layerCategories.length > 0 && showFeedback) {
        showSuccessFeedback(`Loaded ${layerCategories.length} categories for ${layer}`);
      }
    } catch (error) {
      const errorMessage = `Failed to load categories for layer ${layer}`;
      logger.taxonomy(LogLevel.ERROR, errorMessage, error);
      setCategoryError(error instanceof Error ? error : new Error(String(error)));

      // Show error feedback
      showErrorFeedback(`${errorMessage}. Using fallback data if available.`, error);

      // Try to use any previously loaded categories if available
      if (categories.length === 0) {
        // Use the error recovery service to get fallback data
        const fallbackCategories = taxonomyErrorRecovery.getFallbackCategories(layer);
        
        if (fallbackCategories.length > 0) {
          setCategories(fallbackCategories);
          showSuccessFeedback(`Using fallback data for ${layer} layer categories`);
        }
      }
    } finally {
      setIsLoadingCategories(false);
    }
  }, [categories, showErrorFeedback, showSuccessFeedback]);

  // Load subcategories for a category
  const loadSubcategories = useCallback(async (layer: string, category: string) => {
    if (!layer || !category) return;

    setIsLoadingSubcategories(true);
    setSubcategoryError(null);

    try {
      // Wait for taxonomy initialization to complete
      await waitForTaxonomyInit();

      const categorySubcategories = taxonomyService.getSubcategories(layer, category);
      logger.taxonomy(LogLevel.INFO, `Loaded ${categorySubcategories.length} subcategories for ${layer}.${category}`);

      setSubcategories(categorySubcategories);

      // If no subcategories were found, throw an error
      if (categorySubcategories.length === 0) {
        throw new Error(`No subcategories found for ${layer}.${category}`);
      }

      // Show success feedback for non-empty results
      if (categorySubcategories.length > 0 && showFeedback) {
        showSuccessFeedback(`Loaded ${categorySubcategories.length} subcategories for ${layer}.${category}`);
      }
    } catch (error) {
      const errorMessage = `Failed to load subcategories for ${layer}.${category}`;
      logger.taxonomy(LogLevel.ERROR, errorMessage, error);
      setSubcategoryError(error instanceof Error ? error : new Error(String(error)));

      // Show error feedback
      showErrorFeedback(`${errorMessage}. Using fallback data if available.`, error);

      // Try to use any previously loaded subcategories if available
      if (subcategories.length === 0) {
        // Use the error recovery service to get fallback data
        const fallbackSubcategories = taxonomyErrorRecovery.getFallbackSubcategories(layer, category);
        
        if (fallbackSubcategories.length > 0) {
          setSubcategories(fallbackSubcategories);
          const categoryName = categories.find(cat => cat.code === category)?.name || category;
          showSuccessFeedback(`Using fallback data for ${categoryName} subcategories`);
        }
      }
    } finally {
      setIsLoadingSubcategories(false);
    }
  }, [subcategories, categories, showErrorFeedback, showSuccessFeedback]);

  // Update HFN and MFA when selections change
  useEffect(() => {
    if (selectedLayer && selectedCategory && selectedSubcategory) {
      const newHfn = `${selectedLayer}.${selectedCategory}.${selectedSubcategory}.${sequential}${fileType ? `.${fileType}` : ''}`;
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
          showErrorFeedback(`${errorMessage}. Using fallback mapping if available.`, error);
        }

        // Use the error recovery service to get fallback MFA
        const fallbackMfa = taxonomyErrorRecovery.getFallbackMFA(
          selectedLayer, selectedCategory, selectedSubcategory, sequential, fileType || undefined
        );
        
        if (fallbackMfa) {
          setMfa(fallbackMfa);
          
          // Get names for better user feedback
          const categoryName = categories.find(cat => cat.code === selectedCategory)?.name || selectedCategory;
          const subcategoryName = subcategories.find(subcat => subcat.code === selectedSubcategory)?.name || selectedSubcategory;
          
          showSuccessFeedback(`Using fallback mapping for ${categoryName}.${subcategoryName}`);
        } else {
          setMfa('');
          showErrorFeedback('Could not generate a valid NNA Address for the selected combination');
        }
      }
    } else {
      setHfn('');
      setMfa('');
    }
  }, [selectedLayer, selectedCategory, selectedSubcategory, sequential, fileType, 
    categories, subcategories, showErrorFeedback, showSuccessFeedback]);

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

  // Select a layer
  const selectLayer = useCallback((layer: string) => {
    setSelectedLayer(layer);
    setSelectedCategory(null);
    setSelectedSubcategory(null);

    // Optional feedback when layer is selected
    if (showFeedback) {
      const layerNames: Record<string, string> = {
        'G': 'Genesis Star',
        'S': 'Song',
        'L': 'Look',
        'M': 'Move',
        'W': 'World',
        'B': 'Beat',
        'P': 'Performance',
        'T': 'Tune',
        'C': 'Chord',
        'R': 'Rhythm'
      };

      const layerName = layerNames[layer] || layer;
      showSuccessFeedback(`Selected ${layerName} layer`);
    }
  }, [showFeedback, showSuccessFeedback]);

  // Select a category
  const selectCategory = useCallback((category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);

    // Find full category name and display in feedback
    if (showFeedback && selectedLayer) {
      const categoryObj = categories.find(cat => cat.code === category);
      if (categoryObj) {
        showSuccessFeedback(`Selected ${categoryObj.name} category`);
      }
    }
  }, [categories, selectedLayer, showFeedback, showSuccessFeedback]);

  // Select a subcategory
  const selectSubcategory = useCallback((subcategory: string) => {
    setSelectedSubcategory(subcategory);

    // Find full subcategory name and display in feedback
    if (showFeedback && selectedLayer && selectedCategory) {
      const subcategoryObj = subcategories.find(subcat => subcat.code === subcategory);
      if (subcategoryObj) {
        showSuccessFeedback(`Selected ${subcategoryObj.name} subcategory`);
      }
    }
  }, [subcategories, selectedLayer, selectedCategory, showFeedback, showSuccessFeedback]);

  // Update sequential number
  const updateSequential = useCallback((newSequential: string) => {
    setSequential(newSequential);

    // Optional feedback when sequential number is updated
    if (showFeedback) {
      showSuccessFeedback(`Updated sequential number to ${newSequential}`);
    }
  }, [showFeedback, showSuccessFeedback]);

  // Update file type
  const updateFileType = useCallback((newFileType: string | null) => {
    setFileType(newFileType);

    // Optional feedback when file type is updated
    if (showFeedback && newFileType) {
      showSuccessFeedback(`Updated file type to ${newFileType}`);
    }
  }, [showFeedback, showSuccessFeedback]);

  // Reset all selections
  const reset = useCallback(() => {
    setSelectedLayer(null);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSequential('001');
    setFileType(null);

    // Optional feedback when reset is called
    if (showFeedback) {
      showSuccessFeedback('Reset all taxonomy selections');
    }
  }, [showFeedback, showSuccessFeedback]);

  // Force reload categories
  const reloadCategories = useCallback(() => {
    if (selectedLayer) {
      loadCategories(selectedLayer);

      // Optional feedback when categories are reloaded
      if (showFeedback) {
        showSuccessFeedback(`Reloading categories for ${selectedLayer}`);
      }
    } else {
      // Show error if no layer is selected
      if (showFeedback) {
        showErrorFeedback('Cannot reload categories: No layer selected');
      }
    }
  }, [selectedLayer, loadCategories, showFeedback, showSuccessFeedback, showErrorFeedback]);

  // Force reload subcategories
  const reloadSubcategories = useCallback(() => {
    if (selectedLayer && selectedCategory) {
      loadSubcategories(selectedLayer, selectedCategory);

      // Optional feedback when subcategories are reloaded
      if (showFeedback) {
        showSuccessFeedback(`Reloading subcategories for ${selectedLayer}.${selectedCategory}`);
      }
    } else {
      // Show error if no layer or category is selected
      if (showFeedback) {
        showErrorFeedback('Cannot reload subcategories: No layer or category selected');
      }
    }
  }, [selectedLayer, selectedCategory, loadSubcategories, showFeedback, showSuccessFeedback, showErrorFeedback]);

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
        showErrorFeedback('Invalid taxonomy selection - could not generate NNA Address');
      }
      return false;
    }

    // All validations passed
    if (showFeedback) {
      showSuccessFeedback('Taxonomy selections are valid');
    }
    return true;
  }, [selectedLayer, selectedCategory, selectedSubcategory, mfa, showFeedback, showErrorFeedback, showSuccessFeedback]);

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

    // Reset
    reset,

    // Validation
    validateSelections
  };
};