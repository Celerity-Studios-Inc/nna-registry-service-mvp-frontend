import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { taxonomyService } from '../../services/simpleTaxonomyService';
import { logger, LogLevel } from '../../utils/logger';
import { 
  FullTaxonomyData, 
  TaxonomyItem, 
  TaxonomyLoadingState,
  TaxonomyPath 
} from './types';

interface TaxonomyContextType {
  // Data state
  taxonomyData: FullTaxonomyData | null;
  loadingState: TaxonomyLoadingState;
  error: Error | null;
  lastUpdated: number | null;
  
  // Utility functions
  getCategories: (layer: string) => TaxonomyItem[];
  getSubcategories: (layer: string, category: string) => TaxonomyItem[];
  convertHFNtoMFA: (hfn: string) => string;
  convertMFAtoHFN: (mfa: string) => string;
  validateHFN: (hfn: string) => boolean;
  refreshTaxonomyData: () => Promise<void>;
  
  // Path helpers
  buildHFN: (path: TaxonomyPath) => string;
  parseHFN: (hfn: string) => TaxonomyPath | null;
}

// Create a context with default values
const TaxonomyContext = createContext<TaxonomyContextType>({
  taxonomyData: null,
  loadingState: 'idle',
  error: null,
  lastUpdated: null,
  
  getCategories: () => [],
  getSubcategories: () => [],
  convertHFNtoMFA: () => '',
  convertMFAtoHFN: () => '',
  validateHFN: () => false,
  refreshTaxonomyData: async () => {},
  
  buildHFN: () => '',
  parseHFN: () => null
});

// Storage keys for caching
const TAXONOMY_STORAGE_KEY = 'nna_taxonomy_data';
const TAXONOMY_TIMESTAMP_KEY = 'nna_taxonomy_timestamp';

// Cache expiration time (24 hours in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

/**
 * Provider component that loads and caches all taxonomy data
 */
