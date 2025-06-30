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
  private static readonly API_BASE = '/api/taxonomy';

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
      
      return data;
    } catch (error) {
      console.error('Error fetching taxonomy index:', error);
      throw error;
    }
  }
}

export const taxonomyIndexService = new TaxonomyIndexService();
export type { TaxonomyIndex, LayerIndex, SubcategoryCount };