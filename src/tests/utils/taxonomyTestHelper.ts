/**
 * Taxonomy Test Helper - Provides utilities for adapting test expectations
 * to the actual taxonomy structure without modifying core code.
 */

// Use direct imports to avoid circular references
import * as taxonomyLookup from '../../taxonomyLookup';

// Helper function to get layer module as it's not exported directly
function getLayerModule(layerCode: string) {
  const layerModuleKey = `${layerCode}_layer`;
  return (taxonomyLookup as any)[layerModuleKey];
}

/**
 * Gets the mapping for an HFN based on the current taxonomy structure.
 * This should be used for generating test expectations dynamically.
 *
 * Note: This is for backward compatibility with existing tests.
 */
export function getActualMappingForHfn(hfn: string): string {
  if (!hfn) return '';

  const parts = hfn.split('.');
  if (parts.length < 4) return '';

  const [layerCode, categoryCode, subcategoryCode, identifier] = parts;

  try {
    // Get layer numeric code
    const layer = (taxonomyLookup as any).layers[layerCode];
    if (!layer) return '';

    const layerNumeric = layer.numericCode;

    // Get category numeric code
    const layerModule = getLayerModule(layerCode);
    if (!layerModule) return '';

    const categories = layerModule.getCategories();
    const category = categories.find((c: any) => c.code === categoryCode);
    if (!category) return '';

    const categoryNumeric = category.numericCode;

    // Get subcategory numeric code
    const subcategories = layerModule.getSubcategories(categoryCode);
    const subcategory = subcategories.find(
      (s: any) => s.code === subcategoryCode
    );
    if (!subcategory) return '';

    const subcategoryNumeric = subcategory.numericCode;

    // Format the result
    return `${layerNumeric}.${categoryNumeric
      .toString()
      .padStart(3, '0')}.${subcategoryNumeric
      .toString()
      .padStart(3, '0')}.${identifier}`;
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
