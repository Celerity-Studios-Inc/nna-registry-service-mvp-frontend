/**
 * Taxonomy Service Adapter
 * 
 * This adapter provides a gradual migration path from the existing flattened
 * taxonomy system to the new API-based taxonomy service. It allows existing
 * components to work unchanged while providing enhanced capabilities.
 * 
 * Features:
 * - Seamless migration from sync to async operations
 * - Backward compatibility with existing components
 * - Feature flagging for gradual rollout
 * - Performance monitoring and fallback mechanisms
 */

import { logger } from '../utils/logger';
import { TaxonomyItem } from '../types/taxonomy.types';
import apiTaxonomyService from './apiTaxonomyService';

// Feature flags for controlling migration
interface TaxonomyFeatureFlags {
  useApiService: boolean;
  enableCaching: boolean;
  enableFallback: boolean;
  enablePerformanceMonitoring: boolean;
}

// Default feature flags - can be overridden by environment variables
const DEFAULT_FEATURE_FLAGS: TaxonomyFeatureFlags = {
  useApiService: process.env.REACT_APP_USE_API_TAXONOMY === 'true',
  enableCaching: true,
  enableFallback: true,
  enablePerformanceMonitoring: process.env.NODE_ENV === 'development',
};

// Performance monitoring interface
interface PerformanceMetrics {
  operationName: string;
  startTime: number;
  endTime: number;
  duration: number;
  source: 'api' | 'fallback' | 'cache';
  success: boolean;
  error?: string;
}

class TaxonomyServiceAdapter {
  private featureFlags: TaxonomyFeatureFlags;
  private performanceMetrics: PerformanceMetrics[] = [];
  private fallbackService: any = null;

  constructor(customFlags?: Partial<TaxonomyFeatureFlags>) {
    this.featureFlags = { ...DEFAULT_FEATURE_FLAGS, ...customFlags };
    this.initializeFallbackService();
    
    logger.debug('TaxonomyServiceAdapter initialized with flags:', this.featureFlags);
  }

  private async initializeFallbackService() {
    if (this.featureFlags.enableFallback) {
      try {
        const { enhancedTaxonomyService } = await import('./enhancedTaxonomyService');
        this.fallbackService = enhancedTaxonomyService;
        logger.debug('Fallback service initialized');
      } catch (error) {
        logger.error('Failed to initialize fallback service:', error);
      }
    }
  }

  private startPerformanceTimer(operationName: string): number {
    if (!this.featureFlags.enablePerformanceMonitoring) return 0;
    return Date.now();
  }

  private endPerformanceTimer(
    operationName: string,
    startTime: number,
    source: 'api' | 'fallback' | 'cache',
    success: boolean,
    error?: string
  ): void {
    if (!this.featureFlags.enablePerformanceMonitoring || startTime === 0) return;

    const endTime = Date.now();
    const metric: PerformanceMetrics = {
      operationName,
      startTime,
      endTime,
      duration: endTime - startTime,
      source,
      success,
      error,
    };

    this.performanceMetrics.push(metric);
    
    // Keep only last 100 metrics to prevent memory leak
    if (this.performanceMetrics.length > 100) {
      this.performanceMetrics = this.performanceMetrics.slice(-100);
    }

    logger.debug(`Performance: ${operationName} took ${metric.duration}ms (${source})`);
  }

  /**
   * Get all available layers
   * Provides both sync and async interfaces for compatibility
   */
  async getLayersAsync(): Promise<string[]> {
    const startTime = this.startPerformanceTimer('getLayers');

    try {
      if (this.featureFlags.useApiService) {
        const layers = await apiTaxonomyService.getLayers();
        this.endPerformanceTimer('getLayers', startTime, 'api', true);
        return layers;
      }
    } catch (error) {
      logger.error('API getLayers failed:', error);
      this.endPerformanceTimer('getLayers', startTime, 'api', false, String(error));
    }

    // Fallback to existing service
    if (this.fallbackService) {
      try {
        const layers = this.fallbackService.getLayers();
        this.endPerformanceTimer('getLayers', startTime, 'fallback', true);
        return layers;
      } catch (error) {
        logger.error('Fallback getLayers failed:', error);
        this.endPerformanceTimer('getLayers', startTime, 'fallback', false, String(error));
      }
    }

    // Last resort: return hardcoded layers
    const hardcodedLayers = ['G', 'S', 'L', 'M', 'W', 'B', 'P', 'T', 'C', 'R'];
    this.endPerformanceTimer('getLayers', startTime, 'fallback', true);
    return hardcodedLayers;
  }

  /**
   * Synchronous version for backward compatibility
   */
  getLayers(): string[] {
    if (this.fallbackService) {
      return this.fallbackService.getLayers();
    }
    return ['G', 'S', 'L', 'M', 'W', 'B', 'P', 'T', 'C', 'R'];
  }

