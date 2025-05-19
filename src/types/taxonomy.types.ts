// Updated taxonomy types for NNA Registry Service
export interface LayerOption {
  id: string;
  name: string;
  code: string;
  numericCode?: number;
}

export interface CategoryOption {
  id: string;
  name: string;
  code: string;
  numericCode?: number;
}

export interface SubcategoryOption {
  id: string;
  name: string;
  code: string;
  numericCode?: number;
}

export interface Taxonomy {
  [layer: string]: {
    categories: {
      [categoryNum: string]: {
        name: string;
        code: string;
        numericCode?: number;
        subcategories: {
          [subcategoryNum: string]: {
            name: string;
            code: string;
            numericCode?: number;
          };
        };
      };
    };
  };
}

export interface LayerInfo {
  id: string;
  name: string;
  code: string;
  numericCode?: number;
  categories: {
    [key: string]: {
      name: string;
      code: string;
      numericCode?: number;
      subcategories: {
        [key: string]: {
          name: string;
          code: string;
          numericCode?: number;
        };
      };
    };
  };
}

export interface Category {
  id?: string;
  name: string;
  code: string;
  numericCode?: number;
  subcategories: {
    [key: string]: {
      name: string;
      code: string;
      numericCode?: number;
    };
  };
}

export interface Subcategory {
  id: string;
  name: string;
  code: string;
  numericCode?: number;
}

export interface TaxonomyData {
  [key: string]: LayerInfo;
}

// New interfaces for flattened taxonomy structure
export interface TaxonomySubcategory {
  code: string;
  numericCode: string;
  name: string;
}

export interface FlattenedSubcategory {
  numericCode: string;
  name: string;
}

export interface LayerLookup {
  [categoryOrFullCode: string]: {
    numericCode: string;
    name: string;
  };
}

export interface SubcategoryMapping {
  [category: string]: string[]; // Array of full subcategory codes (category.subcategory)
}

export interface TaxonomyItem {
  code: string;
  numericCode: string;
  name: string;
}
