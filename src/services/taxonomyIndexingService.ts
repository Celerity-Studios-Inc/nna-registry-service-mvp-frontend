// services/taxonomyIndexingService.ts

interface SubcategoryCount {
  category: string;
  count: number;
}

interface LayerIndex {
  totalCategories: number;
  totalSubcategories: number;
  categories: Record<string, { subcategoryCount: number }>;
}

interface TaxonomyIndex {
  version: string;
  lastUpdated: string;
  totalLayers: number;
  layers: Record<string, LayerIndex>;
}

interface CachedIndex {
  data: TaxonomyIndex;
  timestamp: number;
  version: string;
}

class TaxonomyIndexService {
  private static readonly CACHE_KEY = 'nna_taxonomy_index';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
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

  // Get cached index or fetch from API
  async getIndex(): Promise<TaxonomyIndex> {
    const cached = this.getCachedIndex();
    
    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }

    const freshIndex = await this.fetchIndex();
    this.cacheIndex(freshIndex);
    return freshIndex;
  }

  // Get subcategory count for specific layer+category
  async getSubcategoryCount(layer: string, category: string): Promise<number> {
    const index = await this.getIndex();
    return index.layers[layer]?.categories[category]?.subcategoryCount || 0;
  }

  // Get category count for specific layer
  async getCategoryCount(layer: string): Promise<number> {
    const index = await this.getIndex();
    return index.layers[layer]?.totalCategories || 0;
  }

  // Get total layer count
  async getLayerCount(): Promise<number> {
    const index = await this.getIndex();
    return index.totalLayers;
  }

  // Get all subcategory counts for a layer
  async getLayerSubcategoryCounts(layer: string): Promise<SubcategoryCount[]> {
    const index = await this.getIndex();
    const layerData = index.layers[layer];
    
    if (!layerData) {
      return [];
    }

    return Object.entries(layerData.categories).map(([category, data]) => ({
      category,
      count: data.subcategoryCount
    }));
  }

  // Get total subcategories for a layer
  async getTotalSubcategories(layer: string): Promise<number> {
    const index = await this.getIndex();
    return index.layers[layer]?.totalSubcategories || 0;
  }

  // Check if index needs refresh (version change)
  async needsRefresh(): Promise<boolean> {
    const cached = this.getCachedIndex();
    if (!cached) return true;

    try {
      const currentVersion = await this.getCurrentVersion();
      return cached.version !== currentVersion;
    } catch {
      return true;
    }
  }

  // Force refresh index
  async refreshIndex(): Promise<TaxonomyIndex> {
    const freshIndex = await this.fetchIndex();
    this.cacheIndex(freshIndex);
    return freshIndex;
  }

  // Get current version without full index
  async getCurrentVersion(): Promise<string> {
    try {
      const response = await fetch(`${TaxonomyIndexService.API_BASE}/version`);
      if (!response.ok) {
        throw new Error('Failed to fetch taxonomy version');
      }
      const data = await response.json();
      return data.version;
    } catch (error) {
      // Fallback: try to get version from full index
      try {
        const index = await this.fetchIndex();
        return index.version;
      } catch {
        throw new Error('Unable to fetch taxonomy version');
      }
    }
  }

  // Clear cache (useful for debugging)
  clearCache(): void {
    localStorage.removeItem(TaxonomyIndexService.CACHE_KEY);
  }

  // Get cache status
  getCacheStatus(): { cached: boolean; version?: string; age?: string } {
    const cached = this.getCachedIndex();
    if (!cached) {
      return { cached: false };
    }

    const ageMs = Date.now() - cached.timestamp;
    const ageHours = Math.round(ageMs / (1000 * 60 * 60));
    const ageString = ageHours < 1 ? 'Less than 1 hour' : `${ageHours} hour${ageHours > 1 ? 's' : ''}`;

    return {
      cached: true,
      version: cached.version,
      age: ageString
    };
  }

  // Private methods
  private getCachedIndex(): CachedIndex | null {
    try {
      const cached = localStorage.getItem(TaxonomyIndexService.CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }

  private isCacheValid(cached: CachedIndex): boolean {
    const now = Date.now();
    return (now - cached.timestamp) < TaxonomyIndexService.CACHE_DURATION;
  }

  private cacheIndex(index: TaxonomyIndex): void {
    const cached: CachedIndex = {
      data: index,
      timestamp: Date.now(),
      version: index.version
    };
    try {
      localStorage.setItem(TaxonomyIndexService.CACHE_KEY, JSON.stringify(cached));
    } catch (error) {
      console.warn('Failed to cache taxonomy index:', error);
    }
  }

  private async fetchIndex(): Promise<TaxonomyIndex> {
    try {
      const response = await fetch(`${TaxonomyIndexService.API_BASE}/index`);
      if (!response.ok) {
        throw new Error(`Failed to fetch taxonomy index: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      
      // Validate response structure
      if (!data.version || !data.layers) {
        throw new Error('Invalid taxonomy index response structure');
      }
      
      // Transform backend response to our expected format
      return this.transformBackendResponse(data);
    } catch (error) {
      console.error('Error fetching taxonomy index:', error);
      
      // If backend is not available (404, network error, CORS, etc.), use frontend fallback
      if (error instanceof Error && 
          (error.message.includes('404') || 
           error.message.includes('Failed to fetch') ||
           error.message.includes('NetworkError') ||
           error.message.includes('fetch') ||
           error.message.includes('CORS'))) {
        console.warn('Backend taxonomy index not available, generating from frontend data...');
        return this.generateFrontendIndex();
      }
      
      throw error;
    }
  }

  // Transform backend response to our expected index format
  private transformBackendResponse(backendData: any): TaxonomyIndex {
    const layers: Record<string, LayerIndex> = {};
    let totalLayers = 0;

    for (const [layerCode, layerData] of Object.entries(backendData.layers)) {
      if (layerData && typeof layerData === 'object' && 'categories' in layerData) {
        const categories: Record<string, { subcategoryCount: number }> = {};
        let totalSubcategories = 0;
        let totalCategories = 0;

        const layerCategories = (layerData as any).categories;
        for (const [categoryCode, categoryData] of Object.entries(layerCategories)) {
          if (categoryData && typeof categoryData === 'object' && 'subcategories' in categoryData) {
            const subcategories = (categoryData as any).subcategories;
            const subcategoryCount = Object.keys(subcategories).length;
            
            categories[categoryCode] = { subcategoryCount };
            totalSubcategories += subcategoryCount;
            totalCategories++;
          }
        }

        if (totalCategories > 0) {
          layers[layerCode] = {
            totalCategories,
            totalSubcategories,
            categories
          };
          totalLayers++;
        }
      }
    }

    const transformedIndex: TaxonomyIndex = {
      version: `backend-${backendData.version}`,
      lastUpdated: new Date().toISOString(),
      totalLayers,
      layers
    };

    console.info('Transformed backend taxonomy index:', {
      version: transformedIndex.version,
      totalLayers: transformedIndex.totalLayers,
      layersProcessed: Object.keys(transformedIndex.layers),
      backendVersion: backendData.version
    });

    return transformedIndex;
  }

  // Generate index from frontend taxonomy data as fallback
  private generateFrontendIndex(): TaxonomyIndex {
    try {
      // Import frontend taxonomy service
      const { taxonomyService } = require('../services/simpleTaxonomyService');
      
      const layers: Record<string, LayerIndex> = {};
      const layerCodes = ['G', 'S', 'L', 'M', 'W', 'B', 'P', 'T', 'C', 'R'];
      let totalLayers = 0;
      
      for (const layer of layerCodes) {
        try {
          const categories = taxonomyService.getCategories(layer);
          let totalSubcategories = 0;
          const categoryData: Record<string, { subcategoryCount: number }> = {};
          
          for (const category of categories) {
            const subcategories = taxonomyService.getSubcategories(layer, category.code);
            const subcategoryCount = subcategories.length;
            totalSubcategories += subcategoryCount;
            
            categoryData[category.code] = {
              subcategoryCount
            };
          }
          
          if (categories.length > 0) {
            layers[layer] = {
              totalCategories: categories.length,
              totalSubcategories,
              categories: categoryData
            };
            totalLayers++;
          }
        } catch (error) {
          console.warn(`Failed to generate index for layer ${layer}:`, error);
          // Continue with other layers
        }
      }
      
      const frontendIndex: TaxonomyIndex = {
        version: 'frontend-' + new Date().toISOString().split('T')[0], // e.g., "frontend-2025-06-30"
        lastUpdated: new Date().toISOString(),
        totalLayers,
        layers
      };
      
      console.info('Generated frontend taxonomy index:', {
        version: frontendIndex.version,
        totalLayers: frontendIndex.totalLayers,
        layersGenerated: Object.keys(frontendIndex.layers)
      });
      
      return frontendIndex;
    } catch (error) {
      console.error('Failed to generate frontend taxonomy index:', error);
      
      // Absolute fallback - return empty but valid structure
      return {
        version: 'fallback-' + Date.now(),
        lastUpdated: new Date().toISOString(),
        totalLayers: 0,
        layers: {}
      };
    }
  }
}

export const taxonomyIndexService = new TaxonomyIndexService();
export type { TaxonomyIndex, LayerIndex, SubcategoryCount };