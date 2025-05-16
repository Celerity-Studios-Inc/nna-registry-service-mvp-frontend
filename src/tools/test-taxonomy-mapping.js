/**
 * Test Taxonomy Mapping
 * 
 * This script tests the taxonomy mapping for the W.BCH.SUN case specifically,
 * as well as some other important mappings.
 */

// Import the taxonomy service
const taxonomyService = require('../services/taxonomyService').default;

// Test W.BCH.SUN mapping
function testWBchSun() {
  console.log('\n=== Testing W.BCH.SUN Mapping ===');
  
  const hfn = 'W.BCH.SUN.001';
  const expected = '5.004.003.001';
  const actual = taxonomyService.convertHFNtoMFA(hfn);
  
  console.log(`HFN: ${hfn}`);
  console.log(`Expected MFA: ${expected}`);
  console.log(`Actual MFA: ${actual}`);
  
  if (actual === expected) {
    console.log('✅ Test PASSED');
  } else {
    console.log('❌ Test FAILED');
  }
}

// Test other important mappings
function testOtherMappings() {
  console.log('\n=== Testing Other Important Mappings ===');
  
  const testCases = [
    { hfn: 'G.POP.BAS.001', expected: '1.001.001.001', description: 'Songs > Pop > Base' },
    { hfn: 'S.POP.HPM.001', expected: '2.001.007.001', description: 'Stars > Pop > Hipster Male' },
    { hfn: 'L.STG.RED.001', expected: '3.001.001.001', description: 'Looks > Stage > Red' }
  ];
  
  let passCount = 0;
  
  testCases.forEach(({ hfn, expected, description }) => {
    const actual = taxonomyService.convertHFNtoMFA(hfn);
    
    console.log(`\nTesting: ${description}`);
    console.log(`HFN: ${hfn}`);
    console.log(`Expected MFA: ${expected}`);
    console.log(`Actual MFA: ${actual}`);
    
    if (actual === expected) {
      console.log('✅ Test PASSED');
      passCount++;
    } else {
      console.log('❌ Test FAILED');
    }
  });
  
  console.log(`\nSummary: ${passCount}/${testCases.length} tests passed`);
}

// Test error handling
function testErrorHandling() {
  console.log('\n=== Testing Error Handling ===');
  
  const invalidInputs = [
    { input: 'INVALID', description: 'Completely invalid input' },
    { input: 'W', description: 'Only layer code' },
    { input: 'W.INVALID.SUN.001', description: 'Invalid category code' },
    { input: 'W.BCH.INVALID.001', description: 'Invalid subcategory code' },
    { input: 'Z.BCH.SUN.001', description: 'Invalid layer code' },
  ];
  
  invalidInputs.forEach(({ input, description }) => {
    console.log(`\nTesting: ${description}`);
    console.log(`Input: ${input}`);
    
    try {
      const result = taxonomyService.convertHFNtoMFA(input);
      console.log(`Result: ${result}`);
      
      if (result === '') {
        console.log('✅ Test PASSED - Returned empty string for invalid input');
      } else {
        console.log('❓ Test RESULT UNEXPECTED - Returned non-empty string for invalid input');
      }
    } catch (error) {
      console.log(`❌ Test FAILED - Threw error: ${error.message}`);
    }
  });
}

// Run the tests
console.log('=== Taxonomy Mapping Test Suite ===');
testWBchSun();
testOtherMappings();
testErrorHandling();
console.log('\n=== End of Test Suite ===');