/**
 * Enhanced Taxonomy Service - Toggle-Controlled Backend Integration
 * 
 * This service can operate in two modes based on user settings:
 * 1. Frontend Mode (default): Uses existing flat file taxonomy service
 * 2. Backend Mode (experimental): Uses live backend APIs
 * 
 * The mode is controlled by the Settings page toggle for backend taxonomy.
 */

import { logger } from '../utils/logger';
import { TaxonomyItem } from '../types/taxonomy.types';
// Import the original frontend service for fallback
import { taxonomyService as frontendTaxonomyService } from './simpleTaxonomyService';

/**
 * Check if user has enabled backend taxonomy service via Settings
 */
function isBackendTaxonomyEnabled(): boolean {
  try {
    const setting = localStorage.getItem('nna-use-backend-taxonomy');
    return setting === 'true';
  } catch (error) {
    logger.warn('Could not read backend taxonomy setting, defaulting to frontend service');
    return false;
  }
}

/**
 * Environment-aware backend URL selection for when backend mode is enabled
 */
function getBackendUrl(): string {
  // Use environment variables for proper canonical URLs
  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }

  // Fallback based on environment detection
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      return 'https://registry.dev.reviz.dev';
    } else if (hostname.includes('dev') || hostname.includes('-dev.')) {
      return 'https://registry.dev.reviz.dev';
    } else if (hostname.includes('stg') || hostname.includes('staging')) {
      return 'https://registry.stg.reviz.dev';
    } else {
      return 'https://registry.reviz.dev';
    }
  }

  // Default to development
  return 'https://registry.dev.reviz.dev';
}

/**
 * Enhanced fetch wrapper with error handling and logging
 */