  /**
   * Get categories for a specific layer
   */
  async getCategoriesAsync(layer: string): Promise<TaxonomyItem[]> {
    const startTime = this.startPerformanceTimer('getCategories');

    try {
      if (this.featureFlags.useApiService) {
        const categories = await apiTaxonomyService.getCategories(layer);
        this.endPerformanceTimer('getCategories', startTime, 'api', true);
        return categories;
      }
    } catch (error) {
      logger.error(`API getCategories failed for layer ${layer}:`, error);
      this.endPerformanceTimer('getCategories', startTime, 'api', false, String(error));
    }

    // Fallback to existing service
    if (this.fallbackService) {
      try {
        const categories = this.fallbackService.getCategories(layer);
        this.endPerformanceTimer('getCategories', startTime, 'fallback', true);
        return categories;
      } catch (error) {
        logger.error(`Fallback getCategories failed for layer ${layer}:`, error);
        this.endPerformanceTimer('getCategories', startTime, 'fallback', false, String(error));
      }
    }

    this.endPerformanceTimer('getCategories', startTime, 'fallback', true);
    return [];
  }

  /**
   * Synchronous version for backward compatibility
   */
  getCategories(layer: string): TaxonomyItem[] {
    if (this.fallbackService) {
      return this.fallbackService.getCategories(layer);
    }
    return [];
  }

  /**
   * Get subcategories for a specific layer and category
   */
  async getSubcategoriesAsync(layer: string, categoryCode: string): Promise<TaxonomyItem[]> {
    const startTime = this.startPerformanceTimer('getSubcategories');

    try {
      if (this.featureFlags.useApiService) {
        const subcategories = await apiTaxonomyService.getSubcategories(layer, categoryCode);
        this.endPerformanceTimer('getSubcategories', startTime, 'api', true);
        return subcategories;
      }
    } catch (error) {
      logger.error(`API getSubcategories failed for ${layer}.${categoryCode}:`, error);
      this.endPerformanceTimer('getSubcategories', startTime, 'api', false, String(error));
    }

    // Fallback to existing service
    if (this.fallbackService) {
      try {
        const subcategories = this.fallbackService.getSubcategories(layer, categoryCode);
        this.endPerformanceTimer('getSubcategories', startTime, 'fallback', true);
        return subcategories;
      } catch (error) {
        logger.error(`Fallback getSubcategories failed for ${layer}.${categoryCode}:`, error);
        this.endPerformanceTimer('getSubcategories', startTime, 'fallback', false, String(error));
      }
    }

    this.endPerformanceTimer('getSubcategories', startTime, 'fallback', true);
    return [];
  }

  /**
   * Synchronous version for backward compatibility
   */
  getSubcategories(layer: string, categoryCode: string): TaxonomyItem[] {
    if (this.fallbackService) {
      return this.fallbackService.getSubcategories(layer, categoryCode);
    }
    return [];
  }

  /**
   * Convert HFN to MFA
   */
  async convertHFNtoMFAAsync(hfn: string): Promise<string> {
    const startTime = this.startPerformanceTimer('convertHFNtoMFA');

    try {
      if (this.featureFlags.useApiService) {
        const mfa = await apiTaxonomyService.convertHFNtoMFA(hfn);
        this.endPerformanceTimer('convertHFNtoMFA', startTime, 'api', true);
        return mfa;
      }
    } catch (error) {
      logger.error(`API convertHFNtoMFA failed for ${hfn}:`, error);
      this.endPerformanceTimer('convertHFNtoMFA', startTime, 'api', false, String(error));
    }

    // Fallback to existing service
    if (this.fallbackService) {
      try {
        const mfa = this.fallbackService.convertHFNtoMFA(hfn);
        this.endPerformanceTimer('convertHFNtoMFA', startTime, 'fallback', true);
        return mfa;
      } catch (error) {
        logger.error(`Fallback convertHFNtoMFA failed for ${hfn}:`, error);
        this.endPerformanceTimer('convertHFNtoMFA', startTime, 'fallback', false, String(error));
      }
    }

    this.endPerformanceTimer('convertHFNtoMFA', startTime, 'fallback', true);
    return '';
  }

  /**
   * Synchronous version for backward compatibility
   */
  convertHFNtoMFA(hfn: string): string {
    if (this.fallbackService) {
      return this.fallbackService.convertHFNtoMFA(hfn);
    }
    return '';
  }

