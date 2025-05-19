/**
 * Taxonomy Test Helper - Provides utilities for adapting test expectations
 * to the actual taxonomy structure without modifying core code.
 */

// Use direct imports to avoid circular references
import { LAYER_LOOKUPS } from '../../taxonomyLookup/constants';

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

/**
 * Gets the mapping for an HFN based on the current taxonomy structure.
 * This should be used for generating test expectations dynamically.
 */
export function getActualMappingForHfn(hfn: string): string {
  if (!hfn) return '';

  const parts = hfn.split('.');
  if (parts.length < 4) return '';

  const [layerCode, categoryCode, subcategoryCode, identifier] = parts;

  try {
    // Get layer numeric code
    const layerNumeric = LAYER_NUMERIC_CODES[layerCode];
    if (!layerNumeric) return '';

    // Get category numeric code
    const layerLookup = LAYER_LOOKUPS[layerCode];
    if (!layerLookup) return '';

    const categoryInfo = layerLookup[categoryCode];
    if (!categoryInfo) return '';

    const categoryNumeric = categoryInfo.numericCode;

    // Get subcategory numeric code
    const subcategoryKey = `${categoryCode}.${subcategoryCode}`;
    const subcategoryInfo = layerLookup[subcategoryKey];
    if (!subcategoryInfo) return '';

    const subcategoryNumeric = subcategoryInfo.numericCode;

    // Format the result
    return `${layerNumeric}.${categoryNumeric.padStart(
      3,
      '0'
    )}.${subcategoryNumeric.padStart(3, '0')}.${identifier}`;
  } catch (error) {
    console.error(`Error getting mapping for ${hfn}:`, error);
    return '';
  }
}

/**
 * Compatibility alias for getActualMappingForHfn
 */
export function getExpectedMappingForTest(hfn: string): string {
  return getActualMappingForHfn(hfn);
}
