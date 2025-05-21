/**
 * UltraSimpleTaxonomyData
 * 
 * Hardcoded taxonomy data for the ultra-simple taxonomy selector.
 * This approach eliminates async loading and complex state management
 * to provide a guaranteed reliable taxonomy selection experience.
 */

export interface SimpleTaxonomyItem {
  code: string;
  name: string;
  numericCode: string;
}

// Complete set of layers
export const SIMPLE_LAYERS: SimpleTaxonomyItem[] = [
  { code: 'G', name: 'Song', numericCode: '1' },
  { code: 'S', name: 'Star', numericCode: '2' },
  { code: 'L', name: 'Look', numericCode: '3' },
  { code: 'M', name: 'Move', numericCode: '4' },
  { code: 'W', name: 'World', numericCode: '5' },
  { code: 'B', name: 'Beat', numericCode: '6' },
  { code: 'P', name: 'Prop', numericCode: '7' },
  { code: 'T', name: 'Training', numericCode: '8' },
  { code: 'C', name: 'Character', numericCode: '9' },
  { code: 'R', name: 'Rights', numericCode: '10' },
];

// Categories for each layer
export const SIMPLE_CATEGORIES: Record<string, SimpleTaxonomyItem[]> = {
  'G': [
    { code: 'POP', name: 'Pop', numericCode: '001' },
    { code: 'RCK', name: 'Rock', numericCode: '002' },
    { code: 'HIP', name: 'Hip_Hop', numericCode: '003' },
    { code: 'RNB', name: 'RnB', numericCode: '004' },
    { code: 'DNC', name: 'Dance_Electronic', numericCode: '005' },
    { code: 'ELC', name: 'Electronic', numericCode: '006' },
    { code: 'INS', name: 'Instrumental', numericCode: '007' },
    { code: 'CLS', name: 'Classical', numericCode: '008' },
  ],
  'S': [
    { code: 'POP', name: 'Pop', numericCode: '001' },
    { code: 'RCK', name: 'Rock', numericCode: '002' },
    { code: 'HIP', name: 'Hip_Hop', numericCode: '003' },
    { code: 'RNB', name: 'RnB', numericCode: '004' },
    { code: 'DNC', name: 'Dance_Electronic', numericCode: '005' },
    { code: 'LAT', name: 'Latin', numericCode: '006' },
    { code: 'IND', name: 'Indie', numericCode: '007' },
    { code: 'ALT', name: 'Alternative', numericCode: '008' },
    { code: 'WLD', name: 'World', numericCode: '009' },
    { code: 'JZZ', name: 'Jazz', numericCode: '010' },
    { code: 'JPO', name: 'J_Pop', numericCode: '011' },
    { code: 'BOL', name: 'Bollywood', numericCode: '012' },
    { code: 'KPO', name: 'K_Pop', numericCode: '013' },
    { code: 'VAV', name: 'Virtual_Avatars', numericCode: '014' },
    { code: 'CUL', name: 'Cultural_Icons', numericCode: '015' },
    { code: 'FAN', name: 'Fantasy', numericCode: '016' },
  ],
  'L': [
    { code: 'STR', name: 'Street', numericCode: '001' },
    { code: 'FAS', name: 'Fashion', numericCode: '002' },
    { code: 'CAS', name: 'Casual', numericCode: '003' },
    { code: 'ATH', name: 'Athletic', numericCode: '004' },
    { code: 'VIN', name: 'Vintage', numericCode: '005' },
    { code: 'AVA', name: 'Avant_Garde', numericCode: '006' },
  ],
  'M': [
    { code: 'DNC', name: 'Dance', numericCode: '001' },
    { code: 'ACR', name: 'Acrobatics', numericCode: '002' },
    { code: 'MAR', name: 'Martial_Arts', numericCode: '003' },
    { code: 'YOG', name: 'Yoga', numericCode: '004' },
    { code: 'STR', name: 'Strength', numericCode: '005' },
  ],
  'W': [
    { code: 'FAN', name: 'Fantasy', numericCode: '001' },
    { code: 'FUT', name: 'Future', numericCode: '002' },
    { code: 'SCI', name: 'Sci_Fi', numericCode: '003' },
    { code: 'BCH', name: 'Beach', numericCode: '004' },
    { code: 'MTN', name: 'Mountain', numericCode: '005' },
    { code: 'DSR', name: 'Desert', numericCode: '006' },
    { code: 'JGL', name: 'Jungle', numericCode: '007' },
    { code: 'CIT', name: 'City', numericCode: '008' },
  ],
  'B': [
    { code: 'RHY', name: 'Rhythm', numericCode: '001' },
    { code: 'MEL', name: 'Melody', numericCode: '002' },
    { code: 'HAR', name: 'Harmony', numericCode: '003' },
    { code: 'PER', name: 'Percussion', numericCode: '004' },
  ],
  'P': [
    { code: 'INS', name: 'Instrument', numericCode: '001' },
    { code: 'COS', name: 'Costume', numericCode: '002' },
    { code: 'ACC', name: 'Accessory', numericCode: '003' },
    { code: 'SET', name: 'Set_Piece', numericCode: '004' },
  ],
  'T': [
    { code: 'BEG', name: 'Beginner', numericCode: '001' },
    { code: 'INT', name: 'Intermediate', numericCode: '002' },
    { code: 'ADV', name: 'Advanced', numericCode: '003' },
    { code: 'PRF', name: 'Professional', numericCode: '004' },
  ],
  'C': [
    { code: 'HUM', name: 'Human', numericCode: '001' },
    { code: 'ANI', name: 'Animal', numericCode: '002' },
    { code: 'MON', name: 'Monster', numericCode: '003' },
    { code: 'ROB', name: 'Robot', numericCode: '004' },
    { code: 'FAN', name: 'Fantasy', numericCode: '005' },
  ],
  'R': [
    { code: 'OWN', name: 'Ownership', numericCode: '001' },
    { code: 'LIC', name: 'License', numericCode: '002' },
    { code: 'ROY', name: 'Royalty', numericCode: '003' },
    { code: 'DIS', name: 'Distribution', numericCode: '004' },
  ],
};

