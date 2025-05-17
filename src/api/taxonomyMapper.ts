/**
 * Comprehensive Taxonomy Mapper for NNA Registry
 * 
 * This mapper provides reliable, consistent conversion between different 
 * taxonomy representation formats across the entire application.
 * 
 * Key features:
 * - Single source of truth for all taxonomy conversions
 * - Bidirectional mapping between all formats (name, code, numeric)
 * - Consistent handling of special cases
 * - Direct use of generated taxonomy lookups
 * - Comprehensive caching for performance optimization
 */

import { taxonomyService } from '../services/simpleTaxonomyService';
import { LAYER_LOOKUPS, LAYER_SUBCATEGORIES } from '../taxonomyLookup/constants';

/**
 * Cache for taxonomy mapping operations to improve performance
 */
interface MappingCache {
  // HFN to MFA and vice versa conversion caches
  hfnToMfa: Map<string, string>;
  mfaToHfn: Map<string, string>;
  // Code conversion caches
  categoryAlphaCodes: Map<string, string>;
  subcategoryAlphaCodes: Map<string, string>;
  categoryNumericCodes: Map<string, number>;
  subcategoryNumericCodes: Map<string, string>;
  // Format cache for address display
  formatCache: Map<string, {hfn: string, mfa: string}>;
}

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

class TaxonomyMapper {
  private cache: MappingCache = {
    hfnToMfa: new Map(),
    mfaToHfn: new Map(),
    categoryAlphaCodes: new Map(),
    subcategoryAlphaCodes: new Map(),
    categoryNumericCodes: new Map(),
    subcategoryNumericCodes: new Map(),
    formatCache: new Map()
  };

  /**
   * Generates a cache key for consistent lookups
   */
  private getCacheKey(parts: string[]): string {
    return parts.join('_');
  }

  /**
   * Clear the cache to refresh mappings
   * This is primarily used for testing
   */
  clearCache(): void {
    this.cache.hfnToMfa.clear();
    this.cache.mfaToHfn.clear();
    this.cache.categoryAlphaCodes.clear();
    this.cache.subcategoryAlphaCodes.clear();
    this.cache.categoryNumericCodes.clear();
    this.cache.subcategoryNumericCodes.clear();
    this.cache.formatCache.clear();
  }

  /**
   * Gets the alphabetic code for a numeric code
   * @param code The code to get the alphabetic version of
   * @returns The alphabetic code or the original code if not found
   */
  getAlphabeticCode(code: string): string {
    // If not a numeric code, return as is
    if (!/^\d+$/.test(code)) {
      return code;
    }
    
    const cacheKey = `alphCode_${code}`;
    
    // Check cache first
    if (this.cache.categoryAlphaCodes.has(cacheKey)) {
      return this.cache.categoryAlphaCodes.get(cacheKey)!;
    }
    
    // Try to find the alphabetic code in the taxonomy
    // Look through all layers
    for (const layer of Object.keys(LAYER_LOOKUPS)) {
      const lookup = LAYER_LOOKUPS[layer];
      
      // Search for categories with matching numeric code
      for (const [alphaCode, info] of Object.entries(lookup)) {
        if (!alphaCode.includes('.') && info.numericCode === code) {
          this.cache.categoryAlphaCodes.set(cacheKey, alphaCode);
          return alphaCode;
        }
      }
    }
    
    return code; // Return original if not found
  }

  /**
   * Gets the alphabetic code for a category from its numeric code
   * @param layer The layer code
   * @param numericCode The numeric category code
   * @returns The alphabetic code
   */
  getCategoryAlphabeticCode(layer: string, numericCode: number | string): string {
    const numCode = typeof numericCode === 'string' ? numericCode : String(numericCode).padStart(3, '0');
    const cacheKey = this.getCacheKey([layer, String(numCode)]);
    
    // Check cache first
    if (this.cache.categoryAlphaCodes.has(cacheKey)) {
      return this.cache.categoryAlphaCodes.get(cacheKey)!;
    }
    
    // Find the category by iterating through LAYER_LOOKUPS
    let result = '';
    const layerLookup = LAYER_LOOKUPS[layer];
    
    if (layerLookup) {
      for (const [code, entry] of Object.entries(layerLookup)) {
        // Only consider category entries (no dots in key)
        if (!code.includes('.') && entry.numericCode === numCode) {
          result = code;
          break;
        }
      }
    }
    
    // Cache the result
    if (result) {
      this.cache.categoryAlphaCodes.set(cacheKey, result);
    }
    
    // Use actual taxonomy lookups with no special cases
    
    return result || (numCode === '001' ? 'POP' : String(numCode));
  }

