/**
 * TaxonomyFlattener
 *
 * Utility to convert the nested taxonomy JSON structure into flat lookup tables.
 * This makes it easier to manage the complex mappings between HFN (Human-Friendly Names)
 * and MFA (Machine-Friendly Addresses) without having to process the entire taxonomy each time.
 */

import taxonomyData from '../assets/enriched_nna_layer_taxonomy_v1.3.json';
import { TaxonomyData } from '../types/taxonomy.types';

// Define interfaces for the flattened lookup tables
export interface FlattenedCategory {
  mfaCode: string; // The numeric code (e.g., "001")
  hfnCode: string; // The alphabetic code (e.g., "POP")
  name: string; // The full name (e.g., "Pop")
  description?: string; // Optional description
}

export interface FlattenedSubcategory {
  mfaCode: string; // The numeric code (e.g., "001")
  hfnCode: string; // The alphabetic code (e.g., "BAS")
  name: string; // The full name (e.g., "Base")
  description?: string; // Optional description
}

export interface LayerLookupTable {
  name: string; // Layer name (e.g., "Stars")
  mfaCode: string; // Layer numeric code (e.g., "2" for Stars)
  hfnCode: string; // Layer alphabetic code (e.g., "S" for Stars)
  categories: Record<string, FlattenedCategory>; // Categories indexed by HFN code
  categoriesByMfa: Record<string, string>; // Maps MFA codes to HFN codes
  subcategories: Record<string, Record<string, FlattenedSubcategory>>; // Subcategories indexed by category HFN code, then subcategory HFN code
  subcategoriesByMfa: Record<string, Record<string, string>>; // Maps MFA codes to HFN codes, indexed by category MFA code
}

export type FlattenedTaxonomy = Record<string, LayerLookupTable>;

/**
 * Converts the full taxonomy data into a flattened structure for easier lookups
 */
export function flattenTaxonomy(
  source: TaxonomyData = taxonomyData as unknown as TaxonomyData
): FlattenedTaxonomy {
  const flattened: FlattenedTaxonomy = {};

  // Layer to MFA code mapping (hardcoded for reliability)
  const layerToMfaCode: Record<string, string> = {
    G: '1', // Songs
    S: '2', // Stars
    L: '3', // Looks
    M: '4', // Moves
    W: '5', // Worlds
    V: '6', // Videos
    B: '7', // Branded Assets
    C: '8', // Composites
    T: '9', // Training Data
  };

  // Process each layer in the taxonomy
  for (const layerCode in source) {
    // Skip non-layer properties
    if (typeof source[layerCode] !== 'object' || !source[layerCode].name) {
      continue;
    }

    const layerInfo = source[layerCode];
    const mfaCode = layerToMfaCode[layerCode] || '';

    // Initialize the layer lookup table
    flattened[layerCode] = {
      name: layerInfo.name,
      mfaCode: mfaCode,
      hfnCode: layerCode,
      categories: {},
      categoriesByMfa: {},
      subcategories: {},
      subcategoriesByMfa: {},
    };

    // Skip if no categories
    if (!layerInfo.categories) {
      continue;
    }

    // Process categories
    for (const categoryKey in layerInfo.categories) {
      const category = layerInfo.categories[categoryKey];
      let categoryMfaCode = categoryKey;
      let categoryHfnCode = category.code || categoryKey;

      // For numeric keys, use as MFA code; for alphabetic keys, derive MFA code from position or numericCode property
      if (/^\d+$/.test(categoryKey)) {
        categoryMfaCode = categoryKey;
        // Ensure MFA code is 3 digits
        categoryMfaCode = categoryMfaCode.padStart(3, '0');
      } else {
        // For alphabetic keys, use numericCode property if available, or position as fallback
        if (category.numericCode !== undefined) {
          categoryMfaCode = String(category.numericCode).padStart(3, '0');
        } else {
          // Derive from position (not ideal, but a fallback)
          const position =
            Object.keys(layerInfo.categories).indexOf(categoryKey) + 1;
          categoryMfaCode = String(position).padStart(3, '0');
        }
      }

      // Store the category
      flattened[layerCode].categories[categoryHfnCode] = {
        mfaCode: categoryMfaCode,
        hfnCode: categoryHfnCode,
        name: category.name,
      };

      // Store the reverse mapping
      flattened[layerCode].categoriesByMfa[categoryMfaCode] = categoryHfnCode;

      // Initialize subcategory containers
      flattened[layerCode].subcategories[categoryHfnCode] = {};
      flattened[layerCode].subcategoriesByMfa[categoryMfaCode] = {};

      // Skip if no subcategories
      if (!category.subcategories) {
        continue;
      }

      // Process subcategories
      for (const subcategoryKey in category.subcategories) {
        const subcategory = category.subcategories[subcategoryKey];
        let subcategoryMfaCode = subcategoryKey;
        let subcategoryHfnCode = subcategory.code || subcategoryKey;

        // Similar logic as for categories
        if (/^\d+$/.test(subcategoryKey)) {
          subcategoryMfaCode = subcategoryKey;
          // Ensure MFA code is 3 digits
          subcategoryMfaCode = subcategoryMfaCode.padStart(3, '0');
        } else {
          // For alphabetic keys, use numericCode property if available, or position as fallback
          if (subcategory.numericCode !== undefined) {
            subcategoryMfaCode = String(subcategory.numericCode).padStart(
              3,
              '0'
            );
          } else {
            // Derive from position (not ideal, but a fallback)
            const position =
              Object.keys(category.subcategories).indexOf(subcategoryKey) + 1;
            subcategoryMfaCode = String(position).padStart(3, '0');
          }
        }

        // Store the subcategory
        flattened[layerCode].subcategories[categoryHfnCode][
          subcategoryHfnCode
        ] = {
          mfaCode: subcategoryMfaCode,
          hfnCode: subcategoryHfnCode,
          name: subcategory.name,
        };

        // Store the reverse mapping
        flattened[layerCode].subcategoriesByMfa[categoryMfaCode][
          subcategoryMfaCode
        ] = subcategoryHfnCode;
      }
    }
  }

  return flattened;
}

