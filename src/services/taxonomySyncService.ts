// services/taxonomySyncService.ts

import { logger } from '../utils/logger';

interface SyncState {
  isInitialized: boolean;
  currentVersion: string | null;
  isHealthy: boolean;
  lastSyncTime: number | null;
  lastError: string | null;
  connectionState: 'connected' | 'disconnected' | 'error';
}

interface TaxonomyVersion {
  version: string;
  lastUpdated: string;
}

interface TaxonomyHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  checks: {
    database: boolean;
    cache: boolean;
    files: boolean;
  };
}

interface LayerCount {
  count: number;
  layers: string[];
}

interface CategoryCount {
  layer: string;
  count: number;
}

interface SubcategoryCount {
  layer: string;
  category: string;
  count: number;
}

interface LayerSubcategoryCounts {
  layer: string;
  counts: Array<{ category: string; count: number }>;
  totalCategories: number;
  totalSubcategories: number;
}

interface TaxonomyIndex {
  version: string;
  lastUpdated: string;
  totalLayers: number;
  layers: Record<string, {
    totalCategories: number;
    totalSubcategories: number;
    categories: Record<string, { subcategoryCount: number }>;
  }>;
  source: 'backend' | 'frontend';
}

class TaxonomySyncService {
  private static readonly API_BASE = (() => {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    if (hostname === 'nna-registry-frontend-dev.vercel.app' || hostname === 'localhost') {
      return 'https://registry.dev.reviz.dev/api/taxonomy';
    }
    if (hostname === 'nna-registry-frontend-stg.vercel.app') {
      return 'https://registry.stg.reviz.dev/api/taxonomy';
    }
    if (hostname === 'nna-registry-frontend.vercel.app') {
      return 'https://registry.reviz.dev/api/taxonomy';
    }
    return '/api/taxonomy'; // Fallback to proxy
  })();
  
  private static readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private static readonly HEALTH_CHECK_INTERVAL = 2 * 60 * 1000; // 2 minutes
  private static readonly CACHE_KEY = 'nna_taxonomy_sync_cache';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  private syncState: SyncState = {
    isInitialized: false,
    currentVersion: null,
    isHealthy: false,
    lastSyncTime: null,
    lastError: null,
    connectionState: 'disconnected'
  };

  private syncInterval: NodeJS.Timeout | null = null;
  private healthInterval: NodeJS.Timeout | null = null;
  private eventListeners: Array<(state: SyncState) => void> = [];

  // Initialize the sync service
  async initializeSync(): Promise<void> {
    try {
      logger.info('🔄 Initializing taxonomy sync service...');
      
      // Check health first
      await this.checkHealth();
      
      // Get current version
      const version = await this.getVersion();
      
      // Sync initial index
      await this.syncIndex();
      
      // Update state
      this.syncState.isInitialized = true;
      this.syncState.currentVersion = version.version;
      this.syncState.lastSyncTime = Date.now();
      this.syncState.connectionState = 'connected';
      this.syncState.lastError = null;
      
      // Start background processes
      this.startBackgroundSync();
      this.startHealthMonitoring();
      
      logger.info(`✅ Taxonomy sync initialized with version ${version.version}`);
      this.notifyStateChange();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.syncState.lastError = errorMessage;
      this.syncState.connectionState = 'error';
      this.syncState.isHealthy = false;
      
      logger.error('❌ Failed to initialize taxonomy sync:', error);
      this.notifyStateChange();
      throw error;
    }
  }

