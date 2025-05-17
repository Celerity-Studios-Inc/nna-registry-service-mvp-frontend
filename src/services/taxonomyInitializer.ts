/**
 * Taxonomy Initializer Service
 * 
 * This service handles the initialization and validation of taxonomy data
 * before the application starts using it. It provides a mechanism to
 * ensure that taxonomy data is loaded and available when needed.
 */
import { taxonomyService } from './simpleTaxonomyService';
import { logger } from '../utils/logger';

// Define key categories and subcategories that must be available
const CRITICAL_MAPPINGS = [
  { hfn: 'W.BCH.SUN.001', expectedMfa: '5.004.003.001' },
  { hfn: 'S.POP.HPM.001', expectedMfa: '2.004.003.001' }
];

const REQUIRED_LAYERS = ['W', 'S', 'G', 'L', 'M', 'B', 'P', 'T', 'C', 'R'];

// Initialization state
let isInitialized = false;
let isInitializing = false;
let initError: Error | null = null;
let initListeners: Array<(success: boolean) => void> = [];

/**
 * Initialize the taxonomy service
 * @returns Promise that resolves when initialization is complete
 */
export const initializeTaxonomy = async (): Promise<boolean> => {
  // For test resets
  if (typeof global !== 'undefined' && (global as any).__TAXONOMY_INIT_TEST_RESET) {
    isInitialized = false;
    isInitializing = false;
    initError = null;
    initListeners = [];
    return false;
  }

  // If already initialized, return immediately
  if (isInitialized) {
    return true;
  }
  
  // If currently initializing, wait for it to complete
  if (isInitializing) {
    return new Promise<boolean>((resolve) => {
      initListeners.push(resolve);
    });
  }
  
  // Start initialization
  isInitializing = true;
  initError = null;
  
  try {
    logger.info('Initializing taxonomy service...');
    
    // Validate required layers
    for (const layer of REQUIRED_LAYERS) {
      const categories = taxonomyService.getCategories(layer);
      logger.info(`Layer ${layer}: Found ${categories.length} categories`);
      
      if (categories.length === 0) {
        throw new Error(`No categories found for layer ${layer}`);
      }
      
      // Check at least one subcategory for the first category
      if (categories.length > 0) {
        const firstCategory = categories[0];
        const subcategories = taxonomyService.getSubcategories(layer, firstCategory.code);
        logger.info(`Layer ${layer}, Category ${firstCategory.code}: Found ${subcategories.length} subcategories`);
        
        if (subcategories.length === 0) {
          logger.warn(`No subcategories found for ${layer}.${firstCategory.code}`);
        }
      }
    }
    
    // Validate critical mappings
    for (const mapping of CRITICAL_MAPPINGS) {
      const mfa = taxonomyService.convertHFNtoMFA(mapping.hfn);
      logger.info(`Testing mapping ${mapping.hfn} -> ${mfa}`);
      
      if (mfa !== mapping.expectedMfa) {
        throw new Error(`Critical mapping failed: ${mapping.hfn} -> ${mfa} (expected ${mapping.expectedMfa})`);
      }
    }
    
    // Successfully initialized
    isInitialized = true;
    isInitializing = false;
    logger.info('Taxonomy service successfully initialized');
    
    // Notify listeners
    initListeners.forEach(listener => listener(true));
    initListeners = [];
    
    return true;
  } catch (error) {
    // Initialization failed
    initError = error instanceof Error ? error : new Error(String(error));
    isInitializing = false;
    
    logger.error('Taxonomy service initialization failed:', initError);
    
    // Notify listeners
    initListeners.forEach(listener => listener(false));
    initListeners = [];
    
    return false;
  }
};

/**
 * Check if taxonomy is initialized
 */
export const isTaxonomyInitialized = (): boolean => {
  return isInitialized;
};

/**
 * Get initialization error if any
 */
export const getTaxonomyInitError = (): Error | null => {
  return initError;
};

/**
 * Wait for taxonomy to be initialized
 * @returns Promise that resolves when initialization is complete
 */
export const waitForTaxonomyInit = (): Promise<boolean> => {
  if (isInitialized) {
    return Promise.resolve(true);
  }
  
  if (initError) {
    return Promise.resolve(false);
  }
  
  return new Promise<boolean>((resolve) => {
    initListeners.push(resolve);
  });
};