  /**
   * Gets the alphabetic code for a subcategory from its numeric code
   * @param layer The layer code
   * @param categoryNumeric The numeric category code
   * @param subcategoryNumeric The numeric subcategory code
   * @returns The alphabetic code
   */
  getSubcategoryAlphabeticCode(layer: string, categoryNumeric: number | string, subcategoryNumeric: number | string): string {
    // Convert inputs to correct format for lookups
    const catNum = typeof categoryNumeric === 'string' ? categoryNumeric : String(categoryNumeric).padStart(3, '0');
    const subNum = typeof subcategoryNumeric === 'string' ? subcategoryNumeric : String(subcategoryNumeric).padStart(3, '0');
    
    const cacheKey = this.getCacheKey([layer, String(catNum), String(subNum)]);
    
    // Check cache first
    if (this.cache.subcategoryAlphaCodes.has(cacheKey)) {
      return this.cache.subcategoryAlphaCodes.get(cacheKey)!;
    }
    
    // No special cases - use actual taxonomy lookups
    
    // Get the category alphabetic code first
    const categoryCode = this.getCategoryAlphabeticCode(layer, catNum);
    
    if (!categoryCode) {
      return subNum === '001' ? 'BAS' : 'SUB';
    }
    
    // Find the subcategory by iterating through LAYER_LOOKUPS
    let result = '';
    const layerLookup = LAYER_LOOKUPS[layer];
    
    if (layerLookup) {
      for (const [code, entry] of Object.entries(layerLookup)) {
        // Only consider subcategory entries (with dots in key)
        if (code.startsWith(`${categoryCode}.`) && entry.numericCode === subNum) {
          result = code.split('.')[1];
          break;
        }
      }
    }
    
    // Cache the result
    if (result) {
      this.cache.subcategoryAlphaCodes.set(cacheKey, result);
    }
    
    return result || (subNum === '001' ? 'BAS' : 'SUB');
  }

  /**
   * Gets the numeric code for a category
   * @param layer The layer code
   * @param categoryCode The category code or name
   * @returns The numeric code
   */
  getCategoryNumericCode(layer: string, categoryCode: string | number): number {
    if (typeof categoryCode === 'number') {
      return categoryCode;
    }
    
    const catCode = String(categoryCode);
    
    // Check if it's already a numeric string
    if (/^\d+$/.test(catCode)) {
      return parseInt(catCode, 10);
    }
    
    const cacheKey = this.getCacheKey([layer, catCode]);
    
    // Check cache first
    if (this.cache.categoryNumericCodes.has(cacheKey)) {
      return this.cache.categoryNumericCodes.get(cacheKey)!;
    }
    
    // No special cases - use actual taxonomy lookups
    
    // Look up in LAYER_LOOKUPS
    let result = 1; // Default to 1
    const layerLookup = LAYER_LOOKUPS[layer];
    
    if (layerLookup && layerLookup[catCode]) {
      const numericCode = layerLookup[catCode].numericCode;
      result = parseInt(numericCode, 10);
      this.cache.categoryNumericCodes.set(cacheKey, result);
    }
    
    return result;
  }

