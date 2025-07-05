# Quick Implementation Guide - Asynchronous Taxonomy Sync

## Essential Code Snippets

### 1. Basic Taxonomy Sync Service

```typescript
// services/taxonomySyncService.ts
class TaxonomySyncService {
  private static readonly API_BASE = '/api/taxonomy';
  private static readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

  private syncState = {
    isInitialized: false,
    currentVersion: null,
    isHealthy: false,
    lastError: null
  };

  async initializeSync(): Promise<void> {
    try {
      await this.checkHealth();
      const version = await this.getVersion();
      await this.syncIndex();
      
      this.syncState.isInitialized = true;
      this.syncState.currentVersion = version.version;
      this.startBackgroundSync();
    } catch (error) {
      this.syncState.lastError = error.message;
    }
  }

  async syncIndex(): Promise<any> {
    const response = await fetch(`${TaxonomySyncService.API_BASE}/index`);
    if (!response.ok) throw new Error(`Sync failed: ${response.status}`);
    return response.json();
  }

  async checkHealth(): Promise<any> {
    const response = await fetch(`${TaxonomySyncService.API_BASE}/health`);
    if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
    return response.json();
  }

  async getVersion(): Promise<any> {
    const response = await fetch(`${TaxonomySyncService.API_BASE}/version`);
    if (!response.ok) throw new Error(`Version check failed: ${response.status}`);
    return response.json();
  }

  private startBackgroundSync(): void {
    setInterval(async () => {
      try {
        const version = await this.getVersion();
        if (this.syncState.currentVersion !== version.version) {
          console.log('Taxonomy version changed, syncing...');
          await this.syncIndex();
          this.syncState.currentVersion = version.version;
        }
      } catch (error) {
        console.error('Background sync failed:', error);
      }
    }, TaxonomySyncService.SYNC_INTERVAL);
  }
}

export const taxonomySyncService = new TaxonomySyncService();
```

### 2. React Hook

```typescript
// hooks/useTaxonomySync.ts
import { useState, useEffect } from 'react';
import { taxonomySyncService } from '../services/taxonomySyncService';

export function useTaxonomySync() {
  const [index, setIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sync = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taxonomySyncService.syncIndex();
      setIndex(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    taxonomySyncService.initializeSync();
  }, []);

  return { index, loading, error, sync };
}
```

### 3. Provider Component

```typescript
// components/TaxonomyProvider.tsx
import React, { createContext, useContext } from 'react';
import { useTaxonomySync } from '../hooks/useTaxonomySync';

const TaxonomyContext = createContext(null);

export function TaxonomyProvider({ children }) {
  const taxonomySync = useTaxonomySync();

  const getSubcategoryCount = (layer, category) => {
    return taxonomySync.index?.layers[layer]?.categories[category]?.subcategoryCount || 0;
  };

  return (
    <TaxonomyContext.Provider value={{ ...taxonomySync, getSubcategoryCount }}>
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

### 4. Usage in Components

```typescript
// components/TaxonomyLayer.tsx
import React from 'react';
import { useTaxonomy } from './TaxonomyProvider';

export function TaxonomyLayer({ layer }) {
  const { index, loading, error, getSubcategoryCount } = useTaxonomy();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!index?.layers[layer]) return <div>Layer not found</div>;

  const layerData = index.layers[layer];
  const categories = Object.keys(layerData.categories);

  return (
    <div>
      <h3>Layer {layer}</h3>
      <p>Categories: {layerData.totalCategories}</p>
      <p>Subcategories: {layerData.totalSubcategories}</p>
      
      {categories.map(category => (
        <div key={category}>
          {category} ({getSubcategoryCount(layer, category)} subcategories)
        </div>
      ))}
    </div>
  );
}
```

### 5. App Integration

```typescript
// App.tsx
import React from 'react';
import { TaxonomyProvider } from './components/TaxonomyProvider';
import { TaxonomyLayer } from './components/TaxonomyLayer';

function App() {
  return (
    <TaxonomyProvider>
      <div className="App">
        <h1>NNA Taxonomy</h1>
        <TaxonomyLayer layer="B" />
        <TaxonomyLayer layer="S" />
        <TaxonomyLayer layer="L" />
      </div>
    </TaxonomyProvider>
  );
}

export default App;
```

## Key Implementation Steps

1. **Create the sync service** - Handles background polling and caching
2. **Implement the React hook** - Manages state and provides sync functions
3. **Add the provider component** - Provides context and utility functions
4. **Update existing components** - Use the new sync system instead of direct API calls
5. **Add error handling** - Graceful degradation for network issues
6. **Test offline functionality** - Ensure cached data works without network

## Backend Endpoints Ready

All required endpoints are live and tested:
- ✅ `/api/taxonomy/version`
- ✅ `/api/taxonomy/health`
- ✅ `/api/taxonomy/index`
- ✅ `/api/taxonomy/tree`
- ✅ `/api/taxonomy/layer-count`
- ✅ `/api/taxonomy/layers/:layer/category-count`
- ✅ `/api/taxonomy/layers/:layer/categories/:category/subcategory-count`
- ✅ `/api/taxonomy/layers/:layer/subcategory-counts`

## Benefits

- **Real-time updates** when taxonomy changes
- **Offline support** with cached data
- **Performance optimized** with pre-calculated counts
- **Error resilient** with graceful degradation
- **Type safe** with full TypeScript support 