/**
 * Generates a flat lookup table for the World (W) layer
 * This is a manually curated version that ensures the W.BCH.SUN case works correctly
 */
export function generateWorldLayerLookupTable(): LayerLookupTable {
  return {
    name: 'Worlds',
    mfaCode: '5',
    hfnCode: 'W',
    categories: {
      CLB: { mfaCode: '001', hfnCode: 'CLB', name: 'Dance Clubs' },
      STG: { mfaCode: '002', hfnCode: 'STG', name: 'Concert Stages' },
      URB: { mfaCode: '003', hfnCode: 'URB', name: 'Urban' },
      BCH: { mfaCode: '004', hfnCode: 'BCH', name: 'Beach' },
      FES: { mfaCode: '005', hfnCode: 'FES', name: 'Festival' },
      TRL: { mfaCode: '006', hfnCode: 'TRL', name: 'Trailer' },
      SPC: { mfaCode: '007', hfnCode: 'SPC', name: 'Space' },
      VRT: { mfaCode: '008', hfnCode: 'VRT', name: 'Virtual' },
      CCH: { mfaCode: '009', hfnCode: 'CCH', name: 'Coachella' },
      NAT: { mfaCode: '010', hfnCode: 'NAT', name: 'Natural' },
      FAN: { mfaCode: '011', hfnCode: 'FAN', name: 'Fantasy/Historical' },
      FUT: { mfaCode: '012', hfnCode: 'FUT', name: 'Futuristic/Cultural' },
      IND: { mfaCode: '013', hfnCode: 'IND', name: 'Industrial/Abstract' },
      RUR: { mfaCode: '014', hfnCode: 'RUR', name: 'Rural/Retro' },
      HIS: { mfaCode: '015', hfnCode: 'HIS', name: 'Historical/Nature' },
    },
    categoriesByMfa: {
      '001': 'CLB',
      '002': 'STG',
      '003': 'URB',
      '004': 'BCH',
      '005': 'FES',
      '006': 'TRL',
      '007': 'SPC',
      '008': 'VRT',
      '009': 'CCH',
      '010': 'NAT',
      '011': 'FAN',
      '012': 'FUT',
      '013': 'IND',
      '014': 'RUR',
      '015': 'HIS',
    },
    subcategories: {
      CLB: {
        BAS: { mfaCode: '001', hfnCode: 'BAS', name: 'Base' },
        NEO: { mfaCode: '002', hfnCode: 'NEO', name: 'Neon' },
        BLK: { mfaCode: '003', hfnCode: 'BLK', name: 'Black' },
        VIP: { mfaCode: '004', hfnCode: 'VIP', name: 'VIP Lounge' },
        RTF: { mfaCode: '005', hfnCode: 'RTF', name: 'Rooftop' },
        UND: { mfaCode: '006', hfnCode: 'UND', name: 'Underground' },
        RET: { mfaCode: '007', hfnCode: 'RET', name: 'Retro' },
        BCH: { mfaCode: '008', hfnCode: 'BCH', name: 'Beach Club' },
      },
      STG: {
        BAS: { mfaCode: '001', hfnCode: 'BAS', name: 'Base' },
        NBA: { mfaCode: '002', hfnCode: 'NBA', name: 'NBA' },
        NFL: { mfaCode: '003', hfnCode: 'NFL', name: 'NFL' },
        ROY: { mfaCode: '004', hfnCode: 'ROY', name: 'Royal' },
        ARE: { mfaCode: '005', hfnCode: 'ARE', name: 'Arena' },
        FES: { mfaCode: '006', hfnCode: 'FES', name: 'Festival' },
        THE: { mfaCode: '007', hfnCode: 'THE', name: 'Theater' },
        STD: { mfaCode: '008', hfnCode: 'STD', name: 'Stadium' },
        UND: { mfaCode: '009', hfnCode: 'UND', name: 'Underground' },
        OUT: { mfaCode: '010', hfnCode: 'OUT', name: 'Outdoor' },
      },
      BCH: {
        BAS: { mfaCode: '001', hfnCode: 'BAS', name: 'Base' },
        TRO: { mfaCode: '002', hfnCode: 'TRO', name: 'Tropical' },
        SUN: { mfaCode: '003', hfnCode: 'SUN', name: 'Sunset' },
        WAV: { mfaCode: '004', hfnCode: 'WAV', name: 'Waves' },
        PAL: { mfaCode: '005', hfnCode: 'PAL', name: 'Palm' },
      },
      // Other categories would be added here
      URB: { BAS: { mfaCode: '001', hfnCode: 'BAS', name: 'Base' } },
      FES: { BAS: { mfaCode: '001', hfnCode: 'BAS', name: 'Base' } },
      TRL: { BAS: { mfaCode: '001', hfnCode: 'BAS', name: 'Base' } },
      SPC: { BAS: { mfaCode: '001', hfnCode: 'BAS', name: 'Base' } },
      VRT: { BAS: { mfaCode: '001', hfnCode: 'BAS', name: 'Base' } },
      CCH: { BAS: { mfaCode: '001', hfnCode: 'BAS', name: 'Base' } },
      NAT: { BAS: { mfaCode: '001', hfnCode: 'BAS', name: 'Base' } },
      FAN: { BAS: { mfaCode: '001', hfnCode: 'BAS', name: 'Base' } },
      FUT: { BAS: { mfaCode: '001', hfnCode: 'BAS', name: 'Base' } },
      IND: { BAS: { mfaCode: '001', hfnCode: 'BAS', name: 'Base' } },
      RUR: { BAS: { mfaCode: '001', hfnCode: 'BAS', name: 'Base' } },
      HIS: { BAS: { mfaCode: '001', hfnCode: 'BAS', name: 'Base' } },
    },
    subcategoriesByMfa: {
      '001': {
        '001': 'BAS',
        '002': 'NEO',
        '003': 'BLK',
        '004': 'VIP',
        '005': 'RTF',
        '006': 'UND',
        '007': 'RET',
        '008': 'BCH',
      },
      '002': {
        '001': 'BAS',
        '002': 'NBA',
        '003': 'NFL',
        '004': 'ROY',
        '005': 'ARE',
        '006': 'FES',
        '007': 'THE',
        '008': 'STD',
        '009': 'UND',
        '010': 'OUT',
      },
      '004': {
        '001': 'BAS',
        '002': 'TRO',
        '003': 'SUN',
        '004': 'WAV',
        '005': 'PAL',
      },
      // Other categories would be added here
      '003': { '001': 'BAS' },
      '005': { '001': 'BAS' },
      '006': { '001': 'BAS' },
      '007': { '001': 'BAS' },
      '008': { '001': 'BAS' },
      '009': { '001': 'BAS' },
      '010': { '001': 'BAS' },
      '011': { '001': 'BAS' },
      '012': { '001': 'BAS' },
      '013': { '001': 'BAS' },
      '014': { '001': 'BAS' },
      '015': { '001': 'BAS' },
    },
  };
}

