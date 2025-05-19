/**
 * Standard Taxonomy Code Mapping Utilities
 *
 * This file provides functions for mapping between different code formats
 * and converting between Human-Friendly Names (HFN) and Machine-Friendly Addresses (MFA).
 *
 * It uses the flattened taxonomy lookups directly without special case handling.
 *
 * Based on the NNA Framework Whitepaper dual addressing scheme:
 * - Human-Friendly Names (HFN): Uses three-character uppercase alphabetic codes (e.g., POP, NAT)
 * - Machine-Friendly Addresses (MFA): Uses three-digit numeric codes (e.g., 001, 015)
 */

import { LAYER_LOOKUPS } from '../taxonomyLookup/constants';

// Comprehensive layer mappings with full metadata
export const layerMappings: Record<
  string,
  { name: string; numeric: number; description?: string }
> = {
  G: { name: 'Songs', numeric: 1, description: 'Licensed music tracks' },
  S: {
    name: 'Stars',
    numeric: 2,
    description: 'Virtual avatars and characters',
  },
  L: { name: 'Looks', numeric: 3, description: 'Wardrobe and styling assets' },
  M: {
    name: 'Moves',
    numeric: 4,
    description: 'Choreography and dance assets',
  },
  W: { name: 'Worlds', numeric: 5, description: 'Environmental backdrops' },
  B: {
    name: 'Branded',
    numeric: 6,
    description: 'Premium virtual product placements',
  },
  P: {
    name: 'Personalize',
    numeric: 7,
    description: 'User-uploaded customizations',
  },
  T: {
    name: 'Training Data',
    numeric: 8,
    description: 'Datasets for AI training',
  },
  C: {
    name: 'Composite',
    numeric: 9,
    description: 'Aggregated multi-layer assets',
  },
  R: {
    name: 'Rights',
    numeric: 10,
    description: 'Provenance and rights tracking',
  },
};

// Comprehensive bidirectional category code mappings
// Alphabetic to Numeric (used in HFN to MFA conversion)
export const categoryAlphaToNumeric: Record<string, string> = {
  POP: '001', // Pop
  ROK: '002',
  RCK: '002', // Rock (with alternate code)
  HIP: '003', // Hip-Hop
  DNC: '004', // Dance
  DSF: '005', // Disco-Funk
  RNB: '006', // R&B
  JZZ: '007', // Jazz
  JPO: '008', // J-Pop
  BOL: '009', // Bollywood
  LAT: '010', // Latin
  IND: '011', // Indie
  ALT: '012', // Alternative
  WLD: '013', // World
  RFK: '014', // Retrofunk
  NAT: '015', // Nature (especially for Worlds)
  KPO: '016', // K-Pop
  HYP: '017', // Hyperpop
  AFB: '018', // Afrobeat
  MOD: '019', // Modern
  BLU: '020', // Blues
  CLS: '021', // Classical
  URL: '022', // Urban
  SPC: '023', // Space
  SCI: '024', // Science
  FAN: '025', // Fantasy
  BAS: '001', // Base (default for subcategories)
};

// Numeric to Alphabetic (used in MFA to HFN conversion)
export const categoryNumericToAlpha: Record<string, string> = {
  '001': 'POP', // Pop
  '002': 'ROK', // Rock
  '003': 'HIP', // Hip-Hop
  '004': 'DNC', // Dance
  '005': 'DSF', // Disco-Funk
  '006': 'RNB', // R&B
  '007': 'JZZ', // Jazz
  '008': 'JPO', // J-Pop
  '009': 'BOL', // Bollywood
  '010': 'LAT', // Latin
  '011': 'IND', // Indie
  '012': 'ALT', // Alternative
  '013': 'WLD', // World
  '014': 'RFK', // Retrofunk
  '015': 'NAT', // Nature (especially for Worlds)
  '016': 'KPO', // K-Pop
  '017': 'HYP', // Hyperpop
  '018': 'AFB', // Afrobeat
  '019': 'MOD', // Modern
  '020': 'BLU', // Blues
  '021': 'CLS', // Classical
  '022': 'URL', // Urban
  '023': 'SPC', // Space
  '024': 'SCI', // Science
  '025': 'FAN', // Fantasy
};

// Special subcategory mappings for different layers
// This handles the case where the same numeric code maps to different
// alphabetic codes depending on the layer and category
export const layerSpecificSubcategoryMappings: Record<
  string,
  Record<string, Record<string, string>>
