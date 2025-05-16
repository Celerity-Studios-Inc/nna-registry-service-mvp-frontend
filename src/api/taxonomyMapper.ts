/**
 * Comprehensive Taxonomy Mapper for NNA Registry
 * 
 * This mapper provides reliable, consistent conversion between different 
 * taxonomy representation formats across the entire application.
 * 
 * Key features:
 * - Single source of truth for all taxonomy conversions
 * - Bidirectional mapping between all formats (name, code, numeric)
 * - Consistent handling of special cases like S.POP.HPM
 * - Integration with taxonomyService as the canonical data source
 * - Comprehensive caching for performance optimization
 */

import taxonomyService from './taxonomyService';
import { formatNNAAddressForDisplay } from './codeMapping.enhanced';

/**
 * Cache for taxonomy mapping operations to improve performance
 */
interface MappingCache {
  // Cache structure: layerCode_categoryCode_subcategoryCode -> result
  categoryNames: Map<string, string>;
  subcategoryNames: Map<string, string>;
  categoryAlphaCodes: Map<string, string>;
  subcategoryAlphaCodes: Map<string, string>;
  categoryNumericCodes: Map<string, number>;
  subcategoryNumericCodes: Map<string, number>;
  validCombinations: Map<string, boolean>;
  formatCache: Map<string, {hfn: string, mfa: string}>;
}

class TaxonomyMapper {
  private cache: MappingCache = {
    categoryNames: new Map(),
    subcategoryNames: new Map(),
    categoryAlphaCodes: new Map(),
    subcategoryAlphaCodes: new Map(),
    categoryNumericCodes: new Map(),
    subcategoryNumericCodes: new Map(),
    validCombinations: new Map(),
    formatCache: new Map(),
  };

  constructor() {
    // Populate cache with known special mappings
    this.preloadSpecialCases();
  }

  /**
   * Preload cache with known special mappings
   */
  private preloadSpecialCases(): void {
    // S.POP.HPM special case
    this.cache.subcategoryNumericCodes.set('S_POP_HPM', 7);
    this.cache.subcategoryAlphaCodes.set('S_001_007', 'HPM');
    this.cache.subcategoryAlphaCodes.set('S_POP_007', 'HPM');

    // W.URB/HIP special cases
    this.cache.categoryAlphaCodes.set('W_003', 'HIP');
    this.cache.categoryNumericCodes.set('W_HIP', 3);

    // W.BCH special case - make sure it maps to 003 (not 009/CCH)
    this.cache.categoryAlphaCodes.set('W_003', 'BCH');
    this.cache.categoryNumericCodes.set('W_BCH', 3);

    console.log('Preloaded special case mappings into taxonomy mapper cache');
  }

  /**
   * Generates a cache key for consistent lookups
   */
  private getCacheKey(parts: string[]): string {
    return parts.join('_');
  }

  /**
   * Gets the full layer name from a layer code
   */
  getLayerName(layerCode: string): string {
    const layerInfo = taxonomyService.getLayer(layerCode);
    return layerInfo?.name || layerCode;
  }

  /**
   * Gets the alphabetic code for a category from its numeric code or name
   */
  getCategoryAlphabeticCode(layerCode: string, categoryValue: string | number): string {
    const categoryStr = typeof categoryValue === 'number' ? categoryValue.toString() : categoryValue;
    
    // If already alphabetic, return as is
    if (/^[A-Za-z]{3}$/.test(categoryStr)) {
      return categoryStr.toUpperCase();
    }
    
    // Check cache for numeric lookups
    if (/^\d+$/.test(categoryStr)) {
      const cacheKey = this.getCacheKey([layerCode, categoryStr]);
      if (this.cache.categoryAlphaCodes.has(cacheKey)) {
        return this.cache.categoryAlphaCodes.get(cacheKey)!;
      }
      
      // Not in cache, look up using taxonomy service
      const numericCode = parseInt(categoryStr, 10);
      const result = taxonomyService.getCategoryAlphabeticCode(layerCode, numericCode);
      
      if (result) {
        // Cache the result for future lookups
        this.cache.categoryAlphaCodes.set(cacheKey, result);
        return result;
      }
    }
    
    // Handle lookup by name
    const categories = taxonomyService.getCategories(layerCode);
    const matchByName = categories.find(c => c.name === categoryStr);
    
    if (matchByName) {
      const cacheKey = this.getCacheKey([layerCode, categoryStr]);
      this.cache.categoryAlphaCodes.set(cacheKey, matchByName.code);
      return matchByName.code;
    }
    
    // If we can't determine, generate from first 3 letters
    if (categoryStr.length > 0) {
      return categoryStr.substring(0, 3).toUpperCase();
    }
    
    // Default fallback
    return 'POP';
  }
  
