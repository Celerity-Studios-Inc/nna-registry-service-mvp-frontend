// __tests__/useTaxonomyIndex.test.tsx

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useTaxonomyIndex } from '../useTaxonomyIndex';
import { taxonomyIndexService } from '../../services/taxonomyIndexingService';

// Mock the taxonomy indexing service
jest.mock('../../services/taxonomyIndexingService', () => ({
  taxonomyIndexService: {
    getIndex: jest.fn(),
    refreshIndex: jest.fn(),
    needsRefresh: jest.fn(),
    getCacheStatus: jest.fn(),
    clearCache: jest.fn(),
  }
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  }
}));

const mockTaxonomyIndexService = taxonomyIndexService as jest.Mocked<typeof taxonomyIndexService>;

const mockIndexData = {
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
    }
  }
};

describe('useTaxonomyIndex', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTaxonomyIndexService.needsRefresh.mockResolvedValue(false);
    mockTaxonomyIndexService.getCacheStatus.mockReturnValue({
      cached: true,
      version: '1.3.0',
      age: '1 hour'
    });
  });

  it('should load index on mount', async () => {
    mockTaxonomyIndexService.getIndex.mockResolvedValue(mockIndexData);

    const { result } = renderHook(() => useTaxonomyIndex());

    expect(result.current.loading).toBe(true);
    expect(result.current.index).toBeNull();

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.index).toEqual(mockIndexData);
    expect(result.current.error).toBeNull();
  });

  it('should handle loading errors', async () => {
    const errorMessage = 'Failed to load index';
    mockTaxonomyIndexService.getIndex.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useTaxonomyIndex());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.index).toBeNull();
    expect(result.current.error).toBe(errorMessage);
  });

  it('should provide subcategory count function', async () => {
    mockTaxonomyIndexService.getIndex.mockResolvedValue(mockIndexData);

    const { result } = renderHook(() => useTaxonomyIndex());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.getSubcategoryCount('S', 'POP')).toBe(3);
    expect(result.current.getSubcategoryCount('S', 'RCK')).toBe(2);
    expect(result.current.getSubcategoryCount('S', 'NONEXISTENT')).toBe(0);
    expect(result.current.getSubcategoryCount('NONEXISTENT', 'POP')).toBe(0);
  });

  it('should provide category count function', async () => {
    mockTaxonomyIndexService.getIndex.mockResolvedValue(mockIndexData);

    const { result } = renderHook(() => useTaxonomyIndex());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.getCategoryCount('S')).toBe(2);
    expect(result.current.getCategoryCount('M')).toBe(1);
    expect(result.current.getCategoryCount('NONEXISTENT')).toBe(0);
  });

  it('should provide layer count function', async () => {
    mockTaxonomyIndexService.getIndex.mockResolvedValue(mockIndexData);

    const { result } = renderHook(() => useTaxonomyIndex());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.getLayerCount()).toBe(3);
  });

  it('should provide total subcategories function', async () => {
    mockTaxonomyIndexService.getIndex.mockResolvedValue(mockIndexData);

    const { result } = renderHook(() => useTaxonomyIndex());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.getTotalSubcategories('S')).toBe(5);
    expect(result.current.getTotalSubcategories('M')).toBe(2);
    expect(result.current.getTotalSubcategories('NONEXISTENT')).toBe(0);
  });

  it('should provide layer subcategory counts function', async () => {
    mockTaxonomyIndexService.getIndex.mockResolvedValue(mockIndexData);

    const { result } = renderHook(() => useTaxonomyIndex());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const sLayerCounts = result.current.getLayerSubcategoryCounts('S');
    expect(sLayerCounts).toEqual([
      { category: 'POP', count: 3 },
      { category: 'RCK', count: 2 }
    ]);

    const mLayerCounts = result.current.getLayerSubcategoryCounts('M');
    expect(mLayerCounts).toEqual([
      { category: 'DNC', count: 2 }
    ]);

    const nonexistentLayerCounts = result.current.getLayerSubcategoryCounts('NONEXISTENT');
    expect(nonexistentLayerCounts).toEqual([]);
  });

  it('should handle refresh function', async () => {
    mockTaxonomyIndexService.getIndex.mockResolvedValue(mockIndexData);
    const refreshedData = { ...mockIndexData, version: '1.4.0' };
    mockTaxonomyIndexService.refreshIndex.mockResolvedValue(refreshedData);

    const { result } = renderHook(() => useTaxonomyIndex());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.index?.version).toBe('1.3.0');

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.index?.version).toBe('1.4.0');
    expect(mockTaxonomyIndexService.refreshIndex).toHaveBeenCalled();
  });

  it('should handle refresh errors', async () => {
    mockTaxonomyIndexService.getIndex.mockResolvedValue(mockIndexData);
    mockTaxonomyIndexService.refreshIndex.mockRejectedValue(new Error('Refresh failed'));

    const { result } = renderHook(() => useTaxonomyIndex());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.error).toBe('Refresh failed');
  });

  it('should handle clear cache function', async () => {
    mockTaxonomyIndexService.getIndex.mockResolvedValue(mockIndexData);

    const { result } = renderHook(() => useTaxonomyIndex());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      result.current.clearCache();
    });

    expect(mockTaxonomyIndexService.clearCache).toHaveBeenCalled();
    // clearCache should trigger a reload, so getIndex should be called again
    expect(mockTaxonomyIndexService.getIndex).toHaveBeenCalledTimes(2);
  });

  it('should return cache status', async () => {
    mockTaxonomyIndexService.getIndex.mockResolvedValue(mockIndexData);

    const { result } = renderHook(() => useTaxonomyIndex());

    expect(result.current.cacheStatus).toEqual({
      cached: true,
      version: '1.3.0',
      age: '1 hour'
    });
  });

  it('should return zero values when no index is loaded', () => {
    mockTaxonomyIndexService.getIndex.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useTaxonomyIndex());

    expect(result.current.getSubcategoryCount('S', 'POP')).toBe(0);
    expect(result.current.getCategoryCount('S')).toBe(0);
    expect(result.current.getLayerCount()).toBe(0);
    expect(result.current.getTotalSubcategories('S')).toBe(0);
    expect(result.current.getLayerSubcategoryCounts('S')).toEqual([]);
  });
});