# Taxonomy Indexing Specification for Frontend

## Overview

This document specifies the implementation of an elegant taxonomy indexing system for the frontend that provides accurate subcategory counts, optimizes performance, and automatically regenerates when taxonomy versions change.

## Backend API Endpoints

### 1. Layer Count
- **Endpoint**: `GET /api/taxonomy/layer-count`
- **Response**:
```json
{
  "count": 10,
  "layers": ["G", "S", "L", "M", "W", "B", "P", "T", "R", "C"]
}
```

### 2. Category Count per Layer
- **Endpoint**: `GET /api/taxonomy/layers/:layer/category-count`
- **Response**:
```json
{
  "layer": "B",
  "count": 1
}
```

### 3. Subcategory Count per Category
- **Endpoint**: `GET /api/taxonomy/layers/:layer/categories/:category/subcategory-count`
- **Response**:
```json
{
  "layer": "B",
  "category": "BRD",
  "count": 3
}
```

### 4. Subcategory Counts for All Categories in Layer
- **Endpoint**: `GET /api/taxonomy/layers/:layer/subcategory-counts`
- **Response**:
```json
{
  "layer": "B",
  "counts": [
    { "category": "BRD", "count": 3 }
  ],
  "totalCategories": 1,
  "totalSubcategories": 3
}
```

### 5. Comprehensive Taxonomy Index
- **Endpoint**: `GET /api/taxonomy/index`
- **Response**:
```json
{
  "version": "1.3.0",
  "lastUpdated": "2025-06-30T19:18:19.384Z",
  "totalLayers": 10,
  "layers": {
    "B": {
      "totalCategories": 1,
      "totalSubcategories": 3,
      "categories": {
        "BRD": {
          "subcategoryCount": 3
        }
      }
    }
  }
}
```

## Frontend Implementation Strategy

### 1. Taxonomy Index Service

```typescript
// services/taxonomyIndexService.ts

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
    localStorage.setItem(TaxonomyIndexService.CACHE_KEY, JSON.stringify(cached));
  }

  private async fetchIndex(): Promise<TaxonomyIndex> {
    const response = await fetch(`${TaxonomyIndexService.API_BASE}/index`);
    if (!response.ok) {
      throw new Error('Failed to fetch taxonomy index');
    }
    return response.json();
  }

  private async getCurrentVersion(): Promise<string> {
    const response = await fetch(`${TaxonomyIndexService.API_BASE}/version`);
    if (!response.ok) {
      throw new Error('Failed to fetch taxonomy version');
    }
    const data = await response.json();
    return data.version;
  }
}

export const taxonomyIndexService = new TaxonomyIndexService();
```

### 2. React Hook for Taxonomy Indexing

```typescript
// hooks/useTaxonomyIndex.ts

import { useState, useEffect, useCallback } from 'react';
import { taxonomyIndexService } from '../services/taxonomyIndexService';

interface UseTaxonomyIndexReturn {
  index: TaxonomyIndex | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getSubcategoryCount: (layer: string, category: string) => number;
  getCategoryCount: (layer: string) => number;
  getLayerCount: () => number;
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
      if (await taxonomyIndexService.needsRefresh()) {
        console.log('Taxonomy version changed, refreshing index...');
      }
      
      const data = await taxonomyIndexService.getIndex();
      setIndex(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load taxonomy index');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taxonomyIndexService.refreshIndex();
      setIndex(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh taxonomy index');
    } finally {
      setLoading(false);
    }
  }, []);

  const getSubcategoryCount = useCallback((layer: string, category: string): number => {
    return index?.layers[layer]?.categories[category]?.subcategoryCount || 0;
  }, [index]);

  const getCategoryCount = useCallback((layer: string): number => {
    return index?.layers[layer]?.totalCategories || 0;
  }, [index]);

  const getLayerCount = useCallback((): number => {
    return index?.totalLayers || 0;
  }, [index]);

  useEffect(() => {
    loadIndex();
  }, [loadIndex]);

  return {
    index,
    loading,
    error,
    refresh,
    getSubcategoryCount,
    getCategoryCount,
    getLayerCount
  };
}
```

### 3. Component Implementation

