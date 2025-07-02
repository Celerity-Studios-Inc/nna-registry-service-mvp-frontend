// hooks/useTaxonomySync.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { taxonomySyncService, TaxonomyIndex, SyncState } from '../services/taxonomySyncService';
import { logger } from '../utils/logger';

interface UseTaxonomySyncReturn {
  // Data
  index: TaxonomyIndex | null;
  syncState: SyncState;
  
  // Loading states
  loading: boolean;
  initializing: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  sync: () => Promise<void>;
  forceSync: () => Promise<void>;
  initialize: () => Promise<void>;
  
  // Utility functions
  getSubcategoryCount: (layer: string, category: string) => number;
  getCategoryCount: (layer: string) => number;
  getLayerCount: () => number;
  getTotalSubcategories: (layer: string) => number;
  
  // Advanced functions
  getLayerSubcategoryCounts: (layer: string) => Array<{ category: string; count: number }>;
  isLayerAvailable: (layer: string) => boolean;
  isCategoryAvailable: (layer: string, category: string) => boolean;
  
  // Status helpers
  isHealthy: boolean;
  isConnected: boolean;
  lastSyncTime: Date | null;
  cacheAge: string | null;
}

export function useTaxonomySync(): UseTaxonomySyncReturn {
  const [index, setIndex] = useState<TaxonomyIndex | null>(null);
  const [syncState, setSyncState] = useState<SyncState>(taxonomySyncService.getSyncState());
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isInitializedRef = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Initialize the sync service
  const initialize = useCallback(async () => {
    if (isInitializedRef.current) {
      logger.info('Taxonomy sync already initialized');
      return;
    }
    
    try {
      setInitializing(true);
      setError(null);
      
      logger.info('🚀 Initializing taxonomy sync...');
      
      // Subscribe to state changes
      unsubscribeRef.current = taxonomySyncService.onStateChange((newState) => {
        setSyncState(newState);
        if (newState.lastError) {
          setError(newState.lastError);
        } else {
          setError(null);
        }
      });
      
      // Try to load from cache first
      const cachedIndex = taxonomySyncService.getCachedIndex();
      if (cachedIndex) {
        setIndex(cachedIndex);
        logger.info(`📋 Loaded cached taxonomy index (version ${cachedIndex.version})`);
      }
      
      // Initialize the service
      await taxonomySyncService.initializeSync();
      
      // Get fresh index
      const freshIndex = taxonomySyncService.getCachedIndex();
      if (freshIndex) {
        setIndex(freshIndex);
      }
      
      isInitializedRef.current = true;
      logger.info('✅ Taxonomy sync initialization complete');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize taxonomy sync';
      setError(errorMessage);
      logger.error('❌ Failed to initialize taxonomy sync:', err);
    } finally {
      setInitializing(false);
    }
  }, []);

  // Manual sync function
  const sync = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      logger.info('🔄 Manual sync requested...');
      const freshIndex = await taxonomySyncService.syncIndex();
      setIndex(freshIndex);
      
      logger.info('✅ Manual sync completed');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sync failed';
      setError(errorMessage);
      logger.error('❌ Manual sync failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Force sync (clears cache first)
  const forceSync = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      logger.info('🔄 Force sync requested...');
      const freshIndex = await taxonomySyncService.forceSync();
      setIndex(freshIndex);
      
      logger.info('✅ Force sync completed');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Force sync failed';
      setError(errorMessage);
      logger.error('❌ Force sync failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Utility functions
  const getSubcategoryCount = useCallback((layer: string, category: string): number => {
    if (!index || !index.layers[layer]) return 0;
    return index.layers[layer].categories[category]?.subcategoryCount || 0;
  }, [index]);

  const getCategoryCount = useCallback((layer: string): number => {
    if (!index || !index.layers[layer]) return 0;
    return index.layers[layer].totalCategories || 0;
  }, [index]);

  const getLayerCount = useCallback((): number => {
    if (!index) return 0;
    return index.totalLayers || 0;
  }, [index]);

  const getTotalSubcategories = useCallback((layer: string): number => {
    if (!index || !index.layers[layer]) return 0;
    return index.layers[layer].totalSubcategories || 0;
  }, [index]);

  const getLayerSubcategoryCounts = useCallback((layer: string): Array<{ category: string; count: number }> => {
    if (!index || !index.layers[layer]) return [];
    
    const layerData = index.layers[layer];
    return Object.entries(layerData.categories).map(([category, data]) => ({
      category,
      count: data.subcategoryCount
    }));
  }, [index]);

  const isLayerAvailable = useCallback((layer: string): boolean => {
    return !!(index && index.layers[layer]);
  }, [index]);

  const isCategoryAvailable = useCallback((layer: string, category: string): boolean => {
    return !!(index && index.layers[layer] && index.layers[layer].categories[category]);
  }, [index]);

  // Status helpers
  const isHealthy = syncState.isHealthy;
  const isConnected = syncState.connectionState === 'connected';
  const lastSyncTime = syncState.lastSyncTime ? new Date(syncState.lastSyncTime) : null;

  // Calculate cache age
  const cacheAge = useCallback((): string | null => {
    if (!lastSyncTime) return null;
    
    const now = Date.now();
    const ageMs = now - lastSyncTime.getTime();
    
    const minutes = Math.floor(ageMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h ago`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }, [lastSyncTime])();

  // Initialize on mount
  useEffect(() => {
    initialize();
    
    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [initialize]);

  return {
    // Data
    index,
    syncState,
    
    // Loading states
    loading,
    initializing,
    
    // Error handling
    error,
    
    // Actions
    sync,
    forceSync,
    initialize,
    
    // Utility functions
    getSubcategoryCount,
    getCategoryCount,
    getLayerCount,
    getTotalSubcategories,
    
    // Advanced functions
    getLayerSubcategoryCounts,
    isLayerAvailable,
    isCategoryAvailable,
    
    // Status helpers
    isHealthy,
    isConnected,
    lastSyncTime,
    cacheAge
  };
}