  /**
   * Gets the alphabetic code for a subcategory from its numeric code or name
   */
  getSubcategoryAlphabeticCode(
    layerCode: string, 
    categoryValue: string | number, 
    subcategoryValue: string | number
  ): string {
    const categoryStr = typeof categoryValue === 'number' ? categoryValue.toString() : categoryValue;
    const subcategoryStr = typeof subcategoryValue === 'number' ? subcategoryValue.toString() : subcategoryValue;
    
    // If already alphabetic, return as is
    if (/^[A-Za-z]{3}$/.test(subcategoryStr)) {
      return subcategoryStr.toUpperCase();
    }
    
    // Special case handling - direct cache lookup for S.POP.HPM / S.001.007
    if (layerCode === 'S' && 
        (categoryStr === 'POP' || categoryStr === '001') && 
        (subcategoryStr === '7' || subcategoryStr === '007')) {
      return 'HPM';
    }
    
    // Normalize category code
    let categoryCode = categoryStr;
    if (/^\d+$/.test(categoryStr) || categoryStr.length > 3) {
      categoryCode = this.getCategoryAlphabeticCode(layerCode, categoryStr);
    }
    
    // Check cache for numeric lookups
    if (/^\d+$/.test(subcategoryStr)) {
      const cacheKey = this.getCacheKey([layerCode, categoryCode, subcategoryStr]);
      if (this.cache.subcategoryAlphaCodes.has(cacheKey)) {
        return this.cache.subcategoryAlphaCodes.get(cacheKey)!;
      }
      
      // Not in cache, look up using taxonomy service
      const numericCode = parseInt(subcategoryStr, 10);
      const categoryNumericCode = this.getCategoryNumericCode(layerCode, categoryCode);
      const result = taxonomyService.getSubcategoryAlphabeticCode(
        layerCode, 
        categoryNumericCode, 
        numericCode
      );
      
      if (result) {
        // Cache the result for future lookups
        this.cache.subcategoryAlphaCodes.set(cacheKey, result);
        return result;
      }
    }
    
    // Try to find by name
    const subcategories = taxonomyService.getSubcategories(layerCode, categoryCode);
    const matchByName = subcategories.find(sc => sc.name === subcategoryStr);
    
    if (matchByName) {
      return matchByName.code;
    }
    
    // Special case for "Base" subcategory
    if (subcategoryStr === "Base") {
      return "BAS";
    }
    
    // If we can't determine, generate from first 3 letters
    if (subcategoryStr.length > 0) {
      return subcategoryStr.substring(0, 3).toUpperCase();
    }
    
    // Default fallback
    return 'BAS';
  }

  /**
   * Gets the numeric code for a category from its alphabetic code or name
   */
  getCategoryNumericCode(layerCode: string, categoryValue: string | number): number {
    const categoryStr = typeof categoryValue === 'number' ? categoryValue.toString() : categoryValue;
    
    // If already numeric, parse and return
    if (/^\d+$/.test(categoryStr)) {
      return parseInt(categoryStr, 10);
    }
    
    // Special case for W.HIP or W.BCH mapping to 003
    if (layerCode === 'W' && (categoryStr === 'HIP' || categoryStr === 'BCH')) {
      return 3;
    }
    
    // Check cache for code lookups
    if (/^[A-Za-z]{3}$/.test(categoryStr)) {
      const cacheKey = this.getCacheKey([layerCode, categoryStr]);
      if (this.cache.categoryNumericCodes.has(cacheKey)) {
        return this.cache.categoryNumericCodes.get(cacheKey)!;
      }
      
      // Not in cache, look up using taxonomy service
      const result = taxonomyService.getCategoryNumericCode(layerCode, categoryStr);
      if (result !== -1) {
        // Cache the result for future lookups
        this.cache.categoryNumericCodes.set(cacheKey, result);
        return result;
      }
    }
    
    // Try to find by name
    const categories = taxonomyService.getCategories(layerCode);
    const matchByName = categories.find(c => c.name === categoryStr);
    
    if (matchByName && matchByName.numericCode) {
      return matchByName.numericCode;
    }
    
    // Default fallback for popular categories
    if (categoryStr === 'Pop' || categoryStr.toUpperCase() === 'POP') {
      return 1;
    }
    
    // Last resort
    return 1;
  }

