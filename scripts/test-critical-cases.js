/**
 * Critical Test Cases Verification Script
 * 
 * This script tests the most critical taxonomy combinations that were the focus
 * of the refactoring project. It specifically validates:
 * 1. S.POP.HPM.001 -> 2.001.007.001 mapping
 * 2. W.BCH.SUN.001 -> 5.004.003.001 mapping
 * 3. Rapid layer switching behavior
 */

const { taxonomyService } = require('../src/services/simpleTaxonomyService');

// Text colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test results tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0
};

/**
 * Run a test case and report results
 */
function runTest(name, testFn) {
  testResults.total++;
  
  console.log(`\n${colors.blue}Running test: ${colors.cyan}${name}${colors.reset}`);
  
  try {
    const result = testFn();
    if (result.success) {
      testResults.passed++;
      console.log(`${colors.green}✓ PASS: ${result.message}${colors.reset}`);
    } else {
      testResults.failed++;
      console.log(`${colors.red}✗ FAIL: ${result.message}${colors.reset}`);
    }
    
    // Print additional details if available
    if (result.details) {
      console.log(`${colors.yellow}Details: ${result.details}${colors.reset}`);
    }
  } catch (error) {
    testResults.failed++;
    console.log(`${colors.red}✗ ERROR: ${error.message}${colors.reset}`);
    console.log(`${colors.yellow}Stack: ${error.stack}${colors.reset}`);
  }
}

/**
 * Verify the S.POP.HPM special case mapping
 */
function testStarPopHPMMapping() {
  const hfn = 'S.POP.HPM.001';
  const expectedMfa = '2.001.007.001';
  
  // Get MFA using taxonomy service
  const actualMfa = taxonomyService.convertHFNtoMFA(hfn);
  
  return {
    success: actualMfa === expectedMfa,
    message: actualMfa === expectedMfa 
      ? `Successfully converted ${hfn} to ${actualMfa}` 
      : `Failed to convert ${hfn} correctly. Expected: ${expectedMfa}, Got: ${actualMfa || 'undefined'}`,
    details: `Used HFN: ${hfn}, Expected MFA: ${expectedMfa}, Actual MFA: ${actualMfa}`
  };
}

/**
 * Verify the W.BCH.SUN special case mapping
 */
function testWorldBeachSunMapping() {
  const hfn = 'W.BCH.SUN.001';
  const expectedMfa = '5.004.003.001';
  
  // Get MFA using taxonomy service
  const actualMfa = taxonomyService.convertHFNtoMFA(hfn);
  
  return {
    success: actualMfa === expectedMfa,
    message: actualMfa === expectedMfa 
      ? `Successfully converted ${hfn} to ${actualMfa}` 
      : `Failed to convert ${hfn} correctly. Expected: ${expectedMfa}, Got: ${actualMfa || 'undefined'}`,
    details: `Used HFN: ${hfn}, Expected MFA: ${expectedMfa}, Actual MFA: ${actualMfa}`
  };
}

/**
 * Verify all category lookups for Star layer
 */
function testStarCategoryLookups() {
  // Get all categories for Star layer
  const categories = taxonomyService.getCategories('S');
  
  // Check if categories array is non-empty
  if (!categories || categories.length === 0) {
    return {
      success: false,
      message: 'Failed to retrieve categories for Star layer',
      details: 'The categories array is empty or undefined'
    };
  }
  
  // Check if POP category exists
  const popCategory = categories.find(c => c.code === 'POP');
  if (!popCategory) {
    return {
      success: false,
      message: 'Failed to find POP category in Star layer',
      details: `Available categories: ${categories.map(c => c.code).join(', ')}`
    };
  }
  
  // Get subcategories for POP
  const subcategories = taxonomyService.getSubcategories('S', 'POP');
  
  // Check if subcategories array is non-empty
  if (!subcategories || subcategories.length === 0) {
    return {
      success: false,
      message: 'Failed to retrieve subcategories for S.POP',
      details: 'The subcategories array is empty or undefined'
    };
  }
  
  // Check if HPM subcategory exists
  const hpmSubcategory = subcategories.find(s => s.code === 'HPM');
  if (!hpmSubcategory) {
    return {
      success: false,
      message: 'Failed to find HPM subcategory in S.POP',
      details: `Available subcategories: ${subcategories.map(s => s.code).join(', ')}`
    };
  }
  
  return {
    success: true,
    message: 'Successfully verified all Star layer category lookups',
    details: `Found ${categories.length} categories and ${subcategories.length} subcategories for S.POP, including HPM`
  };
}

