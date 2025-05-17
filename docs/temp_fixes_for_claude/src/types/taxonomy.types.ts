export interface Subcategory {
  code: string; // Three-letter code (e.g., "SUN")
  numericCode: string; // Three-digit code (e.g., "001")
  name: string; // Human-readable name (e.g., "Sunset")
}

export interface Category {
  [categoryCode: string]: Subcategory[];
}

export interface Taxonomy {
  [layer: string]: Category;
}

export interface TaxonomyPath {
  layer: string;
  category: string;
  subcategory: string;
}