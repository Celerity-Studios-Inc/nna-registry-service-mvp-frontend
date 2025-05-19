/**
 * Taxonomy Error Recovery Service
 *
 * Provides fallback data and recovery strategies when the taxonomy system
 * encounters errors. This service is designed to work with the useTaxonomy hook
 * and the TaxonomyInitProvider to ensure a graceful experience even when
 * taxonomy data cannot be loaded properly.
 */
import { TaxonomyItem } from '../types/taxonomy.types';
import { logger } from '../utils/logger';

// Define types for the fallback data structures
type TaxonomyItemArray = Array<{
  code: string;
  numericCode: string;
  name: string;
}>;

interface CategoryMap {
  [key: string]: TaxonomyItemArray;
}

interface SubcategoryMap {
  [key: string]: TaxonomyItemArray;
}

interface MfaMap {
  [key: string]: string;
}

// Fallback data for critical taxonomy paths
const FALLBACK_DATA = {
  CATEGORIES: {
    S: [
      // Songs
      { code: 'POP', numericCode: '004', name: 'Pop' },
      { code: 'RCK', numericCode: '005', name: 'Rock' },
      { code: 'HIP', numericCode: '006', name: 'Hip Hop' },
    ],
    W: [
      // Worlds
      { code: 'BCH', numericCode: '004', name: 'Beach' },
      { code: 'CST', numericCode: '005', name: 'Coast' },
      { code: 'DCL', numericCode: '006', name: 'Dance Club' },
    ],
    G: [
      // Genesis
      { code: 'GRD', numericCode: '001', name: 'Ground' },
      { code: 'OBJ', numericCode: '002', name: 'Object' },
    ],
    L: [
      // Looks
      { code: 'OUT', numericCode: '001', name: 'Outfit' },
      { code: 'ACC', numericCode: '002', name: 'Accessory' },
    ],
    M: [
      // Moves
      { code: 'DNC', numericCode: '001', name: 'Dance' },
      { code: 'ACT', numericCode: '002', name: 'Action' },
    ],
  } as CategoryMap,
  SUBCATEGORIES: {
    'S.POP': [
      // Song - Pop
      { code: 'BPP', numericCode: '001', name: 'Bubblegum Pop' },
      { code: 'ELP', numericCode: '002', name: 'Electro Pop' },
      { code: 'HPM', numericCode: '003', name: 'Hip Pop Music' },
    ],
    'S.RCK': [
      // Song - Rock
      { code: 'BAS', numericCode: '001', name: 'Bass' },
      { code: 'ALT', numericCode: '002', name: 'Alternative' },
    ],
    'W.BCH': [
      // World - Beach
      { code: 'SUN', numericCode: '003', name: 'Sunset' },
      { code: 'FES', numericCode: '003', name: 'Festival' },
      { code: 'TRO', numericCode: '002', name: 'Tropical' },
    ],
  } as SubcategoryMap,
  MFA_MAPPINGS: {
    'W.BCH.SUN': '5.004.003',
    'S.POP.HPM': '2.004.003',
  } as MfaMap,
};

// Maximum number of retries for loading taxonomy data
const MAX_RETRIES = 3;

// Record to track repeated errors to prevent repeated fallback logging
const errorTrackingMap = new Map<string, number>();

/**
 * Get fallback categories for a layer when primary data fails to load
 */
export function getFallbackCategories(layer: string): TaxonomyItem[] {
  const key = `categories-${layer}`;
  const errorCount = (errorTrackingMap.get(key) || 0) + 1;
  errorTrackingMap.set(key, errorCount);

  if (errorCount === 1) {
    logger.warn(
      `Using fallback categories for layer ${layer} (attempt ${errorCount})`
    );
  }

  return FALLBACK_DATA.CATEGORIES[layer] || [];
}

/**
 * Get fallback subcategories for a layer/category when primary data fails to load
 */
export function getFallbackSubcategories(
  layer: string,
  category: string
): TaxonomyItem[] {
  const key = `subcategories-${layer}.${category}`;
  const errorCount = (errorTrackingMap.get(key) || 0) + 1;
  errorTrackingMap.set(key, errorCount);

  if (errorCount === 1) {
    logger.warn(
      `Using fallback subcategories for ${layer}.${category} (attempt ${errorCount})`
    );
  }

  const fallbackKey = `${layer}.${category}`;
  return FALLBACK_DATA.SUBCATEGORIES[fallbackKey] || [];
}

/**
 * Get fallback MFA code for a given layer, category, and subcategory
 */
export function getFallbackMFA(
  layer: string,
  category: string,
  subcategory: string,
  sequential: string,
  fileType?: string
): string {
  const key = `mfa-${layer}.${category}.${subcategory}`;
  const errorCount = (errorTrackingMap.get(key) || 0) + 1;
  errorTrackingMap.set(key, errorCount);

  if (errorCount === 1) {
    logger.warn(
      `Using fallback MFA mapping for ${layer}.${category}.${subcategory} (attempt ${errorCount})`
    );
  }

  const fallbackKey = `${layer}.${category}.${subcategory}`;
  const baseMapping = FALLBACK_DATA.MFA_MAPPINGS[fallbackKey];

  if (!baseMapping) {
    return '';
  }

  return `${baseMapping}.${sequential}${fileType ? `.${fileType}` : ''}`;
}

/**
 * Check if maximum retries have been reached for a specific operation
 */
export function hasReachedMaxRetries(
  operationType: string,
  identifier: string
): boolean {
  const key = `${operationType}-${identifier}`;
  const currentRetries = errorTrackingMap.get(key) || 0;
  return currentRetries >= MAX_RETRIES;
}

/**
 * Increment retry count for a specific operation
 */
export function incrementRetryCount(
  operationType: string,
  identifier: string
): number {
  const key = `${operationType}-${identifier}`;
  const currentRetries = (errorTrackingMap.get(key) || 0) + 1;
  errorTrackingMap.set(key, currentRetries);
  return currentRetries;
}

/**
 * Reset retry counts for all operations or a specific one
 */
export function resetRetryCount(
  operationType?: string,
  identifier?: string
): void {
  if (operationType && identifier) {
    const key = `${operationType}-${identifier}`;
    errorTrackingMap.delete(key);
  } else {
    errorTrackingMap.clear();
  }
}

/**
 * Get user-friendly error message for taxonomy errors
 */
export function getUserFriendlyErrorMessage(
  error: Error,
  context: string
): string {
  // Extract the base message without stack trace
  const baseMessage = error.message.split('\n')[0];

  switch (context) {
    case 'initialization':
      return `Unable to initialize taxonomy data. Some features may be limited. (${baseMessage})`;
    case 'categories':
      return `Unable to load categories. Using fallback data if available. (${baseMessage})`;
    case 'subcategories':
      return `Unable to load subcategories. Using fallback data if available. (${baseMessage})`;
    case 'mfa-conversion':
      return `Unable to generate NNA Address. Using fallback mapping if available. (${baseMessage})`;
    default:
      return `Taxonomy error: ${baseMessage}`;
  }
}

// Export a singleton instance
export const taxonomyErrorRecovery = {
  getFallbackCategories,
  getFallbackSubcategories,
  getFallbackMFA,
  hasReachedMaxRetries,
  incrementRetryCount,
  resetRetryCount,
  getUserFriendlyErrorMessage,
};
