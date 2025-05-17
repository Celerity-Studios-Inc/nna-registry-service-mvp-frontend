/**
 * Taxonomy verification tests
 * 
 * These tests verify that the taxonomy mapping works correctly,
 * especially for the W.BCH.SUN case.
 */
import { taxonomyService } from '../services/simpleTaxonomyService';

/**
 * Test W.BCH.SUN mapping
 */
export function testWBCHSUNMapping() {
  const hfn = 'W.BCH.SUN.001';
  const expectedMfa = '5.004.003.001';
  
  const actualMfa = taxonomyService.convertHFNtoMFA(hfn);
  
  console.log(`Testing W.BCH.SUN mapping:`);
  console.log(`HFN: ${hfn}`);
  console.log(`Expected MFA: ${expectedMfa}`);
  console.log(`Actual MFA: ${actualMfa}`);
  console.log(`Result: ${actualMfa === expectedMfa ? '✅ PASS' : '❌ FAIL'}`);
  
  return actualMfa === expectedMfa;
}

/**
 * Test all W layer mappings
 */
export function testAllWLayerMappings() {
  const mappings = taxonomyService.generateAllMappings('W');
  
  console.log(`Generated ${mappings.length} mappings for W layer`);
  
  // Check BCH.SUN specifically
  const bchSunMapping = mappings.find(m => m.hfn === 'W.BCH.SUN.001');
  
  if (bchSunMapping) {
    console.log(`W.BCH.SUN.001 maps to ${bchSunMapping.mfa}`);
    console.log(`Result: ${bchSunMapping.mfa === '5.004.003.001' ? '✅ PASS' : '❌ FAIL'}`);
  } else {
    console.log('❌ FAIL: W.BCH.SUN.001 mapping not found');
  }
  
  return mappings;
}

/**
 * Run all verification tests
 */
export function runAllTests() {
  console.log('Running all taxonomy verification tests');
  console.log('=====================================');
  
  const wbchsunResult = testWBCHSUNMapping();
  console.log('-------------------------------------');
  
  const allWLayerResults = testAllWLayerMappings();
  console.log('-------------------------------------');
  
  return {
    wbchsunResult,
    allWLayerResults
  };
}

// Uncomment to run tests directly
// runAllTests();