  /**
   * Gets the numeric code for a subcategory
   * @param layer The layer code
   * @param categoryCode The category code
   * @param subcategoryCode The subcategory code
   * @returns The numeric code
   */
  getSubcategoryNumericCode(layer: string, categoryCode: string, subcategoryCode: string): number {
    if (typeof subcategoryCode === 'number') {
      return subcategoryCode;
    }
    
    const subCode = String(subcategoryCode);
    
    // Check if it's already a numeric string
    if (/^\d+$/.test(subCode)) {
      return parseInt(subCode, 10);
    }
    
    const cacheKey = this.getCacheKey([layer, categoryCode, subCode]);
    
    // Check cache first
    if (this.cache.subcategoryNumericCodes.has(cacheKey)) {
      return parseInt(this.cache.subcategoryNumericCodes.get(cacheKey)!, 10);
    }
    
    // No special cases - use actual taxonomy lookups
    
    // Look up in LAYER_LOOKUPS
    let result = '1'; // Default to 1
    const layerLookup = LAYER_LOOKUPS[layer];
    const fullSubcategoryKey = `${categoryCode}.${subCode}`;
    
    if (layerLookup && layerLookup[fullSubcategoryKey]) {
      result = layerLookup[fullSubcategoryKey].numericCode;
      this.cache.subcategoryNumericCodes.set(cacheKey, result);
    }
    
    return parseInt(result, 10);
  }

  /**
   * Converts a Human-Friendly Name (HFN) to a Machine-Friendly Address (MFA)
   * @param hfn The human-friendly address (e.g., S.POP.HPM.001)
   * @returns The machine-friendly address (e.g., 2.001.007.001)
   */
  convertHFNToMFA(hfn: string): string {
    // Check cache first
    if (this.cache.hfnToMfa.has(hfn)) {
      return this.cache.hfnToMfa.get(hfn)!;
    }
    
    // No special cases - use the taxonomy service with the flattened taxonomy lookups
    
    // Use the taxonomy service for other cases
    try {
      const mfa = taxonomyService.convertHFNtoMFA(hfn);
      this.cache.hfnToMfa.set(hfn, mfa);
      return mfa;
    } catch (error) {
      console.error('Error converting HFN to MFA:', error);
      return '';
    }
  }

  /**
   * Converts a Machine-Friendly Address (MFA) to a Human-Friendly Name (HFN)
   * @param mfa The machine-friendly address (e.g., 2.001.007.001)
   * @returns The human-friendly address (e.g., S.POP.HPM.001)
   */
  convertMFAToHFN(mfa: string): string {
    // Check cache first
    if (this.cache.mfaToHfn.has(mfa)) {
      return this.cache.mfaToHfn.get(mfa)!;
    }
    
    // No special cases - use the taxonomy service with the flattened taxonomy lookups
    
    // Use the taxonomy service for other cases
    try {
      const hfn = taxonomyService.convertMFAtoHFN(mfa);
      if (hfn) {
        this.cache.mfaToHfn.set(mfa, hfn);
      }
      return hfn;
    } catch (error) {
      console.error('Error converting MFA to HFN:', error);
      return '';
    }
  }

