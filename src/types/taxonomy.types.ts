/**
 * Layer option in the taxonomy
 */
export interface LayerOption {
  code: string;
  name: string;
  description?: string;
}

/**
 * Category option in the taxonomy
 */
export interface CategoryOption {
  code: string;
  name: string;
  description?: string;
  layerCode: string;
}

/**
 * Subcategory option in the taxonomy
 */
export interface SubcategoryOption {
  code: string;
  name: string;
  description?: string;
  categoryCode: string;
  numericCode?: number;
}

/**
 * Complete taxonomy structure
 */
export interface TaxonomyData {
  layers: LayerOption[];
  categories: CategoryOption[];
  subcategories: SubcategoryOption[];
}

/**
 * NNA Address format
 */
export interface NNAAddress {
  layerCode: string;
  categoryCode: string;
  subcategoryCode: string;
  sequential: string;
  humanFriendlyName?: string;
  machineFriendlyAddress?: string;
}