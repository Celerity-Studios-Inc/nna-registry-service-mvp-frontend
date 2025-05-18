/**
 * SimpleTaxonomyService
 * 
 * A simplified taxonomy service that uses flattened lookup tables
 * for efficient HFN to MFA conversion and taxonomy navigation.
 */
import { W_LAYER_LOOKUP, W_SUBCATEGORIES } from '../taxonomyLookup/W_layer';
import { S_LAYER_LOOKUP, S_SUBCATEGORIES } from '../taxonomyLookup/S_layer';
import { logger } from '../utils/logger';
import { TaxonomyItem } from '../types/taxonomy.types';

// Layer numeric codes mapping
const LAYER_NUMERIC_CODES: Record<string, string> = {
  'G': '1', 'S': '2', 'L': '3', 'M': '4', 'W': '5',
  'B': '6', 'P': '7', 'T': '8', 'C': '9', 'R': '10'
};

// Layer lookups mapping - add other layers as they become available
const LAYER_LOOKUPS: Record<string, Record<string, { numericCode: string, name: string }>> = {
  'W': W_LAYER_LOOKUP,
  'S': S_LAYER_LOOKUP,
  // 'G': G_LAYER_LOOKUP,
  // etc.
};

// Layer subcategories mapping - add other layers as they become available
const LAYER_SUBCATEGORIES: Record<string, Record<string, string[]>> = {
  'W': W_SUBCATEGORIES,
  'S': S_SUBCATEGORIES,
  // 'G': G_SUBCATEGORIES,
  // etc.
};

class SimpleTaxonomyService {
  /**
   * Get all categories for a layer
   */
  getCategories(layer: string): TaxonomyItem[] {
    const lookup = LAYER_LOOKUPS[layer];
    const subcategories = LAYER_SUBCATEGORIES[layer];
    
    if (!lookup || !subcategories) {
      logger.error(`Layer not found: ${layer}`);
      return [];
    }
    
    return Object.keys(subcategories).map(categoryCode => ({
      code: categoryCode,
      numericCode: lookup[categoryCode].numericCode,
      name: lookup[categoryCode].name
    }));
  }
  
  /**
   * Get all subcategories for a category
   */
  getSubcategories(layer: string, categoryCode: string): TaxonomyItem[] {
    const lookup = LAYER_LOOKUPS[layer];
    const subcategories = LAYER_SUBCATEGORIES[layer];
    
    if (!lookup || !subcategories || !subcategories[categoryCode]) {
      logger.error(`Category not found: ${layer}.${categoryCode}`);
      return [];
    }
    
    return subcategories[categoryCode].map(fullCode => {
      const subcategoryCode = fullCode.split('.')[1]; // Get part after the dot
      return {
        code: subcategoryCode,
        numericCode: lookup[fullCode].numericCode,
        name: lookup[fullCode].name
      };
    });
  }
  
  /**
   * Convert HFN to MFA
   */
  convertHFNtoMFA(hfn: string): string {
    try {
      const parts = hfn.split('.');
      if (parts.length < 3) {
        throw new Error(`Invalid HFN format: ${hfn}`);
      }
      
      const [layer, categoryCode, subcategoryCode, sequential, ...rest] = parts;
      
      // Get layer numeric code
      const layerNumeric = LAYER_NUMERIC_CODES[layer];
      if (!layerNumeric) {
        throw new Error(`Unknown layer: ${layer}`);
      }
      
      // Get lookup table for this layer
      const lookup = LAYER_LOOKUPS[layer];
      if (!lookup) {
        throw new Error(`Layer lookup not found: ${layer}`);
      }
      
      // Get category numeric code
      const categoryInfo = lookup[categoryCode];
      if (!categoryInfo) {
        throw new Error(`Category not found: ${layer}.${categoryCode}`);
      }
      
      // Get subcategory numeric code
      const fullSubcategoryCode = `${categoryCode}.${subcategoryCode}`;
      const subcategoryInfo = lookup[fullSubcategoryCode];
      if (!subcategoryInfo) {
        throw new Error(`Subcategory not found: ${fullSubcategoryCode}`);
      }
      
      // Build MFA
      const suffix = rest.length > 0 ? '.' + rest.join('.') : '';
      const mfa = `${layerNumeric}.${categoryInfo.numericCode}.${subcategoryInfo.numericCode}.${sequential}${suffix}`;
      
      logger.debug(`Converted HFN to MFA: ${hfn} -> ${mfa}`);
      return mfa;
    } catch (error) {
      logger.error(`Error converting HFN to MFA:`, error);
      return '';
    }
  }
  
  /**
   * Validate if an HFN is valid
   */
  validateHFN(hfn: string): boolean {
    try {
      const parts = hfn.split('.');
      if (parts.length < 3) {
        return false;
      }
      
      const [layer, categoryCode, subcategoryCode] = parts;
      
      // Check if layer exists
      if (!LAYER_LOOKUPS[layer]) {
        return false;
      }
      
      // Check if category exists
      if (!LAYER_SUBCATEGORIES[layer][categoryCode]) {
        return false;
      }
      
      // Check if subcategory exists
      const fullSubcategoryCode = `${categoryCode}.${subcategoryCode}`;
      if (!LAYER_LOOKUPS[layer][fullSubcategoryCode]) {
        return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Generate all possible HFN/MFA pairs for a layer
   */
  generateAllMappings(layer: string): { hfn: string, mfa: string, category: string, subcategory: string }[] {
    const result = [];
    const categories = this.getCategories(layer);
    
    for (const category of categories) {
      const subcategories = this.getSubcategories(layer, category.code);
      
      for (const subcategory of subcategories) {
        const hfn = `${layer}.${category.code}.${subcategory.code}.001`;
        const mfa = this.convertHFNtoMFA(hfn);
        
        result.push({
          hfn,
          mfa,
          category: category.name,
          subcategory: subcategory.name
        });
      }
    }
    
    return result;
  }
  
  /**
   * Get the layer numeric code
   */
  getLayerNumericCode(layer: string): string {
    return LAYER_NUMERIC_CODES[layer] || '0';
  }
}

export const taxonomyService = new SimpleTaxonomyService();