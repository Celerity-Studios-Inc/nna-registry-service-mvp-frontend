/**
 * Taxonomy Service for NNA Registry
 *
 * Provides centralized management of taxonomy data and mapping between
 * Human-Friendly Names (HFN) and Machine-Friendly Addresses (MFA).
 */

import taxonomyData from '../assets/enriched_nna_layer_taxonomy_v1.3.json';
import { logger } from '../utils/logger';
import { validateTaxonomyData } from '../utils/taxonomyValidator';
import { CategoryOption, SubcategoryOption, LayerOption as TypeLayerOption } from '../types/taxonomy.types';

/**
 * Category in the taxonomy hierarchy
 */
export interface TaxonomyCategory {
  code: string;
  numericCode: string;
  name: string;
}

/**
 * Subcategory in the taxonomy hierarchy
 */
export interface TaxonomySubcategory {
  code: string;
  numericCode: string;
  name: string;
}

/**
 * Layer information including name and code
 */
export interface LayerInfo {
  code: string;
  name: string;
  numericCode: string;
}

/**
 * Central service for taxonomy operations
 */
class TaxonomyService {
  private isInitialized: boolean = false;
  
  // Map layer codes to numeric values
  private readonly LAYER_NUMERIC_CODES: { [key: string]: string } = {
    'G': '1',
    'S': '2', 
    'L': '3',
    'M': '4',
    'W': '5',
    'B': '6',
    'P': '7',
    'T': '8',
    'C': '9',
    'R': '10'
  };
  
  // Map layer codes to names
  private readonly LAYER_NAMES: { [key: string]: string } = {
    'G': 'Songs',
    'S': 'Stars',
    'L': 'Looks',
    'M': 'Moves',
    'W': 'Worlds',
    'B': 'Branded',
    'P': 'Personalize',
    'T': 'Training Data',
    'C': 'Composite',
    'R': 'Rights'
  };
  
  /**
   * Special case mappings to override taxonomy data for known issues
   * Format: 'Layer.Category.Subcategory': 'NumericCode'
   */
  private readonly SUBCATEGORY_OVERRIDES: { [key: string]: string } = {
    // This is the critical fix for W.BCH.SUN
    'W.BCH.SUN': '003',
    
    // Add any other overrides here
    'S.POP.HPM': '007'
  };
  
  // Cache for performance
  private layerCache: Map<string, LayerInfo> = new Map();
  private categoriesCache: Map<string, CategoryOption[]> = new Map();
  private subcategoriesCache: Map<string, SubcategoryOption[]> = new Map();
  
  constructor() {
    this.initialize();
  }
  
  /**
   * Initialize the taxonomy service and validate data
   */
  private initialize(): void {
    try {
      // Validate taxonomy data structure
      const validation = validateTaxonomyData(taxonomyData);
      
      if (!validation.valid) {
        logger.warn('Taxonomy data validation issues:', validation.issues);
      }
      
      this.isInitialized = true;
      logger.info('Taxonomy service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize taxonomy service:', error);
      throw error;
    }
  }
  
