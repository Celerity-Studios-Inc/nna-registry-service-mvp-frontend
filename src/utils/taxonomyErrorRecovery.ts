/**
 * Taxonomy Error Recovery Utilities
 * 
 * This file contains utility functions for recovering from taxonomy-related errors.
 * It provides fallback mechanisms, cleanup functions, and global error handlers.
 */

import { logger } from './logger';

/**
 * Reset the taxonomy-related session storage to recover from corrupted state
 * @param preserveItems Items to preserve (optional)
 */
export const resetTaxonomyStorage = (preserveItems: string[] = []) => {
  
  const keysToKeep = new Set(preserveItems);
  const keysToRemove: string[] = [];
  
  // Find all taxonomy-related keys
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (!key) continue;
    
    // Skip preserved items
    if (keysToKeep.has(key)) continue;
    
    // Check if key is related to taxonomy
    if (
      key.startsWith('taxonomy_') ||
      key.startsWith('lastActive') ||
      key.startsWith('selected') ||
      key.startsWith('direct') ||
      key.includes('layer') ||
      key.includes('category') ||
      key.includes('subcategory')
    ) {
      keysToRemove.push(key);
    }
  }
  
  // Remove the identified keys
  keysToRemove.forEach(key => {
    sessionStorage.removeItem(key);
  });
  
  return keysToRemove.length;
};

/**
 * Clear any cached taxonomy data in session storage related to a specific layer
 * @param layer The layer code
 */
export const resetLayerData = (layer: string) => {
  
  const keysToRemove: string[] = [];
  
  // Find all keys related to this layer
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (!key) continue;
    
    // Check if key is related to this layer
    if (
      key.includes(`_${layer}_`) ||
      key.includes(`_${layer}.`) ||
      key.includes(`.${layer}_`) ||
      key === `selectedLayer_${layer}` ||
      key === `directCategories_${layer}`
    ) {
      keysToRemove.push(key);
    }
  }
  
  // Remove the identified keys
  keysToRemove.forEach(key => {
    sessionStorage.removeItem(key);
  });
  
  return keysToRemove.length;
};

/**
 * Force the taxonomy context to refresh by dispatching events
 * @param layer Optional layer to refresh
 */
