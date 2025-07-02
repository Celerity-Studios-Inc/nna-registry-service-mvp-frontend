// components/providers/TaxonomySyncProvider.tsx

import React, { createContext, useContext, ReactNode } from 'react';
import { useTaxonomySync } from '../../hooks/useTaxonomySync';
import { TaxonomyIndex, SyncState } from '../../services/taxonomySyncService';
import { logger } from '../../utils/logger';

interface TaxonomySyncContextValue {
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
  
  // Layer helpers
  getAllLayers: () => string[];
  getLayerCategories: (layer: string) => string[];
  getCategorySubcategories: (layer: string, category: string) => string[];
  
  // Formatting helpers
  formatLayerName: (layer: string) => string;
  formatCategoryName: (category: string) => string;
  formatSubcategoryName: (subcategory: string) => string;
  
  // Validation helpers
  isValidLayer: (layer: string) => boolean;
  isValidCategory: (layer: string, category: string) => boolean;
  isValidSubcategory: (layer: string, category: string, subcategory: string) => boolean;
}

const TaxonomySyncContext = createContext<TaxonomySyncContextValue | null>(null);

interface TaxonomySyncProviderProps {
  children: ReactNode;
  enableDebugLogging?: boolean;
}

export function TaxonomySyncProvider({ 
  children, 
  enableDebugLogging = false 
}: TaxonomySyncProviderProps) {
  const taxonomySync = useTaxonomySync();

  // Layer name mappings
  const LAYER_NAMES: Record<string, string> = {
    'G': 'Songs',
    'S': 'Stars', 
    'L': 'Looks',
    'M': 'Moves',
    'W': 'Worlds',
    'B': 'Branded',
    'P': 'Personalize',
    'T': 'Training Data',
    'R': 'Rights',
    'C': 'Composites'
  };

  // Enhanced utility functions
  const getAllLayers = (): string[] => {
    if (!taxonomySync.index) return [];
    return Object.keys(taxonomySync.index.layers).sort();
  };

  const getLayerCategories = (layer: string): string[] => {
    if (!taxonomySync.index || !taxonomySync.index.layers[layer]) return [];
    return Object.keys(taxonomySync.index.layers[layer].categories).sort();
  };

  const getCategorySubcategories = (layer: string, category: string): string[] => {
    // This would require additional data structure or API call
    // For now, we'll return empty array as subcategory names aren't in the index
    if (enableDebugLogging) {
      logger.info(`Getting subcategories for ${layer}.${category} - requires additional implementation`);
    }
    return [];
  };

  // Formatting helpers
  const formatLayerName = (layer: string): string => {
    return LAYER_NAMES[layer] || layer;
  };

  const formatCategoryName = (category: string): string => {
    // Convert category codes to readable names
    const categoryNames: Record<string, string> = {
      'POP': 'Pop',
      'RCK': 'Rock',
      'HIP': 'Hip Hop',
      'DNC': 'Dance/Electronic',
      'RNB': 'R&B/Soul',
      'JZZ': 'Jazz',
      'LAT': 'Latin',
      'WLD': 'World',
      'ALT': 'Alternative',
      'CLS': 'Classical',
      'BLU': 'Blues',
      'FLK': 'Folk',
      // Add more as needed
    };
    
    return categoryNames[category] || category;
  };

  const formatSubcategoryName = (subcategory: string): string => {
    // Handle dot notation subcategories
    if (subcategory.includes('.')) {
      const parts = subcategory.split('.');
      return parts[parts.length - 1]; // Return the subcategory part
    }
    
    // Common subcategory mappings
    const subcategoryNames: Record<string, string> = {
      'BAS': 'Base',
      'EXP': 'Experimental',
      'VIN': 'Vintage',
      'MOD': 'Modern',
      'CLA': 'Classic',
      // Add more as needed
    };
    
    return subcategoryNames[subcategory] || subcategory;
  };

  // Validation helpers
  const isValidLayer = (layer: string): boolean => {
    return taxonomySync.isLayerAvailable(layer);
  };

  const isValidCategory = (layer: string, category: string): boolean => {
    return taxonomySync.isCategoryAvailable(layer, category);
  };

  const isValidSubcategory = (layer: string, category: string, subcategory: string): boolean => {
    // For now, check if the category exists and subcategory count > 0
    const subcategoryCount = taxonomySync.getSubcategoryCount(layer, category);
    return subcategoryCount > 0;
  };

  // Enhanced context value
  const contextValue: TaxonomySyncContextValue = {
    // Spread all values from useTaxonomySync
    ...taxonomySync,
    
    // Enhanced helper functions
    getAllLayers,
    getLayerCategories,
    getCategorySubcategories,
    
    // Formatting helpers
    formatLayerName,
    formatCategoryName,
    formatSubcategoryName,
    
    // Validation helpers
    isValidLayer,
    isValidCategory,
    isValidSubcategory
  };

  // Debug logging
  React.useEffect(() => {
    if (enableDebugLogging && taxonomySync.index) {
      logger.info('🔍 TaxonomySyncProvider Debug Info:', {
        version: taxonomySync.index.version,
        totalLayers: taxonomySync.index.totalLayers,
        layers: Object.keys(taxonomySync.index.layers),
        syncState: taxonomySync.syncState,
        isHealthy: taxonomySync.isHealthy,
        isConnected: taxonomySync.isConnected,
        lastSyncTime: taxonomySync.lastSyncTime,
        cacheAge: taxonomySync.cacheAge
      });
    }
  }, [enableDebugLogging, taxonomySync.index, taxonomySync.syncState]);

  return (
    <TaxonomySyncContext.Provider value={contextValue}>
      {children}
    </TaxonomySyncContext.Provider>
  );
}

// Hook to use the taxonomy sync context
export function useTaxonomy(): TaxonomySyncContextValue {
  const context = useContext(TaxonomySyncContext);
  
  if (!context) {
    throw new Error('useTaxonomy must be used within a TaxonomySyncProvider');
  }
  
  return context;
}

// Type exports for external use
export type { TaxonomySyncContextValue };