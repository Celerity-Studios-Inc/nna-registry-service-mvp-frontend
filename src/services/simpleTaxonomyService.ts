/**
 * SimpleTaxonomyService
 *
 * A simplified taxonomy service that uses flattened lookup tables
 * for efficient HFN to MFA conversion and taxonomy navigation.
 */
import {
  W_LAYER_LOOKUP,
  W_SUBCATEGORIES,
  G_LAYER_LOOKUP,
  G_SUBCATEGORIES,
  S_LAYER_LOOKUP,
  S_SUBCATEGORIES,
  L_LAYER_LOOKUP,
  L_SUBCATEGORIES,
  M_LAYER_LOOKUP,
  M_SUBCATEGORIES,
  B_LAYER_LOOKUP,
  B_SUBCATEGORIES,
  P_LAYER_LOOKUP,
  P_SUBCATEGORIES,
  T_LAYER_LOOKUP,
  T_SUBCATEGORIES,
  C_LAYER_LOOKUP,
  C_SUBCATEGORIES,
  R_LAYER_LOOKUP,
  R_SUBCATEGORIES
} from '../taxonomyLookup';
import { logger } from '../utils/logger';
import { TaxonomyItem } from '../types/taxonomy.types';

// Layer numeric codes mapping
const LAYER_NUMERIC_CODES: Record<string, string> = {
  'G': '1', 'S': '2', 'L': '3', 'M': '4', 'W': '5',
  'B': '6', 'P': '7', 'T': '8', 'C': '9', 'R': '10'
};

// Import constants from the constants file for proper encapsulation
import { LAYER_LOOKUPS, LAYER_SUBCATEGORIES } from '../taxonomyLookup/constants';

class SimpleTaxonomyService {
  /**
   * Get all categories for a layer
   */
  getCategories(layer: string): TaxonomyItem[] {
    console.log(`Getting categories for layer: ${layer}`);

    const lookup = LAYER_LOOKUPS[layer];
    const subcategories = LAYER_SUBCATEGORIES[layer];

    if (!lookup) {
      console.error(`Layer lookup not found for layer: ${layer}`);
      logger.error(`Layer lookup not found: ${layer}`);
      return [];
    }

    if (!subcategories) {
      console.error(`Layer subcategories not found for layer: ${layer}`);
      logger.error(`Layer subcategories not found: ${layer}`);
      return [];
    }

    console.log(`Total lookup entries for ${layer}:`, Object.keys(lookup).length);
    console.log(`Categories in subcategories for ${layer}:`, Object.keys(subcategories));

    try {
      const results = Object.keys(subcategories).map(categoryCode => {
        const lookupEntry = lookup[categoryCode];
        if (!lookupEntry) {
          console.warn(`Missing lookup entry for category ${categoryCode} in layer ${layer}`);
          return null;
        }

        return {
          code: categoryCode,
          numericCode: lookupEntry.numericCode,
          name: lookupEntry.name
        };
      }).filter(item => item !== null) as TaxonomyItem[];

      console.log(`Returning ${results.length} categories for ${layer}`);
      return results;
    } catch (error) {
      console.error(`Error mapping categories for ${layer}:`, error);
      logger.error(`Error mapping categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }
  
  /**
   * Get all subcategories for a category
   */
  getSubcategories(layer: string, categoryCode: string): TaxonomyItem[] {
    console.log(`Getting subcategories for ${layer}.${categoryCode}`);

    const lookup = LAYER_LOOKUPS[layer];
    const subcategories = LAYER_SUBCATEGORIES[layer];

    if (!lookup) {
      console.error(`Layer lookup not found for layer: ${layer}`);
      logger.error(`Layer lookup not found: ${layer}`);
      return [];
    }

    if (!subcategories) {
      console.error(`Layer subcategories not found for layer: ${layer}`);
      logger.error(`Layer subcategories not found: ${layer}`);
      return [];
    }

    if (!subcategories[categoryCode]) {
      console.error(`Category ${categoryCode} not found in layer ${layer} subcategories`);
      logger.error(`Category not found: ${layer}.${categoryCode}`);
      return [];
    }

    console.log(`Found ${subcategories[categoryCode].length} subcategory codes for ${layer}.${categoryCode}:`,
      subcategories[categoryCode]);

    try {
      const results = subcategories[categoryCode].map(fullCode => {
        if (!lookup[fullCode]) {
          console.warn(`Missing lookup entry for subcategory ${fullCode} in layer ${layer}`);
          return null;
        }

        const subcategoryCode = fullCode.split('.')[1]; // Get part after the dot
        return {
          code: subcategoryCode,
          numericCode: lookup[fullCode].numericCode,
          name: lookup[fullCode].name
        };
      }).filter(item => item !== null) as TaxonomyItem[];

      console.log(`Returning ${results.length} subcategories for ${layer}.${categoryCode}`);
      return results;
    } catch (error) {
      console.error(`Error mapping subcategories for ${layer}.${categoryCode}:`, error);
      logger.error(`Error mapping subcategories: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
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
      logger.error(`Error converting HFN to MFA: ${error instanceof Error ? error.message : 'Unknown error'}`);
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