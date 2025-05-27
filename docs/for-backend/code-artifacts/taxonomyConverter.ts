// src/services/taxonomyConverter.ts
import { taxonomyService } from './simpleTaxonomyService';

// Now using the working SimpleTaxonomyService instead of the broken API taxonomyService

/**
 * TaxonomyConverter - Utility to convert between various taxonomy formats
 *
 * The NNA Registry System uses several representations of taxonomy items:
 * 1. Codes (alphabetic): POP, HPM - Used in human-friendly naming (HFN)
 * 2. Codes (numeric): 001, 007 - Used in machine-friendly addressing (MFA)
 * 3. Names: Pop, Pop_Hipster_Male_Stars - Used by backend validation
 *
 * This utility provides conversion between these formats to ensure
 * consistent communication between frontend and backend.
 */
export class TaxonomyConverter {
  /**
   * Converts numeric or alphabetic codes to alphabetic codes
   * Added for backward compatibility with existing code
   * @param layer Layer code (e.g., "S")
   * @param codeType Whether this is a 'category' or 'subcategory'
   * @param code The code to convert (numeric or alphabetic)
   * @param parentCategoryCode Optional parent category for subcategories
   * @returns Alphabetic code
   */
  static getAlphabeticCode(
    layer: string,
    codeType: 'category' | 'subcategory',
    code: string,
    parentCategoryCode?: string
  ): string {
    // If it's already alphabetic, return it
    if (!/^\d+$/.test(code)) {
      return code;
    }

    // Handle numeric codes
    if (codeType === 'category') {
      const categories = taxonomyService.getCategories(layer);
      const category = categories.find(
        c => parseInt(c.numericCode, 10) === parseInt(code, 10)
      );
      return category?.code || code;
    } else {
      // For subcategory, we need the parent category
      let canonicalCategoryCode = parentCategoryCode || '';

      // If parent is numeric, convert it first
      if (parentCategoryCode && /^\d+$/.test(parentCategoryCode)) {
        canonicalCategoryCode = this.getAlphabeticCode(
          layer,
          'category',
          parentCategoryCode
        );
      }

      const subcategories = taxonomyService.getSubcategories(
        layer,
        canonicalCategoryCode
      );
      const subcategory = subcategories.find(
        s => parseInt(s.numericCode, 10) === parseInt(code, 10)
      );
      return subcategory?.code || code;
    }
  }
  /**
   * Converts category code to category name
   * @param layer Layer code (e.g., "S")
   * @param categoryCode Category code (e.g., "POP" or "001")
   * @returns Category name (e.g., "Pop")
   */
  static getCategoryName(layer: string, categoryCode: string): string {
    // Handle numeric codes
    if (/^\d+$/.test(categoryCode)) {
      const categories = taxonomyService.getCategories(layer);
      const category = categories.find(
        c => parseInt(c.numericCode, 10) === parseInt(categoryCode, 10)
      );
      return category?.name || '';
    }

    // Handle alphabetic codes
    const categories = taxonomyService.getCategories(layer);
    const category = categories.find(c => c.code === categoryCode);
    return category?.name || '';
  }

  /**
   * Converts subcategory code to subcategory name
   * @param layer Layer code (e.g., "S")
   * @param categoryCode Category code (e.g., "POP" or "001")
   * @param subcategoryCode Subcategory code (e.g., "HPM" or "007")
   * @returns Subcategory name (e.g., "Pop_Hipster_Male_Stars")
   */
  static getSubcategoryName(
    layer: string,
    categoryCode: string,
    subcategoryCode: string
  ): string {
    // Ensure we have the canonical category code (alphabetic)
    let canonicalCategoryCode = categoryCode;
    if (/^\d+$/.test(categoryCode)) {
      const categories = taxonomyService.getCategories(layer);
      const category = categories.find(
        c => parseInt(c.numericCode, 10) === parseInt(categoryCode, 10)
      );
      canonicalCategoryCode = category?.code || categoryCode;
    }

    // Debug logging removed - now using working SimpleTaxonomyService

    // Handle numeric subcategory codes
    if (/^\d+$/.test(subcategoryCode)) {
      const subcategories = taxonomyService.getSubcategories(
        layer,
        canonicalCategoryCode
      );
      // Now using working SimpleTaxonomyService - should find subcategories correctly
      const subcategory = subcategories.find(
        s => parseInt(s.numericCode, 10) === parseInt(subcategoryCode, 10)
      );
      return subcategory?.name || '';
    }

    // Handle alphabetic subcategory codes
    const subcategories = taxonomyService.getSubcategories(
      layer,
      canonicalCategoryCode
    );
    // Now using working SimpleTaxonomyService - should find subcategories correctly
    const subcategory = subcategories.find(s => s.code === subcategoryCode);
    return subcategory?.name || '';
  }

  /**
   * Returns the appropriate category value to send to the backend API
   * @param layer Layer code (e.g., "S")
   * @param categoryCode Category code (e.g., "POP" or "001")
   * @returns Category name for backend (e.g., "Pop")
   */
  static getBackendCategoryValue(
    layer: string,
    categoryCode: string | undefined
  ): string {
    if (!categoryCode) return 'Pop'; // Default fallback
    return this.getCategoryName(layer, categoryCode);
  }

  /**
   * Returns the appropriate subcategory value to send to the backend API
   * @param layer Layer code (e.g., "S")
   * @param categoryCode Category code (e.g., "POP" or "001")
   * @param subcategoryCode Subcategory code (e.g., "HPM" or "007")
   * @returns Subcategory name for backend (e.g., "Pop_Hipster_Male_Stars")
   */
  static getBackendSubcategoryValue(
    layer: string,
    categoryCode: string | undefined,
    subcategoryCode: string | undefined
  ): string {
    if (!categoryCode || !subcategoryCode) return 'Base'; // Default fallback
    
    const subcategoryName = this.getSubcategoryName(layer, categoryCode, subcategoryCode);
    
    // If we get an empty name, fall back to 'Base'
    if (!subcategoryName) {
      console.warn(`Failed to get subcategory name for ${layer}.${categoryCode}.${subcategoryCode}, falling back to 'Base'`);
      return 'Base';
    }
    return subcategoryName;
  }

  /**
   * Verifies if a taxonomy combination is valid
   * @param layer Layer code (e.g., "S")
   * @param categoryCode Category code (e.g., "POP" or "001")
   * @param subcategoryCode Subcategory code (e.g., "HPM" or "007")
   * @returns Whether the combination is valid
   */
  static isValidCombination(
    layer: string,
    categoryCode: string,
    subcategoryCode: string
  ): boolean {
    // Ensure we have the canonical category code (alphabetic)
    let canonicalCategoryCode = categoryCode;
    if (/^\d+$/.test(categoryCode)) {
      const categories = taxonomyService.getCategories(layer);
      const category = categories.find(
        c => parseInt(c.numericCode, 10) === parseInt(categoryCode, 10)
      );
      canonicalCategoryCode = category?.code || categoryCode;
    }

    // Check if subcategory exists
    const subcategories = taxonomyService.getSubcategories(
      layer,
      canonicalCategoryCode
    );

    if (/^\d+$/.test(subcategoryCode)) {
      return subcategories.some(
        s => parseInt(s.numericCode, 10) === parseInt(subcategoryCode, 10)
      );
    }

    return subcategories.some(s => s.code === subcategoryCode);
  }
}