  /**
   * Convert MFA to HFN
   */
  async convertMFAtoHFNAsync(mfa: string): Promise<string> {
    const startTime = this.startPerformanceTimer('convertMFAtoHFN');

    try {
      if (this.featureFlags.useApiService) {
        const hfn = await apiTaxonomyService.convertMFAtoHFN(mfa);
        this.endPerformanceTimer('convertMFAtoHFN', startTime, 'api', true);
        return hfn;
      }
    } catch (error) {
      logger.error(`API convertMFAtoHFN failed for ${mfa}:`, error);
      this.endPerformanceTimer('convertMFAtoHFN', startTime, 'api', false, String(error));
    }

    // Fallback to existing service
    if (this.fallbackService) {
      try {
        const hfn = this.fallbackService.convertMFAtoHFN(mfa);
        this.endPerformanceTimer('convertMFAtoHFN', startTime, 'fallback', true);
        return hfn;
      } catch (error) {
        logger.error(`Fallback convertMFAtoHFN failed for ${mfa}:`, error);
        this.endPerformanceTimer('convertMFAtoHFN', startTime, 'fallback', false, String(error));
      }
    }

    this.endPerformanceTimer('convertMFAtoHFN', startTime, 'fallback', true);
    return '';
  }

  /**
   * Synchronous version for backward compatibility
   */
  convertMFAtoHFN(mfa: string): string {
    if (this.fallbackService) {
      return this.fallbackService.convertMFAtoHFN(mfa);
    }
    return '';
  }

  /**
   * Get next sequential number for asset registration
   */
  async getNextSequence(layer: string, categoryCode: string, subcategoryCode: string): Promise<{
    nextNumber: number;
    formattedSequence: string;
  }> {
    try {
      if (this.featureFlags.useApiService) {
        const result = await apiTaxonomyService.getNextSequence(layer, categoryCode, subcategoryCode);
        if (result) {
          return {
            nextNumber: result.nextNumber,
            formattedSequence: result.formattedSequence,
          };
        }
      }
    } catch (error) {
      logger.error(`Failed to get next sequence for ${layer}.${categoryCode}.${subcategoryCode}:`, error);
    }

    // Fallback: generate a placeholder sequence
    return {
      nextNumber: 1,
      formattedSequence: '001',
    };
  }

  /**
   * Update feature flags at runtime
   */
  updateFeatureFlags(flags: Partial<TaxonomyFeatureFlags>): void {
    this.featureFlags = { ...this.featureFlags, ...flags };
    logger.debug('Updated feature flags:', this.featureFlags);
  }

  /**
   * Get performance metrics for monitoring
   */
  getPerformanceMetrics(): PerformanceMetrics[] {
    return [...this.performanceMetrics];
  }

  /**
   * Clear performance metrics
   */
  clearPerformanceMetrics(): void {
    this.performanceMetrics = [];
  }

  /**
   * Get service status
   */
  async getServiceStatus(): Promise<{
    adapterVersion: string;
    featureFlags: TaxonomyFeatureFlags;
    apiServiceStatus: any;
    fallbackAvailable: boolean;
    performanceMetricsCount: number;
  }> {
    const apiServiceStatus = await apiTaxonomyService.getServiceStatus();

    return {
      adapterVersion: '1.0.0',
      featureFlags: this.featureFlags,
      apiServiceStatus,
      fallbackAvailable: !!this.fallbackService,
      performanceMetricsCount: this.performanceMetrics.length,
    };
  }
}

// Create singleton instance
const taxonomyServiceAdapter = new TaxonomyServiceAdapter();

// Export both individual functions and adapter instance
export const {
  getLayers,
  getCategories,
  getSubcategories,
  convertHFNtoMFA,
  convertMFAtoHFN,
} = {
  getLayers: () => taxonomyServiceAdapter.getLayers(),
  getCategories: (layer: string) => taxonomyServiceAdapter.getCategories(layer),
  getSubcategories: (layer: string, categoryCode: string) => 
    taxonomyServiceAdapter.getSubcategories(layer, categoryCode),
  convertHFNtoMFA: (hfn: string) => taxonomyServiceAdapter.convertHFNtoMFA(hfn),
  convertMFAtoHFN: (mfa: string) => taxonomyServiceAdapter.convertMFAtoHFN(mfa),
};

// Export async versions for new components
export const taxonomyAsync = {
  getLayers: () => taxonomyServiceAdapter.getLayersAsync(),
  getCategories: (layer: string) => taxonomyServiceAdapter.getCategoriesAsync(layer),
  getSubcategories: (layer: string, categoryCode: string) => 
    taxonomyServiceAdapter.getSubcategoriesAsync(layer, categoryCode),
  convertHFNtoMFA: (hfn: string) => taxonomyServiceAdapter.convertHFNtoMFAAsync(hfn),
  convertMFAtoHFN: (mfa: string) => taxonomyServiceAdapter.convertMFAtoHFNAsync(mfa),
  getNextSequence: (layer: string, categoryCode: string, subcategoryCode: string) =>
    taxonomyServiceAdapter.getNextSequence(layer, categoryCode, subcategoryCode),
};

export default taxonomyServiceAdapter;