  // Sync the complete taxonomy index
  async syncIndex(): Promise<TaxonomyIndex> {
    try {
      logger.info('📥 Syncing taxonomy index...');
      
      const response = await fetch(`${TaxonomySyncService.API_BASE}/index`);
      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status} ${response.statusText}`);
      }
      
      const index: TaxonomyIndex = await response.json();
      
      // Cache the index
      this.cacheIndex(index);
      
      // Update sync state
      this.syncState.lastSyncTime = Date.now();
      this.syncState.currentVersion = index.version;
      this.syncState.lastError = null;
      
      logger.info(`✅ Taxonomy index synced successfully (version ${index.version})`);
      this.notifyStateChange();
      
      return index;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      this.syncState.lastError = errorMessage;
      this.syncState.connectionState = 'error';
      
      logger.error('❌ Failed to sync taxonomy index:', error);
      this.notifyStateChange();
      throw error;
    }
  }

  // Check taxonomy service health
  async checkHealth(): Promise<TaxonomyHealth> {
    try {
      const response = await fetch(`${TaxonomySyncService.API_BASE}/health`);
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      
      const health: TaxonomyHealth = await response.json();
      
      this.syncState.isHealthy = health.status === 'healthy';
      this.syncState.connectionState = health.status === 'healthy' ? 'connected' : 'degraded';
      
      logger.info(`🏥 Health check: ${health.status} (version ${health.version})`);
      this.notifyStateChange();
      
      return health;
      
    } catch (error) {
      this.syncState.isHealthy = false;
      this.syncState.connectionState = 'error';
      
      logger.warn('🏥 Health check failed:', error);
      this.notifyStateChange();
      throw error;
    }
  }

  // Get current taxonomy version
  async getVersion(): Promise<TaxonomyVersion> {
    try {
      const response = await fetch(`${TaxonomySyncService.API_BASE}/version`);
      if (!response.ok) {
        throw new Error(`Version check failed: ${response.status}`);
      }
      
      const version: TaxonomyVersion = await response.json();
      logger.info(`📋 Current taxonomy version: ${version.version}`);
      
      return version;
      
    } catch (error) {
      logger.error('❌ Failed to get taxonomy version:', error);
      throw error;
    }
  }

  // Get layer count
  async getLayerCount(): Promise<LayerCount> {
    try {
      const response = await fetch(`${TaxonomySyncService.API_BASE}/layer-count`);
      if (!response.ok) {
        throw new Error(`Layer count failed: ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      logger.error('❌ Failed to get layer count:', error);
      throw error;
    }
  }

  // Get category count for a layer
  async getCategoryCount(layer: string): Promise<CategoryCount> {
    try {
      const response = await fetch(`${TaxonomySyncService.API_BASE}/layers/${layer}/category-count`);
      if (!response.ok) {
        throw new Error(`Category count failed: ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      logger.error(`❌ Failed to get category count for layer ${layer}:`, error);
      throw error;
    }
  }

  // Get subcategory count for a category
  async getSubcategoryCount(layer: string, category: string): Promise<SubcategoryCount> {
    try {
      const response = await fetch(`${TaxonomySyncService.API_BASE}/layers/${layer}/categories/${category}/subcategory-count`);
      if (!response.ok) {
        throw new Error(`Subcategory count failed: ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      logger.error(`❌ Failed to get subcategory count for ${layer}.${category}:`, error);
      throw error;
    }
  }

  // Get all subcategory counts for a layer
  async getLayerSubcategoryCounts(layer: string): Promise<LayerSubcategoryCounts> {
    try {
      const response = await fetch(`${TaxonomySyncService.API_BASE}/layers/${layer}/subcategory-counts`);
      if (!response.ok) {
        throw new Error(`Layer subcategory counts failed: ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      logger.error(`❌ Failed to get subcategory counts for layer ${layer}:`, error);
      throw error;
    }
  }

  // Get cached index
  getCachedIndex(): TaxonomyIndex | null {
    try {
      const cached = localStorage.getItem(TaxonomySyncService.CACHE_KEY);
      if (!cached) return null;
      
      const parsedCache = JSON.parse(cached);
      
      // Check cache validity
      if (Date.now() - parsedCache.timestamp > TaxonomySyncService.CACHE_DURATION) {
        this.clearCache();
        return null;
      }
      
      return parsedCache.data;
      
    } catch (error) {
      logger.warn('Failed to read cached index:', error);
      return null;
    }
  }

  // Cache taxonomy index
  private cacheIndex(index: TaxonomyIndex): void {
    try {
      const cacheData = {
        data: index,
        timestamp: Date.now(),
        version: index.version
      };
      
      localStorage.setItem(TaxonomySyncService.CACHE_KEY, JSON.stringify(cacheData));
      logger.info(`💾 Cached taxonomy index (version ${index.version})`);
      
    } catch (error) {
      logger.warn('Failed to cache taxonomy index:', error);
    }
  }

  // Clear cache
  clearCache(): void {
    try {
      localStorage.removeItem(TaxonomySyncService.CACHE_KEY);
      logger.info('🗑️ Taxonomy cache cleared');
    } catch (error) {
      logger.warn('Failed to clear cache:', error);
    }
  }

  // Start background sync process
  private startBackgroundSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(async () => {
      try {
        const version = await this.getVersion();
        
        if (this.syncState.currentVersion !== version.version) {
          logger.info(`🔄 Taxonomy version changed: ${this.syncState.currentVersion} → ${version.version}`);
          await this.syncIndex();
        }
        
      } catch (error) {
        logger.error('Background sync failed:', error);
        this.syncState.lastError = error instanceof Error ? error.message : 'Background sync failed';
        this.syncState.connectionState = 'error';
        this.notifyStateChange();
      }
    }, TaxonomySyncService.SYNC_INTERVAL);
    
    logger.info(`⏰ Background sync started (interval: ${TaxonomySyncService.SYNC_INTERVAL / 1000}s)`);
  }

  // Start health monitoring
  private startHealthMonitoring(): void {
    if (this.healthInterval) {
      clearInterval(this.healthInterval);
    }
    
    this.healthInterval = setInterval(async () => {
      try {
        await this.checkHealth();
      } catch (error) {
        // Health check failures are logged in checkHealth()
      }
    }, TaxonomySyncService.HEALTH_CHECK_INTERVAL);
    
    logger.info(`💓 Health monitoring started (interval: ${TaxonomySyncService.HEALTH_CHECK_INTERVAL / 1000}s)`);
  }

  // Stop all background processes
  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    if (this.healthInterval) {
      clearInterval(this.healthInterval);
      this.healthInterval = null;
    }
    
    this.syncState.isInitialized = false;
    this.syncState.connectionState = 'disconnected';
    
    logger.info('🛑 Taxonomy sync stopped');
    this.notifyStateChange();
  }

  // Get current sync state
  getSyncState(): SyncState {
    return { ...this.syncState };
  }

  // Subscribe to state changes
  onStateChange(listener: (state: SyncState) => void): () => void {
    this.eventListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.eventListeners.indexOf(listener);
      if (index > -1) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners of state changes
  private notifyStateChange(): void {
    const state = this.getSyncState();
    this.eventListeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        logger.error('Error in sync state listener:', error);
      }
    });
  }

  // Force manual sync
  async forceSync(): Promise<TaxonomyIndex> {
    logger.info('🔄 Force sync requested...');
    this.clearCache();
    return await this.syncIndex();
  }
}

export const taxonomySyncService = new TaxonomySyncService();
export type { TaxonomyIndex, SyncState, TaxonomyHealth, TaxonomyVersion };