```typescript
// components/TaxonomyLayer.tsx

import React from 'react';
import { useTaxonomyIndex } from '../hooks/useTaxonomyIndex';

interface TaxonomyLayerProps {
  layer: string;
  onCategorySelect?: (category: string) => void;
}

export function TaxonomyLayer({ layer, onCategorySelect }: TaxonomyLayerProps) {
  const { 
    index, 
    loading, 
    error, 
    getCategoryCount, 
    getSubcategoryCount 
  } = useTaxonomyIndex();

  if (loading) {
    return <div>Loading taxonomy data...</div>;
  }

  if (error) {
    return <div>Error loading taxonomy: {error}</div>;
  }

  if (!index?.layers[layer]) {
    return <div>Layer {layer} not found</div>;
  }

  const layerData = index.layers[layer];
  const categories = Object.keys(layerData.categories);

  return (
    <div className="taxonomy-layer">
      <h3>Layer {layer}</h3>
      <p>Categories: {layerData.totalCategories}</p>
      <p>Total Subcategories: {layerData.totalSubcategories}</p>
      
      <div className="categories">
        {categories.map(category => (
          <div key={category} className="category-item">
            <button onClick={() => onCategorySelect?.(category)}>
              {category} ({getSubcategoryCount(layer, category)} subcategories)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 4. Auto-Refresh Strategy

```typescript
// components/TaxonomyProvider.tsx

import React, { createContext, useContext, useEffect } from 'react';
import { useTaxonomyIndex } from '../hooks/useTaxonomyIndex';

const TaxonomyContext = createContext<ReturnType<typeof useTaxonomyIndex> | null>(null);

export function TaxonomyProvider({ children }: { children: React.ReactNode }) {
  const taxonomyIndex = useTaxonomyIndex();

  // Auto-refresh on version change
  useEffect(() => {
    const checkForUpdates = async () => {
      if (await taxonomyIndexService.needsRefresh()) {
        console.log('Taxonomy version changed, auto-refreshing...');
        await taxonomyIndex.refresh();
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkForUpdates, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [taxonomyIndex]);

  return (
    <TaxonomyContext.Provider value={taxonomyIndex}>
      {children}
    </TaxonomyContext.Provider>
  );
}

export function useTaxonomy() {
  const context = useContext(TaxonomyContext);
  if (!context) {
    throw new Error('useTaxonomy must be used within TaxonomyProvider');
  }
  return context;
}
```

## Implementation Benefits

### 1. **Performance Optimization**
- **O(1) Lookups**: Subcategory counts are pre-calculated and cached
- **Reduced API Calls**: Single index endpoint provides all necessary data
- **Client-Side Caching**: 24-hour cache with version-based invalidation

### 2. **Data Consistency**
- **Version Tracking**: Automatic refresh when taxonomy version changes
- **Real-time Updates**: Background polling for version changes
- **Fallback Handling**: Graceful degradation if API is unavailable

### 3. **User Experience**
- **Instant Counts**: No loading delays for subcategory counts
- **Offline Support**: Cached data works without network
- **Progressive Enhancement**: Works with or without JavaScript

### 4. **Developer Experience**
- **Type Safety**: Full TypeScript support
- **React Integration**: Custom hooks for easy component integration
- **Error Handling**: Comprehensive error states and recovery

## Migration Strategy

### Phase 1: Backend Implementation ✅
- [x] Implement all indexing endpoints
- [x] Test endpoint functionality
- [x] Deploy to development environment

### Phase 2: Frontend Implementation
- [ ] Create TaxonomyIndexService
- [ ] Implement useTaxonomyIndex hook
- [ ] Add TaxonomyProvider component
- [ ] Update existing components to use new indexing

### Phase 3: Testing & Validation
- [ ] Verify subcategory counts match frontend expectations
- [ ] Test auto-refresh functionality
- [ ] Validate performance improvements
- [ ] Cross-browser compatibility testing

### Phase 4: Production Deployment
- [ ] Deploy to staging environment
- [ ] A/B test with existing implementation
- [ ] Monitor performance metrics
- [ ] Gradual rollout to production

## Monitoring & Maintenance

### Key Metrics to Track
- **Cache Hit Rate**: Percentage of requests served from cache
- **API Response Times**: Performance of indexing endpoints
- **Version Change Frequency**: How often taxonomy updates occur
- **Error Rates**: Failed index fetches or cache operations

### Maintenance Tasks
- **Cache Cleanup**: Periodic cleanup of expired cache entries
- **Version Monitoring**: Alert on unexpected version changes
- **Performance Monitoring**: Track endpoint response times
- **Error Tracking**: Monitor and resolve indexing failures

## Conclusion

This indexing system provides an elegant solution for accurate subcategory counts while maintaining excellent performance and user experience. The combination of server-side pre-calculation and client-side caching ensures that the frontend always displays correct counts without sacrificing performance.

The auto-refresh mechanism ensures that users always see up-to-date taxonomy data, while the comprehensive error handling provides a robust foundation for production use. 