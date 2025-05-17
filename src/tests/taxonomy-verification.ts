/**
 * This file is for manually running verification of the taxonomy service
 * Run with: npx ts-node src/tests/taxonomy-verification.ts
 */
import { taxonomyService } from '../services/simpleTaxonomyService';

// Test W.BCH.SUN mapping - This is our critical case that needed fixing
const testWBCHSUN = () => {
  const hfn = 'W.BCH.SUN.001';
  const mfa = taxonomyService.convertHFNtoMFA(hfn);
  
  console.log('Testing W.BCH.SUN.001 mapping:');
  console.log(`HFN: ${hfn}`);
  console.log(`MFA: ${mfa}`);
  console.log(`Expected: 5.004.003.001`);
  console.log(`Result: ${mfa === '5.004.003.001' ? 'SUCCESS ✅' : 'FAILED ❌'}`);
  console.log('');
}

// Test category retrieval
const testCategoryRetrieval = () => {
  const layer = 'W';
  const categories = taxonomyService.getCategories(layer);
  
  console.log(`Testing category retrieval for layer ${layer}:`);
  console.log(`Found ${categories.length} categories`);
  console.log(categories);
  console.log(categories.length > 0 ? 'SUCCESS ✅' : 'FAILED ❌');
  console.log('');
}

// Test subcategory retrieval
const testSubcategoryRetrieval = () => {
  const layer = 'W';
  const category = 'BCH';
  const subcategories = taxonomyService.getSubcategories(layer, category);
  
  console.log(`Testing subcategory retrieval for ${layer}.${category}:`);
  console.log(`Found ${subcategories.length} subcategories`);
  console.log(subcategories);
  console.log(subcategories.length > 0 ? 'SUCCESS ✅' : 'FAILED ❌');
  console.log('');
}

// Run all tests
const runTests = () => {
  console.log('=== RUNNING TAXONOMY SERVICE VERIFICATION ===');
  testWBCHSUN();
  testCategoryRetrieval();
  testSubcategoryRetrieval();
  console.log('=== VERIFICATION COMPLETE ===');
}

// Execute tests
runTests();