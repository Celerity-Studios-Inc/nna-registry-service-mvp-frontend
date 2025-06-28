/**
 * API-Based Taxonomy Service
 * 
 * This service integrates with the backend taxonomy microservice to provide
 * a single source of truth for all taxonomy data. It replaces the existing
 * flattened taxonomy files with live API calls to the backend service.
 * 
 * Features:
 * - Real-time taxonomy data from backend API
 * - Automatic caching with TTL
 * - Fallback to existing flattened taxonomy during migration
 * - Environment-aware API endpoints
 * - Sequential asset numbering integration
 * - Admin capabilities for taxonomy management
 */

import { logger } from '../utils/logger';
import { TaxonomyItem } from '../types/taxonomy.types';
import { getEnvironmentConfig } from '../utils/environment.config';

// Cache interface for storing taxonomy data
interface TaxonomyCacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface TaxonomyCache {
  layers: TaxonomyCacheItem<string[]> | null;
  categories: Map<string, TaxonomyCacheItem<TaxonomyItem[]>>;
  subcategories: Map<string, TaxonomyCacheItem<TaxonomyItem[]>>;
  version: TaxonomyCacheItem<TaxonomyVersion> | null;
}

interface TaxonomyVersion {
  version: number;
  lastUpdated: string;
  checksum: string;
}

interface NextSequenceResponse {
  layer: string;
  category: string;
  subcategory: string;
  nextNumber: number;
  formattedSequence: string; // e.g., "001"
}

interface TaxonomyTreeNode {
  id: string;
  layer?: string;
  category?: string;
  subcategory?: string;
  name: string;
  description?: string;
  numericCode: string;
  children?: TaxonomyTreeNode[];
}

interface TaxonomyTree {
  version: number;
  lastUpdated: string;
  tree: TaxonomyTreeNode[];
}

// Cache configuration
const CACHE_TTL = {
  LAYERS: 1 * 60 * 60 * 1000, // 1 hour
  CATEGORIES: 30 * 60 * 1000,  // 30 minutes
  SUBCATEGORIES: 15 * 60 * 1000, // 15 minutes
  VERSION: 5 * 60 * 1000,      // 5 minutes
};

class ApiTaxonomyService {
  private cache: TaxonomyCache;
  private baseUrl: string;
  private fallbackService: any;

  constructor() {
    this.cache = {
      layers: null,
      categories: new Map(),
      subcategories: new Map(),
      version: null,
    };
    
    // Get environment-specific API base URL
    const envConfig = getEnvironmentConfig();
    this.baseUrl = envConfig.backendUrl;
    
    // Initialize fallback service for migration period
    this.initializeFallbackService();
    
    logger.debug('ApiTaxonomyService initialized with base URL:', this.baseUrl);
  }

