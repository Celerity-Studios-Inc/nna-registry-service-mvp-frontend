/**
 * Test script for verifying taxonomy selection functionality
 * 
 * This script tests the core layer-category-subcategory selection flow
 * to ensure proper state management in the useTaxonomy hook.
 * 
 * Run with: node scripts/test-taxonomy-selection.js
 */

// Import taxonomy service directly
const { taxonomyService } = require('../src/services/simpleTaxonomyService');

// Log function for better readability
const log = (msg) => console.log(`[TEST] ${msg}`);

// Clear console for cleaner output
console.clear();
log('Starting Taxonomy Selection Test...');

/**
 * Test the layer-category-subcategory selection flow
 * This simulates the workflow that users follow in the UI
 */
async function testTaxonomySelection() {
  // Array of layers to test
  const layers = ['G', 'S', 'L', 'M', 'W'];
  let overallSuccess = true;

  // Test each layer
  for (const layer of layers) {
    log(`\n=== Testing Layer: ${layer} ===`);
    
    try {
      // Step 1: Select a layer
      log(`Selecting layer: ${layer}`);
      
      // Step 2: Get categories for the selected layer
      const categories = taxonomyService.getCategories(layer);
      
      if (!categories || categories.length === 0) {
        log(`❌ ERROR: No categories found for layer ${layer}`);
        overallSuccess = false;
        continue;
      }
      
      log(`✅ SUCCESS: Found ${categories.length} categories for layer ${layer}`);
      log(`Category samples: ${categories.slice(0, 3).map(c => c.code).join(', ')}${categories.length > 3 ? '...' : ''}`);
      
      // Step 3: Select a category (first one for simplicity)
      const selectedCategory = categories[0];
      log(`Selecting category: ${selectedCategory.code}`);
      
      // Step 4: Get subcategories for the selected category
      const subcategories = taxonomyService.getSubcategories(layer, selectedCategory.code);
      
      if (!subcategories || subcategories.length === 0) {
        log(`❌ ERROR: No subcategories found for ${layer}.${selectedCategory.code}`);
        overallSuccess = false;
        continue;
      }
      
      log(`✅ SUCCESS: Found ${subcategories.length} subcategories for ${layer}.${selectedCategory.code}`);
      log(`Subcategory samples: ${subcategories.slice(0, 3).map(s => s.code).join(', ')}${subcategories.length > 3 ? '...' : ''}`);
      
      // Step 5: Select a subcategory (first one for simplicity)
      const selectedSubcategory = subcategories[0];
      log(`Selecting subcategory: ${selectedSubcategory.code}`);
      
      // Step 6: Generate HFN and MFA
      const hfn = `${layer}.${selectedCategory.code}.${selectedSubcategory.code}.001`;
      log(`Generated HFN: ${hfn}`);
      
      let mfa;
      try {
        mfa = taxonomyService.convertHFNtoMFA(hfn);
        log(`✅ SUCCESS: Generated MFA: ${mfa}`);
      } catch (e) {
        log(`❌ ERROR: Failed to convert HFN to MFA: ${e.message}`);
        overallSuccess = false;
      }
      
      log(`Test for layer ${layer} completed`);
      
    } catch (error) {
      log(`❌ ERROR: Test failed for layer ${layer}: ${error.message}`);
      console.error(error);
      overallSuccess = false;
    }
  }
  
  // Overall test result
  log('\n=== Test Summary ===');
  if (overallSuccess) {
    log('✅ ALL TESTS PASSED: Taxonomy selection flow is working properly');
  } else {
    log('❌ SOME TESTS FAILED: See errors above');
  }
}

// Run the test
testTaxonomySelection()
  .then(() => {
    log('Test script completed');
  })
  .catch(err => {
    console.error('Test script failed with error:', err);
  });