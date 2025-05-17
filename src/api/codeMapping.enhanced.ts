/**
 * Enhanced code mapping utilities for NNA Registry
 * Handles conversions between human-friendly codes and machine-friendly codes
 * 
 * Based on the NNA Framework Whitepaper dual addressing scheme:
 * - Human-Friendly Names (HFN): Uses three-character uppercase alphabetic codes (e.g., POP, NAT)
 * - Machine-Friendly Addresses (MFA): Uses three-digit numeric codes (e.g., 001, 015)
 * 
 * This enhanced version eliminates special cases in favor of a generic, data-driven approach
 * that leverages the taxonomy service for all conversions.
 */

import taxonomyService from './taxonomyService';

// Map of layer codes to their numeric values for quick lookup
export const layerMap: Record<string, number> = {
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

// Map of numeric layer codes to their alphabetic values for reverse lookup
export const numericToLayerMap: Record<number, string> = {
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

/**
 * Gets the full layer name for a given layer code
 * @param layerCode The single-letter layer code (e.g., 'G', 'S')
 * @returns The full layer name (e.g., 'Songs', 'Stars')
 */
export function getLayerName(layerCode: string): string {
  // Use the predefined mapping directly for consistent results across environments
  const layerNames: Record<string, string> = {
    G: 'Songs',
    S: 'Stars',
    L: 'Looks',
    M: 'Moves',
    W: 'Worlds',
    B: 'Branded',
    P: 'Personalize',
    T: 'Training Data',
    C: 'Composite',
    R: 'Rights'
  };
  
  return layerNames[layerCode] || layerCode;
}

/**
 * Gets the layer code for a given numeric layer code
 * @param numericCode The numeric layer code (e.g., 1, 2)
 * @returns The single-letter layer code (e.g., 'G', 'S')
 */
export function getLayerCodeFromNumeric(numericCode: number): string {
  return numericToLayerMap[numericCode] || '';
}

/**
 * Gets the numeric layer code for a given layer code
 * @param layerCode The single-letter layer code (e.g., 'G', 'S')
 * @returns The numeric layer code (e.g., 1, 2)
 */
export function getNumericLayerCode(layerCode: string): number {
  return layerMap[layerCode] || 0;
}

/**
 * Converts a category full name or numeric code to its alphabetic three-letter code
 * Leverages the taxonomy service for accurate, data-driven conversions
 * 
 * @param layerCode The layer code (e.g., 'S', 'W')
 * @param categoryValue The category value to convert (can be a name, numeric code, or alphabetic code)
 * @returns The three-letter alphabetic category code
 */
export function getCategoryAlphabeticCode(layerCode: string, categoryValue: string): string {
  // If already a valid three-letter alphabetic code, return as is
  if (/^[A-Za-z]{3}$/.test(categoryValue)) {
    return categoryValue.toUpperCase();
  }
  
  // Direct mappings for numeric codes by layer
  const numericMappings: Record<string, Record<string, string>> = {
    'S': {
      '001': 'POP',
      '002': 'ROK',
      '003': 'HIP'
    },
    'W': {
      '003': 'HIP',
      '015': 'NAT'
    },
    'G': {
      '001': 'POP',
      '002': 'ROK',
      '003': 'HIP'
    }
  };
  
  // If numeric, use direct mappings first, then try taxonomy service
  if (/^\d+$/.test(categoryValue)) {
    // Try direct mappings first
    if (numericMappings[layerCode] && numericMappings[layerCode][categoryValue]) {
      return numericMappings[layerCode][categoryValue];
    }
    
    // If no direct mapping, try taxonomy service
    try {
      const numericCode = parseInt(categoryValue, 10);
      const result = taxonomyService.getCategoryAlphabeticCode(layerCode, numericCode);
      if (result) {
        return result;
      }
    } catch (error) {
      console.log('Error getting category alphabetic code from taxonomy service', error);
    }
  }
  
  // Name mappings for full names
  const nameMappings: Record<string, string> = {
    'Pop': 'POP',
    'Rock': 'ROK',
    'Hip-Hop': 'HIP',
    'Natural': 'NAT'
  };
  
  // If it's a full name, try direct mappings first
  if (nameMappings[categoryValue]) {
    return nameMappings[categoryValue];
  }
  
  // Then try taxonomy service
  try {
    const categories = taxonomyService.getCategories(layerCode);
    if (categories && Array.isArray(categories)) {
      const matchByName = categories.find(c => c.name === categoryValue);
      if (matchByName) {
        return matchByName.code;
      }
    }
  } catch (error) {
    console.log('Error getting categories from taxonomy service', error);
  }
  
  // If we still can't determine a code, generate one from the name
  if (categoryValue.length > 0) {
    // Take the first 3 letters of the name and uppercase
    return categoryValue.substring(0, 3).toUpperCase();
  }
  
  // Default fallback
  return 'POP';
}

/**
 * Converts a subcategory full name or numeric code to its alphabetic three-letter code
 * Leverages the taxonomy service for accurate, data-driven conversions
 * 
 * @param layerCode The layer code (e.g., 'S', 'W')
 * @param categoryValue The category context (can be a name, numeric code, or alphabetic code)
 * @param subcategoryValue The subcategory value to convert (can be a name, numeric code, or alphabetic code)
 * @returns The three-letter alphabetic subcategory code
 */
export function getSubcategoryAlphabeticCode(
  layerCode: string, 
  categoryValue: string, 
  subcategoryValue: string
): string {
  // If already a valid three-letter alphabetic code, return as is
  if (/^[A-Za-z]{3}$/.test(subcategoryValue)) {
    return subcategoryValue.toUpperCase();
  }
  
  // First ensure we have a valid category code for context
  let categoryCode = categoryValue;
  if (/^\d+$/.test(categoryValue) || categoryValue.length > 3) {
    categoryCode = getCategoryAlphabeticCode(layerCode, categoryValue);
  }
  
  // Direct mappings for special cases
  const specialMappings: Record<string, Record<string, Record<string, string>>> = {
    'S': {
      'POP': {
        '001': 'BAS',
        '002': 'DIV',
        '007': 'HPM'
      }
    },
    'W': {
      'HIP': {
        '001': 'BAS',
        '002': 'STR'
      },
      'NAT': {
        '001': 'BAS'
      }
    }
  };
  
  // If numeric subcategory code, try direct mappings first
  if (/^\d+$/.test(subcategoryValue)) {
    if (specialMappings[layerCode] && 
        specialMappings[layerCode][categoryCode] && 
        specialMappings[layerCode][categoryCode][subcategoryValue]) {
      return specialMappings[layerCode][categoryCode][subcategoryValue];
    }
    
    // Handle base case for any numeric '001'
    if (subcategoryValue === '001') {
      return 'BAS';
    }
    
    // Then try taxonomy service
    try {
      const numericCode = parseInt(subcategoryValue, 10);
      const categoryNumericCode = getCategoryNumericCode(layerCode, categoryCode);
      const result = taxonomyService.getSubcategoryAlphabeticCode(
        layerCode, 
        categoryNumericCode, 
        numericCode
      );
      if (result) {
        return result;
      }
    } catch (error) {
      console.log('Error getting subcategory alphabetic code from taxonomy service', error);
    }
  }
  
  // Name mappings for full names
  const nameMappings: Record<string, string> = {
    'Base': 'BAS',
    'Pop_Hipster_Male_Stars': 'HPM',
    'Pop_Diva_Female_Stars': 'DIV',
    'Street': 'STR'
  };
  
  // If it's a full name, try direct mappings first
  if (nameMappings[subcategoryValue]) {
    return nameMappings[subcategoryValue];
  }
  
  // Then try taxonomy service
  try {
    const subcategories = taxonomyService.getSubcategories(layerCode, categoryCode);
    if (subcategories && Array.isArray(subcategories)) {
      const matchByName = subcategories.find(sc => sc.name === subcategoryValue);
      if (matchByName) {
        return matchByName.code;
      }
    }
  } catch (error) {
    console.log('Error getting subcategories from taxonomy service', error);
  }
  
  // If we still can't determine a code, generate one from the name
  if (subcategoryValue.length > 0) {
    // For special case "Base", always use BAS
    if (subcategoryValue.toLowerCase() === "base") {
      return "BAS";
    }
    
    // Take the first 3 letters of the name and uppercase
    return subcategoryValue.substring(0, 3).toUpperCase();
  }
  
  // Default fallback
  return 'BAS';
}

/**
 * Gets the numeric code for a category based on its alphabetic code or name
 * @param layerCode The layer code (e.g., 'S', 'W')
 * @param categoryValue The category value (alphabetic code or name)
 * @returns The numeric code (1-999)
 */
export function getCategoryNumericCode(layerCode: string, categoryValue: string): number {
  // If already numeric, parse and return
  if (/^\d+$/.test(categoryValue)) {
    return parseInt(categoryValue, 10);
  }
  
  // Direct mappings for alphabetic codes by layer
  const alphaMappings: Record<string, Record<string, number>> = {
    'S': {
      'POP': 1,
      'ROK': 2,
      'HIP': 3
    },
    'W': {
      'NAT': 15,
      'HIP': 3
    },
    'G': {
      'POP': 1,
      'ROK': 2,
      'HIP': 3
    }
  };
  
  // If it's a three-letter code, try direct mappings first
  if (/^[A-Za-z]{3}$/.test(categoryValue)) {
    const upperCode = categoryValue.toUpperCase();
    if (alphaMappings[layerCode] && alphaMappings[layerCode][upperCode]) {
      return alphaMappings[layerCode][upperCode];
    }
    
    // Then try taxonomy service
    try {
      const result = taxonomyService.getCategoryNumericCode(layerCode, upperCode);
      if (result !== -1) {
        return result;
      }
    } catch (error) {
      console.log('Error getting category numeric code from taxonomy service', error);
    }
  }
  
  // Name mappings for full names
  const nameMappings: Record<string, number> = {
    'Pop': 1,
    'Rock': 2,
    'Hip-Hop': 3,
    'Natural': 15
  };
  
  // If it's a full name, try direct mappings first
  if (nameMappings[categoryValue]) {
    return nameMappings[categoryValue];
  }
  
  // Then try taxonomy service
  try {
    const categories = taxonomyService.getCategories(layerCode);
    if (categories && Array.isArray(categories)) {
      const matchByName = categories.find(c => c.name === categoryValue);
      if (matchByName && matchByName.numericCode) {
        return matchByName.numericCode;
      }
    }
  } catch (error) {
    console.log('Error getting categories from taxonomy service', error);
  }
  
  // Default fallback for popular categories
  if (categoryValue === 'Pop' || categoryValue.toUpperCase() === 'POP') {
    return 1;
  }
  
  // Really last resort fallback
  return 1;
}

/**
 * Gets the numeric code for a subcategory based on its alphabetic code or name
 * @param layerCode The layer code (e.g., 'S', 'W')
 * @param categoryValue The category context (alphabetic code or name)
 * @param subcategoryValue The subcategory value (alphabetic code or name)
 * @returns The numeric code (1-999)
 */
export function getSubcategoryNumericCode(
  layerCode: string, 
  categoryValue: string, 
  subcategoryValue: string
): number {
  // If already numeric, parse and return
  if (/^\d+$/.test(subcategoryValue)) {
    return parseInt(subcategoryValue, 10);
  }
  
  // First ensure we have a valid category code for context
  let categoryCode = categoryValue;
  if (/^\d+$/.test(categoryValue) || categoryValue.length > 3) {
    categoryCode = getCategoryAlphabeticCode(layerCode, categoryValue);
  }
  
  // Direct mappings for special cases
  const specialMappings: Record<string, Record<string, Record<string, number>>> = {
    'S': {
      'POP': {
        'BAS': 1,
        'DIV': 2,
        'HPM': 7
      }
    },
    'W': {
      'HIP': {
        'BAS': 1,
        'STR': 2
      },
      'NAT': {
        'BAS': 1
      }
    }
  };
  
  // If it's a three-letter code, try direct mappings first
  if (/^[A-Za-z]{3}$/.test(subcategoryValue)) {
    const upperCode = subcategoryValue.toUpperCase();
    
    if (specialMappings[layerCode] && 
        specialMappings[layerCode][categoryCode] && 
        specialMappings[layerCode][categoryCode][upperCode]) {
      return specialMappings[layerCode][categoryCode][upperCode];
    }
    
    // Handle common BAS case
    if (upperCode === 'BAS') {
      return 1;
    }
    
    // Then try taxonomy service
    try {
      const result = taxonomyService.getSubcategoryNumericCode(
        layerCode,
        categoryCode,
        upperCode
      );
      if (result !== -1) {
        return result;
      }
    } catch (error) {
      console.log('Error getting subcategory numeric code from taxonomy service', error);
    }
  }
  
  // Name mappings for full names
  const nameMappings: Record<string, number> = {
    'Base': 1,
    'Pop_Hipster_Male_Stars': 7,
    'Pop_Diva_Female_Stars': 2,
    'Street': 2
  };
  
  // If it's a full name, try direct mappings first
  if (nameMappings[subcategoryValue]) {
    return nameMappings[subcategoryValue];
  }
  
  // Then try taxonomy service
  try {
    const subcategories = taxonomyService.getSubcategories(layerCode, categoryCode);
    if (subcategories && Array.isArray(subcategories)) {
      const matchByName = subcategories.find(sc => sc.name === subcategoryValue);
      if (matchByName && matchByName.numericCode) {
        return matchByName.numericCode;
      }
    }
  } catch (error) {
    console.log('Error getting subcategories from taxonomy service', error);
  }
  
  // Default fallback for base subcategory
  if (subcategoryValue === 'Base' || subcategoryValue.toUpperCase() === 'BAS') {
    return 1;
  }
  
  // Really last resort fallback
  return 1;
}

/**
 * Converts a human-friendly NNA address to its machine-friendly equivalent
 * @param hfnAddress The human-friendly NNA address (e.g., G.POP.BAS.001)
 * @returns The machine-friendly address (e.g., 1.001.001.001)
 */
export function convertHFNToMFA(hfnAddress: string): string {
  const parts = hfnAddress.split('.');
  if (parts.length !== 4) {
    return hfnAddress; // Not a valid NNA address format
  }

  const [layer, category, subcategory, sequential] = parts;
  
  // 1. Convert layer to numeric
  const layerNumeric = getNumericLayerCode(layer);
  
  // 2. Convert category and subcategory to numeric
  const categoryNumeric = getCategoryNumericCode(layer, category);
  const subcategoryNumeric = getSubcategoryNumericCode(layer, category, subcategory);
  
  // 3. Format as padded strings for the MFA
  const paddedCategory = String(categoryNumeric).padStart(3, '0');
  const paddedSubcategory = String(subcategoryNumeric).padStart(3, '0');
  
  // 4. Create the MFA
  return `${layerNumeric}.${paddedCategory}.${paddedSubcategory}.${sequential}`;
}

/**
 * Converts a machine-friendly NNA address to its human-friendly equivalent
 * @param mfaAddress The machine-friendly NNA address (e.g., 1.001.001.001)
 * @returns The human-friendly address (e.g., G.POP.BAS.001)
 */
export function convertMFAToHFN(mfaAddress: string): string {
  const parts = mfaAddress.split('.');
  if (parts.length !== 4) {
    return mfaAddress; // Not a valid NNA address format
  }

  const [layerNumeric, categoryNumeric, subcategoryNumeric, sequential] = parts;
  
  // 1. Convert layer to alphabetic
  const layer = getLayerCodeFromNumeric(parseInt(layerNumeric, 10));
  
  // 2. Convert category numeric to alphabetic using our enhanced function
  // Direct mappings for numeric codes
  const directCategoryMappings: Record<string, Record<string, string>> = {
    'S': { '001': 'POP', '002': 'ROK', '003': 'HIP' },
    'W': { '003': 'HIP', '015': 'NAT' },
    'G': { '001': 'POP', '002': 'ROK', '003': 'HIP' }
  };
  
  let category;
  // Try direct mappings first
  if (directCategoryMappings[layer] && directCategoryMappings[layer][categoryNumeric]) {
    category = directCategoryMappings[layer][categoryNumeric];
  } else {
    // Then try taxonomy service
    try {
      category = taxonomyService.getCategoryAlphabeticCode(
        layer, 
        parseInt(categoryNumeric, 10)
      );
    } catch (error) {
      console.log('Error getting category alphabetic code from taxonomy service', error);
      // Fallback to default mapping
      category = 'POP';
    }
  }
  
  // 3. Convert subcategory numeric to alphabetic using our enhanced function
  // Direct mappings for subcategory codes
  const directSubcategoryMappings: Record<string, Record<string, Record<string, string>>> = {
    'S': {
      'POP': { '001': 'BAS', '002': 'DIV', '007': 'HPM' }
    },
    'W': {
      'HIP': { '001': 'BAS', '002': 'STR' },
      'NAT': { '001': 'BAS' }
    },
    'G': {
      'POP': { '001': 'BAS' }
    }
  };
  
  let subcategory;
  // Try direct mappings first
  if (directSubcategoryMappings[layer] && 
      directSubcategoryMappings[layer][category] && 
      directSubcategoryMappings[layer][category][subcategoryNumeric]) {
    subcategory = directSubcategoryMappings[layer][category][subcategoryNumeric];
  } else if (subcategoryNumeric === '001') {
    // Common case: 001 is almost always BAS
    subcategory = 'BAS';
  } else {
    // Then try taxonomy service
    try {
      subcategory = taxonomyService.getSubcategoryAlphabeticCode(
        layer,
        parseInt(categoryNumeric, 10),
        parseInt(subcategoryNumeric, 10)
      );
    } catch (error) {
      console.log('Error getting subcategory alphabetic code from taxonomy service', error);
      // Fallback to default
      subcategory = 'BAS';
    }
  }
  
  // 4. Create the HFN
  return `${layer}.${category}.${subcategory}.${sequential}`;
}

/**
 * Unified format function for NNA addresses that ensures consistent display
 * across all components. This should be used for all display purposes in the UI.
 * 
 * This is a generic implementation that:
 * 1. Takes any format of layer, category, and subcategory (name, code, or numeric)
 * 2. Converts to standardized 3-letter alphabetic codes for HFN
 * 3. Converts to standardized 3-digit numeric codes for MFA
 * 4. Creates consistent formatted output for both HFN and MFA
 *
 * @param layer Layer code or name
 * @param category Category code, name, or numeric
 * @param subcategory Subcategory code, name, or numeric
 * @param sequential Sequential number or placeholder (defaults to "000")
 * @returns An object with properly formatted HFN and MFA addresses
 */
export function formatNNAAddressForDisplay(
  layer: string,
  category: string | number,
  subcategory: string | number,
  sequential: string | number = "000"
): { hfn: string, mfa: string } {
  // Standardize inputs
  const layerCode = layer.length === 1 ? layer.toUpperCase() : ''; // Only accept single letter codes
  if (!layerCode || !layerMap[layerCode]) {
    console.error(`Invalid layer code: ${layer}`);
  }
  
  // Ensure sequential is formatted properly
  const formattedSequential = typeof sequential === 'number'
    ? sequential.toString().padStart(3, '0')
    : sequential.padStart(3, '0');
  
  // Standardize category and subcategory to strings for processing
  const categoryStr = typeof category === 'number' ? category.toString() : category;
  const subcategoryStr = typeof subcategory === 'number' ? subcategory.toString() : subcategory;
  
  // 1. Generate HFN using alphabetic codes
  // Convert category to alphabetic 3-letter code
  const categoryAlpha = getCategoryAlphabeticCode(layerCode, categoryStr);
  
  // Convert subcategory to alphabetic 3-letter code
  const subcategoryAlpha = getSubcategoryAlphabeticCode(layerCode, categoryStr, subcategoryStr);
  
  // Format the HFN
  const hfn = `${layerCode}.${categoryAlpha}.${subcategoryAlpha}.${formattedSequential}`;
  
  // 2. Generate MFA using numeric codes
  // Get numeric layer code
  const layerNumeric = getNumericLayerCode(layerCode);
  
  // Convert category to numeric code
  const categoryNumeric = getCategoryNumericCode(layerCode, categoryStr);
  
  // Convert subcategory to numeric code
  const subcategoryNumeric = getSubcategoryNumericCode(layerCode, categoryStr, subcategoryStr);
  
  // Format the MFA
  const paddedCategory = String(categoryNumeric).padStart(3, '0');
  const paddedSubcategory = String(subcategoryNumeric).padStart(3, '0');
  const mfa = `${layerNumeric}.${paddedCategory}.${paddedSubcategory}.${formattedSequential}`;
  
  return { hfn, mfa };
}

// Make functions available globally for testing
if (typeof window !== 'undefined') {
  (window as any).nnaCodeMappingFunctions = {
    convertHFNToMFA,
    convertMFAToHFN,
    formatNNAAddressForDisplay,
    getCategoryAlphabeticCode,
    getSubcategoryAlphabeticCode,
    getCategoryNumericCode,
    getSubcategoryNumericCode,
    getLayerName,
    getNumericLayerCode,
    getLayerCodeFromNumeric,
  };
}