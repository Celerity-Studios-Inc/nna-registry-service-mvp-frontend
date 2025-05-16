/**
 * Taxonomy Mapper CLI Tool
 * 
 * A command-line utility to validate the taxonomy mapping functionality.
 * This tool generates and validates all HFN/MFA pairs for a specific layer.
 * 
 * Usage:
 *   node taxonomyMapper.js W
 *   (This will test all mappings for the World (W) layer)
 */

import taxonomyService from '../services/taxonomyService';
import { generateMappingTable, printMappingTable, validateWBchSunMapping } from '../utils/taxonomyValidator';
import { logger } from '../utils/logger';

// Enable debug logging
logger.enableDebug();

/**
 * Main function
 */
function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const layer = args[0];
  
  if (!layer) {
    console.error('Error: Layer code is required.');
    console.log('Usage: node taxonomyMapper.js <layer>');
    console.log('Example: node taxonomyMapper.js W');
    process.exit(1);
  }
  
  console.log(`\nTaxonomy Mapper - Testing Layer: ${layer}`);
  console.log('==============================================');
  
  // Check the W.BCH.SUN mapping first (critical case)
  if (layer === 'W') {
    console.log('Testing critical W.BCH.SUN mapping:');
    const result = validateWBchSunMapping(hfn => taxonomyService.convertHFNtoMFA(hfn));
    
    if (result.valid) {
      console.log('✅ W.BCH.SUN mapping is CORRECT!');
      console.log(`   HFN: W.BCH.SUN.001 -> MFA: ${result.actual}`);
    } else {
      console.log('❌ W.BCH.SUN mapping is INCORRECT!');
      console.log(`   Expected: ${result.expected}, Got: ${result.actual}`);
    }
    console.log('');
  }
  
  // Generate and print all mappings for the requested layer
  console.log(`Generating all mappings for layer ${layer}...`);
  const mappings = generateMappingTable(
    layer,
    layerCode => taxonomyService.getCategories(layerCode),
    (layerCode, categoryCode) => taxonomyService.getSubcategories(layerCode, categoryCode),
    hfn => taxonomyService.convertHFNtoMFA(hfn)
  );
  
  if (mappings.length === 0) {
    console.error(`Error: No mappings found for layer ${layer}.`);
    process.exit(1);
  }
  
  printMappingTable(mappings);
  
  // Print taxonomy paths for some examples
  console.log('\nExample Taxonomy Paths:');
  console.log('-----------------------');
  
  const categories = taxonomyService.getCategories(layer);
  if (categories.length > 0) {
    const category = categories[0];
    console.log(`${layer} > ${category.code}: ${taxonomyService.getTaxonomyPath(layer, category.code)}`);
    
    const subcategories = taxonomyService.getSubcategories(layer, category.code);
    if (subcategories.length > 0) {
      const subcategory = subcategories[0];
      console.log(`${layer} > ${category.code} > ${subcategory.code}: ${taxonomyService.getTaxonomyPath(layer, category.code, subcategory.code)}`);
    }
  }
  
  // If W layer, also test with Beach and Sunset specifically
  if (layer === 'W') {
    console.log(`W > BCH: ${taxonomyService.getTaxonomyPath('W', 'BCH')}`);
    console.log(`W > BCH > SUN: ${taxonomyService.getTaxonomyPath('W', 'BCH', 'SUN')}`);
  }
}

// Execute the main function
main();