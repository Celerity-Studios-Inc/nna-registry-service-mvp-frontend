/**
 * Simple taxonomyTestHelper implementation that should work
 */

// Use direct imports to avoid circular references
import taxonomyLookup, { getLayerModule } from '../../taxonomyLookup';

/**
 * Gets the actual mapping for an HFN from the taxonomy
 */
export function getActualMappingForHfn(hfn: string): string {
  if (!hfn) return '';
  
  const parts = hfn.split('.');
  if (parts.length < 4) return '';
  
  const [layerCode, categoryCode, subcategoryCode, identifier] = parts;
  
  try {
    // Get layer numeric code
    const layer = taxonomyLookup.layers[layerCode];
    if (!layer) return '';
    
    const layerNumeric = layer.numericCode;
    
    // Get category numeric code
    const layerModule = getLayerModule(layerCode);
    if (!layerModule) return '';
    
    const categories = layerModule.getCategories();
    const category = categories.find(c => c.code === categoryCode);
    if (!category) return '';
    
    const categoryNumeric = category.numericCode;
    
    // Get subcategory numeric code
    const subcategories = layerModule.getSubcategories(categoryCode);
    const subcategory = subcategories.find(s => s.code === subcategoryCode);
    if (!subcategory) return '';
    
    const subcategoryNumeric = subcategory.numericCode;
    
    // Format the result
    return `${layerNumeric}.${categoryNumeric.toString().padStart(3, '0')}.${subcategoryNumeric.toString().padStart(3, '0')}.${identifier}`;
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