> = {
  // Stars layer subcategory mappings
  S: {
    // POP category subcategories for Stars
    POP: {
      // Alpha to Numeric
      BAS: '001', // Base
      DIV: '002', // Pop_Diva_Female_Stars
      IDF: '003', // Pop_Idol_Female_Stars
      LGF: '004', // Pop_Legend_Female_Stars
      LGM: '005', // Pop_Legend_Male_Stars
      ICM: '006', // Pop_Icon_Male_Stars
      HPM: '007', // Pop_Hipster_Male_Stars - Special case
    },
    // Numeric to Alpha for POP category in Stars layer
    POP_NUMERIC: {
      '001': 'BAS', // Base
      '002': 'DIV', // Pop_Diva_Female_Stars
      '003': 'IDF', // Pop_Idol_Female_Stars
      '004': 'LGF', // Pop_Legend_Female_Stars
      '005': 'LGM', // Pop_Legend_Male_Stars
      '006': 'ICM', // Pop_Icon_Male_Stars
      '007': 'HPM', // Pop_Hipster_Male_Stars
    },
  },
  // Worlds layer special subcategory mappings
  W: {
    // For NAT (Nature) category in Worlds
    NAT: {
      BAS: '001', // Base/Default
      FOR: '002', // Forest
      OCN: '003', // Ocean
      MNT: '004', // Mountain
      DST: '005', // Desert
    },
    // Urban environments in Worlds
    HIP: {
      BAS: '001', // Base/Default
      STR: '002', // Street
      CBD: '003', // City Center
      SUB: '004', // Suburb
      FUT: '005', // Futuristic
    },
  },
  // Default subcategory mappings for any layer/category combination
  default: {
    default: {
      BAS: '001', // Base is 001 in nearly all taxonomies
    },
  },
};

/**
 * Convert a layer alphabetic code to its numeric code
 * @param layerCode Layer alphabetic code (e.g., 'S', 'W')
 * @returns Numeric code (e.g., 2, 5)
 */
export function getNumericLayerCode(layerCode: string): number {
  return layerMappings[layerCode]?.numeric || 0;
}

/**
 * Convert a numeric layer code to its alphabetic code
 * @param numericCode Layer numeric code (e.g., 2, 5)
 * @returns Alphabetic code (e.g., 'S', 'W')
 */
export function getLayerCodeFromNumeric(numericCode: number): string {
  for (const [code, details] of Object.entries(layerMappings)) {
    if (details.numeric === numericCode) {
      return code;
    }
  }
  return '';
}

/**
 * Get the full name of a layer from its code
 * @param layerCode Layer code (e.g., 'S', 'W')
 * @returns Full layer name (e.g., 'Stars', 'Worlds')
 */
export function getLayerName(layerCode: string): string {
  return layerMappings[layerCode]?.name || '';
}

/**
 * Gets the alphabetic code for a category from a numeric code
 * @param layerCode Layer code
 * @param categoryValue Category numeric code or name
 * @returns Alphabetic category code
 */
export function getCategoryAlphabeticCode(
  layerCode: string,
  categoryValue: string
): string {
  // If already alphabetic, return as is
  if (!/^\d+$/.test(categoryValue)) {
    // Special case for 'Natural' -> 'NAT'
    if (categoryValue === 'Natural') return 'NAT';
    return categoryValue;
  }

  // Pad numeric code to 3 digits for lookup
  const paddedCode = categoryValue.padStart(3, '0');
  return categoryNumericToAlpha[paddedCode] || categoryValue;
}

/**
 * Gets the numeric code for a category
 * @param layerCode Layer code
 * @param categoryValue Category alphabetic code or name
 * @returns Numeric category code
 */
export function getCategoryNumericCode(
  layerCode: string,
  categoryValue: string
): number {
  // If already numeric, parse and return
  if (/^\d+$/.test(categoryValue)) {
    return parseInt(categoryValue, 10);
  }

  // Look up from alpha to numeric mapping
  const numericCode = categoryAlphaToNumeric[categoryValue];
  return numericCode ? parseInt(numericCode, 10) : 1;
}

/**
 * Gets the alphabetic code for a subcategory
 * @param layerCode Layer code
 * @param category Category code
 * @param subcategoryValue Subcategory numeric code or name
 * @returns Alphabetic subcategory code
 */