/**
 * Verify all category lookups for World layer
 */
function testWorldCategoryLookups() {
  // Get all categories for World layer
  const categories = taxonomyService.getCategories('W');
  
  // Check if categories array is non-empty
  if (!categories || categories.length === 0) {
    return {
      success: false,
      message: 'Failed to retrieve categories for World layer',
      details: 'The categories array is empty or undefined'
    };
  }
  
  // Check if BCH category exists
  const bchCategory = categories.find(c => c.code === 'BCH');
  if (!bchCategory) {
    return {
      success: false,
      message: 'Failed to find BCH category in World layer',
      details: `Available categories: ${categories.map(c => c.code).join(', ')}`
    };
  }
  
  // Get subcategories for BCH
  const subcategories = taxonomyService.getSubcategories('W', 'BCH');
  
  // Check if subcategories array is non-empty
  if (!subcategories || subcategories.length === 0) {
    return {
      success: false,
      message: 'Failed to retrieve subcategories for W.BCH',
      details: 'The subcategories array is empty or undefined'
    };
  }
  
  // Check if SUN subcategory exists
  const sunSubcategory = subcategories.find(s => s.code === 'SUN');
  if (!sunSubcategory) {
    return {
      success: false,
      message: 'Failed to find SUN subcategory in W.BCH',
      details: `Available subcategories: ${subcategories.map(s => s.code).join(', ')}`
    };
  }
  
  return {
    success: true,
    message: 'Successfully verified all World layer category lookups',
    details: `Found ${categories.length} categories and ${subcategories.length} subcategories for W.BCH, including SUN`
  };
}

/**
 * Simulate rapid layer switching
 */
function testRapidLayerSwitching() {
  const layers = ['S', 'W', 'G', 'L', 'S', 'W'];
  const results = [];
  
  // Perform multiple rapid layer selections
  for (const layer of layers) {
    // Get categories for current layer
    const categories = taxonomyService.getCategories(layer);
    
    // Store the results
    results.push({
      layer,
      categoryCount: categories.length,
      hasCategories: categories.length > 0
    });
  }
  
  // Check if all layer switches successfully loaded categories
  const failures = results.filter(r => !r.hasCategories);
  
  return {
    success: failures.length === 0,
    message: failures.length === 0 
      ? 'Successfully handled rapid layer switching' 
      : `Failed to load categories for ${failures.length} layer switches`,
    details: `Results: ${results.map(r => `${r.layer}: ${r.categoryCount} categories`).join(', ')}`
  };
}

/**
 * Run all tests and report summary
 */
function runAllTests() {
  console.log(`${colors.magenta}=============================================${colors.reset}`);
  console.log(`${colors.magenta}Running Critical Taxonomy Mapping Tests${colors.reset}`);
  console.log(`${colors.magenta}=============================================${colors.reset}`);
  
  runTest('S.POP.HPM Mapping', testStarPopHPMMapping);
  runTest('W.BCH.SUN Mapping', testWorldBeachSunMapping);
  runTest('Star Layer Category Lookups', testStarCategoryLookups);
  runTest('World Layer Category Lookups', testWorldCategoryLookups);
  runTest('Rapid Layer Switching', testRapidLayerSwitching);
  
  // Print summary
  console.log(`\n${colors.magenta}=============================================${colors.reset}`);
  console.log(`${colors.magenta}Test Summary${colors.reset}`);
  console.log(`${colors.magenta}=============================================${colors.reset}`);
  console.log(`${colors.blue}Total Tests: ${testResults.total}${colors.reset}`);
  console.log(`${colors.green}Passed: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testResults.failed}${colors.reset}`);
  
  // Overall result
  if (testResults.failed === 0) {
    console.log(`\n${colors.green}✓ ALL TESTS PASSED${colors.reset}`);
    console.log(`${colors.green}The taxonomy refactoring has successfully fixed all critical issues!${colors.reset}`);
  } else {
    console.log(`\n${colors.red}✗ SOME TESTS FAILED${colors.reset}`);
    console.log(`${colors.red}Please review the failures and address the issues.${colors.reset}`);
  }
}

// Execute all tests
runAllTests();

// Export for browser environment
if (typeof window !== 'undefined') {
  window.runTaxonomyTests = runAllTests;
}