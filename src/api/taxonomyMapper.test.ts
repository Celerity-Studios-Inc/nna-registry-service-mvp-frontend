/**
 * Simple test for taxonomyMapper
 */
import taxonomyMapper from './taxonomyMapper';
import { flattenedTaxonomy } from '../utils/taxonomyFlattener';

// Mock the taxonomyLookup constants module
// We can't reference external variables directly in the mock function
// so we'll mock with expected values that match the flattened taxonomy
jest.mock('../taxonomyLookup/constants', () => {
  // Create mock W layer lookup with values that match flattened taxonomy
  const W_LAYER_LOOKUP = {
    'BCH': { numericCode: '004', name: 'Beach' },
    'STG': { numericCode: '002', name: 'Concert_Stages' },
    'BCH.SUN': { numericCode: '003', name: 'Sunset' },
    'STG.FES': { numericCode: '003', name: 'Festival' }
  };
  
  // Create mock S layer lookup with values that match flattened taxonomy
  const S_LAYER_LOOKUP = {
    'POP': { numericCode: '001', name: 'Pop' },
    'POP.HPM': { numericCode: '007', name: 'Pop_Hipster_Male_Stars' }
  };
  
  // Create mock subcategories as arrays of fully qualified category.subcategory keys
  const W_SUBCATEGORIES = {
    'BCH': ['BCH.SUN'],
    'STG': ['STG.FES']
  };
  
  const S_SUBCATEGORIES = {
    'POP': ['POP.HPM']
  };
  
  return {
    // Mock LAYER_LOOKUPS
    LAYER_LOOKUPS: {
      'W': W_LAYER_LOOKUP,
      'S': S_LAYER_LOOKUP
    },
    
    // Mock LAYER_SUBCATEGORIES
    LAYER_SUBCATEGORIES: {
      'W': W_SUBCATEGORIES,
      'S': S_SUBCATEGORIES
    }
  };
});

// Mock the logger
jest.mock('../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  }
}));

describe('TaxonomyMapper', () => {
  it('should normalize addresses from numeric to alphabetic format', () => {
    const result = taxonomyMapper.normalizeAddressForDisplay('W.002.003.001', 'hfn');
    console.log('Normalized result:', result);
    expect(result).toBe('W.STG.FES.001');
  });
  
  it('should handle the critical S.POP.HPM.001 case correctly', () => {
    // Get the expected MFA using the flattened taxonomy values
    // The constants in the mock match these values
    const expectedMFA = '2.001.007.001';
    
    // Test direct formatting with correct parameters
    const formatted = taxonomyMapper.formatNNAAddress('S', 'POP', 'HPM', '001', 'mfa');
    console.log('Formatted S.POP.HPM.001 as MFA:', formatted);
    expect(formatted).toBe(expectedMFA);
    
    // To get MFA from HFN, need to use a different function
    // Either use the internal convertHFNToMFA or call formatNNAAddress from component parts
    const hfn = 'S.POP.HPM.001';
    const parts = hfn.split('.');
    const mfaViaFormat = taxonomyMapper.formatNNAAddress(
      parts[0], parts[1], parts[2], parts[3], 'mfa'
    );
    console.log('HFN to MFA via formatting:', mfaViaFormat);
    expect(mfaViaFormat).toBe(expectedMFA);
  });
});