export const forceTaxonomyRefresh = (layer?: string) => {
  
  // Create a unique operation ID for this recovery
  const recoveryId = `recovery_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  if (layer) {
    // Create a layer change event to force taxonomy refresh
    const layerChangeEvent = new CustomEvent('layerChanged', {
      detail: {
        layer,
        timestamp: Date.now(),
        operationId: recoveryId,
        isRecovery: true
      }
    });
    
    // Dispatch the event
    window.dispatchEvent(layerChangeEvent);
  } else {
    // Create a general taxonomy refresh event
    const refreshEvent = new CustomEvent('taxonomyEmergencyReload', {
      detail: {
        timestamp: Date.now(),
        operationId: recoveryId,
        isRecovery: true
      }
    });
    
    // Dispatch the event
    window.dispatchEvent(refreshEvent);
  }
  
  return recoveryId;
};

/**
 * Comprehensive taxonomy recovery process
 * @param layer Optional layer to focus recovery on
 * @returns Promise that resolves when recovery is complete
 */
export const performFullRecovery = async (layer?: string): Promise<boolean> => {
  
  // Step 1: Reset session storage
  if (layer) {
    resetLayerData(layer);
  } else {
    resetTaxonomyStorage();
  }
  
  // CRITICAL FIX: Reset any pending selection throttles to ensure we can make new selections
  try {
    // Clear all throttle keys to ensure we can make new selections after recovery
    if (window.__layerSelectionLock) {
      console.log('[TAXONOMY RECOVERY] Clearing layer selection lock');
      window.__layerSelectionLock = false;
    }
    if (window.__categorySelectionTimestamp) {
      console.log('[TAXONOMY RECOVERY] Clearing category selection timestamp');
      window.__categorySelectionTimestamp = 0;
    }
  } catch (e) {
    console.warn('[TAXONOMY RECOVERY] Error clearing throttle keys:', e);
  }
  
  // Step 2: Force refresh with a delay to allow storage changes to take effect
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        // Force refresh
        const recoveryId = forceTaxonomyRefresh(layer);
        
        // CRITICAL FIX: Perform additional recovery steps for the Star layer
        // because it has special handling needs for POP category
        if (layer === 'S') {
          console.log(`[TAXONOMY RECOVERY ${recoveryId}] Special recovery for Star layer`);
          
          try {
            // Direct service call to prefetch categories for the Star layer
            const taxonomyService = require('../services/simpleTaxonomyService').taxonomyService;
            const starCategories = taxonomyService.getCategories('S');
            
            if (starCategories && starCategories.length > 0) {
              console.log(`[TAXONOMY RECOVERY ${recoveryId}] Pre-loaded ${starCategories.length} Star categories`);
              
              // Store in session storage for faster access
              try {
                sessionStorage.setItem('directCategories_S', JSON.stringify(starCategories));
                
                // Also specifically pre-load POP category subcategories since that's a common issue
                const popSubcategories = taxonomyService.getSubcategories('S', 'POP');
                if (popSubcategories && popSubcategories.length > 0) {
                  console.log(`[TAXONOMY RECOVERY ${recoveryId}] Pre-loaded ${popSubcategories.length} POP subcategories`);
                  sessionStorage.setItem('subcategoriesList_S_POP', JSON.stringify(popSubcategories));
                }
              } catch (e) {
                console.warn(`[TAXONOMY RECOVERY ${recoveryId}] Session storage error:`, e);
              }
            }
          } catch (e) {
            console.warn(`[TAXONOMY RECOVERY ${recoveryId}] Special Star layer recovery error:`, e);
          }
        }
        
        // Wait for a bit to allow the refresh to complete
        setTimeout(() => {
          console.log(`[TAXONOMY RECOVERY ${recoveryId}] Recovery process completed`);
          resolve(true);
        }, 500);
      } catch (error) {
        console.error('[TAXONOMY RECOVERY] Recovery failed:', error);
        resolve(false);
      }
    }, 100);
  });
};

/**
 * Fix for React Error #301 - Attempts to recover from the unmounted component state error
 */
export const fixReactError301 = async (): Promise<boolean> => {
  console.log('[TAXONOMY RECOVERY] Attempting to fix React Error #301');
  
  // Step 1: Reset all taxonomy storage
  resetTaxonomyStorage();
  
  // Step 2: Create and dispatch a special event to notify components
  const errorFixEvent = new CustomEvent('reactError301Fix', {
    detail: {
      timestamp: Date.now(),
      message: 'Attempting to recover from React Error #301'
    }
  });
  
  window.dispatchEvent(errorFixEvent);
  
  // Step 3: Force a taxonomy refresh after a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        forceTaxonomyRefresh();
        resolve(true);
      } catch (error) {
        console.error('[TAXONOMY RECOVERY] Error 301 fix failed:', error);
        resolve(false);
      }
    }, 200);
  });
};

/**
 * Register global error handling for taxonomy components
 */
export const setupGlobalTaxonomyErrorHandler = () => {
  // Create a listener for unhandled errors
  window.addEventListener('error', (event) => {
    // Check if this is a React error in the taxonomy components
    if (event.error && event.error.message && 
        (event.error.message.includes('React error #301') || 
         event.error.stack?.includes('SimpleTaxonomySelectionV2') ||
         event.error.stack?.includes('SimpleTaxonomySelectionV3') ||
         event.error.stack?.includes('TaxonomyContext'))) {
      
      console.error('[TAXONOMY RECOVERY] Detected React Error #301:', event.error);
      
      // Attempt recovery
      fixReactError301().then(success => {
        console.log(`[TAXONOMY RECOVERY] Recovery ${success ? 'succeeded' : 'failed'}`);
      });
      
      // Prevent the error from bubbling up to crash the app
      event.preventDefault();
    }
  });
  
  console.log('[TAXONOMY RECOVERY] Global taxonomy error handler initialized');
};

/**
 * Specific recovery function for the enhanced SimpleTaxonomySelectionV3 component
 * @param layerCode The layer code to recover
 * @param categoryCode The category code to recover
 * @returns Promise that resolves when recovery is complete
 */
export const recoverEnhancedTaxonomySelection = async (
  layerCode: string,
  categoryCode?: string
): Promise<boolean> => {
  logger.info(`[ENHANCED RECOVERY] Starting recovery for ${layerCode}${categoryCode ? `.${categoryCode}` : ''}`);
  
  try {
    // Step 1: Clear any cached data for this combination
    const subcategoryCacheKey = categoryCode ? `${layerCode}.${categoryCode}` : null;
    
    // Clear any subcategory cache entries
    if (subcategoryCacheKey) {
      try {
        sessionStorage.removeItem(`subcategoriesCache_${subcategoryCacheKey}`);
        sessionStorage.removeItem(`subcategoriesList_${subcategoryCacheKey}`);
        
        // Also check for direct caching in component refs
        const taxonomyCacheStr = sessionStorage.getItem('taxonomyCache');
        if (taxonomyCacheStr) {
          try {
            const taxonomyCache = JSON.parse(taxonomyCacheStr);
            if (taxonomyCache[subcategoryCacheKey]) {
              delete taxonomyCache[subcategoryCacheKey];
              sessionStorage.setItem('taxonomyCache', JSON.stringify(taxonomyCache));
            }
          } catch (e) {
            console.warn('Error parsing taxonomy cache:', e);
          }
        }
      } catch (e) {
        console.warn('Error clearing subcategory cache:', e);
      }
    }
    
    // Step 2: Force a data reload by dispatching a custom event
    const recoveryEvent = new CustomEvent('enhanced-taxonomy-reload', {
      detail: {
        layerCode,
        categoryCode,
        timestamp: Date.now(),
        source: 'recovery'
      }
    });
    
    window.dispatchEvent(recoveryEvent);
    logger.info('[ENHANCED RECOVERY] Dispatched enhanced-taxonomy-reload event');
    
    // Step 3: Preload required data using the enhanced service
    try {
      const enhancedService = require('../services/enhancedTaxonomyService');
      
      // Preload categories for the layer
      const categories = enhancedService.getCategories(layerCode);
      logger.info(`[ENHANCED RECOVERY] Preloaded ${categories.length} categories for ${layerCode}`);
      
      // If category code provided, preload subcategories
      if (categoryCode) {
        const subcategories = enhancedService.getSubcategories(layerCode, categoryCode);
        logger.info(`[ENHANCED RECOVERY] Preloaded ${subcategories.length} subcategories for ${layerCode}.${categoryCode}`);
        
        // Check if we got subcategories, if not try the fallback data
        if (!subcategories || subcategories.length === 0) {
          try {
            const { FALLBACK_SUBCATEGORIES } = require('../services/taxonomyFallbackData');
            if (FALLBACK_SUBCATEGORIES[layerCode]?.[categoryCode]) {
              logger.info(`[ENHANCED RECOVERY] Using fallback data for ${layerCode}.${categoryCode}`);
              
              // Store fallback data in session storage
              const fallbackData = FALLBACK_SUBCATEGORIES[layerCode][categoryCode];
              sessionStorage.setItem(`subcategoriesList_${layerCode}_${categoryCode}`, JSON.stringify(fallbackData));
            }
          } catch (e) {
            logger.error('[ENHANCED RECOVERY] Error using fallback data:', e);
          }
        }
      }
    } catch (e) {
      logger.error('[ENHANCED RECOVERY] Error preloading data:', e);
    }
    
    return true;
  } catch (error) {
    logger.error('[ENHANCED RECOVERY] Recovery failed:', error);
    return false;
  }
};