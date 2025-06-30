/**
 * Backend Taxonomy Service
 * Integrates with the backend API for taxonomy operations
 * Used when backend taxonomy toggle is enabled in settings
 */

import { TaxonomyItem } from '../types/taxonomy.types';
import { logger } from '../utils/logger';

export interface BackendTaxonomyService {
  getLayers(): Promise<string[]>;
  getCategories(layer: string): Promise<TaxonomyItem[]>;
  getSubcategories(layer: string, category: string): Promise<TaxonomyItem[]>;
  convertHfnToMfa(hfn: string): Promise<{ success: boolean; mfa?: string; error?: string }>;
  convertMfaToHfn(mfa: string): Promise<{ success: boolean; hfn?: string; error?: string }>;
  getTaxonomyTree(): Promise<any>;
  getVersion(): Promise<{ version: number; lastUpdated: string; totalNodes: number }>;
  getHealth(): Promise<{ status: string; environment: string }>;
  seedTaxonomy(): Promise<{ message: string; nodesInserted: number }>;
}

class BackendTaxonomyServiceImpl implements BackendTaxonomyService {
  private baseUrl: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Determine backend URL based on environment
    this.baseUrl = this.getBackendUrl();
    logger.info(`Backend Taxonomy Service initialized with URL: ${this.baseUrl}`);
  }

  private getBackendUrl(): string {
    // Check environment variables first
    if (process.env.REACT_APP_BACKEND_TAXONOMY_URL) {
      return process.env.REACT_APP_BACKEND_TAXONOMY_URL;
    }

    // Default based on environment using new backend URLs
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8080';
    }
    
    if (hostname.includes('dev') || hostname.includes('nna-registry-frontend-dev')) {
      return 'https://registry.dev.reviz.dev';
    }
    
    if (hostname.includes('staging') || hostname.includes('-stg.')) {
      return 'https://registry.stg.reviz.dev';
    }
    
    // Production
    return 'https://registry.reviz.dev';
  }

  private getCacheKey(endpoint: string, params?: Record<string, string>): string {
    const paramString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return `${endpoint}${paramString}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data as T;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private async fetchWithCache<T>(
    endpoint: string, 
    options: RequestInit = {},
    cacheKey?: string
  ): Promise<T> {
    const key = cacheKey || endpoint;
    
    // Check cache first for GET requests
    if ((!options.method || options.method === 'GET')) {
      const cached = this.getFromCache<T>(key);
      if (cached) {
        logger.debug(`Cache hit for ${key}`);
        return cached;
      }
    }

    try {
      const url = `${this.baseUrl}/api/taxonomy${endpoint}`;
      logger.debug(`Fetching from backend: ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache successful GET responses
      if (!options.method || options.method === 'GET') {
        this.setCache(key, data);
      }
      
      return data;
    } catch (error) {
      logger.error(`Backend taxonomy API error for ${endpoint}:`, error);
      throw new Error(`Failed to fetch taxonomy data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getLayers(): Promise<string[]> {
    try {
      const response = await this.fetchWithCache<{ layers: string[]; count: number }>('/layers');
      return response.layers;
    } catch (error) {
      logger.error('Failed to get layers from backend:', error);
      throw error;
    }
  }

  async getCategories(layer: string): Promise<TaxonomyItem[]> {
    try {
      const response = await this.fetchWithCache<{ 
        categories: Array<{ code: string; name: string; numericCode: string }>;
        count: number;
      }>(`/layers/${layer}/categories`);
      
      return response.categories.map(cat => ({
        code: cat.code,
        name: cat.name,
        numericCode: cat.numericCode,
      }));
    } catch (error) {
      logger.error(`Failed to get categories for layer ${layer}:`, error);
      throw error;
    }
  }

  async getSubcategories(layer: string, category: string): Promise<TaxonomyItem[]> {
    try {
      const response = await this.fetchWithCache<{
        subcategories: Array<{ code: string; name: string; numericCode: string }>;
        count: number;
      }>(`/layers/${layer}/categories/${category}/subcategories`);
      
      return response.subcategories.map(sub => ({
        code: sub.code,
        name: sub.name,
        numericCode: sub.numericCode,
      }));
    } catch (error) {
      logger.error(`Failed to get subcategories for ${layer}.${category}:`, error);
      throw error;
    }
  }

  async convertHfnToMfa(hfn: string): Promise<{ success: boolean; mfa?: string; error?: string }> {
    try {
      const response = await this.fetchWithCache<{
        hfn: string;
        mfa: string;
        success: boolean;
        error?: string;
      }>('/convert/hfn-to-mfa', {
        method: 'POST',
        body: JSON.stringify({ hfn }),
      });
      
      return {
        success: response.success,
        mfa: response.mfa,
        error: response.error,
      };
    } catch (error) {
      logger.error(`Failed to convert HFN ${hfn} to MFA:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Conversion failed',
      };
    }
  }

  async convertMfaToHfn(mfa: string): Promise<{ success: boolean; hfn?: string; error?: string }> {
    try {
      const response = await this.fetchWithCache<{
        mfa: string;
        hfn: string;
        success: boolean;
        error?: string;
      }>('/convert/mfa-to-hfn', {
        method: 'POST',
        body: JSON.stringify({ mfa }),
      });
      
      return {
        success: response.success,
        hfn: response.hfn,
        error: response.error,
      };
    } catch (error) {
      logger.error(`Failed to convert MFA ${mfa} to HFN:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Conversion failed',
      };
    }
  }

  async getTaxonomyTree(): Promise<any> {
    try {
      return await this.fetchWithCache<any>('/tree');
    } catch (error) {
      logger.error('Failed to get taxonomy tree from backend:', error);
      throw error;
    }
  }

  async getVersion(): Promise<{ version: number; lastUpdated: string; totalNodes: number }> {
    try {
      const response = await this.fetchWithCache<{
        version: number;
        lastUpdated: string;
        checksum: string;
        totalNodes: number;
      }>('/version');
      
      return {
        version: response.version,
        lastUpdated: response.lastUpdated,
        totalNodes: response.totalNodes,
      };
    } catch (error) {
      logger.error('Failed to get backend taxonomy version:', error);
      throw error;
    }
  }

  async getHealth(): Promise<{ status: string; environment: string }> {
    try {
      const response = await this.fetchWithCache<{
        status: string;
        environment: string;
        services: any;
        uptime: number;
        timestamp: string;
      }>('/health');
      
      return {
        status: response.status,
        environment: response.environment,
      };
    } catch (error) {
      logger.error('Failed to check backend taxonomy health:', error);
      throw error;
    }
  }

  async seedTaxonomy(): Promise<{ message: string; nodesInserted: number }> {
    try {
      const response = await this.fetchWithCache<{
        message: string;
        nodesInserted: number;
        timestamp: string;
      }>('/seed', {
        method: 'POST',
      });
      
      // Clear cache after seeding
      this.cache.clear();
      
      return {
        message: response.message,
        nodesInserted: response.nodesInserted,
      };
    } catch (error) {
      logger.error('Failed to seed backend taxonomy:', error);
      throw error;
    }
  }

  // Cache management methods
  clearCache(): void {
    this.cache.clear();
    logger.info('Backend taxonomy cache cleared');
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Create singleton instance
export const backendTaxonomyService = new BackendTaxonomyServiceImpl();

// Utility function to check if backend taxonomy is enabled
export function isBackendTaxonomyEnabled(): boolean {
  try {
    const setting = localStorage.getItem('nna-use-backend-taxonomy');
    return setting ? JSON.parse(setting) : false;
  } catch (error) {
    logger.warn('Failed to read backend taxonomy setting:', error);
    return false;
  }
}

// Utility function to get the appropriate taxonomy service
export function getTaxonomyService(): any {
  if (isBackendTaxonomyEnabled()) {
    logger.info('Using backend taxonomy service');
    return backendTaxonomyService;
  } else {
    // Import frontend service dynamically to avoid circular dependencies
    import('../services/simpleTaxonomyService').then(module => {
      logger.info('Using frontend taxonomy service');
      return module.taxonomyService;
    });
  }
}

export default backendTaxonomyService;