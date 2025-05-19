/**
 * Types for the taxonomy data system
 */

/**
 * Basic taxonomy item with code, name, and numeric code
 */
export interface TaxonomyItem {
  code: string;
  name: string;
  numericCode: string;
}

/**
 * Subcategory entry in the taxonomy
 */
export interface SubcategoryEntry extends TaxonomyItem {
  // Additional fields can be added here if needed
}

/**
 * Category entry in the taxonomy with subcategories
 */
export interface CategoryEntry extends TaxonomyItem {
  subcategories: {
    [subcategoryCode: string]: SubcategoryEntry;
  };
}

/**
 * Layer in the taxonomy with categories
 */
export interface LayerEntry {
  categories: {
    [categoryCode: string]: CategoryEntry;
  };
}

/**
 * Complete taxonomy data structure
 */
export interface FullTaxonomyData {
  layers: {
    [layer: string]: LayerEntry;
  };
}

/**
 * Type for taxonomy loading state
 */
export type TaxonomyLoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Simplified taxonomy path 
 */
export interface TaxonomyPath {
  layer: string;
  category: string;
  subcategory: string;
}