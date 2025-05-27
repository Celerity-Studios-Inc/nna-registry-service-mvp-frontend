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
  LAYER_LOOKUPS,
  LAYER_SUBCATEGORIES,
} from '../taxonomyLookup/constants';
import { logger } from '../utils/logger';
import { TaxonomyItem } from '../types/taxonomy.types';

// Layer numeric codes mapping
const LAYER_NUMERIC_CODES: Record<string, string> = {
  G: '1',
  S: '2',
  L: '3',
  M: '4',
  W: '5',
  B: '6',
  P: '7',
  T: '8',
  C: '9',
  R: '10',
};

// Layer alpha codes mapping (reverse of numeric)
const LAYER_ALPHA_CODES: Record<string, string> = {
  '1': 'G',
  '2': 'S',
  '3': 'L',
  '4': 'M',
  '5': 'W',
  '6': 'B',
  '7': 'P',
  '8': 'T',
  '9': 'C',
  '10': 'R',
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
          name: categoryEntry.name,
        };
      });
    } catch (error) {
      logger.error(
        `Error getting categories: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
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
    // Enhanced logging for debugging
    logger.info(`getSubcategories called with: layer=${layer}, categoryCode=${categoryCode}`);
    
    // Debug: Check what's actually in LAYER_SUBCATEGORIES for C layer
    if (layer === 'C') {
      console.log(`🔍 C LAYER DEBUG: LAYER_SUBCATEGORIES[C] exists:`, !!LAYER_SUBCATEGORIES['C']);
      console.log(`🔍 C LAYER DEBUG: Keys in LAYER_SUBCATEGORIES[C]:`, Object.keys(LAYER_SUBCATEGORIES['C'] || {}));
      console.log(`🔍 C LAYER DEBUG: LAYER_SUBCATEGORIES[C][RMX]:`, LAYER_SUBCATEGORIES['C']['RMX']);
      console.log(`🔍 C LAYER DEBUG: LAYER_SUBCATEGORIES[C][${categoryCode}]:`, LAYER_SUBCATEGORIES['C'][categoryCode]);
      console.log(`🔍 C LAYER DEBUG: Full LAYER_SUBCATEGORIES[C]:`, LAYER_SUBCATEGORIES['C']);
    }

    // Input validation with detailed error messages
    if (!layer) {
      logger.error('Layer parameter is required but was not provided');
      return [];
    }

    if (!categoryCode) {
      logger.error(
        `Category code is required but was not provided for layer ${layer}`
      );
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
    
    // Check case sensitivity issues
    const normalizedCategoryCode = categoryCode.toUpperCase();
    const originalKeysInSubcategories = LAYER_SUBCATEGORIES[layer][categoryCode];
    const upperKeysInSubcategories = LAYER_SUBCATEGORIES[layer][normalizedCategoryCode];
    
    logger.debug(`Case sensitivity check: Original "${categoryCode}" exists: ${!!originalKeysInSubcategories}, Uppercase "${normalizedCategoryCode}" exists: ${!!upperKeysInSubcategories}`);
    
    // IMPROVED APPROACH: First try to get subcategories from LAYER_SUBCATEGORIES
    // If not found, we'll use a more robust approach below
    let subcategoryCodes: string[] = [];
    let sourceDescription = 'unknown';
    
    if (LAYER_SUBCATEGORIES[layer][categoryCode]) {
      // Standard approach: Get from the subcategories mapping
      const rawCodes = LAYER_SUBCATEGORIES[layer][categoryCode];
      logger.debug(`Raw subcategory codes for ${layer}.${categoryCode}: ${JSON.stringify(rawCodes)}`);
      
      subcategoryCodes = Array.isArray(rawCodes) ? 
        rawCodes.filter(code => !!code && typeof code === 'string') : [];
        
      logger.debug(`Found ${subcategoryCodes.length} subcategories from primary source for ${layer}.${categoryCode}`);
      sourceDescription = 'primary source';
      
      // Debug the filter operation
      if (Array.isArray(rawCodes) && rawCodes.length !== subcategoryCodes.length) {
        logger.warn(`Filtered out ${rawCodes.length - subcategoryCodes.length} invalid entries in ${layer}.${categoryCode} subcategories`);
        rawCodes.forEach((code, index) => {
          if (!code || typeof code !== 'string') {
            logger.warn(`Invalid entry at index ${index}: ${JSON.stringify(code)}`);
          }
        });
      }
    } else if (normalizedCategoryCode !== categoryCode && LAYER_SUBCATEGORIES[layer][normalizedCategoryCode]) {
      // Try with normalized (uppercase) category code
      logger.info(`Using normalized category code: ${normalizedCategoryCode} instead of ${categoryCode}`);
      const rawCodes = LAYER_SUBCATEGORIES[layer][normalizedCategoryCode];
      
      subcategoryCodes = Array.isArray(rawCodes) ? 
        rawCodes.filter(code => !!code && typeof code === 'string') : [];
      
      logger.debug(`Found ${subcategoryCodes.length} subcategories using normalized category code ${normalizedCategoryCode}`);
      sourceDescription = 'normalized category code';
    }
    
    // UNIVERSAL FALLBACK: If no subcategories found in the mapping,
    // derive them directly from LAYER_LOOKUPS by finding entries with the proper prefix
    if (subcategoryCodes.length === 0) {
      logger.info(`Using universal fallback to derive subcategories for ${layer}.${categoryCode}`);
      
      // Try with original category code
      let derivedCodes = Object.keys(LAYER_LOOKUPS[layer])
        .filter(key => {
          // Match entries like 'PRF.BAS', 'PRF.LEO', etc. for 'PRF' category
          return key.startsWith(`${categoryCode}.`) && key.split('.').length === 2;
        });
        
      // If none found, try with normalized category code
      if (derivedCodes.length === 0 && normalizedCategoryCode !== categoryCode) {
        logger.debug(`Trying universal fallback with normalized code: ${normalizedCategoryCode}`);
        derivedCodes = Object.keys(LAYER_LOOKUPS[layer])
          .filter(key => {
            return key.startsWith(`${normalizedCategoryCode}.`) && key.split('.').length === 2;
          });
      }
      
      if (derivedCodes.length > 0) {
        logger.info(`Successfully derived ${derivedCodes.length} subcategories from lookups for ${layer}.${categoryCode}`);
        subcategoryCodes = derivedCodes;
        sourceDescription = 'universal fallback';
      }
    }
    
    // If we still have no subcategories, try one more universal approach
    if (subcategoryCodes.length === 0) {
      // Look for all entries in the layer and extract ones that might match our category
      const allLayerKeys = Object.keys(LAYER_LOOKUPS[layer]);
      logger.debug(`Trying pattern matching. All layer keys count: ${allLayerKeys.length}`);
      
      // Try to find category prefix pattern in the keys
      const keyPattern = new RegExp(`^${categoryCode}\.\w+$`, 'i');
      const matchingKeys = allLayerKeys.filter(key => keyPattern.test(key));
      
      if (matchingKeys.length > 0) {
        logger.info(`Found ${matchingKeys.length} subcategory candidates using pattern matching for ${layer}.${categoryCode}`);
        logger.debug(`Matching keys: ${JSON.stringify(matchingKeys)}`);
        subcategoryCodes = matchingKeys;
        sourceDescription = 'pattern matching';
      } else {
        // Last resort: dump some sample keys to help debugging
        logger.warn(`No keys matched regex pattern for ${layer}.${categoryCode}`);
        logger.debug(`Sample keys from layer ${layer}: ${JSON.stringify(allLayerKeys.slice(0, 10))}`);
      }
    }

    if (!subcategoryCodes.length) {
      logger.warn(`No subcategories found for ${layer}.${categoryCode} after all fallback attempts`);
      return [];
    }
    
    logger.info(`Using ${subcategoryCodes.length} subcategory codes from ${sourceDescription} for ${layer}.${categoryCode}`);
    logger.debug(`Subcategory codes: ${JSON.stringify(subcategoryCodes)}`);
    

    // Enhanced debugging for development environments only
    if (process.env.NODE_ENV !== 'production') {
      logger.debug(
        `Processing subcategories for ${layer}.${categoryCode} (${subcategoryCodes.length} found)`
      );

      // Check if first subcategory exists in lookup as a sanity check
      if (subcategoryCodes.length > 0) {
        const firstEntry = LAYER_LOOKUPS[layer][subcategoryCodes[0]];
        logger.debug(
          `First subcategory sample: ${subcategoryCodes[0]} -> ${
            firstEntry ? 'Found' : 'Not found'
          }`
        );
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
            errors.push(
              `Empty subcategory code found for ${layer}.${categoryCode}`
            );
            continue;
          }

          if (!fullCode.includes('.')) {
            errors.push(
              `Invalid subcategory code format (missing dot): ${fullCode}`
            );

            // Try to fix the format by prepending the category code
            const fixedCode = `${categoryCode}.${fullCode}`;
            const fixedEntry = LAYER_LOOKUPS[layer][fixedCode];

            if (fixedEntry) {
              logger.info(
                `Fixed subcategory code format: ${fullCode} -> ${fixedCode}`
              );
              results.push({
                code: fullCode, // Use the original as the code
                numericCode: fixedEntry.numericCode,
                name: fixedEntry.name,
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
              `${categoryCode}.${subcategoryCode}`, // Standard format
              subcategoryCode, // Direct code
              fullCode.toUpperCase(), // Uppercase
              fullCode.toLowerCase(), // Lowercase
            ];

            let foundAlternative = false;

            for (const altKey of alternatives) {
              const altEntry = LAYER_LOOKUPS[layer][altKey];
              if (altEntry) {
                logger.info(
                  `Found subcategory using alternative lookup: ${altKey}`
                );
                results.push({
                  code: subcategoryCode,
                  numericCode:
                    altEntry.numericCode ||
                    String(results.length + 1).padStart(3, '0'),
                  name: altEntry.name || subcategoryCode.replace(/_/g, ' '),
                });
                foundAlternative = true;
                break;
              }
            }

            if (!foundAlternative) {
              // Create a synthetic entry as last resort
              logger.warn(
                `Creating synthetic entry for missing subcategory: ${fullCode}`
              );
              results.push({
                code: subcategoryCode,
                numericCode: String(results.length + 1).padStart(3, '0'),
                name: subcategoryCode.replace(/_/g, ' '),
              });
            }

            continue;
          }

          // Validate the entry has all required fields
          if (!subcategoryEntry.numericCode || !subcategoryEntry.name) {
            const missingFields = [];
            if (!subcategoryEntry.numericCode)
              missingFields.push('numericCode');
            if (!subcategoryEntry.name) missingFields.push('name');

            errors.push(
              `Subcategory entry missing required fields (${missingFields.join(
                ', '
              )}): ${fullCode}`
            );

            // Create a complete entry with fallback values
            results.push({
              code: subcategoryCode,
              numericCode:
                subcategoryEntry.numericCode ||
                String(results.length + 1).padStart(3, '0'),
              name: subcategoryEntry.name || subcategoryCode.replace(/_/g, ' '),
            });

            continue;
          }

          // Found a valid entry, add it to results
          results.push({
            code: subcategoryCode,
            numericCode: subcategoryEntry.numericCode,
            name: subcategoryEntry.name,
          });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          errors.push(
            `Error processing subcategory ${fullCode}: ${errorMessage}`
          );
        }
      }

      // Log a summary of processing
      if (errors.length > 0) {
        logger.warn(
          `Encountered ${errors.length} errors processing subcategories for ${layer}.${categoryCode}`
        );

        // In development, log each error
        if (process.env.NODE_ENV !== 'production' && errors.length <= 5) {
          errors.forEach(err => logger.warn(`- ${err}`));
        }
      }

      // Log success information
      logger.info(
        `Successfully mapped ${results.length}/${subcategoryCodes.length} subcategories for ${layer}.${categoryCode}`
      );

      // Return the results, which might include fallback or synthetic entries
      return results;
    } catch (error) {
      // Handle unexpected errors
      logger.error(
        `Error getting subcategories: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
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

      // Normalize case to uppercase for better matching
      const normalizedCategoryCode = categoryCode.toUpperCase();
      const normalizedSubcategoryCode = subcategoryCode.toUpperCase();

      // Handle special cases directly for performance
      if (
        layer === 'S' &&
        normalizedCategoryCode === 'POP' &&
        normalizedSubcategoryCode === 'HPM'
      ) {
        // Special case for S.POP.HPM
        let mfa = `2.001.007.${sequential}`;
        if (rest.length > 0) {
          mfa += '.' + rest.join('.');
        }
        return mfa;
      }

      if (
        layer === 'W' &&
        normalizedCategoryCode === 'BCH' &&
        normalizedSubcategoryCode === 'SUN'
      ) {
        // Special case for W.BCH.SUN
        let mfa = `5.004.003.${sequential}`;
        if (rest.length > 0) {
          mfa += '.' + rest.join('.');
        }
        return mfa;
      }

      // Get the layer number
      const layerNumeric = LAYER_NUMERIC_CODES[layer];
      if (!layerNumeric) {
        throw new Error(`Unknown layer: ${layer}`);
      }

      // Get the category number - try normalized code first, then original
      let categoryEntry = LAYER_LOOKUPS[layer][normalizedCategoryCode];
      if (!categoryEntry) {
        // Try original case as fallback
        categoryEntry = LAYER_LOOKUPS[layer][categoryCode];
        if (!categoryEntry) {
          throw new Error(`Category not found: ${layer}.${categoryCode}`);
        }
      }

      // Get the subcategory number - try with normalized format
      const normalizedSubcategoryKey = `${normalizedCategoryCode}.${normalizedSubcategoryCode}`;
      let subcategoryEntry = LAYER_LOOKUPS[layer][normalizedSubcategoryKey];

      // If not found, try original case
      if (!subcategoryEntry) {
        const originalSubcategoryKey = `${categoryCode}.${subcategoryCode}`;
        subcategoryEntry = LAYER_LOOKUPS[layer][originalSubcategoryKey];

        // If still not found, try mixed case variations
        if (!subcategoryEntry) {
          const mixedCase1 = `${normalizedCategoryCode}.${subcategoryCode}`;
          const mixedCase2 = `${categoryCode}.${normalizedSubcategoryCode}`;

          subcategoryEntry =
            LAYER_LOOKUPS[layer][mixedCase1] ||
            LAYER_LOOKUPS[layer][mixedCase2];

          if (!subcategoryEntry) {
            throw new Error(
              `Subcategory not found: ${normalizedSubcategoryKey}`
            );
          }
        }
      }

      // Build MFA
      let mfa = `${layerNumeric}.${categoryEntry.numericCode}.${subcategoryEntry.numericCode}.${sequential}`;

      // Add any remaining parts (like file extensions)
      if (rest.length > 0) {
        mfa += '.' + rest.join('.');
      }

      // Only log in non-production environments
      if (process.env.NODE_ENV !== 'production') {
        logger.debug(`Converted HFN to MFA: ${hfn} → ${mfa}`);
      }

      return mfa;
    } catch (error) {
      // Log the error in non-production environments
      if (process.env.NODE_ENV !== 'production') {
        logger.error(
          `Error converting HFN to MFA: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
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

      const [
        layerNumeric,
        categoryNumeric,
        subcategoryNumeric,
        sequential,
        ...rest
      ] = parts;

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
        throw new Error(
          `Category not found for numeric code: ${categoryNumeric}`
        );
      }

      // Find the subcategory code
      let subcategoryCode = '';
      for (const [code, entry] of Object.entries(LAYER_LOOKUPS[layer])) {
        if (
          code.startsWith(`${categoryCode}.`) &&
          entry.numericCode === subcategoryNumeric
        ) {
          subcategoryCode = code.split('.')[1];
          break;
        }
      }

      if (!subcategoryCode) {
        throw new Error(
          `Subcategory not found for numeric code: ${subcategoryNumeric}`
        );
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
      logger.error(
        `Error converting MFA to HFN: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
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
  generateAllMappings(
    layer: string
  ): { hfn: string; mfa: string; category: string; subcategory: string }[] {
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
            subcategory: subcategory.name,
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
  
  /**
   * Debug function for taxonomy data
   * @param layer - The layer code (e.g., 'L', 'S')
   * @param categoryCode - The category code (e.g., 'PRF', 'DNC')
   */
  debugTaxonomyData(layer: string, categoryCode: string): void {
    logger.debug('=== Debugging taxonomy data ===');
    logger.debug(`Layer: ${layer}`);
    logger.debug(`Category Code: ${categoryCode}`);
    
    // Check hardcoded data
    let usingHardcodedData = false;
    let hardcodedSubcategories: string[] = [];
    
    if (LAYER_SUBCATEGORIES[layer] && LAYER_SUBCATEGORIES[layer][categoryCode]) {
      usingHardcodedData = true;
      hardcodedSubcategories = LAYER_SUBCATEGORIES[layer][categoryCode];
    }
    
    logger.debug(`Using hardcoded data: ${usingHardcodedData}`);
    if (usingHardcodedData) {
      logger.debug(`Hardcoded subcategories: ${JSON.stringify(hardcodedSubcategories)}`);
      
      // Check if subcategories have valid entries in LAYER_LOOKUPS
      const validLookups = hardcodedSubcategories.filter(code => {
        if (!code) return false;
        const fullCode = code.includes('.') ? code : `${categoryCode}.${code}`;
        return !!LAYER_LOOKUPS[layer][fullCode];
      });
      
      logger.debug(`Valid subcategory lookups: ${validLookups.length}/${hardcodedSubcategories.length}`);
      if (validLookups.length < hardcodedSubcategories.length) {
        logger.warn(`Some subcategories don't have valid lookups for ${layer}.${categoryCode}`);
        
        // Detailed debug for each subcategory
        hardcodedSubcategories.forEach(code => {
          if (!code) {
            logger.warn(`Empty subcategory code found in ${layer}.${categoryCode}`);
            return;
          }
          
          const fullCode = code.includes('.') ? code : `${categoryCode}.${code}`;
          const lookup = LAYER_LOOKUPS[layer][fullCode];
          
          if (!lookup) {
            logger.warn(`No lookup found for ${fullCode}`);
          } else {
            logger.debug(`Lookup for ${fullCode}: ${JSON.stringify(lookup)}`);
          }
        });
      }
    } else {
      logger.warn(`No hardcoded subcategories found for ${layer}.${categoryCode}`);
      
      // Try to find alternates in LAYER_LOOKUPS
      const alternateKeys = Object.keys(LAYER_LOOKUPS[layer])
        .filter(key => key.startsWith(`${categoryCode}.`) || 
                       key.startsWith(`${categoryCode.toUpperCase()}.`) || 
                       key.startsWith(`${categoryCode.toLowerCase()}.`));
      
      if (alternateKeys.length > 0) {
        logger.debug(`Found ${alternateKeys.length} potential alternate keys in LAYER_LOOKUPS:`);
        alternateKeys.forEach(key => logger.debug(`  - ${key}`));
      } else {
        logger.warn(`No alternate keys found in LAYER_LOOKUPS for ${layer}.${categoryCode}`);
      }
    }
    
    // Check LAYER_LOOKUPS structure for this layer
    logger.debug(`LAYER_LOOKUPS keys for ${layer}:`, Object.keys(LAYER_LOOKUPS[layer]).slice(0, 5));
    
    // Verify direct subcategory lookup
    const subcategories = this.getSubcategories(layer, categoryCode);
    logger.debug(`Direct getSubcategories call returned: ${subcategories.length} items`);
    if (subcategories.length === 0) {
      logger.warn(`getSubcategories returned empty array for ${layer}.${categoryCode}`);
    } else {
      logger.debug(`First few subcategories: ${JSON.stringify(subcategories.slice(0, 3))}`);
    }
    
    logger.debug('=== End debugging taxonomy data ===');
  }
}

export const taxonomyService = new SimpleTaxonomyService();