  /**
   * Gets the numeric code for a subcategory from its alphabetic code or name
   */
  getSubcategoryNumericCode(
    layerCode: string, 
    categoryValue: string | number, 
    subcategoryValue: string | number
  ): number {
    const categoryStr = typeof categoryValue === 'number' ? categoryValue.toString() : categoryValue;
    const subcategoryStr = typeof subcategoryValue === 'number' ? subcategoryValue.toString() : subcategoryValue;
    
    // If already numeric, parse and return
    if (/^\d+$/.test(subcategoryStr)) {
      return parseInt(subcategoryStr, 10);
    }
    
    // Special case for S.POP.HPM / S.001.HPM always mapping to 7
    if (layerCode === 'S' && 
        (categoryStr === 'POP' || categoryStr === '001') && 
        subcategoryStr === 'HPM') {
      return 7;
    }
    
    // Normalize category code
    let categoryCode = categoryStr;
    if (/^\d+$/.test(categoryStr) || categoryStr.length > 3) {
      categoryCode = this.getCategoryAlphabeticCode(layerCode, categoryStr);
    }
    
    // Check cache for code lookups
    if (/^[A-Za-z]{3}$/.test(subcategoryStr)) {
      const cacheKey = this.getCacheKey([layerCode, categoryCode, subcategoryStr]);
      if (this.cache.subcategoryNumericCodes.has(cacheKey)) {
        return this.cache.subcategoryNumericCodes.get(cacheKey)!;
      }
      
      // Not in cache, look up using taxonomy service
      const result = taxonomyService.getSubcategoryNumericCode(
        layerCode,
        categoryCode,
        subcategoryStr
      );
      
      if (result !== -1) {
        // Cache the result for future lookups
        this.cache.subcategoryNumericCodes.set(cacheKey, result);
        return result;
      }
    }
    
    // Try to find by name
    const subcategories = taxonomyService.getSubcategories(layerCode, categoryCode);
    const matchByName = subcategories.find(sc => sc.name === subcategoryStr);
    
    if (matchByName && matchByName.numericCode) {
      return matchByName.numericCode;
    }
    
    // Default fallback for base subcategory
    if (subcategoryStr === 'Base' || subcategoryStr.toUpperCase() === 'BAS') {
      return 1;
    }
    
    // Last resort
    return 1;
  }

  /**
   * Converts a human-friendly NNA address to its machine-friendly equivalent
   */
  convertHFNToMFA(hfnAddress: string): string {
    const parts = hfnAddress.split('.');
    if (parts.length !== 4) {
      return hfnAddress; // Not a valid NNA address format
    }

    const [layer, category, subcategory, sequential] = parts;
    
    // Convert each part to its numeric representation
    const layerNumeric = this.getNumericLayerCode(layer);
    const categoryNumeric = this.getCategoryNumericCode(layer, category);
    const subcategoryNumeric = this.getSubcategoryNumericCode(layer, category, subcategory);
    
    // Format as padded strings for the MFA
    const paddedCategory = String(categoryNumeric).padStart(3, '0');
    const paddedSubcategory = String(subcategoryNumeric).padStart(3, '0');
    
    return `${layerNumeric}.${paddedCategory}.${paddedSubcategory}.${sequential}`;
  }

  /**
   * Converts a machine-friendly NNA address to its human-friendly equivalent
   */
  convertMFAToHFN(mfaAddress: string): string {
    const parts = mfaAddress.split('.');
    if (parts.length !== 4) {
      return mfaAddress; // Not a valid NNA address format
    }

    const [layerNumeric, categoryNumeric, subcategoryNumeric, sequential] = parts;
    
    // Convert each part to its alphabetic representation
    const layer = this.getLayerCodeFromNumeric(parseInt(layerNumeric, 10));
    const category = this.getCategoryAlphabeticCode(layer, parseInt(categoryNumeric, 10));
    const subcategory = this.getSubcategoryAlphabeticCode(
      layer,
      parseInt(categoryNumeric, 10),
      parseInt(subcategoryNumeric, 10)
    );
    
    return `${layer}.${category}.${subcategory}.${sequential}`;
  }

