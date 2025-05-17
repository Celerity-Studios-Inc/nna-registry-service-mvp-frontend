/**
 * SimpleTaxonomyService
 * 
 * A service that provides access to taxonomy data using flattened lookup tables.
 * This approach offers several advantages:
 * - More efficient lookups (O(1) complexity)
 * - Easier debugging and maintenance
 * - Explicit handling of special cases
 * - Reduced memory usage
 * 
 * @module SimpleTaxonomyService
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

// Layer lookups mapping
const LAYER_LOOKUPS: Record<string, Record<string, { numericCode: string, name: string }>> = {
  'W': W_LAYER_LOOKUP,
  'S': S_LAYER_LOOKUP,
  'G': G_LAYER_LOOKUP,
  'L': L_LAYER_LOOKUP,
  'M': M_LAYER_LOOKUP,
  'B': B_LAYER_LOOKUP,
  'P': P_LAYER_LOOKUP,
  'T': T_LAYER_LOOKUP,
  'C': C_LAYER_LOOKUP,
  'R': R_LAYER_LOOKUP
};

// Layer subcategories mapping
const LAYER_SUBCATEGORIES: Record<string, Record<string, string[]>> = {
  'W': W_SUBCATEGORIES,
  'S': S_SUBCATEGORIES,
  'G': G_SUBCATEGORIES,
  'L': L_SUBCATEGORIES,
  'M': M_SUBCATEGORIES,
  'B': B_SUBCATEGORIES,
  'P': P_SUBCATEGORIES,
  'T': T_SUBCATEGORIES,
  'C': C_SUBCATEGORIES,
  'R': R_SUBCATEGORIES
};

class SimpleTaxonomyService {
  /**
   * Retrieves all categories for a given layer
   * @param layer - The layer code (e.g., 'W', 'S')
   * @returns An array of taxonomy items representing categories
   * @throws Error if the layer is not found
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
   * Retrieves all subcategories for a given layer and category
   * @param layer - The layer code (e.g., 'W', 'S')
   * @param categoryCode - The category code (e.g., 'BCH', 'POP')
   * @returns An array of taxonomy items representing subcategories
   * @throws Error if the layer or category is not found
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
   * Converts a Human-Friendly Name (HFN) to a Machine-Friendly Address (MFA)
   * @param hfn - The HFN to convert (e.g., 'W.BCH.SUN.001')
   * @returns The corresponding MFA (e.g., '5.004.003.001')
   * @throws Error if the HFN is invalid or any component is not found
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
   * Validates if a Human-Friendly Name (HFN) is valid
   * @param hfn - The HFN to validate (e.g., 'W.BCH.SUN.001')
   * @returns True if the HFN is valid, false otherwise
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
   * Generates all possible HFN/MFA pairs for a given layer
   * @param layer - The layer code (e.g., 'W', 'S')
   * @returns An array of objects containing HFN, MFA, category, and subcategory
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
   * Gets the numeric code for a layer
   * @param layer - The layer code (e.g., 'W', 'S')
   * @returns The numeric code for the layer (e.g., '5', '2')
   */
  getLayerNumericCode(layer: string): string {
    return LAYER_NUMERIC_CODES[layer] || '0';
  }
}

export const taxonomyService = new SimpleTaxonomyService();