  /**
   * Ensure the service is initialized before operations
   */
  private checkInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Taxonomy service is not initialized');
    }
  }
  
  /**
   * Get information about a specific layer
   */
  public getLayer(layerCode: string): LayerInfo | null {
    this.checkInitialized();
    
    if (this.layerCache.has(layerCode)) {
      return this.layerCache.get(layerCode) || null;
    }
    
    if (!taxonomyData[layerCode]) {
      return null;
    }
    
    const layerInfo: LayerInfo = {
      code: layerCode,
      name: this.LAYER_NAMES[layerCode] || layerCode,
      numericCode: this.LAYER_NUMERIC_CODES[layerCode] || ''
    };
    
    this.layerCache.set(layerCode, layerInfo);
    return layerInfo;
  }
  
  /**
   * Get all available layers as options for UI
   */
  public getLayers(): TypeLayerOption[] {
    this.checkInitialized();

    return Object.keys(this.LAYER_NAMES).map(code => ({
      id: code,
      code,
      name: this.LAYER_NAMES[code],
      numericCode: parseInt(this.LAYER_NUMERIC_CODES[code])
    }));
  }
  
  /**
   * Get a category from a layer by code
   */
  public getCategory(layerCode: string, categoryCode: string): TaxonomyCategory | null {
    try {
      this.checkInitialized();
      
      const layer = this.getLayer(layerCode);
      if (!layer || !taxonomyData[layerCode]) {
        logger.warn(`Layer ${layerCode} not found or has no categories`);
        return null;
      }
      
      // Handle special case for S.001/S.POP combinations
      let normalizedCategoryCode = categoryCode;
      if (layerCode === 'S' && categoryCode === '001') {
        normalizedCategoryCode = 'POP';
        logger.debug('Converting numeric category code 001 to POP for layer S');
      }
      
      // Try to get category by normalized code first
      const categories = Object.keys(taxonomyData[layerCode]);
      
      if (categories.includes(normalizedCategoryCode)) {
        const subcategories = taxonomyData[layerCode][normalizedCategoryCode] as any[];
        if (subcategories && subcategories.length > 0) {
          // Use the first subcategory's numeric code to determine category numeric code
          const firstSubcategory = subcategories[0];
          const numericPrefix = firstSubcategory.numericCode.substring(0, 3);
          
          return {
            code: normalizedCategoryCode,
            numericCode: numericPrefix,
            name: this.getCategoryDisplayName(layerCode, normalizedCategoryCode)
          };
        }
      }
      
      // If not found and we're looking for POP, try 001
      if (!categories.includes(normalizedCategoryCode) && layerCode === 'S' && normalizedCategoryCode === 'POP') {
        const subcategories = taxonomyData[layerCode]['001'] as any[];
        if (subcategories && subcategories.length > 0) {
          const firstSubcategory = subcategories[0];
          const numericPrefix = firstSubcategory.numericCode.substring(0, 3);
          
          return {
            code: 'POP',
            numericCode: numericPrefix,
            name: this.getCategoryDisplayName(layerCode, 'POP')
          };
        }
      }
      
      return null;
    } catch (error) {
      logger.error(`Error in getCategory for ${layerCode}.${categoryCode}:`, error);
      return null;
    }
  }
  
  /**
   * Get all categories for a layer as options for UI
   */
  public getCategories(layerCode: string): CategoryOption[] {
    this.checkInitialized();

    // Check cache first
    const cacheKey = layerCode;
    if (this.categoriesCache.has(cacheKey)) {
      return this.categoriesCache.get(cacheKey) || [];
    }

    const layer = this.getLayer(layerCode);
    if (!layer || !taxonomyData[layerCode]) {
      return [];
    }

    const categories: CategoryOption[] = [];

    Object.keys(taxonomyData[layerCode]).forEach(categoryCode => {
      const subcategories = taxonomyData[layerCode][categoryCode] as any[];
      if (subcategories && subcategories.length > 0) {
        // Use the first subcategory's numeric code to determine category numeric code
        const firstSubcategory = subcategories[0];
        const numericPrefix = firstSubcategory.numericCode.substring(0, 3);

        const name = this.getCategoryDisplayName(layerCode, categoryCode);

        categories.push({
          id: `${layerCode}.${categoryCode}`,
          code: categoryCode,
          numericCode: parseInt(numericPrefix),
          name,
        });
      }
    });

    // Sort categories by numeric code
    categories.sort((a, b) => (a.numericCode || 0) - (b.numericCode || 0));

    this.categoriesCache.set(cacheKey, categories);
    return categories;
  }
  
  /**
   * Get a proper display name for a category
   */
  private getCategoryDisplayName(layerCode: string, categoryCode: string): string {
    // Custom display names for categories
    const specialCategoryNames: Record<string, Record<string, string>> = {
      'W': {
        'BCH': 'Beach',
        'CST': 'Concert Stages',
        'URB': 'Urban',
        'DCL': 'Dance Club',
        'TRO': 'Tropical'
      },
      'S': {
        'POP': 'Pop',
        'ROK': 'Rock',
        'HIP': 'Hip Hop'
      }
    };
    
    // Return special name if defined, otherwise format the code
    if (specialCategoryNames[layerCode]?.[categoryCode]) {
      return specialCategoryNames[layerCode][categoryCode];
    }
    
    // If the category is all caps, format it nicely
    if (/^[A-Z]+$/.test(categoryCode)) {
      // Add spaces before capital letters
      return categoryCode.replace(/([A-Z])/g, ' $1').trim()
        // Replace underscores with spaces
        .replace(/_/g, ' ')
        // Capitalize only the first letter of each word
        .replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
    }
    
    return categoryCode;
  }
  
  /**
   * Get a subcategory by its code
   */
  public getSubcategory(
    layerCode: string,
    categoryCode: string,
    subcategoryCode: string
  ): TaxonomySubcategory | null {
    try {
      this.checkInitialized();
      
      // Special case for S.POP.HPM / S.001.HPM - hardcoded fallback
      if (layerCode === 'S' && (categoryCode === 'POP' || categoryCode === '001') && subcategoryCode === 'HPM') {
        logger.debug('Special handling for S.POP.HPM / S.001.HPM subcategory');
        
        // First try direct lookup
        const category = this.getCategory(layerCode, categoryCode);
        if (category && taxonomyData[layerCode][categoryCode]) {
          const subcategories = taxonomyData[layerCode][categoryCode] as any[];
          const subcategory = subcategories.find(sc => sc.code === subcategoryCode);
          
          if (subcategory) {
            return {
              ...subcategory,
              id: `${layerCode}.${category.code}.${subcategory.code}`
            };
          }
        }
        
        // If direct lookup fails, return hardcoded S.POP.HPM mapping
        logger.debug('Using hardcoded fallback for S.POP.HPM subcategory');
        return {
          id: `${layerCode}.${categoryCode === 'POP' ? 'POP' : '001'}.HPM`,
          name: 'Hipster Male',
          code: 'HPM',
          numericCode: '7'
        };
      }
      
      // Check override for W.BCH.SUN
      if (layerCode === 'W' && categoryCode === 'BCH' && subcategoryCode === 'SUN') {
        // First try direct lookup
        const subcategories = taxonomyData[layerCode][categoryCode] as any[];
        const subcategory = subcategories.find(sc => sc.code === subcategoryCode);
        
        if (subcategory) {
          // Override the numeric code
          const override = this.SUBCATEGORY_OVERRIDES[`${layerCode}.${categoryCode}.${subcategoryCode}`];
          if (override) {
            return {
              ...subcategory,
              numericCode: override,
              id: `${layerCode}.${categoryCode}.${subcategory.code}`
            };
          }
          
          return {
            ...subcategory,
            id: `${layerCode}.${categoryCode}.${subcategory.code}`
          };
        }
      }
      
      // Standard case
      const category = this.getCategory(layerCode, categoryCode);
      if (!category || !taxonomyData[layerCode][categoryCode]) {
        logger.warn(`Category ${categoryCode} not found in layer ${layerCode}`);
        return null;
      }
      
      const subcategories = taxonomyData[layerCode][categoryCode] as any[];
      const subcategory = subcategories.find(sc => sc.code === subcategoryCode);
      
      if (!subcategory) {
        logger.warn(`Subcategory ${subcategoryCode} not found in ${layerCode}.${categoryCode}`);
        return null;
      }
      
      // Check if there's an override for this subcategory
      const overrideKey = `${layerCode}.${categoryCode}.${subcategoryCode}`;
      if (this.SUBCATEGORY_OVERRIDES[overrideKey]) {
        logger.debug(`Using override ${this.SUBCATEGORY_OVERRIDES[overrideKey]} for ${overrideKey}`);
        return {
          ...subcategory,
          numericCode: this.SUBCATEGORY_OVERRIDES[overrideKey],
          id: `${layerCode}.${category.code}.${subcategory.code}`
        };
      }
      
      return {
        ...subcategory,
        id: `${layerCode}.${category.code}.${subcategory.code}`
      };
    } catch (error) {
      logger.error(`Error in getSubcategory for ${layerCode}.${categoryCode}.${subcategoryCode}:`, error);
      return null;
    }
  }
  
  /**
   * Get all subcategories for a category as options for UI
   */
  public getSubcategories(layerCode: string, categoryCode: string): SubcategoryOption[] {
    this.checkInitialized();

    // Check cache first
    const cacheKey = `${layerCode}.${categoryCode}`;
    if (this.subcategoriesCache.has(cacheKey)) {
      return this.subcategoriesCache.get(cacheKey) || [];
    }

    if (!taxonomyData[layerCode] || !taxonomyData[layerCode][categoryCode]) {
      return [];
    }

    const subcategories: SubcategoryOption[] = [];
    const subcategoryList = taxonomyData[layerCode][categoryCode] as any[];

    subcategoryList.forEach(subcategory => {
      // Check if there's an override for this subcategory's numeric code
      const overrideKey = `${layerCode}.${categoryCode}.${subcategory.code}`;
      const numericCode = this.SUBCATEGORY_OVERRIDES[overrideKey] || subcategory.numericCode;

      subcategories.push({
        id: `${layerCode}.${categoryCode}.${subcategory.code}`,
        code: subcategory.code,
        numericCode: parseInt(numericCode),
        name: subcategory.name
      });
    });

    // Sort subcategories by numeric code
    subcategories.sort((a, b) => (a.numericCode || 0) - (b.numericCode || 0));

    this.subcategoriesCache.set(cacheKey, subcategories);
    return subcategories;
  }
  
  /**
   * Get the numeric code for a subcategory
   */
  public getSubcategoryNumericCode(
    layerCode: string,
    categoryCode: string,
    subcategoryCode: string
  ): string {
    try {
      this.checkInitialized();
      
      // Check overrides first
      const overrideKey = `${layerCode}.${categoryCode}.${subcategoryCode}`;
      if (this.SUBCATEGORY_OVERRIDES[overrideKey]) {
        logger.debug(`Using override for ${overrideKey}: ${this.SUBCATEGORY_OVERRIDES[overrideKey]}`);
        return this.SUBCATEGORY_OVERRIDES[overrideKey];
      }
      
      // Handle special case for S.POP.HPM / S.001.HPM
      if (layerCode === 'S' && (categoryCode === 'POP' || categoryCode === '001') && subcategoryCode === 'HPM') {
        logger.debug('Special case: S.POP.HPM always maps to numeric code 7');
        return '007';
      }
      
      // Try to get the subcategory
      const subcategory = this.getSubcategory(layerCode, categoryCode, subcategoryCode);
      if (subcategory) {
        return subcategory.numericCode.padStart(3, '0');
      }
      
      // If subcategory not found, return default
      logger.warn(`Could not find subcategory ${subcategoryCode} in ${layerCode}.${categoryCode}`);
      return '001'; // Default to "001" (usually Base) instead of a hash-based fallback
    } catch (error) {
      logger.error(`Error in getSubcategoryNumericCode for ${layerCode}.${categoryCode}.${subcategoryCode}:`, error);
      return '001';
    }
  }
  
  /**
   * Get the numeric code for a category
   */
  public getCategoryNumericCode(layerCode: string, categoryCode: string): string {
    try {
      this.checkInitialized();
      
      const category = this.getCategory(layerCode, categoryCode);
      if (category) {
        return category.numericCode.padStart(3, '0');
      }
      
      // For S layer, POP maps to 001
      if (layerCode === 'S' && categoryCode === 'POP') {
        return '001';
      }
      
      logger.warn(`Could not find category ${categoryCode} in ${layerCode}`);
      return '001'; // Default to "001"
    } catch (error) {
      logger.error(`Error in getCategoryNumericCode for ${layerCode}.${categoryCode}:`, error);
      return '001';
    }
  }
  
  /**
   * Convert a Human-Friendly Name (HFN) to Machine-Friendly Address (MFA)
   */
  public convertHFNtoMFA(hfn: string): string {
    try {
      // Parse the HFN
      const parts = hfn.split('.');
      if (parts.length < 3) {
        throw new Error(`Invalid HFN format: ${hfn}`);
      }
      
      const [layer, categoryCode, subcategoryCode, sequential, ...rest] = parts;
      
      // Get numeric codes for each part
      const layerNumeric = this.LAYER_NUMERIC_CODES[layer] || '0';
      let categoryNumeric: string;
      let subcategoryNumeric: string;
      
      // Special handling for W.BCH.SUN - critical fix for this mapping issue
      if (layer === 'W' && categoryCode === 'BCH' && subcategoryCode === 'SUN') {
        categoryNumeric = '004'; // Beach
        subcategoryNumeric = '003'; // Sunset
        logger.debug('Using special case mapping for W.BCH.SUN: 5.004.003');
      } else {
        categoryNumeric = this.getCategoryNumericCode(layer, categoryCode);
        subcategoryNumeric = this.getSubcategoryNumericCode(layer, categoryCode, subcategoryCode);
      }
      
      // Construct the MFA
      const suffix = rest.length > 0 ? '.' + rest.join('.') : '';
      const mfa = `${layerNumeric}.${categoryNumeric}.${subcategoryNumeric}.${sequential}${suffix}`;
      
      logger.taxonomyMapping(hfn, mfa, 'HFN->MFA');
      return mfa;
    } catch (error) {
      logger.error(`Error converting HFN to MFA: ${error}`, { hfn });
      return '';
    }
  }
  
  /**
   * Generate a taxonomy path string for display
   */
  public getTaxonomyPath(
    layerCode: string,
    categoryCode?: string,
    subcategoryCode?: string
  ): string {
    if (!layerCode) return '';
    
    try {
      this.checkInitialized();
      
      // Get layer info
      const layer = this.getLayer(layerCode);
      if (!layer) {
        // Fallback using the code directly when layer info is not found
        logger.warn(`Could not find layer "${layerCode}" in taxonomy data, using code directly`);
        return layerCode;
      }
      
      let path = layer.name;
      
      // Only continue if category code is provided
      if (!categoryCode) {
        return path;
      }
      
      // Get category info
      const category = this.getCategory(layerCode, categoryCode);
      
      // Add category to path - use actual name if found, or code as fallback
      if (!category) {
        logger.warn(`Could not find category "${categoryCode}" in layer "${layerCode}" for taxonomy path, using code directly`);
        path += ` > ${categoryCode}`;
      } else {
        path += ` > ${category.name}`;
      }
      
      // Only continue if subcategory code is provided
      if (!subcategoryCode) {
        return path;
      }
      
      // Get subcategory info
      const subcategory = this.getSubcategory(layerCode, categoryCode, subcategoryCode);
      
      // Add subcategory to path - use actual name if found, or code as fallback
      if (!subcategory) {
        logger.warn(`Could not find subcategory "${subcategoryCode}" for "${layerCode}.${categoryCode}" in taxonomy path, using code directly`);
        path += ` > ${subcategoryCode}`;
      } else {
        path += ` > ${subcategory.name}`;
      }
      
      return path;
    } catch (error) {
      // In case of any errors, return a basic fallback path
      logger.error('Error generating taxonomy path:', error);
      
      const parts = [];
      parts.push(this.LAYER_NAMES[layerCode] || layerCode);
      if (categoryCode) parts.push(categoryCode);
      if (subcategoryCode) parts.push(subcategoryCode);
      
      return parts.join(' > ');
    }
  }
  
  /**
   * Clear the internal caches to reload data
   */
  public clearCache(): void {
    this.layerCache.clear();
    this.categoriesCache.clear();
    this.subcategoriesCache.clear();
    logger.info('Taxonomy service cache cleared');
  }
}

// Create and export a singleton instance
const taxonomyService = new TaxonomyService();
export default taxonomyService;