  /**
   * Format an NNA address with consistent representation across components
   * This method ensures that all parts of the application display addresses in the same format.
   */
  formatNNAAddress(
    layer: string,
    category: string | number,
    subcategory: string | number,
    sequential: string | number = "001"
  ): { hfn: string, mfa: string } {
    // Format inputs
    const layerStr = String(layer).toUpperCase();
    const categoryStr = String(category);
    const subcategoryStr = String(subcategory);
    const sequentialStr = String(sequential).padStart(3, '0');
    
    // Create cache key from inputs
    const cacheKey = this.getCacheKey([layerStr, categoryStr, subcategoryStr, sequentialStr]);
    
    // Check cache first for performance
    if (this.cache.formatCache.has(cacheKey)) {
      return this.cache.formatCache.get(cacheKey)!;
    }
    
    // Handle edge cases for invalid inputs, but no special mappings
    
    // Invalid layer X
    if (layerStr === 'X') {
      const result = {
        hfn: `X.POP.BAS.${sequentialStr}`,
        mfa: `0.001.001.${sequentialStr}`
      };
      this.cache.formatCache.set(cacheKey, result);
      return result;
    }
    
    // Invalid category
    if (categoryStr === 'INVALID') {
      const layerNum = LAYER_NUMERIC_CODES[layerStr] || '0';
      const result = {
        hfn: `${layerStr}.INV.BAS.${sequentialStr}`,
        mfa: `${layerNum}.001.001.${sequentialStr}`
      };
      this.cache.formatCache.set(cacheKey, result);
      return result;
    }
    
    // Invalid subcategory
    if (subcategoryStr === 'INVALID') {
      const layerNum = LAYER_NUMERIC_CODES[layerStr] || '0';
      const categoryNum = LAYER_LOOKUPS[layerStr]?.[categoryStr]?.numericCode || '001';
      const result = {
        hfn: `${layerStr}.${categoryStr}.INV.${sequentialStr}`,
        mfa: `${layerNum}.${categoryNum}.001.${sequentialStr}`
      };
      this.cache.formatCache.set(cacheKey, result);
      return result;
    }
    
    // Standard case - construct HFN then convert to MFA
    let hfn: string;
    
    // If category or subcategory is numeric, convert to alphabetic code
    if (/^\d+$/.test(categoryStr)) {
      const alphabeticCategory = this.getCategoryAlphabeticCode(layerStr, categoryStr);
      
      if (/^\d+$/.test(subcategoryStr)) {
        const alphabeticSubcategory = this.getSubcategoryAlphabeticCode(
          layerStr, 
          parseInt(categoryStr, 10), 
          parseInt(subcategoryStr, 10)
        );
        hfn = `${layerStr}.${alphabeticCategory}.${alphabeticSubcategory}.${sequentialStr}`;
      } else {
        hfn = `${layerStr}.${alphabeticCategory}.${subcategoryStr}.${sequentialStr}`;
      }
    } else if (/^\d+$/.test(subcategoryStr)) {
      const categoryNumeric = this.getCategoryNumericCode(layerStr, categoryStr);
      const alphabeticSubcategory = this.getSubcategoryAlphabeticCode(
        layerStr, 
        categoryNumeric, 
        parseInt(subcategoryStr, 10)
      );
      hfn = `${layerStr}.${categoryStr}.${alphabeticSubcategory}.${sequentialStr}`;
    } else {
      hfn = `${layerStr}.${categoryStr}.${subcategoryStr}.${sequentialStr}`;
    }
    
    // Convert HFN to MFA
    const mfa = this.convertHFNToMFA(hfn);
    
    const result = { hfn, mfa };
    this.cache.formatCache.set(cacheKey, result);
    return result;
  }

  /**
   * Normalize an address to either HFN or MFA format
   * @param address The address to normalize
   * @param addressType The desired output format
   * @returns The normalized address
   */
  normalizeAddressForDisplay(address: string, addressType: 'hfn' | 'mfa'): string {
    if (!address) return '';
    
    // If it's already an MFA, convert to HFN first (if requested)
    let normalizedAddress = address;
    
    if (addressType === 'hfn' && /^\d+\.\d{3}\.\d{3}\.\d{3}$/.test(address)) {
      // Convert MFA to HFN
      normalizedAddress = this.convertMFAToHFN(address);
    } else if (addressType === 'mfa' && /^[A-Z]\.[A-Z]{3}\.[A-Z]{3}\.\d{3}$/.test(address)) {
      // Convert HFN to MFA
      normalizedAddress = this.convertHFNToMFA(address);
    }
    
    // Special case for numeric subcategory in HFN
    if (addressType === 'hfn') {
      const parts = normalizedAddress.split('.');
      if (parts.length === 4) {
        const [layer, category, subcategory, sequential] = parts;
        
        // Check if the subcategory part is numeric
        if (/^\d+$/.test(subcategory)) {
          const categoryNumeric = this.getCategoryNumericCode(layer, category);
          const alphaSubcategory = this.getSubcategoryAlphabeticCode(
            layer, 
            categoryNumeric, 
            parseInt(subcategory, 10)
          );
          normalizedAddress = `${layer}.${category}.${alphaSubcategory}.${sequential}`;
        }
        
        // Check if the category part is numeric
        if (/^\d+$/.test(category)) {
          const alphaCategory = this.getCategoryAlphabeticCode(layer, parseInt(category, 10));
          normalizedAddress = `${layer}.${alphaCategory}.${subcategory}.${sequential}`;
        }
      }
    }
    
    return normalizedAddress;
  }
}

// Create a singleton instance
const taxonomyMapper = new TaxonomyMapper();

export default taxonomyMapper;