async function fetchWithErrorHandling(url: string, options?: RequestInit): Promise<any> {
  try {
    logger.debug(`API Request: ${url}`);
    const startTime = Date.now();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const responseTime = Date.now() - startTime;
    logger.debug(`API Response: ${url} (${responseTime}ms) - ${response.status}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    logger.debug(`API Data received: ${JSON.stringify(data).substring(0, 200)}...`);
    
    return data;
  } catch (error) {
    logger.error(`API Error for ${url}:`, error);
    throw error;
  }
}

/**
 * Simple in-memory cache for API responses
 * Backend is fast (<100ms) but caching reduces unnecessary calls
 */
class TaxonomyCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    logger.debug(`Cache hit: ${key}`);
    return cached.data;
  }

  clear(): void {
    this.cache.clear();
    logger.debug('Taxonomy cache cleared');
  }
}

const cache = new TaxonomyCache();

/**
 * Gets all available layers - toggles between frontend and backend based on user setting
 */
export async function getLayers(): Promise<string[]> {
  // Check if user has enabled backend taxonomy service
  if (!isBackendTaxonomyEnabled()) {
    logger.debug('Using frontend taxonomy service for layers');
    // Return available layers from the frontend service
    return ['G', 'S', 'L', 'M', 'W', 'B', 'P', 'T', 'C', 'R'];
  }

  logger.debug('Using backend taxonomy service for layers');
  
  const cacheKey = 'layers';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const baseUrl = getBackendUrl();
    const url = `${baseUrl}/api/taxonomy/layers`;
    
    const data = await fetchWithErrorHandling(url);
    
    // Backend returns object like {"G": "Songs", "S": "Stars", ...}
    // Convert to array of layer codes
    const layers = Object.keys(data);
    
    logger.debug(`Retrieved ${layers.length} layers from backend:`, layers);
    
    cache.set(cacheKey, layers);
    return layers;
  } catch (error) {
    logger.error('Failed to get layers from backend:', error);
    
    // Fallback to known layers if backend fails
    const fallbackLayers = ['G', 'S', 'L', 'M', 'W', 'C', 'B', 'P', 'T', 'R'];
    logger.warn('Using fallback layers:', fallbackLayers);
    return fallbackLayers;
  }
}

/**
 * Gets categories for a specific layer - toggles between frontend and backend based on user setting
 */
export async function getCategories(layer: string): Promise<TaxonomyItem[]> {
  // Check if user has enabled backend taxonomy service
  if (!isBackendTaxonomyEnabled()) {
    logger.debug(`Using frontend taxonomy service for categories (layer: ${layer})`);
    return frontendTaxonomyService.getCategories(layer);
  }

  logger.debug(`Using backend taxonomy service for categories (layer: ${layer})`);
  
  const cacheKey = `categories-${layer}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const baseUrl = getBackendUrl();
    const url = `${baseUrl}/api/taxonomy/layers/${layer}/categories`;
    
    const data = await fetchWithErrorHandling(url);
    
    // Backend returns: {"layer": "S", "categories": [{"code": "POP", "name": "Pop", "numericCode": "001"}], "count": 16}
    const categories: TaxonomyItem[] = data.categories.map((cat: any) => ({
      code: cat.code,
      name: cat.name,
      numericCode: cat.numericCode
    }));
    
    logger.debug(`Retrieved ${categories.length} categories for layer ${layer} from backend`);
    
    cache.set(cacheKey, categories);
    return categories;
  } catch (error) {
    logger.error(`Failed to get categories for layer ${layer} from backend:`, error);
    // Fallback to frontend service on error
    logger.debug('Falling back to frontend taxonomy service');
    return frontendTaxonomyService.getCategories(layer);
  }
}

/**
 * Gets subcategories for a specific layer and category - toggles between frontend and backend based on user setting
 */
export async function getSubcategories(layer: string, categoryCode: string): Promise<TaxonomyItem[]> {
  // Check if user has enabled backend taxonomy service
  if (!isBackendTaxonomyEnabled()) {
    logger.debug(`Using frontend taxonomy service for subcategories (layer: ${layer}, category: ${categoryCode})`);
    return frontendTaxonomyService.getSubcategories(layer, categoryCode);
  }

  logger.debug(`Using backend taxonomy service for subcategories (layer: ${layer}, category: ${categoryCode})`);
  
  const cacheKey = `subcategories-${layer}-${categoryCode}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const baseUrl = getBackendUrl();
    const url = `${baseUrl}/api/taxonomy/layers/${layer}/categories/${categoryCode}/subcategories`;
    
    const data = await fetchWithErrorHandling(url);
    
    // Backend returns: {"layer": "S", "category": "POP", "subcategories": [{"code": "POP.BAS", "name": "Base", "numericCode": "001"}], "count": 16}
    const subcategories: TaxonomyItem[] = data.subcategories.map((sub: any) => {
      // Extract subcategory code from full code (e.g., "POP.BAS" → "BAS")
      const subCode = sub.code.includes('.') ? sub.code.split('.')[1] : sub.code;
      
      return {
        code: subCode,
        name: sub.name,
        numericCode: sub.numericCode
      };
    });
    
    logger.debug(`Retrieved ${subcategories.length} subcategories for ${layer}.${categoryCode}`);
    
    cache.set(cacheKey, subcategories);
    return subcategories;
  } catch (error) {
    logger.error(`Failed to get subcategories for ${layer}.${categoryCode} from backend:`, error);
    // Fallback to frontend service on error
    logger.debug('Falling back to frontend taxonomy service');
    return frontendTaxonomyService.getSubcategories(layer, categoryCode);
  }
}

/**
 * Converts a Human-Friendly Name (HFN) to a Machine-Friendly Address (MFA) - toggles between frontend and backend based on user setting
 */
export async function convertHFNtoMFA(hfn: string): Promise<string> {
  if (!hfn) return '';

  // Check if user has enabled backend taxonomy service
  if (!isBackendTaxonomyEnabled()) {
    logger.debug(`Using frontend taxonomy service for HFN->MFA conversion: ${hfn}`);
    return frontendTaxonomyService.convertHFNtoMFA(hfn);
  }

  logger.debug(`Using backend taxonomy service for HFN->MFA conversion: ${hfn}`);

  try {
    const baseUrl = getBackendUrl();
    const url = `${baseUrl}/api/taxonomy/convert/hfn-to-mfa`;
    
    const response = await fetchWithErrorHandling(url, {
      method: 'POST',
      body: JSON.stringify({ hfn }),
    });

    // Backend returns: {"hfn": "S.POP.BAS.001", "mfa": "2.001.001.001", "success": true}
    if (response.success && response.mfa) {
      logger.debug(`Converted HFN to MFA: ${hfn} → ${response.mfa}`);
      return response.mfa;
    } else {
      logger.error('Backend conversion failed:', response);
      // Fallback to frontend service
      return frontendTaxonomyService.convertHFNtoMFA(hfn);
    }
  } catch (error) {
    logger.error(`Failed to convert HFN to MFA via backend: ${hfn}`, error);
    // Fallback to frontend service on error
    logger.debug('Falling back to frontend taxonomy service');
    return frontendTaxonomyService.convertHFNtoMFA(hfn);
  }
}

/**
 * Converts a Machine-Friendly Address (MFA) to a Human-Friendly Name (HFN) - toggles between frontend and backend based on user setting
 */
export async function convertMFAtoHFN(mfa: string): Promise<string> {
  if (!mfa) return '';

  // Check if user has enabled backend taxonomy service
  if (!isBackendTaxonomyEnabled()) {
    logger.debug(`Using frontend taxonomy service for MFA->HFN conversion: ${mfa}`);
    return frontendTaxonomyService.convertMFAtoHFN(mfa);
  }

  logger.debug(`Using backend taxonomy service for MFA->HFN conversion: ${mfa}`);

  try {
    const baseUrl = getBackendUrl();
    const url = `${baseUrl}/api/taxonomy/convert/mfa-to-hfn`;
    
    const response = await fetchWithErrorHandling(url, {
      method: 'POST',
      body: JSON.stringify({ mfa }),
    });

    // Backend returns: {"mfa": "2.001.001.001", "hfn": "S.POP.BAS.001", "success": true}
    if (response.success && response.hfn) {
      logger.debug(`Converted MFA to HFN: ${mfa} → ${response.hfn}`);
      return response.hfn;
    } else {
      logger.error('Backend conversion failed:', response);
      // Fallback to frontend service
      return frontendTaxonomyService.convertMFAtoHFN(mfa);
    }
  } catch (error) {
    logger.error(`Failed to convert MFA to HFN via backend: ${mfa}`, error);
    // Fallback to frontend service on error
    logger.debug('Falling back to frontend taxonomy service');
    return frontendTaxonomyService.convertMFAtoHFN(mfa);
  }
}

/**
 * Gets backend taxonomy service health
 */
export async function getTaxonomyHealth(): Promise<any> {
  try {
    const baseUrl = getBackendUrl();
    const url = `${baseUrl}/api/taxonomy/health`;
    
    const health = await fetchWithErrorHandling(url);
    logger.debug('Taxonomy service health:', health);
    
    return health;
  } catch (error) {
    logger.error('Failed to get taxonomy health:', error);
    return { status: 'unhealthy', error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Gets backend taxonomy service version
 */
export async function getTaxonomyVersion(): Promise<any> {
  try {
    const baseUrl = getBackendUrl();
    const url = `${baseUrl}/api/taxonomy/version`;
    
    const version = await fetchWithErrorHandling(url);
    logger.debug('Taxonomy service version:', version);
    
    return version;
  } catch (error) {
    logger.error('Failed to get taxonomy version:', error);
    return { version: 'unknown', error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Clears the taxonomy cache
 * Useful for refreshing data when backend is updated
 */
export function clearTaxonomyCache(): void {
  cache.clear();
  logger.info('Taxonomy cache cleared - fresh data will be fetched on next request');
}

/**
 * Inspection utility for debugging taxonomy structure (backward compatibility)
 */
export async function inspectTaxonomyStructure(layer: string, categoryCode: string): Promise<Record<string, any>> {
  try {
    logger.debug(`Inspecting taxonomy structure: ${layer}.${categoryCode}`);
    
    // Get categories for the layer
    const categories = await getCategories(layer);
    const categoryExists = categories.some(cat => cat.code === categoryCode);
    
    if (!categoryExists) {
      return { exists: false, reason: 'category_not_found' };
    }
    
    // Get subcategories for the layer/category
    const subcategories = await getSubcategories(layer, categoryCode);
    
    return {
      exists: true,
      categoryName: categories.find(cat => cat.code === categoryCode)?.name || categoryCode,
      subcategories: subcategories.map(sub => ({
        id: sub.numericCode,
        code: sub.code,
        name: sub.name
      }))
    };
  } catch (error) {
    logger.error('Error inspecting taxonomy structure:', error);
    return { exists: false, reason: 'error', error: String(error) };
  }
}

/**
 * Debug utility for inspecting API responses
 */
export async function debugTaxonomyAPI(layer?: string, categoryCode?: string): Promise<void> {
  logger.debug('=== Taxonomy API Debug ===');
  
  try {
    // Test health
    const health = await getTaxonomyHealth();
    logger.debug('Health:', health);
    
    // Test version
    const version = await getTaxonomyVersion();
    logger.debug('Version:', version);
    
    // Test layers
    const layers = await getLayers();
    logger.debug('Layers:', layers);
    
    if (layer) {
      // Test categories for specific layer
      const categories = await getCategories(layer);
      logger.debug(`Categories for ${layer}:`, categories);
      
      if (categoryCode && categories.length > 0) {
        // Test subcategories for specific layer/category
        const subcategories = await getSubcategories(layer, categoryCode);
        logger.debug(`Subcategories for ${layer}.${categoryCode}:`, subcategories);
      }
    }
    
    logger.debug('=== End Taxonomy API Debug ===');
  } catch (error) {
    logger.error('Debug failed:', error);
  }
}

// Export all functions as a service object for backward compatibility
export const enhancedTaxonomyService = {
  getLayers,
  getCategories,
  getSubcategories,
  convertHFNtoMFA,
  convertMFAtoHFN,
  getTaxonomyHealth,
  getTaxonomyVersion,
  clearTaxonomyCache,
  debugTaxonomyAPI,
  inspectTaxonomyStructure
};

export default enhancedTaxonomyService;