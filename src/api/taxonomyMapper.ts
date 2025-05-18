/**
 * Taxonomy Mapper - Handles formatting and converting between different address formats
 */
import taxonomyLookup, { getLayerModule } from '../taxonomyLookup';
import { Logger } from '../utils/logger';

/**
 * TaxonomyMapper provides functionality for handling NNA taxonomy
 * address formats and conversions between them
 */
class TaxonomyMapper {
  /**
   * Format an NNA address from its individual components
   * @param layer The layer code (e.g. 'W', 'S', etc.)
   * @param category The category code (e.g. 'BCH', 'POP', etc.)
   * @param subcategory The subcategory code (e.g. 'SUN', 'HPM', etc.)
   * @param sequential The sequential identifier (e.g. '001')
   * @param format The format to generate ('hfn' or 'mfa')
   * @returns The formatted address in the specified format
   */
  formatNNAAddress(
    layer: string, 
    category: string, 
    subcategory: string, 
    sequential: string,
    format: 'hfn' | 'mfa' = 'hfn'
  ): string {
    // Return empty string if any required component is missing
    if (!layer || !category || !subcategory || !sequential) {
      return '';
    }

    if (format === 'mfa') {
      // Format as Machine Friendly Address (numeric codes)
      const layerNumeric = this.getLayerNumericCode(layer);
      const categoryNumeric = this.getCategoryNumericCode(layer, category);
      const subcategoryNumeric = this.getSubcategoryNumericCode(layer, category, subcategory);

      // Pad numeric codes with leading zeros
      const paddedCategory = categoryNumeric.toString().padStart(3, '0');
      const paddedSubcategory = subcategoryNumeric.toString().padStart(3, '0');

      return `${layerNumeric}.${paddedCategory}.${paddedSubcategory}.${sequential}`;
    } else {
      // Format as Human Friendly Name (alphabetic codes)
      return `${layer}.${category}.${subcategory}.${sequential}`;
    }
  }

  /**
   * Get the numeric code for a layer
   * @param layer The layer code (e.g. 'W', 'S', etc.)
   * @returns The numeric code for the layer
   */
  getLayerNumericCode(layer: string): number {
    const layerData = taxonomyLookup.layers[layer];
    return layerData ? layerData.numericCode : 0;
  }

  /**
   * Get the numeric code for a category within a layer
   * @param layer The layer code (e.g. 'W', 'S', etc.)
   * @param category The category code (e.g. 'BCH', 'POP', etc.)
   * @returns The numeric code for the category
   */
  getCategoryNumericCode(layer: string, category: string): number {
    try {
      const layerModule = getLayerModule(layer);
      if (!layerModule) return 0;

      const categories = layerModule.getCategories();
      const categoryData = categories.find(cat => cat.code === category);
      return categoryData ? categoryData.numericCode : 0;
    } catch (error) {
      Logger.error(`Error getting category numeric code for ${layer}.${category}:`, error);
      return 0;
    }
  }

  /**
   * Get the alphabetic code for a category from its numeric code
   * @param layer The layer code (e.g. 'W', 'S', etc.)
   * @param numericCode The numeric code of the category
   * @returns The alphabetic code for the category
   */
  getCategoryAlphabeticCode(layer: string, numericCode: number): string {
    try {
      const layerModule = getLayerModule(layer);
      if (!layerModule) return '';

      const categories = layerModule.getCategories();
      const categoryData = categories.find(cat => cat.numericCode === numericCode);
      return categoryData ? categoryData.code : '';
    } catch (error) {
      Logger.error(`Error getting category alphabetic code for ${layer}.${numericCode}:`, error);
      return '';
    }
  }

  /**
   * Get the numeric code for a subcategory within a category
   * @param layer The layer code (e.g. 'W', 'S', etc.)
   * @param category The category code (e.g. 'BCH', 'POP', etc.)
   * @param subcategory The subcategory code (e.g. 'SUN', 'HPM', etc.)
   * @returns The numeric code for the subcategory
   */
  getSubcategoryNumericCode(layer: string, category: string, subcategory: string): number {
    try {
      const layerModule = getLayerModule(layer);
      if (!layerModule) return 0;

      const subcategories = layerModule.getSubcategories(category);
      const subcategoryData = subcategories.find(sub => sub.code === subcategory);
      return subcategoryData ? subcategoryData.numericCode : 0;
    } catch (error) {
      Logger.error(`Error getting subcategory numeric code for ${layer}.${category}.${subcategory}:`, error);
      return 0;
    }
  }

