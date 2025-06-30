// hooks/useTaxonomyIndex.ts

import { useState, useEffect, useCallback } from 'react';
import { taxonomyIndexService, TaxonomyIndex, SubcategoryCount } from '../services/taxonomyIndexingService';
import { logger } from '../utils/logger';

interface UseTaxonomyIndexReturn {
  index: TaxonomyIndex | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getSubcategoryCount: (layer: string, category: string) => number;
  getCategoryCount: (layer: string) => number;
  getLayerCount: () => number;
  getTotalSubcategories: (layer: string) => number;
  getLayerSubcategoryCounts: (layer: string) => SubcategoryCount[];
  cacheStatus: { cached: boolean; version?: string; age?: string };
  clearCache: () => void;
}

export function useTaxonomyIndex(): UseTaxonomyIndexReturn {
  const [index, setIndex] = useState<TaxonomyIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIndex = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if refresh is needed
      const needsRefresh = await taxonomyIndexService.needsRefresh();
      if (needsRefresh) {
        logger.info('Taxonomy version changed or cache expired, refreshing index...');
      }
      
      const data = await taxonomyIndexService.getIndex();
      setIndex(data);
      logger.info(`Loaded taxonomy index version ${data.version} with ${data.totalLayers} layers`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load taxonomy index';
      setError(errorMessage);
      logger.error('Failed to load taxonomy index:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      logger.info('Manually refreshing taxonomy index...');
      const data = await taxonomyIndexService.refreshIndex();
      setIndex(data);
      logger.info(`Refreshed taxonomy index to version ${data.version}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh taxonomy index';
      setError(errorMessage);
      logger.error('Failed to refresh taxonomy index:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getSubcategoryCount = useCallback((layer: string, category: string): number => {
    if (!index) return 0;
    return index.layers[layer]?.categories[category]?.subcategoryCount || 0;
  }, [index]);

  const getCategoryCount = useCallback((layer: string): number => {
    if (!index) return 0;
    return index.layers[layer]?.totalCategories || 0;
  }, [index]);

  const getLayerCount = useCallback((): number => {
    if (!index) return 0;
    return index.totalLayers || 0;
  }, [index]);

  const getTotalSubcategories = useCallback((layer: string): number => {
    if (!index) return 0;
    return index.layers[layer]?.totalSubcategories || 0;
  }, [index]);

  const getLayerSubcategoryCounts = useCallback((layer: string): SubcategoryCount[] => {
    if (!index || !index.layers[layer]) return [];
    
    const layerData = index.layers[layer];
    return Object.entries(layerData.categories).map(([category, data]) => ({
      category,
      count: data.subcategoryCount
    }));
  }, [index]);

  const clearCache = useCallback(() => {
    taxonomyIndexService.clearCache();
    logger.info('Taxonomy index cache cleared');
    // Reload after clearing cache
    loadIndex();
  }, [loadIndex]);

  const cacheStatus = taxonomyIndexService.getCacheStatus();

  useEffect(() => {
    loadIndex();
  }, [loadIndex]);

  // Auto-refresh check every 5 minutes
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        if (await taxonomyIndexService.needsRefresh()) {
          logger.info('Taxonomy version changed, auto-refreshing...');
          await refresh();
        }
      } catch (error) {
        logger.warn('Failed to check for taxonomy updates:', error);
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkForUpdates, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [refresh]);

  return {
    index,
    loading,
    error,
    refresh,
    getSubcategoryCount,
    getCategoryCount,
    getLayerCount,
    getTotalSubcategories,
    getLayerSubcategoryCounts,
    cacheStatus,
    clearCache
  };
}