  private async initializeFallbackService() {
    try {
      // Import the existing enhanced taxonomy service as fallback
      const { enhancedTaxonomyService } = await import('./enhancedTaxonomyService');
      this.fallbackService = enhancedTaxonomyService;
      logger.debug('Fallback taxonomy service initialized');
    } catch (error) {
      logger.error('Failed to initialize fallback taxonomy service:', error);
    }
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid<T>(cacheItem: TaxonomyCacheItem<T> | null): boolean {
    if (!cacheItem) return false;
    return Date.now() - cacheItem.timestamp < cacheItem.ttl;
  }

  /**
   * Create a cache item with TTL
   */
  private createCacheItem<T>(data: T, ttl: number): TaxonomyCacheItem<T> {
    return {
      data,
      timestamp: Date.now(),
      ttl,
    };
  }

  /**
   * Make API request with error handling and fallback
   */
  private async apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T | null> {
    try {
      const url = `${this.baseUrl}/api/taxonomy${endpoint}`;
      logger.debug(`Making API request to: ${url}`);

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      logger.debug(`API response received for ${endpoint}:`, data);
      return data;
    } catch (error) {
      logger.error(`API request failed for ${endpoint}:`, error);
      return null;
    }
  }

  /**
   * Get current taxonomy version
   */
  async getTaxonomyVersion(): Promise<TaxonomyVersion | null> {
    // Check cache first
    if (this.isCacheValid(this.cache.version)) {
      logger.debug('Returning cached taxonomy version');
      return this.cache.version!.data;
    }

    const version = await this.apiRequest<TaxonomyVersion>('/version');
    if (version) {
      this.cache.version = this.createCacheItem(version, CACHE_TTL.VERSION);
      logger.debug('Cached taxonomy version:', version);
      return version;
    }

    return null;
  }

  /**
   * Get the complete taxonomy tree
   */
  async getTaxonomyTree(): Promise<TaxonomyTree | null> {
    const tree = await this.apiRequest<TaxonomyTree>('/tree');
    if (tree) {
      logger.debug('Retrieved taxonomy tree with version:', tree.version);
      return tree;
    }
    return null;
  }

  /**
   * Get all available layers
   */
  async getLayers(): Promise<string[]> {
    // Check cache first
    if (this.isCacheValid(this.cache.layers)) {
      logger.debug('Returning cached layers');
      return this.cache.layers!.data;
    }

    // Try API first
    const layers = await this.apiRequest<string[]>('/layers');
    if (layers) {
      this.cache.layers = this.createCacheItem(layers, CACHE_TTL.LAYERS);
      logger.debug('Cached layers from API:', layers);
      return layers;
    }

    // Fallback to existing service
    if (this.fallbackService) {
      logger.debug('Using fallback service for layers');
      const fallbackLayers = this.fallbackService.getLayers();
      this.cache.layers = this.createCacheItem(fallbackLayers, CACHE_TTL.LAYERS);
      return fallbackLayers;
    }

    logger.error('No layers available from API or fallback');
    return [];
  }

  /**
   * Get categories for a specific layer
   */
  async getCategories(layer: string): Promise<TaxonomyItem[]> {
    const cacheKey = layer;
    const cachedCategories = this.cache.categories.get(cacheKey) || null;

    // Check cache first
    if (this.isCacheValid(cachedCategories)) {
      logger.debug(`Returning cached categories for layer: ${layer}`);
      return cachedCategories!.data;
    }

    // Try API first
    const categories = await this.apiRequest<TaxonomyItem[]>(`/lookup/${layer}/categories`);
    if (categories) {
      this.cache.categories.set(cacheKey, this.createCacheItem(categories, CACHE_TTL.CATEGORIES));
      logger.debug(`Cached categories for layer ${layer} from API:`, categories);
      return categories;
    }

    // Fallback to existing service
    if (this.fallbackService) {
      logger.debug(`Using fallback service for categories in layer: ${layer}`);
      const fallbackCategories = this.fallbackService.getCategories(layer);
      this.cache.categories.set(cacheKey, this.createCacheItem(fallbackCategories, CACHE_TTL.CATEGORIES));
      return fallbackCategories;
    }

    logger.error(`No categories available for layer ${layer} from API or fallback`);
    return [];
  }

  /**
   * Get subcategories for a specific layer and category
   */
  async getSubcategories(layer: string, categoryCode: string): Promise<TaxonomyItem[]> {
    const cacheKey = `${layer}.${categoryCode}`;
    const cachedSubcategories = this.cache.subcategories.get(cacheKey) || null;

    // Check cache first
    if (this.isCacheValid(cachedSubcategories)) {
      logger.debug(`Returning cached subcategories for: ${cacheKey}`);
      return cachedSubcategories!.data;
    }

    // Try API first
    const subcategories = await this.apiRequest<TaxonomyItem[]>(
      `/lookup/${layer}/categories/${categoryCode}/subcategories`
    );
    if (subcategories) {
      this.cache.subcategories.set(cacheKey, this.createCacheItem(subcategories, CACHE_TTL.SUBCATEGORIES));
      logger.debug(`Cached subcategories for ${cacheKey} from API:`, subcategories);
      return subcategories;
    }

    // Fallback to existing service
    if (this.fallbackService) {
      logger.debug(`Using fallback service for subcategories: ${cacheKey}`);
      const fallbackSubcategories = this.fallbackService.getSubcategories(layer, categoryCode);
      this.cache.subcategories.set(cacheKey, this.createCacheItem(fallbackSubcategories, CACHE_TTL.SUBCATEGORIES));
      return fallbackSubcategories;
    }

    logger.error(`No subcategories available for ${cacheKey} from API or fallback`);
    return [];
  }

  /**
   * Get the next sequential number for asset registration
   */
  async getNextSequence(layer: string, categoryCode: string, subcategoryCode: string): Promise<NextSequenceResponse | null> {
    try {
      const response = await this.apiRequest<NextSequenceResponse>('/next-sequence', {
        method: 'POST',
        body: JSON.stringify({
          layer,
          categoryCode,
          subcategoryCode,
        }),
      });

      if (response) {
        logger.debug(`Next sequence for ${layer}.${categoryCode}.${subcategoryCode}:`, response);
        return response;
      }

      // Fallback: generate a placeholder sequence
      logger.warn(`Using fallback sequence generation for ${layer}.${categoryCode}.${subcategoryCode}`);
      return {
        layer,
        category: categoryCode,
        subcategory: subcategoryCode,
        nextNumber: 1,
        formattedSequence: '001',
      };
    } catch (error) {
      logger.error('Error getting next sequence:', error);
      return null;
    }
  }

  /**
   * Convert HFN to MFA using API taxonomy data
   */
  async convertHFNtoMFA(hfn: string): Promise<string> {
    try {
      const response = await this.apiRequest<{ mfa: string }>('/convert/hfn-to-mfa', {
        method: 'POST',
        body: JSON.stringify({ hfn }),
      });

      if (response?.mfa) {
        logger.debug(`Converted HFN to MFA: ${hfn} → ${response.mfa}`);
        return response.mfa;
      }

      // Fallback to existing service
      if (this.fallbackService) {
        logger.debug('Using fallback service for HFN to MFA conversion');
        return this.fallbackService.convertHFNtoMFA(hfn);
      }

      logger.error(`Failed to convert HFN to MFA: ${hfn}`);
      return '';
    } catch (error) {
      logger.error('Error converting HFN to MFA:', error);
      return '';
    }
  }

  /**
   * Convert MFA to HFN using API taxonomy data
   */
  async convertMFAtoHFN(mfa: string): Promise<string> {
    try {
      const response = await this.apiRequest<{ hfn: string }>('/convert/mfa-to-hfn', {
        method: 'POST',
        body: JSON.stringify({ mfa }),
      });

      if (response?.hfn) {
        logger.debug(`Converted MFA to HFN: ${mfa} → ${response.hfn}`);
        return response.hfn;
      }

      // Fallback to existing service
      if (this.fallbackService) {
        logger.debug('Using fallback service for MFA to HFN conversion');
        return this.fallbackService.convertMFAtoHFN(mfa);
      }

      logger.error(`Failed to convert MFA to HFN: ${mfa}`);
      return '';
    } catch (error) {
      logger.error('Error converting MFA to HFN:', error);
      return '';
    }
  }

  /**
   * Clear all cached data (useful for admin operations)
   */
  clearCache(): void {
    this.cache = {
      layers: null,
      categories: new Map(),
      subcategories: new Map(),
      version: null,
    };
    logger.debug('Taxonomy cache cleared');
  }

  /**
   * Validate taxonomy data consistency
   */
  async validateTaxonomy(): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const response = await this.apiRequest<{
      isValid: boolean;
      errors: string[];
      warnings: string[];
    }>('/validate');

    if (response) {
      logger.debug('Taxonomy validation result:', response);
      return response;
    }

    return {
      isValid: false,
      errors: ['Failed to validate taxonomy - API unavailable'],
      warnings: [],
    };
  }