  /**
   * Gets the numeric layer code from a single letter layer code
   */
  getNumericLayerCode(layerCode: string): number {
    const layerMap: Record<string, number> = {
      G: 1, // Songs
      S: 2, // Stars
      L: 3, // Looks
      M: 4, // Moves
      W: 5, // Worlds
      B: 6, // Branded
      P: 7, // Personalize
      T: 8, // Training Data
      C: 9, // Composite
      R: 10 // Rights
    };
    
    return layerMap[layerCode] || 0;
  }

  /**
   * Gets the layer code from a numeric layer code
   */
  getLayerCodeFromNumeric(numericCode: number): string {
    const numericToLayerMap: Record<number, string> = {
      1: 'G',
      2: 'S',
      3: 'L', 
      4: 'M',
      5: 'W',
      6: 'B',
      7: 'P',
      8: 'T',
      9: 'C',
      10: 'R'
    };
    
    return numericToLayerMap[numericCode] || '';
  }

  /**
   * Gets the category name from a category code
   */
  getCategoryName(layerCode: string, categoryValue: string | number): string {
    const categoryStr = typeof categoryValue === 'number' ? categoryValue.toString() : categoryValue;
    const cacheKey = this.getCacheKey([layerCode, categoryStr]);
    
    // Check cache first
    if (this.cache.categoryNames.has(cacheKey)) {
      return this.cache.categoryNames.get(cacheKey)!;
    }
    
    let result = '';
    
    // If numeric, convert to alphabetic first for lookup
    if (/^\d+$/.test(categoryStr)) {
      const numericCode = parseInt(categoryStr, 10);
      const categories = taxonomyService.getCategories(layerCode);
      const category = categories.find(c => c.numericCode === numericCode);
      result = category?.name || '';
    } else {
      // Direct lookup for alphabetic
      const categories = taxonomyService.getCategories(layerCode);
      const category = categories.find(c => c.code === categoryStr);
      result = category?.name || '';
    }
    
    // Cache the result
    this.cache.categoryNames.set(cacheKey, result);
    return result;
  }

  /**
   * Gets the subcategory name from a subcategory code
   */
  getSubcategoryName(
    layerCode: string, 
    categoryValue: string | number, 
    subcategoryValue: string | number
  ): string {
    const categoryStr = typeof categoryValue === 'number' ? categoryValue.toString() : categoryValue;
    const subcategoryStr = typeof subcategoryValue === 'number' ? subcategoryValue.toString() : subcategoryValue;
    const cacheKey = this.getCacheKey([layerCode, categoryStr, subcategoryStr]);
    
    // Check cache first
    if (this.cache.subcategoryNames.has(cacheKey)) {
      return this.cache.subcategoryNames.get(cacheKey)!;
    }
    
    // Special case for S.POP.HPM / S.001.HPM combination
    if (layerCode === 'S' && 
        (categoryStr === 'POP' || categoryStr === '001') && 
        (subcategoryStr === 'HPM' || subcategoryStr === '7' || subcategoryStr === '007')) {
      return 'Hipster_Male_Pop_Star';
    }
    
    // Normalize category code to alphabetic
    let categoryAlpha = categoryStr;
    if (/^\d+$/.test(categoryStr)) {
      categoryAlpha = this.getCategoryAlphabeticCode(layerCode, categoryStr);
    }
    
    let result = '';
    
    // If numeric subcategory, convert to name via lookup
    if (/^\d+$/.test(subcategoryStr)) {
      const numericCode = parseInt(subcategoryStr, 10);
      const subcategories = taxonomyService.getSubcategories(layerCode, categoryAlpha);
      const subcategory = subcategories.find(s => s.numericCode === numericCode);
      result = subcategory?.name || '';
    } else {
      // Direct lookup for alphabetic
      const subcategories = taxonomyService.getSubcategories(layerCode, categoryAlpha);
      const subcategory = subcategories.find(s => s.code === subcategoryStr);
      result = subcategory?.name || '';
    }
    
    // Cache the result
    this.cache.subcategoryNames.set(cacheKey, result);
    return result;
  }