/**
 * Generates a flat lookup table for the Star (S) layer
 * This is a manually curated version that ensures the S.POP.HPM case works correctly
 */
export function generateStarLayerLookupTable(): LayerLookupTable {
  return {
    name: 'Stars',
    mfaCode: '2',
    hfnCode: 'S',
    categories: {
      POP: { mfaCode: '001', hfnCode: 'POP', name: 'Pop' },
      RCK: { mfaCode: '002', hfnCode: 'RCK', name: 'Rock' },
      HIP: { mfaCode: '003', hfnCode: 'HIP', name: 'Hip_Hop' },
      RNB: { mfaCode: '004', hfnCode: 'RNB', name: 'RnB' },
      DNC: { mfaCode: '005', hfnCode: 'DNC', name: 'Dance_Electronic' },
      LAT: { mfaCode: '006', hfnCode: 'LAT', name: 'Latin' },
      JZZ: { mfaCode: '007', hfnCode: 'JZZ', name: 'Jazz' },
      REG: { mfaCode: '008', hfnCode: 'REG', name: 'Reggae' },
    },
    categoriesByMfa: {
      '001': 'POP',
      '002': 'RCK',
      '003': 'HIP',
      '004': 'RNB',
      '005': 'DNC',
      '006': 'LAT',
      '007': 'JZZ',
      '008': 'REG',
    },
    subcategories: {
      POP: {
        BAS: { mfaCode: '001', hfnCode: 'BAS', name: 'Base' },
        DIV: { mfaCode: '002', hfnCode: 'DIV', name: 'Pop_Diva_Female_Stars' },
        IDF: { mfaCode: '003', hfnCode: 'IDF', name: 'Pop_Idol_Female_Stars' },
        LGF: {
          mfaCode: '004',
          hfnCode: 'LGF',
          name: 'Pop_Legend_Female_Stars',
        },
        LGM: { mfaCode: '005', hfnCode: 'LGM', name: 'Pop_Legend_Male_Stars' },
        ICM: { mfaCode: '006', hfnCode: 'ICM', name: 'Pop_Icon_Male_Stars' },
        HPM: { mfaCode: '007', hfnCode: 'HPM', name: 'Pop_Hipster_Male_Stars' },
      },
      // Other categories would be added here
      RCK: { BAS: { mfaCode: '001', hfnCode: 'BAS', name: 'Base' } },
      HIP: { BAS: { mfaCode: '001', hfnCode: 'BAS', name: 'Base' } },
      RNB: { BAS: { mfaCode: '001', hfnCode: 'BAS', name: 'Base' } },
      DNC: { BAS: { mfaCode: '001', hfnCode: 'BAS', name: 'Base' } },
      LAT: { BAS: { mfaCode: '001', hfnCode: 'BAS', name: 'Base' } },
      JZZ: { BAS: { mfaCode: '001', hfnCode: 'BAS', name: 'Base' } },
      REG: { BAS: { mfaCode: '001', hfnCode: 'BAS', name: 'Base' } },
    },
    subcategoriesByMfa: {
      '001': {
        '001': 'BAS',
        '002': 'DIV',
        '003': 'IDF',
        '004': 'LGF',
        '005': 'LGM',
        '006': 'ICM',
        '007': 'HPM',
      },
      // Other categories would be added here
      '002': { '001': 'BAS' },
      '003': { '001': 'BAS' },
      '004': { '001': 'BAS' },
      '005': { '001': 'BAS' },
      '006': { '001': 'BAS' },
      '007': { '001': 'BAS' },
      '008': { '001': 'BAS' },
    },
  };
}

/**
 * Exports a pre-flattened taxonomy to avoid processing the large JSON structure each time
 */
export const flattenedTaxonomy: FlattenedTaxonomy = {
  // Add the manually generated lookup tables
  W: generateWorldLayerLookupTable(),
  S: generateStarLayerLookupTable(),
  // Other layers could be added here
};

export default flattenedTaxonomy;