export const TaxonomyDataProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [taxonomyData, setTaxonomyData] = useState<FullTaxonomyData | null>(null);
  const [loadingState, setLoadingState] = useState<TaxonomyLoadingState>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  /**
   * Load taxonomy data from all sources
   */
  const loadTaxonomyData = useCallback(async (forceRefresh = false) => {
    try {
      setLoadingState('loading');
      logger.taxonomy(LogLevel.INFO, 'Starting to load all taxonomy data');
      
      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const cachedData = sessionStorage.getItem(TAXONOMY_STORAGE_KEY);
        const cachedTimestamp = sessionStorage.getItem(TAXONOMY_TIMESTAMP_KEY);
        
        if (cachedData && cachedTimestamp) {
          const timestamp = parseInt(cachedTimestamp, 10);
          const now = Date.now();
          
          // Only use cache if it's not expired
          if (now - timestamp < CACHE_EXPIRATION) {
            try {
              const parsedData = JSON.parse(cachedData) as FullTaxonomyData;
              logger.taxonomy(LogLevel.INFO, 'Using cached taxonomy data from session storage');
              setTaxonomyData(parsedData);
              setLastUpdated(timestamp);
              setLoadingState('success');
              return;
            } catch (e) {
              logger.taxonomy(LogLevel.WARN, 'Failed to parse cached data', e);
              // Continue to load from service if parsing failed
            }
          } else {
            logger.taxonomy(LogLevel.INFO, 'Cached taxonomy data expired, loading fresh data');
          }
        }
      }
      
      // Begin fresh data load
      const data: FullTaxonomyData = { layers: {} };
      
      // Define all available layers
      const layers = ['S', 'W', 'G', 'L', 'M', 'B', 'P', 'T', 'C', 'R'];
      
      // Load data for each layer
      for (const layer of layers) {
        logger.taxonomy(LogLevel.INFO, `Loading data for layer: ${layer}`);
        data.layers[layer] = { categories: {} };
        
        try {
          const categories = taxonomyService.getCategories(layer);
          
          // Process each category
          for (const category of categories) {
            data.layers[layer].categories[category.code] = {
              code: category.code,
              name: category.name,
              numericCode: category.numericCode,
              subcategories: {}
            };
            
            try {
              // Load subcategories for this category
              const subcategories = taxonomyService.getSubcategories(layer, category.code);
              
              // Process each subcategory
              for (const subcategory of subcategories) {
                data.layers[layer].categories[category.code].subcategories[subcategory.code] = {
                  code: subcategory.code,
                  name: subcategory.name,
                  numericCode: subcategory.numericCode
                };
              }
              
              logger.taxonomy(LogLevel.INFO, `Loaded ${subcategories.length} subcategories for ${layer}.${category.code}`);
            } catch (subErr) {
              logger.taxonomy(LogLevel.ERROR, `Error loading subcategories for ${layer}.${category.code}:`, subErr);
            }
          }
          
          logger.taxonomy(LogLevel.INFO, `Loaded ${categories.length} categories for layer ${layer}`);
        } catch (layerErr) {
          logger.taxonomy(LogLevel.ERROR, `Error loading categories for layer ${layer}:`, layerErr);
        }
      }
      
      // Special pre-loading for known problematic combinations
      logger.taxonomy(LogLevel.INFO, 'Ensuring Star+POP subcategories are loaded');
      try {
        if (data.layers['S'] && data.layers['S'].categories['POP']) {
          const starPopSubcategories = taxonomyService.getSubcategories('S', 'POP');
          logger.taxonomy(LogLevel.INFO, `Verified ${starPopSubcategories.length} S.POP subcategories`);
        }
      } catch (e) {
        logger.taxonomy(LogLevel.ERROR, 'Error pre-loading S.POP subcategories:', e);
      }
      
      // Update state with fetched data
      setTaxonomyData(data);
      
      // Store timestamp
      const timestamp = Date.now();
      setLastUpdated(timestamp);
      
      // Store in session storage for future use
      try {
        sessionStorage.setItem(TAXONOMY_STORAGE_KEY, JSON.stringify(data));
        sessionStorage.setItem(TAXONOMY_TIMESTAMP_KEY, timestamp.toString());
        logger.taxonomy(LogLevel.INFO, 'Taxonomy data cached in session storage');
      } catch (storageErr) {
        logger.taxonomy(LogLevel.WARN, 'Failed to cache taxonomy data:', storageErr);
      }
      
      setLoadingState('success');
      logger.taxonomy(LogLevel.INFO, 'Successfully loaded all taxonomy data');
    } catch (err) {
      logger.taxonomy(LogLevel.ERROR, 'Critical error loading taxonomy data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error loading taxonomy data'));
      setLoadingState('error');
    }
  }, []);

  // Expose a refresh function to force reload data
  const refreshTaxonomyData = useCallback(async () => {
    await loadTaxonomyData(true);
  }, [loadTaxonomyData]);
  
  // Load taxonomy data on component mount
  useEffect(() => {
    loadTaxonomyData();
  }, [loadTaxonomyData]);
  
  // Utility functions that wrap the taxonomy service but use our cached data when possible
  
  /**
   * Get categories for a layer, using cached data if available
   */
  const getCategories = useCallback((layer: string): TaxonomyItem[] => {
    // Try to use cached data first
    if (taxonomyData && taxonomyData.layers[layer]) {
      return Object.values(taxonomyData.layers[layer].categories).map(category => ({
        code: category.code,
        name: category.name,
        numericCode: category.numericCode
      }));
    }
    
    // Fall back to direct service call if cache not available
    try {
      return taxonomyService.getCategories(layer);
    } catch (err) {
      logger.taxonomy(LogLevel.ERROR, `Error getting categories for layer ${layer}:`, err);
      return [];
    }
  }, [taxonomyData]);
  
  /**
   * Get subcategories for a layer and category, using cached data if available
   */
  const getSubcategories = useCallback((layer: string, category: string): TaxonomyItem[] => {
    // Try to use cached data first
    if (taxonomyData && 
        taxonomyData.layers[layer] && 
        taxonomyData.layers[layer].categories[category]) {
      return Object.values(taxonomyData.layers[layer].categories[category].subcategories);
    }
    
    // Fall back to direct service call if cache not available
    try {
      return taxonomyService.getSubcategories(layer, category);
    } catch (err) {
      logger.taxonomy(LogLevel.ERROR, `Error getting subcategories for ${layer}.${category}:`, err);
      return [];
    }
  }, [taxonomyData]);
  
  /**
   * Convert a Human-Friendly Name (HFN) to a Machine-Friendly Address (MFA)
   */
  const convertHFNtoMFA = useCallback((hfn: string): string => {
    try {
      return taxonomyService.convertHFNtoMFA(hfn);
    } catch (err) {
      logger.taxonomy(LogLevel.ERROR, 'Error converting HFN to MFA:', err);
      return '';
    }
  }, []);
  
  /**
   * Convert a Machine-Friendly Address (MFA) to a Human-Friendly Name (HFN)
   */
  const convertMFAtoHFN = useCallback((mfa: string): string => {
    try {
      return taxonomyService.convertMFAtoHFN(mfa);
    } catch (err) {
      logger.taxonomy(LogLevel.ERROR, 'Error converting MFA to HFN:', err);
      return '';
    }
  }, []);
  
  /**
   * Validate a Human-Friendly Name (HFN)
   */
  const validateHFN = useCallback((hfn: string): boolean => {
    try {
      return taxonomyService.validateHFN(hfn);
    } catch (err) {
      logger.taxonomy(LogLevel.ERROR, 'Error validating HFN:', err);
      return false;
    }
  }, []);
  
  /**
   * Build a Human-Friendly Name (HFN) from a taxonomy path
   */
  const buildHFN = useCallback((path: TaxonomyPath): string => {
    try {
      const { layer, category, subcategory } = path;
      return `${layer}.${category}.${subcategory}.001`;
    } catch (err) {
      logger.taxonomy(LogLevel.ERROR, 'Error building HFN:', err);
      return '';
    }
  }, []);
  
  /**
   * Parse a Human-Friendly Name (HFN) into a taxonomy path
   */
  const parseHFN = useCallback((hfn: string): TaxonomyPath | null => {
    try {
      const parts = hfn.split('.');
      if (parts.length < 3) {
        return null;
      }
      
      return {
        layer: parts[0],
        category: parts[1],
        subcategory: parts[2]
      };
    } catch (err) {
      logger.taxonomy(LogLevel.ERROR, 'Error parsing HFN:', err);
      return null;
    }
  }, []);
  
  // Create the context value with memoization to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    taxonomyData,
    loadingState,
    error,
    lastUpdated,
    
    getCategories,
    getSubcategories,
    convertHFNtoMFA,
    convertMFAtoHFN,
    validateHFN,
    refreshTaxonomyData,
    
    buildHFN,
    parseHFN
  }), [
    taxonomyData, 
    loadingState, 
    error, 
    lastUpdated, 
    getCategories,
    getSubcategories,
    convertHFNtoMFA,
    convertMFAtoHFN,
    validateHFN,
    refreshTaxonomyData,
    buildHFN,
    parseHFN
  ]);
  
  return (
    <TaxonomyContext.Provider value={contextValue}>
      {children}
    </TaxonomyContext.Provider>
  );
};

/**
 * Custom hook to use taxonomy data
 */
/**
 * Custom hook to use taxonomy data
 */
export const useTaxonomyData = () => useContext(TaxonomyContext);

// Add displayName for debugging
TaxonomyDataProvider.displayName = 'TaxonomyDataProvider';