export function getSubcategoryAlphabeticCode(
  layerCode: string,
  category: string,
  subcategoryValue: string
): string {
  // If it's "Base", standardize to "BAS"
  if (subcategoryValue === 'Base') return 'BAS';

  // If already alphabetic, return as is
  if (!/^\d+$/.test(subcategoryValue)) {
    return subcategoryValue;
  }

  // Default for numeric code '001' is 'BAS'
  if (subcategoryValue === '001' || subcategoryValue === '1') {
    return 'BAS';
  }

  // Look up the subcategory from LAYER_LOOKUPS
  try {
    const numericCode = subcategoryValue.padStart(3, '0');

    // Try to find in the taxonomy
    for (const [code, info] of Object.entries(LAYER_LOOKUPS[layerCode] || {})) {
      if (code.includes('.') && info.numericCode === numericCode) {
        // Return the part after the dot
        return code.split('.')[1];
      }
    }
  } catch (error) {
    console.error('Error looking up subcategory alphabetic code:', error);
  }

  // Return as is if nothing else matches
  return subcategoryValue;
}

/**
 * Gets the numeric code for a subcategory
 * @param layerCode Layer code
 * @param category Category code
 * @param subcategoryValue Subcategory alphabetic code or name
 * @returns Numeric subcategory code
 */
export function getSubcategoryNumericCode(
  layerCode: string,
  category: string,
  subcategoryValue: string
): number {
  // If already numeric, parse and return
  if (/^\d+$/.test(subcategoryValue)) {
    return parseInt(subcategoryValue, 10);
  }

  // Base case is most common
  if (subcategoryValue === 'Base' || subcategoryValue === 'BAS') {
    return 1;
  }

  // Look up from layer-specific mappings
  try {
    if (
      layerSpecificSubcategoryMappings[layerCode] &&
      layerSpecificSubcategoryMappings[layerCode][category] &&
      layerSpecificSubcategoryMappings[layerCode][category][subcategoryValue]
    ) {
      const code =
        layerSpecificSubcategoryMappings[layerCode][category][subcategoryValue];
      return parseInt(code, 10);
    }
  } catch (error) {
    console.error('Error looking up subcategory numeric code:', error);
  }

  // Try to find in the taxonomy
  try {
    const fullSubcategoryKey = `${category}.${subcategoryValue}`;
    const subcategoryEntry = LAYER_LOOKUPS[layerCode]?.[fullSubcategoryKey];

    if (subcategoryEntry && subcategoryEntry.numericCode) {
      return parseInt(subcategoryEntry.numericCode, 10);
    }
  } catch (error) {
    console.error('Error looking up subcategory in taxonomy:', error);
  }

  return 1;
}

/**
 * Converts a human-friendly NNA address to its machine-friendly equivalent
 * @param hfnAddress The human-friendly NNA address (e.g., G.POP.SHK.001)
 * @returns The machine-friendly address (e.g., 1.001.003.001)
 */
export function convertHFNToMFA(hfnAddress: string): string {
  const parts = hfnAddress.split('.');
  if (parts.length < 4) {
    return hfnAddress; // Not a valid NNA address format
  }

  const [layer, category, subcategory, sequential, ...rest] = parts;

  // 1. Convert layer to numeric
  const layerNumeric = getNumericLayerCode(layer);

  // 2. Convert category to numeric (format as 3-digit code)
  const categoryNumeric = getCategoryNumericCode(layer, category);
  const formattedCategoryNumeric = String(categoryNumeric).padStart(3, '0');

  // 3. Convert subcategory to numeric (format as 3-digit code)
  const subcategoryNumeric = getSubcategoryNumericCode(
    layer,
    category,
    subcategory
  );
  const formattedSubcategoryNumeric = String(subcategoryNumeric).padStart(
    3,
    '0'
  );

  // 4. Format as machine-friendly address
  let mfa = `${layerNumeric}.${formattedCategoryNumeric}.${formattedSubcategoryNumeric}.${sequential}`;

  // Add any remaining parts (like file extensions)
  if (rest.length > 0) {
    mfa += '.' + rest.join('.');
  }

  return mfa;
}

/**
 * Converts a machine-friendly NNA address to its human-friendly equivalent
 * @param mfaAddress The machine-friendly NNA address (e.g., 1.001.003.001)
 * @returns The human-friendly address (e.g., G.POP.SHK.001)
 */