  /**
   * Check if the API is available
   */
  async isApiAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/taxonomy/health`);
      const isAvailable = response.ok;
      logger.debug(`Taxonomy API availability: ${isAvailable}`);
      return isAvailable;
    } catch (error) {
      logger.debug('Taxonomy API not available:', error);
      return false;
    }
  }

  /**
   * Get service status and statistics
   */
  async getServiceStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unavailable';
    apiAvailable: boolean;
    cacheStats: {
      layersCached: boolean;
      categoriesCached: number;
      subcategoriesCached: number;
    };
    fallbackActive: boolean;
  }> {
    const apiAvailable = await this.isApiAvailable();
    
    return {
      status: apiAvailable ? 'healthy' : 'degraded',
      apiAvailable,
      cacheStats: {
        layersCached: this.isCacheValid(this.cache.layers),
        categoriesCached: this.cache.categories.size,
        subcategoriesCached: this.cache.subcategories.size,
      },
      fallbackActive: !apiAvailable && !!this.fallbackService,
    };
  }
}

// Create singleton instance
const apiTaxonomyService = new ApiTaxonomyService();

// Export both individual functions and service object for compatibility
export const {
  getLayers,
  getCategories,
  getSubcategories,
  convertHFNtoMFA,
  convertMFAtoHFN,
} = {
  getLayers: (layer?: string) => apiTaxonomyService.getLayers(),
  getCategories: (layer: string) => apiTaxonomyService.getCategories(layer),
  getSubcategories: (layer: string, categoryCode: string) => 
    apiTaxonomyService.getSubcategories(layer, categoryCode),
  convertHFNtoMFA: (hfn: string) => apiTaxonomyService.convertHFNtoMFA(hfn),
  convertMFAtoHFN: (mfa: string) => apiTaxonomyService.convertMFAtoHFN(mfa),
};

export default apiTaxonomyService;