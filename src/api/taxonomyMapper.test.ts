/**
 * Simple test for taxonomyMapper
 */
import taxonomyMapper from './taxonomyMapper';

// Mock the taxonomyLookup modules
jest.mock('../taxonomyLookup', () => {
  return {
    // Provide mock layers data
    layers: {
      G: { code: 'G', name: 'Songs', numericCode: 1 },
      S: { code: 'S', name: 'Stars', numericCode: 2 },
      W: { code: 'W', name: 'Worlds', numericCode: 5 },
    },
    
    // Mock layer modules
    W_layer: {
      getCategories: () => [
        { code: 'BCH', name: 'Beach', numericCode: 1 },
        { code: 'STG', name: 'Stage', numericCode: 2 },
      ],
      getSubcategories: (category) => {
        if (category === 'STG') {
          return [{ code: 'FES', name: 'Festival', numericCode: 3 }];
        }
        return [];
      }
    },
    S_layer: {
      getCategories: () => [
        { code: 'POP', name: 'Pop', numericCode: 1 },
      ],
      getSubcategories: (category) => {
        if (category === 'POP') {
          return [{ code: 'HPM', name: 'Happy Mood', numericCode: 7 }];
        }
        return [];
      }
    },
    
    // Mock getLayerModule
    getLayerModule: jest.fn().mockImplementation((layer) => {
      if (layer === 'W') {
        return {
          getCategories: () => [
            { code: 'BCH', name: 'Beach', numericCode: 1 },
            { code: 'STG', name: 'Stage', numericCode: 2 },
          ],
          getSubcategories: (category) => {
            if (category === 'STG') {
              return [{ code: 'FES', name: 'Festival', numericCode: 3 }];
            }
            return [];
          }
        };
      }
      if (layer === 'S') {
        return {
          getCategories: () => [
            { code: 'POP', name: 'Pop', numericCode: 1 },
          ],
          getSubcategories: (category) => {
            if (category === 'POP') {
              return [{ code: 'HPM', name: 'Happy Mood', numericCode: 7 }];
            }
            return [];
          }
        };
      }
      return {
        getCategories: () => [],
        getSubcategories: () => []
      };
    })
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
    // Test direct formatting with correct parameters
    const formatted = taxonomyMapper.formatNNAAddress('S', 'POP', 'HPM', '001', 'mfa');
    console.log('Formatted S.POP.HPM.001 as MFA:', formatted);
    expect(formatted).toBe('2.001.007.001');
    
    // To get MFA from HFN, need to use a different function
    // Either use the internal convertHFNToMFA or call formatNNAAddress from component parts
    const hfn = 'S.POP.HPM.001';
    const parts = hfn.split('.');
    const mfaViaFormat = taxonomyMapper.formatNNAAddress(
      parts[0], parts[1], parts[2], parts[3], 'mfa'
    );
    console.log('HFN to MFA via formatting:', mfaViaFormat);
    expect(mfaViaFormat).toBe('2.001.007.001');
  });
});