export function convertMFAToHFN(mfaAddress: string): string {
  const parts = mfaAddress.split('.');
  if (parts.length < 4) {
    return mfaAddress; // Not a valid NNA address format
  }

  const [
    layerNumeric,
    categoryNumeric,
    subcategoryNumeric,
    sequential,
    ...rest
  ] = parts;

  // 1. Convert numeric layer to alphabetic
  const layer = getLayerCodeFromNumeric(parseInt(layerNumeric, 10));

  // 2. Convert numeric category to alphabetic
  const category = getCategoryAlphabeticCode(layer, categoryNumeric);

  // 3. Convert numeric subcategory to alphabetic
  const subcategory = getSubcategoryAlphabeticCode(
    layer,
    category,
    subcategoryNumeric
  );

  // 4. Format as human-friendly address
  let hfn = `${layer}.${category}.${subcategory}.${sequential}`;

  // Add any remaining parts (like file extensions)
  if (rest.length > 0) {
    hfn += '.' + rest.join('.');
  }

  return hfn;
}

/**
 * Unified format function for NNA addresses that ensures consistent display
 * @param layer Layer code
 * @param category Category code
 * @param subcategory Subcategory code
 * @param sequential Sequential number or placeholder (defaults to "000")
 * @returns An object with properly formatted HFN and MFA addresses
 */
export function formatNNAAddressForDisplay(
  layer: string,
  category: string,
  subcategory: string,
  sequential: string | number = '000'
): { hfn: string; mfa: string } {
  // Format sequential number
  const seq =
    typeof sequential === 'number'
      ? sequential.toString().padStart(3, '0')
      : sequential.padStart(3, '0');

  // Create HFN
  const hfn = `${layer}.${category}.${subcategory}.${seq}`;

  // Create MFA by converting HFN
  const mfa = convertHFNToMFA(hfn);

  return { hfn, mfa };
}

/**
 * Attempts to convert a numeric code to an alphabetic one
 * @param code The code to process
 * @param layerCode Optional layer code for context
 * @param categoryName Optional category name for context
 * @returns The alphabetic code
 */
export function getAlphabeticCode(
  code: string,
  layerCode?: string,
  categoryName?: string
): string {
  // If already alphabetic, return as is
  if (/^[A-Za-z]+$/.test(code)) {
    return code.toUpperCase();
  }

  // If numeric, try to convert to alphabetic using categoryNumericToAlpha mapping
  if (/^\d+$/.test(code)) {
    const paddedCode = code.padStart(3, '0');
    if (categoryNumericToAlpha[paddedCode]) {
      return categoryNumericToAlpha[paddedCode];
    }

    // If a layer code is provided, try to look up the code in the layer's lookups
    if (layerCode && LAYER_LOOKUPS[layerCode]) {
      for (const [codeKey, info] of Object.entries(LAYER_LOOKUPS[layerCode])) {
        // Only check top-level entries (categories, not subcategories)
        if (!codeKey.includes('.') && info.numericCode === paddedCode) {
          return codeKey;
        }
      }
    }
  }

  return code;
}

/**
 * Generates a formatted NNA address string
 * @param layer Layer code
 * @param category Category code
 * @param subcategory Subcategory code
 * @param sequential Sequential number or placeholder (defaults to "000")
 * @returns Formatted NNA address
 */
export function formatNNAAddress(
  layer: string,
  category: string,
  subcategory: string,
  sequential: string | number = '000'
): string {
  // Format sequential number
  const seq =
    typeof sequential === 'number'
      ? sequential.toString().padStart(3, '0')
      : sequential.padStart(3, '0');

  return `${layer}.${category}.${subcategory}.${seq}`;
}

// Make functions available globally for testing
if (typeof window !== 'undefined') {
  (window as any).nnaCodeMappingFunctions = {
    convertHFNToMFA,
    convertMFAToHFN,
    formatNNAAddress,
    formatNNAAddressForDisplay,
    getAlphabeticCode,
    layerMappings,
    categoryAlphaToNumeric,
    categoryNumericToAlpha,
    layerSpecificSubcategoryMappings,
    getNumericLayerCode,
    getLayerCodeFromNumeric,
    getLayerName,
    getCategoryAlphabeticCode,
    getCategoryNumericCode,
    getSubcategoryAlphabeticCode,
    getSubcategoryNumericCode,
  };
}
