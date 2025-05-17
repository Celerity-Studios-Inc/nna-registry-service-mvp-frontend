/**
 * Taxonomy Test Utilities
 * 
 * Utilities for testing the taxonomy system.
 */
import { taxonomyService } from '../../services/simpleTaxonomyService';

/**
 * Generate a test case for HFN to MFA conversion
 */
export interface HfnMfaTestCase {
  hfn: string;
  expectedMfa: string;
  description: string;
}

/**
 * Test cases for special HFN to MFA conversions
 */
export const SPECIAL_HFN_MFA_TEST_CASES: HfnMfaTestCase[] = [
  {
    hfn: 'W.BCH.SUN.001',
    expectedMfa: '5.004.003.001',
    description: 'W.BCH.SUN special case'
  },
  {
    hfn: 'S.POP.HPM.001',
    expectedMfa: '2.004.003.001',
    description: 'S.POP.HPM special case'
  },
  {
    hfn: 'W.BCH.SUN.002.mp4',
    expectedMfa: '5.004.003.002.mp4',
    description: 'W.BCH.SUN with sequential 002 and file type'
  }
];

/**
 * Test cases for general HFN to MFA conversions
 */
export const GENERAL_HFN_MFA_TEST_CASES: HfnMfaTestCase[] = [
  {
    hfn: 'G.CAT.SUB.001',
    expectedMfa: '1.001.001.001',
    description: 'Ground layer test case'
  },
  {
    hfn: 'S.RCK.BAS.001',
    expectedMfa: '2.005.001.001',
    description: 'Star layer Rock Bass test case'
  },
  {
    hfn: 'W.BCH.TRO.001',
    expectedMfa: '5.004.002.001',
    description: 'Wave layer Beach Tropical test case'
  }
];

/**
 * Test a single HFN to MFA conversion
 */
export const testHfnToMfa = (testCase: HfnMfaTestCase): boolean => {
  try {
    const actualMfa = taxonomyService.convertHFNtoMFA(testCase.hfn);
    return actualMfa === testCase.expectedMfa;
  } catch (error) {
    console.error(`Error testing ${testCase.description}:`, error);
    return false;
  }
};

/**
 * Get all categories for all layers
 */
export const getAllLayerCategories = (): Record<string, any[]> => {
  const layers = ['G', 'S', 'L', 'M', 'W', 'B', 'P', 'T', 'C', 'R'];
  const result: Record<string, any[]> = {};
  
  for (const layer of layers) {
    try {
      result[layer] = taxonomyService.getCategories(layer);
    } catch (error) {
      console.error(`Error getting categories for layer ${layer}:`, error);
      result[layer] = [];
    }
  }
  
  return result;
};

/**
 * Get all subcategories for a layer and category
 */
export const getAllSubcategories = (layer: string, category: string): any[] => {
  try {
    return taxonomyService.getSubcategories(layer, category);
  } catch (error) {
    console.error(`Error getting subcategories for ${layer}.${category}:`, error);
    return [];
  }
};

/**
 * Execute all HFN to MFA test cases
 */
export const executeAllHfnMfaTests = (): {
  specialCases: Record<string, boolean>;
  generalCases: Record<string, boolean>;
  totalPassed: number;
  totalFailed: number;
} => {
  const specialCases: Record<string, boolean> = {};
  const generalCases: Record<string, boolean> = {};
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  // Test special cases
  for (const testCase of SPECIAL_HFN_MFA_TEST_CASES) {
    const result = testHfnToMfa(testCase);
    specialCases[testCase.hfn] = result;
    
    if (result) {
      totalPassed++;
    } else {
      totalFailed++;
    }
  }
  
  // Test general cases
  for (const testCase of GENERAL_HFN_MFA_TEST_CASES) {
    const result = testHfnToMfa(testCase);
    generalCases[testCase.hfn] = result;
    
    if (result) {
      totalPassed++;
    } else {
      totalFailed++;
    }
  }
  
  return {
    specialCases,
    generalCases,
    totalPassed,
    totalFailed
  };
};