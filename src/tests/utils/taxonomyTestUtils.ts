/**
 * Utility functions and test data for taxonomy system tests
 */
import {
  getExpectedMappingForTest,
  getActualMappingForHfn,
} from './taxonomyTestHelper';

/**
 * Common test cases for special Human-Friendly Name (HFN) to Machine-Friendly Address (MFA) mappings
 */
export const SPECIAL_HFN_MFA_TEST_CASES = [
  {
    hfn: 'W.BCH.SUN.001',
    expectedMfa: getExpectedMappingForTest('W.BCH.SUN.001') || '5.001.001.001',
  },
  {
    hfn: 'S.POP.HPM.001',
    expectedMfa: getExpectedMappingForTest('S.POP.HPM.001') || '2.001.007.001',
  },
  {
    hfn: 'W.HIP.BAS.001',
    expectedMfa: getExpectedMappingForTest('W.HIP.BAS.001') || '5.003.001.001',
  },
  {
    hfn: 'W.BCH.SUN.002.mp4',
    expectedMfa:
      getExpectedMappingForTest('W.BCH.SUN.002.mp4') || '5.001.001.002.mp4',
  },
];

/**
 * Common test cases for general Human-Friendly Name (HFN) to Machine-Friendly Address (MFA) mappings
 */
export const GENERAL_HFN_MFA_TEST_CASES = [
  {
    hfn: 'G.CAT.SUB.001',
    expectedMfa: getExpectedMappingForTest('G.CAT.SUB.001') || '1.001.001.001',
  },
  {
    hfn: 'S.RCK.BAS.001',
    expectedMfa: getExpectedMappingForTest('S.RCK.BAS.001') || '2.005.001.001',
  },
  {
    hfn: 'W.BCH.TRO.001',
    expectedMfa: getExpectedMappingForTest('W.BCH.TRO.001') || '5.001.002.001',
  },
];

/**
 * Mock taxonomy data for tests
 */
export const MOCK_TAXONOMY_DATA = {
  layers: [
    { code: 'G', name: 'Songs' },
    { code: 'S', name: 'Stars' },
    { code: 'L', name: 'Looks' },
    { code: 'M', name: 'Moves' },
    { code: 'W', name: 'Worlds' },
    { code: 'B', name: 'Branded' },
    { code: 'P', name: 'Personalize' },
    { code: 'T', name: 'Training_Data' },
    { code: 'R', name: 'Rights' },
    { code: 'C', name: 'Composites' },
  ],
  categories: {
    W: [
      { code: 'BCH', name: 'Beach', numericCode: '001' },
      { code: 'HIP', name: 'Hip Hop', numericCode: '003' },
      { code: 'URB', name: 'Urban', numericCode: '004' },
    ],
    S: [
      { code: 'POP', name: 'Pop', numericCode: '001' },
      { code: 'RCK', name: 'Rock', numericCode: '005' },
    ],
    G: [{ code: 'CAT', name: 'Category', numericCode: '001' }],
  },
  subcategories: {
    'W-BCH': [
      { code: 'SUN', name: 'Sunset', numericCode: '001' },
      { code: 'TRO', name: 'Tropical', numericCode: '002' },
    ],
    'W-HIP': [{ code: 'BAS', name: 'Base', numericCode: '001' }],
    'S-POP': [{ code: 'HPM', name: 'Happy Mood', numericCode: '007' }],
    'S-RCK': [{ code: 'BAS', name: 'Base', numericCode: '001' }],
    'G-CAT': [{ code: 'SUB', name: 'Subcategory', numericCode: '001' }],
  },
};

/**
 * Creates a mock implementation for taxonomyService.getCategories
 */
export function createMockGetCategories() {
  return jest.fn(layer => {
    if (layer === 'W') {
      return MOCK_TAXONOMY_DATA.categories.W;
    } else if (layer === 'S') {
      return MOCK_TAXONOMY_DATA.categories.S;
    } else if (layer === 'G') {
      return MOCK_TAXONOMY_DATA.categories.G;
    }
    return [];
  });
}

/**
 * Creates a mock implementation for taxonomyService.getSubcategories
 */
export function createMockGetSubcategories() {
  return jest.fn((layer, category) => {
    const key = `${layer}-${category}`;
    return MOCK_TAXONOMY_DATA.subcategories[key] || [];
  });
}

/**
 * Creates a mock implementation for taxonomyService.convertHFNtoMFA
 */
export function createMockConvertHFNtoMFA() {
  return jest.fn(hfn => {
    // Try to get the expected mapping from our test helper
    const mapping = getExpectedMappingForTest(hfn);
    if (mapping) {
      return mapping;
    }

    // Special test cases
    for (const testCase of SPECIAL_HFN_MFA_TEST_CASES) {
      if (testCase.hfn === hfn) {
        return testCase.expectedMfa;
      }
    }

    // General test cases
    for (const testCase of GENERAL_HFN_MFA_TEST_CASES) {
      if (testCase.hfn === hfn) {
        return testCase.expectedMfa;
      }
    }

    // Custom mapping logic for other cases
    const parts = hfn.split('.');
    const [layer, category, subcategory, identifier, ...rest] = parts;

    let layerCode = '0';
    if (layer === 'G') layerCode = '1';
    else if (layer === 'S') layerCode = '2';
    else if (layer === 'W') layerCode = '5';

    let categoryCode = '001';
    let subcategoryCode = '001';

    // Find the numeric codes from our mock data
    const categories = MOCK_TAXONOMY_DATA.categories[layer] || [];
    const categoryItem = categories.find(c => c.code === category);
    if (categoryItem) {
      categoryCode = categoryItem.numericCode;

      const key = `${layer}-${category}`;
      const subcategories = MOCK_TAXONOMY_DATA.subcategories[key] || [];
      const subcategoryItem = subcategories.find(s => s.code === subcategory);
      if (subcategoryItem) {
        subcategoryCode = subcategoryItem.numericCode;
      }
    }

    let mfa = `${layerCode}.${categoryCode}.${subcategoryCode}.${identifier}`;
    if (rest.length > 0) {
      mfa += '.' + rest.join('.');
    }

    return mfa;
  });
}

/**
 * Creates a mock implementation for taxonomyService.convertMFAtoHFN
 */
export function createMockConvertMFAtoHFN() {
  return jest.fn(mfa => {
    // Simple mapping for test cases
    if (mfa === '5.001.001.001') return 'W.BCH.SUN.001';
    if (mfa === '2.001.007.001') return 'S.POP.HPM.001';
    if (mfa === '5.003.001.001') return 'W.HIP.BAS.001';
    if (mfa === '1.001.001.001') return 'G.CAT.SUB.001';
    if (mfa === '2.005.001.001') return 'S.RCK.BAS.001';
    if (mfa === '5.001.002.001') return 'W.BCH.TRO.001';

    // Extension handling
    if (mfa === '5.001.001.002.mp4') return 'W.BCH.SUN.002.mp4';

    // Default fallback - convert MFA to HFN format
    const parts = mfa.split('.');
    const [
      layerNumeric,
      categoryNumeric,
      subcategoryNumeric,
      identifier,
      ...rest
    ] = parts;

    let layer = '';
    if (layerNumeric === '1') layer = 'G';
    else if (layerNumeric === '2') layer = 'S';
    else if (layerNumeric === '5') layer = 'W';

    return `${layer}.CAT.SUB.${identifier}${
      rest.length > 0 ? '.' + rest.join('.') : ''
    }`;
  });
}
