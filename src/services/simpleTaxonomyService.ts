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
import { LAYER_LOOKUPS, LAYER_SUBCATEGORIES } from '../taxonomyLookup/constants';
import { logger } from '../utils/logger';
import { TaxonomyItem } from '../types/taxonomy.types';

// Layer numeric codes mapping
const LAYER_NUMERIC_CODES: Record<string, string> = {
  'G': '1', 'S': '2', 'L': '3', 'M': '4', 'W': '5',
  'B': '6', 'P': '7', 'T': '8', 'C': '9', 'R': '10'
};

// Layer alpha codes mapping (reverse of numeric)
const LAYER_ALPHA_CODES: Record<string, string> = {
  '1': 'G', '2': 'S', '3': 'L', '4': 'M', '5': 'W',
  '6': 'B', '7': 'P', '8': 'T', '9': 'C', '10': 'R'
};

class SimpleTaxonomyService {
  /**
   * Retrieves all categories for a given layer
   * @param layer - The layer code (e.g., 'W', 'S')
   * @returns An array of taxonomy items representing categories
   */
  getCategories(layer: string): TaxonomyItem[] {
    if (!layer || !LAYER_LOOKUPS[layer] || !LAYER_SUBCATEGORIES[layer]) {
      logger.error(`Layer not found: ${layer}`);
      return [];
    }

    try {
      // Get all category codes (keys that don't contain a dot)
      const categories = Object.keys(LAYER_SUBCATEGORIES[layer]);
      
      return categories.map(categoryCode => {
        const categoryEntry = LAYER_LOOKUPS[layer][categoryCode];
        
        return {
          code: categoryCode,
          numericCode: categoryEntry.numericCode,
          name: categoryEntry.name
        };
      });
    } catch (error) {
      logger.error(`Error getting categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }
  
  /**
   * Retrieves all subcategories for a given layer and category
   * @param layer - The layer code (e.g., 'W', 'S')
   * @param categoryCode - The category code (e.g., 'BCH', 'POP')
   * @returns An array of taxonomy items representing subcategories
   */
  getSubcategories(layer: string, categoryCode: string): TaxonomyItem[] {
    // Input validation with detailed error messages
    if (!layer) {
      logger.error('Layer parameter is required but was not provided');
      return [];
    }
    
    if (!categoryCode) {
      logger.error(`Category code is required but was not provided for layer ${layer}`);
      return [];
    }
    
    if (!LAYER_LOOKUPS[layer]) {
      logger.error(`Layer lookups not found for layer: ${layer}`);
      return [];
    }
    
    if (!LAYER_SUBCATEGORIES[layer]) {
      logger.error(`Layer subcategories not found for layer: ${layer}`);
      return [];
    }
    
    if (!LAYER_SUBCATEGORIES[layer][categoryCode]) {
      logger.error(`Category not found in layer subcategories: ${layer}.${categoryCode}`);
      return [];
    }

    // Get subcategory codes for this category
    const subcategoryCodes = LAYER_SUBCATEGORIES[layer][categoryCode] || [];
    
    if (!subcategoryCodes.length) {
      logger.warn(`No subcategories found for ${layer}.${categoryCode}`);
      return [];
    }

    // Enhanced debugging for development environments only
    if (process.env.NODE_ENV !== 'production') {
      logger.debug(`Processing subcategories for ${layer}.${categoryCode} (${subcategoryCodes.length} found)`);
      
      // Check if first subcategory exists in lookup as a sanity check
      if (subcategoryCodes.length > 0) {
        const firstEntry = LAYER_LOOKUPS[layer][subcategoryCodes[0]];
        logger.debug(`First subcategory sample: ${subcategoryCodes[0]} -> ${firstEntry ? 'Found' : 'Not found'}`);
      }
    }

    try {
      // Create a results array with detailed error checking
      const results: TaxonomyItem[] = [];
      const errors: string[] = [];
      
      for (const fullCode of subcategoryCodes) {
        try {
          // Handle case where fullCode might not be properly formatted
          if (!fullCode) {
            errors.push(`Empty subcategory code found for ${layer}.${categoryCode}`);
            continue;
          }
          
          if (!fullCode.includes('.')) {
            errors.push(`Invalid subcategory code format (missing dot): ${fullCode}`);
            
            // Try to fix the format by prepending the category code
            const fixedCode = `${categoryCode}.${fullCode}`;
            const fixedEntry = LAYER_LOOKUPS[layer][fixedCode];
            
            if (fixedEntry) {
              logger.info(`Fixed subcategory code format: ${fullCode} -> ${fixedCode}`);
              results.push({
                code: fullCode, // Use the original as the code
                numericCode: fixedEntry.numericCode,
                name: fixedEntry.name
              });
            }
            
            continue;
          }
          
          const parts = fullCode.split('.');
          const subcategoryCode = parts[1]; // Get the part after the dot
          
          if (!subcategoryCode) {
            errors.push(`Could not extract subcategory code from: ${fullCode}`);
            continue;
          }
          
          const subcategoryEntry = LAYER_LOOKUPS[layer][fullCode];
          
          if (!subcategoryEntry) {
            errors.push(`Subcategory entry not found: ${layer}.${fullCode}`);
            
            // Try alternative formats and lookups
            const alternatives = [
              `${categoryCode}.${subcategoryCode}`,  // Standard format
              subcategoryCode,                       // Direct code
              fullCode.toUpperCase(),                // Uppercase
              fullCode.toLowerCase()                 // Lowercase
            ];
            
            let foundAlternative = false;
            
            for (const altKey of alternatives) {
              const altEntry = LAYER_LOOKUPS[layer][altKey];
              if (altEntry) {
                logger.info(`Found subcategory using alternative lookup: ${altKey}`);
                results.push({
                  code: subcategoryCode,
                  numericCode: altEntry.numericCode || String(results.length + 1).padStart(3, '0'),
                  name: altEntry.name || subcategoryCode.replace(/_/g, ' ')
                });
                foundAlternative = true;
                break;
              }
            }
            
            if (!foundAlternative) {
              // Create a synthetic entry as last resort
              logger.warn(`Creating synthetic entry for missing subcategory: ${fullCode}`);
              results.push({
                code: subcategoryCode,
                numericCode: String(results.length + 1).padStart(3, '0'),
                name: subcategoryCode.replace(/_/g, ' ')
              });
            }
            
            continue;
          }
          
          // Validate the entry has all required fields
          if (!subcategoryEntry.numericCode || !subcategoryEntry.name) {
            const missingFields = [];
            if (!subcategoryEntry.numericCode) missingFields.push('numericCode');
            if (!subcategoryEntry.name) missingFields.push('name');
            
            errors.push(`Subcategory entry missing required fields (${missingFields.join(', ')}): ${fullCode}`);
            
            // Create a complete entry with fallback values
            results.push({
              code: subcategoryCode,
              numericCode: subcategoryEntry.numericCode || String(results.length + 1).padStart(3, '0'),
              name: subcategoryEntry.name || subcategoryCode.replace(/_/g, ' ')
            });
            
            continue;
          }
          
          // Found a valid entry, add it to results
          results.push({
            code: subcategoryCode,
            numericCode: subcategoryEntry.numericCode,
            name: subcategoryEntry.name
          });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          errors.push(`Error processing subcategory ${fullCode}: ${errorMessage}`);
        }
      }
      
      // Log a summary of processing
      if (errors.length > 0) {
        logger.warn(`Encountered ${errors.length} errors processing subcategories for ${layer}.${categoryCode}`);
        
        // In development, log each error
        if (process.env.NODE_ENV !== 'production' && errors.length <= 5) {
          errors.forEach(err => logger.warn(`- ${err}`));
        }
      }
      
      // Log success information
      logger.info(`Successfully mapped ${results.length}/${subcategoryCodes.length} subcategories for ${layer}.${categoryCode}`);
      
      // Return the results, which might include fallback or synthetic entries
      return results;
    } catch (error) {
      // Handle unexpected errors
      logger.error(`Error getting subcategories: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }
  
  /**
   * Converts a Human-Friendly Name (HFN) to a Machine-Friendly Address (MFA)
   * @param hfn - The HFN to convert (e.g., 'W.BCH.SUN.001')
   * @returns The corresponding MFA (e.g., '5.004.003.001')
   */
  convertHFNtoMFA(hfn: string): string {
    if (!hfn) {
      return '';
    }
    
    try {
      // Split the HFN into parts
      const parts = hfn.split('.');
      if (parts.length < 3) {
        throw new Error(`Invalid HFN format: ${hfn}`);
      }
      
      const [layer, categoryCode, subcategoryCode, sequential, ...rest] = parts;
      
      // Get the layer number
      const layerNumeric = LAYER_NUMERIC_CODES[layer];
      if (!layerNumeric) {
        throw new Error(`Unknown layer: ${layer}`);
      }
      
      // Get the category number
      const categoryEntry = LAYER_LOOKUPS[layer][categoryCode];
      if (!categoryEntry) {
        throw new Error(`Category not found: ${layer}.${categoryCode}`);
      }
      
      // Get the subcategory number
      const subcategoryKey = `${categoryCode}.${subcategoryCode}`;
      const subcategoryEntry = LAYER_LOOKUPS[layer][subcategoryKey];
      if (!subcategoryEntry) {
        throw new Error(`Subcategory not found: ${subcategoryKey}`);
      }
      
      // Build MFA
      let mfa = `${layerNumeric}.${categoryEntry.numericCode}.${subcategoryEntry.numericCode}.${sequential}`;
      
      // Add any remaining parts (like file extensions)
      if (rest.length > 0) {
        mfa += '.' + rest.join('.');
      }
      
      logger.debug(`Converted HFN to MFA: ${hfn} → ${mfa}`);
      return mfa;
    } catch (error) {
      logger.error(`Error converting HFN to MFA: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error; // Re-throw for tests
    }
  }
  
  /**
   * Converts a Machine-Friendly Address (MFA) to a Human-Friendly Name (HFN)
   * @param mfa - The MFA to convert (e.g., '5.004.003.001')
   * @returns The corresponding HFN (e.g., 'W.BCH.SUN.001')
   */
  convertMFAtoHFN(mfa: string): string {
    if (!mfa) {
      return '';
    }
    
    try {
      // Split the MFA into parts
      const parts = mfa.split('.');
      if (parts.length < 4) {
        throw new Error(`Invalid MFA format: ${mfa}`);
      }
      
      const [layerNumeric, categoryNumeric, subcategoryNumeric, sequential, ...rest] = parts;
      
      // Get the layer code
      const layer = LAYER_ALPHA_CODES[layerNumeric];
      if (!layer) {
        throw new Error(`Unknown layer numeric code: ${layerNumeric}`);
      }
      
      // Find the category code
      let categoryCode = '';
      for (const [code, entry] of Object.entries(LAYER_LOOKUPS[layer])) {
        if (!code.includes('.') && entry.numericCode === categoryNumeric) {
          categoryCode = code;
          break;
        }
      }
      
      if (!categoryCode) {
        throw new Error(`Category not found for numeric code: ${categoryNumeric}`);
      }
      
      // Find the subcategory code
      let subcategoryCode = '';
      for (const [code, entry] of Object.entries(LAYER_LOOKUPS[layer])) {
        if (code.startsWith(`${categoryCode}.`) && entry.numericCode === subcategoryNumeric) {
          subcategoryCode = code.split('.')[1];
          break;
        }
      }
      
      if (!subcategoryCode) {
        throw new Error(`Subcategory not found for numeric code: ${subcategoryNumeric}`);
      }
      
      // Build HFN
      let hfn = `${layer}.${categoryCode}.${subcategoryCode}.${sequential}`;
      
      // Add any remaining parts (like file extensions)
      if (rest.length > 0) {
        hfn += '.' + rest.join('.');
      }
      
      logger.debug(`Converted MFA to HFN: ${mfa} → ${hfn}`);
      return hfn;
    } catch (error) {
      logger.error(`Error converting MFA to HFN: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      if (!LAYER_LOOKUPS[layer][categoryCode]) {
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
    if (!layer || !LAYER_LOOKUPS[layer] || !LAYER_SUBCATEGORIES[layer]) {
      return [];
    }
    
    const result = [];
    const categories = this.getCategories(layer);
    
    for (const category of categories) {
      const subcategories = this.getSubcategories(layer, category.code);
      
      for (const subcategory of subcategories) {
        const hfn = `${layer}.${category.code}.${subcategory.code}.001`;
        
        try {
          const mfa = this.convertHFNtoMFA(hfn);
          
          result.push({
            hfn,
            mfa,
            category: category.name,
            subcategory: subcategory.name
          });
        } catch (error) {
          logger.warn(`Error converting HFN to MFA for ${hfn}: ${error}`);
        }
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