  /**
   * Get the alphabetic code for a subcategory from its numeric code
   * @param layer The layer code (e.g. 'W', 'S', etc.)
   * @param category The category code (e.g. 'BCH', 'POP', etc.)
   * @param numericCode The numeric code of the subcategory
   * @returns The alphabetic code for the subcategory
   */
  getSubcategoryAlphabeticCode(layer: string, category: string, numericCode: number): string {
    try {
      const layerModule = getLayerModule(layer);
      if (!layerModule) return '';

      const subcategories = layerModule.getSubcategories(category);
      const subcategoryData = subcategories.find(sub => sub.numericCode === numericCode);
      return subcategoryData ? subcategoryData.code : '';
    } catch (error) {
      Logger.error(`Error getting subcategory alphabetic code for ${layer}.${category}.${numericCode}:`, error);
      return '';
    }
  }

  /**
   * Convert from Machine Friendly Address (MFA) to Human Friendly Name (HFN)
   * @param mfa The MFA to convert (e.g. '5.001.001.001')
   * @returns The corresponding HFN (e.g. 'W.BCH.SUN.001')
   */
  convertMFAToHFN(mfa: string): string {
    if (!mfa) return '';

    // Split address into parts, handling file extensions
    const parts = mfa.split('.');
    const hasExtension = parts.length > 4;
    const extension = hasExtension ? parts.splice(4).join('.') : '';

    if (parts.length < 4) return mfa;

    const [layerNumeric, categoryNumeric, subcategoryNumeric, sequential] = parts;

    // Convert numeric codes to alphabetic
    const layer = this.getLayerCodeFromNumeric(parseInt(layerNumeric, 10));
    if (!layer) return mfa;

    const category = this.getCategoryAlphabeticCode(layer, parseInt(categoryNumeric, 10));
    if (!category) return mfa;

    const subcategory = this.getSubcategoryAlphabeticCode(layer, category, parseInt(subcategoryNumeric, 10));
    if (!subcategory) return mfa;

    // Format the HFN
    let hfn = `${layer}.${category}.${subcategory}.${sequential}`;
    if (hasExtension) {
      hfn += `.${extension}`;
    }

    return hfn;
  }

  /**
   * Get the layer code from its numeric code
   * @param numericCode The numeric code of the layer
   * @returns The alphabetic code for the layer
   */
  getLayerCodeFromNumeric(numericCode: number): string {
    for (const [code, layer] of Object.entries(taxonomyLookup.layers)) {
      if (layer.numericCode === numericCode) {
        return code;
      }
    }
    return '';
  }

  /**
   * Normalize an address for display by ensuring it uses the correct format
   * @param address The address to normalize
   * @param addressType The desired format ('hfn' or 'mfa')
   * @returns The normalized address
   */
  normalizeAddressForDisplay(address: string, addressType: 'hfn' | 'mfa' = 'hfn'): string {
    if (!address) return '';

    // Split into parts, handling possible file extensions
    const parts = address.split('.');
    const hasExtension = parts.length > 4;
    const extension = hasExtension ? parts.splice(4).join('.') : '';

    // If it's already an MFA format but we want HFN, convert it first
    if (/^\d+\.\d+/.test(address) && addressType === 'hfn') {
      address = this.convertMFAToHFN(address);
    }

    // Handle conversion from numeric codes to alphabetic codes in HFN
    if (addressType === 'hfn') {
      const segments = address.split('.');
      if (segments.length >= 4) {
        const [layer, category, subcategory, sequential] = segments;
        
        // Check if category is numeric and convert it
        if (/^\d+$/.test(category)) {
          const alphabeticCategory = this.getCategoryAlphabeticCode(layer, parseInt(category, 10));
          
          // Check if subcategory is numeric and convert it
          if (/^\d+$/.test(subcategory)) {
            const alphabeticSubcategory = this.getSubcategoryAlphabeticCode(
              layer, 
              alphabeticCategory, 
              parseInt(subcategory, 10)
            );
            address = `${layer}.${alphabeticCategory}.${alphabeticSubcategory}.${sequential}`;
          } else {
            address = `${layer}.${alphabeticCategory}.${subcategory}.${sequential}`;
          }
        }
        // If only subcategory is numeric, convert just that
        else if (/^\d+$/.test(subcategory)) {
          const alphabeticSubcategory = this.getSubcategoryAlphabeticCode(
            layer, 
            category, 
            parseInt(subcategory, 10)
          );
          address = `${layer}.${category}.${alphabeticSubcategory}.${sequential}`;
        }
      }
    }

    // Reattach extension if present
    if (hasExtension) {
      address = `${address}.${extension}`;
    }

    return address;
  }
}

// Export a singleton instance of the mapper
const taxonomyMapper = new TaxonomyMapper();
export default taxonomyMapper;