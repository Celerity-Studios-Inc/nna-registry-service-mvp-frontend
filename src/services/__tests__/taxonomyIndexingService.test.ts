// __tests__/taxonomyIndexingService.test.ts

import { taxonomyIndexService, TaxonomyIndex } from '../taxonomyIndexingService';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Sample taxonomy index data
const mockIndexData: TaxonomyIndex = {
  version: '1.3.0',
  lastUpdated: '2025-06-30T19:18:19.384Z',
  totalLayers: 3,
  layers: {
    'S': {
      totalCategories: 2,
      totalSubcategories: 5,
      categories: {
        'POP': { subcategoryCount: 3 },
        'RCK': { subcategoryCount: 2 }
      }
    },
    'M': {
      totalCategories: 1,
      totalSubcategories: 2,
      categories: {
        'DNC': { subcategoryCount: 2 }
      }
    },
    'W': {
      totalCategories: 1,
      totalSubcategories: 1,
      categories: {
        'STG': { subcategoryCount: 1 }
      }
    }
  }
};

describe('TaxonomyIndexService', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    mockFetch.mockClear();
    jest.clearAllMocks();
  });

  describe('getIndex', () => {
    it('should fetch index from API when no cache exists', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockIndexData
      });

      const result = await taxonomyIndexService.getIndex();
      
      expect(mockFetch).toHaveBeenCalledWith('/api/taxonomy/index');
      expect(result).toEqual(mockIndexData);
    });

    it('should return cached data if valid', async () => {
      const cachedData = {
        data: mockIndexData,
        timestamp: Date.now(),
        version: mockIndexData.version
      };
      
      mockLocalStorage.setItem('nna_taxonomy_index', JSON.stringify(cachedData));
      
      const result = await taxonomyIndexService.getIndex();
      
      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toEqual(mockIndexData);
    });

    it('should fetch fresh data if cache is expired', async () => {
      const expiredTimestamp = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
      const cachedData = {
        data: mockIndexData,
        timestamp: expiredTimestamp,
        version: mockIndexData.version
      };
      
      mockLocalStorage.setItem('nna_taxonomy_index', JSON.stringify(cachedData));
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockIndexData
      });

      const result = await taxonomyIndexService.getIndex();
      
      expect(mockFetch).toHaveBeenCalledWith('/api/taxonomy/index');
      expect(result).toEqual(mockIndexData);
    });
  });

  describe('getSubcategoryCount', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockIndexData
      });
    });

    it('should return correct subcategory count for existing layer and category', async () => {
      const count = await taxonomyIndexService.getSubcategoryCount('S', 'POP');
      expect(count).toBe(3);
    });

    it('should return 0 for non-existing layer', async () => {
      const count = await taxonomyIndexService.getSubcategoryCount('X', 'POP');
      expect(count).toBe(0);
    });

    it('should return 0 for non-existing category', async () => {
      const count = await taxonomyIndexService.getSubcategoryCount('S', 'XXX');
      expect(count).toBe(0);
    });
  });

  describe('getCategoryCount', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockIndexData
      });
    });

    it('should return correct category count for existing layer', async () => {
      const count = await taxonomyIndexService.getCategoryCount('S');
      expect(count).toBe(2);
    });

    it('should return 0 for non-existing layer', async () => {
      const count = await taxonomyIndexService.getCategoryCount('X');
      expect(count).toBe(0);
    });
  });

  describe('getLayerCount', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockIndexData
      });
    });

    it('should return correct total layer count', async () => {
      const count = await taxonomyIndexService.getLayerCount();
      expect(count).toBe(3);
    });
  });

  describe('getTotalSubcategories', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockIndexData
      });
    });

    it('should return correct total subcategory count for layer', async () => {
      const count = await taxonomyIndexService.getTotalSubcategories('S');
      expect(count).toBe(5);
    });

    it('should return 0 for non-existing layer', async () => {
      const count = await taxonomyIndexService.getTotalSubcategories('X');
      expect(count).toBe(0);
    });
  });

  describe('getLayerSubcategoryCounts', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockIndexData
      });
    });

    it('should return subcategory counts for all categories in layer', async () => {
      const counts = await taxonomyIndexService.getLayerSubcategoryCounts('S');
      expect(counts).toEqual([
        { category: 'POP', count: 3 },
        { category: 'RCK', count: 2 }
      ]);
    });

    it('should return empty array for non-existing layer', async () => {
      const counts = await taxonomyIndexService.getLayerSubcategoryCounts('X');
      expect(counts).toEqual([]);
    });
  });

  describe('needsRefresh', () => {
    it('should return true when no cache exists', async () => {
      const needsRefresh = await taxonomyIndexService.needsRefresh();
      expect(needsRefresh).toBe(true);
    });

    it('should return true when version has changed', async () => {
      const cachedData = {
        data: mockIndexData,
        timestamp: Date.now(),
        version: '1.2.0' // Different version
      };
      
      mockLocalStorage.setItem('nna_taxonomy_index', JSON.stringify(cachedData));
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ version: '1.3.0' })
      });

      const needsRefresh = await taxonomyIndexService.needsRefresh();
      expect(needsRefresh).toBe(true);
    });

    it('should return false when version is same', async () => {
      const cachedData = {
        data: mockIndexData,
        timestamp: Date.now(),
        version: '1.3.0'
      };
      
      mockLocalStorage.setItem('nna_taxonomy_index', JSON.stringify(cachedData));
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ version: '1.3.0' })
      });

      const needsRefresh = await taxonomyIndexService.needsRefresh();
      expect(needsRefresh).toBe(false);
    });
  });

  describe('clearCache', () => {
    it('should remove cached data', () => {
      const cachedData = {
        data: mockIndexData,
        timestamp: Date.now(),
        version: mockIndexData.version
      };
      
      mockLocalStorage.setItem('nna_taxonomy_index', JSON.stringify(cachedData));
      
      taxonomyIndexService.clearCache();
      
      expect(mockLocalStorage.getItem('nna_taxonomy_index')).toBeNull();
    });
  });

  describe('getCacheStatus', () => {
    it('should return not cached when no cache exists', () => {
      const status = taxonomyIndexService.getCacheStatus();
      expect(status.cached).toBe(false);
    });

    it('should return cache details when cache exists', () => {
      const cachedData = {
        data: mockIndexData,
        timestamp: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
        version: '1.3.0'
      };
      
      mockLocalStorage.setItem('nna_taxonomy_index', JSON.stringify(cachedData));
      
      const status = taxonomyIndexService.getCacheStatus();
      expect(status.cached).toBe(true);
      expect(status.version).toBe('1.3.0');
      expect(status.age).toBe('2 hours');
    });
  });

  describe('error handling', () => {
    it('should handle API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      await expect(taxonomyIndexService.getIndex()).rejects.toThrow('Network error');
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });
      
      await expect(taxonomyIndexService.getIndex()).rejects.toThrow('Failed to fetch taxonomy index: 404 Not Found');
    });

    it('should handle invalid response structure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'structure' })
      });
      
      await expect(taxonomyIndexService.getIndex()).rejects.toThrow('Invalid taxonomy index response structure');
    });
  });
});