// Subcategories for each layer+category combination
export const SIMPLE_SUBCATEGORIES: Record<string, SimpleTaxonomyItem[]> = {
  'G.POP': [
    { code: 'BAS', name: 'Base', numericCode: '001' },
    { code: 'GLB', name: 'Global', numericCode: '002' },
    { code: 'TEN', name: 'Teen', numericCode: '003' },
    { code: 'DNC', name: 'Dance', numericCode: '004' },
    { code: 'ELC', name: 'Electro', numericCode: '005' },
    { code: 'DRM', name: 'Dream', numericCode: '006' },
    { code: 'IND', name: 'Indie', numericCode: '007' },
    { code: 'SOU', name: 'Soul', numericCode: '008' },
    { code: 'PNK', name: 'Punk', numericCode: '009' },
    { code: 'IDP', name: 'Idol_Pop', numericCode: '010' },
  ],
  'S.POP': [
    { code: 'BAS', name: 'Base', numericCode: '001' },
    { code: 'DIV', name: 'Pop_Diva_Female_Stars', numericCode: '002' },
    { code: 'IDF', name: 'Pop_Idol_Female_Stars', numericCode: '003' },
    { code: 'LGF', name: 'Pop_Legend_Female_Stars', numericCode: '004' },
    { code: 'LGM', name: 'Pop_Legend_Male_Stars', numericCode: '005' },
    { code: 'ICM', name: 'Pop_Icon_Male_Stars', numericCode: '006' },
    { code: 'HPM', name: 'Pop_Hipster_Male_Stars', numericCode: '007' },
    { code: 'GLB', name: 'Global', numericCode: '008' },
    { code: 'TEN', name: 'Teen', numericCode: '009' },
    { code: 'DNC', name: 'Dance', numericCode: '010' },
    { code: 'ELC', name: 'Electro', numericCode: '011' },
    { code: 'DRM', name: 'Dream', numericCode: '012' },
    { code: 'IND', name: 'Indie', numericCode: '013' },
    { code: 'SOU', name: 'Soul', numericCode: '014' },
    { code: 'PNK', name: 'Punk', numericCode: '015' },
    { code: 'IDP', name: 'Idol_Pop', numericCode: '016' },
  ],
  'S.RCK': [
    { code: 'BAS', name: 'Base', numericCode: '001' },
    { code: 'RSF', name: 'Rock_Star_Female_Stars', numericCode: '002' },
    { code: 'RSM', name: 'Rock_Star_Male_Stars', numericCode: '003' },
    { code: 'CLS', name: 'Classic', numericCode: '004' },
    { code: 'MOD', name: 'Modern', numericCode: '005' },
    { code: 'MTL', name: 'Metal', numericCode: '006' },
    { code: 'PNK', name: 'Punk', numericCode: '007' },
    { code: 'ALT', name: 'Alternative', numericCode: '008' },
    { code: 'GRG', name: 'Grunge', numericCode: '009' },
    { code: 'PRG', name: 'Progressive', numericCode: '010' },
    { code: 'IND', name: 'Indie', numericCode: '011' },
    { code: 'PSY', name: 'Psychedelic', numericCode: '012' },
    { code: 'BLU', name: 'Blues', numericCode: '013' },
  ],
  'W.BCH': [
    { code: 'BAS', name: 'Base', numericCode: '001' },
    { code: 'TRP', name: 'Tropical', numericCode: '002' },
    { code: 'SUN', name: 'Sun', numericCode: '003' },
    { code: 'SRF', name: 'Surf', numericCode: '004' },
    { code: 'RST', name: 'Resort', numericCode: '005' },
    { code: 'ISL', name: 'Island', numericCode: '006' },
  ],
};

// Special case mappings for known problematic combinations
export const SPECIAL_HFN_TO_MFA: Record<string, string> = {
  'S.POP.HPM.001': '2.001.007.001',
  'W.BCH.SUN.001': '5.004.003.001',
};

/**
 * Converts a Human-Friendly Name (HFN) to a Machine-Friendly Address (MFA)
 * with special case handling for known problematic combinations
 */
export function getSimpleMFAFromHFN(hfn: string): string {
  // Check special cases first
  if (SPECIAL_HFN_TO_MFA[hfn]) {
    return SPECIAL_HFN_TO_MFA[hfn];
  }

  // Standard conversion
  const parts = hfn.split('.');
  if (parts.length < 4) return '';

  const [layer, category, subcategory, sequential] = parts;

  // Find layer
  const layerData = SIMPLE_LAYERS.find(l => l.code === layer);
  if (!layerData) return '';

  // Find category
  const categoryData = SIMPLE_CATEGORIES[layer]?.find(c => c.code === category);
  if (!categoryData) return '';

  // Find subcategory
  const subcategoryData = SIMPLE_SUBCATEGORIES[`${layer}.${category}`]?.find(s => s.code === subcategory);
  if (!subcategoryData) return '';

  // Combine to form MFA
  return `${layerData.numericCode}.${categoryData.numericCode}.${subcategoryData.numericCode}.${sequential}`;
}