  /**
   * Format an NNA address with consistent representation across components
   * This method ensures that all parts of the application display addresses in the same format.
   */
  formatNNAAddress(
    layer: string,
    category: string | number,
    subcategory: string | number,
    sequential: string | number = "000"
  ): { hfn: string, mfa: string } {
    // Create cache key from inputs
    const cacheKey = this.getCacheKey([
      layer,
      typeof category === 'number' ? category.toString() : category,
      typeof subcategory === 'number' ? subcategory.toString() : subcategory,
      typeof sequential === 'number' ? sequential.toString() : sequential
    ]);
    
    // Check cache first for performance
    if (this.cache.formatCache.has(cacheKey)) {
      return this.cache.formatCache.get(cacheKey)!;
    }
    
    // Fall through to the existing enhanced formatter
    const result = formatNNAAddressForDisplay(layer, category, subcategory, sequential);
    
    // Cache the result
    this.cache.formatCache.set(cacheKey, result);
    return result;
  }

  /**
   * Normalize a category code to alphabetic representation
   * This is important for the success screen to always show alphabetic codes (e.g., W.STG.FES.001)
   * instead of numeric codes (e.g., W.002.FES.001)
   */
  normalizeAddressForDisplay(address: string, addressType: 'hfn' | 'mfa'): string {
    if (!address) return '';
    
    // If it's already an MFA, convert to HFN first (if requested)
    let hfnAddress = address;
    if (addressType === 'hfn' && /^\d+\.\d{3}\.\d{3}\.\d{3}$/.test(address)) {
      hfnAddress = this.convertMFAToHFN(address);
    } else if (addressType === 'mfa' && /^[A-Z]\.[A-Z]{3}\.[A-Z]{3}\.\d{3}$/.test(address)) {
      // If we want MFA but have HFN, convert it
      return this.convertHFNToMFA(address);
    }
    
    // Now we have or want an HFN address
    if (addressType === 'hfn') {
      const parts = hfnAddress.split('.');
      if (parts.length !== 4) return hfnAddress; // Not valid format
      
      const [layer, category, subcategory, sequential] = parts;
      
      // Check if the category part is numeric (this would be the issue in the success screen)
      if (/^\d+$/.test(category)) {
        // Convert numeric category to alphabetic
        const alphaCategory = this.getCategoryAlphabeticCode(layer, category);
        return `${layer}.${alphaCategory}.${subcategory}.${sequential}`;
      }
      
      return hfnAddress;
    }
    
    // For MFA, just return as is
    return address;
  }

  /**
   * Clear the cache to refresh mappings
   */
  /**
   * General function to get alphabetic code for any code (category or subcategory)
   * For use in consistent display in UI components
   */
  getAlphabeticCode(code: string): string {
    // If already alphabetic, return as is
    if (/^[A-Za-z]{3}$/.test(code)) {
      return code;
    }

    // If numeric, convert to padded format for lookup
    if (/^\d+$/.test(code)) {
      const numericCode = parseInt(code, 10);
      const paddedCode = String(numericCode).padStart(3, '0');

      // Special cases
      if (paddedCode === '003') return 'BCH'; // Beach
      if (paddedCode === '001') return 'POP'; // Pop
      if (paddedCode === '007') return 'HPM'; // Hipster Male

      // Try to look up from taxonomy service - this would require knowledge of layer
      // Since we don't have layer in this context, we'll use common mappings
      const commonMappings: Record<string, string> = {
        '001': 'POP', // Pop
        '002': 'DCL', // Dance_Classical
        '003': 'BCH', // Beach (for World layer) or HIP (Urban for other layers)
        '004': 'MDP', // Modern_Performance
        '005': 'JZZ', // Jazz
        '006': 'NAT', // Natural
        '007': 'HPM', // Hipster Male
        '008': 'ROK', // Rock
        '009': 'CCH', // Contemporary_Choreography
        '011': 'CDP', // Contemporary_Dance
      };

      return commonMappings[paddedCode] || paddedCode;
    }

    // If neither alphabetic nor numeric, return as is
    return code;
  }

  clearCache(): void {
    this.cache.categoryNames.clear();
    this.cache.subcategoryNames.clear();
    this.cache.categoryAlphaCodes.clear();
    this.cache.subcategoryAlphaCodes.clear();
    this.cache.categoryNumericCodes.clear();
    this.cache.subcategoryNumericCodes.clear();
    this.cache.validCombinations.clear();
    this.cache.formatCache.clear();

    // Reload special cases
    this.preloadSpecialCases();
  }
}

// Create a singleton instance
const taxonomyMapper = new TaxonomyMapper();

export default taxonomyMapper;