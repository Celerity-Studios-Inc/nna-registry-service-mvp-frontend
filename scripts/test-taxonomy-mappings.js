/**
 * Test Taxonomy Mappings
 * 
 * This script tests the HFN to MFA conversions for all available layers,
 * with special attention to the W.BCH.SUN and S.POP.HPM cases.
 */

const path = require('path');
require('ts-node').register({ transpileOnly: true });

// Import the taxonomyService from src directory
const { taxonomyService } = require('../src/services/simpleTaxonomyService');

console.log('Testing HFN to MFA conversions for all layers\n');

// Test cases for each available layer
const testCases = [
  { hfn: 'G.POP.BAS.001', expected: '1.001.001.001', description: 'Songs - Pop - Base' },
  { hfn: 'S.POP.BAS.001', expected: '2.001.001.001', description: 'Stars - Pop - Base' },
  { hfn: 'S.POP.HPM.001', expected: '2.001.007.001', description: 'Stars - Pop - Hipster Male Stars (Special Case)' },
  { hfn: 'L.STG.RED.001', expected: '3.001.002.001', description: 'Looks - Stage - Red' },
  { hfn: 'M.POP.BAS.001', expected: '4.001.001.001', description: 'Moves - Pop - Base' },
  { hfn: 'W.BCH.SUN.001', expected: '5.004.003.001', description: 'Worlds - Beach - Sunset (Special Case)' },
];

// Run test cases
let passCount = 0;
let failCount = 0;

testCases.forEach(testCase => {
  const { hfn, expected, description } = testCase;
  const actual = taxonomyService.convertHFNtoMFA(hfn);
  const passed = actual === expected;
  
  if (passed) {
    passCount++;
    console.log(`✅ PASSED: ${hfn} -> ${actual} (${description})`);
  } else {
    failCount++;
    console.log(`❌ FAILED: ${hfn} -> ${actual || 'Error'} (Expected: ${expected}) (${description})`);
  }
});

console.log('\nTest Summary:');
console.log(`Total Tests: ${testCases.length}`);
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);

// Special focus on W.BCH.SUN case
const wbchsun = taxonomyService.convertHFNtoMFA('W.BCH.SUN.001');
console.log('\nSpecial Case - W.BCH.SUN:');
console.log(`W.BCH.SUN.001 -> ${wbchsun}`);
console.log(`Status: ${wbchsun === '5.004.003.001' ? '✅ Fixed correctly' : '❌ Not fixed correctly'}`);

// Special focus on S.POP.HPM case
const spophpm = taxonomyService.convertHFNtoMFA('S.POP.HPM.001');
console.log('\nSpecial Case - S.POP.HPM:');
console.log(`S.POP.HPM.001 -> ${spophpm}`);
console.log(`Status: ${spophpm === '2.001.007.001' ? '✅ Fixed correctly' : '❌ Not fixed correctly'}`);

// Exit with appropriate status code
if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}