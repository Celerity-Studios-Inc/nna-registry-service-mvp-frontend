/**
 * Simplest possible taxonomyMapper.test.ts that should work
 */
import taxonomyMapper from './taxonomyMapper';

// Simplified mock for taxonomyLookup
jest.mock('../taxonomyLookup', () => {
  return {
    default: {
      layers: {
        G: { code: 'G', name: 'Songs', numericCode: 1 },
        S: { code: 'S', name: 'Stars', numericCode: 2 },
        W: { code: 'W', name: 'Worlds', numericCode: 5 }
      },
    },
    getLayerModule: (layerCode) => {
      if (layerCode === 'W') {
        return {
          getCategories: () => [
            { code: 'BCH', name: 'Beach', numericCode: 1 },
            { code: 'STG', name: 'Stage', numericCode: 2 }
          ],
          getSubcategories: (categoryCode) => {
            if (categoryCode === 'STG') {
              return [{ code: 'FES', name: 'Festival', numericCode: 3 }];
            }
            return [];
          }
        };
      }
      return { getCategories: () => [], getSubcategories: () => [] };
    }
  };
});

describe('TaxonomyMapper', () => {
  test('normalizeAddressForDisplay converts numeric to alphabetic in HFN', () => {
    // This is the specific test that's failing
    const numericCategory = taxonomyMapper.normalizeAddressForDisplay('W.002.003.001', 'hfn');
    expect(numericCategory).toBe('W.STG.FES.001');
  });
});


describe('TaxonomyMapper', () => {
  test('normalizeAddressForDisplay converts numeric to alphabetic in HFN', () => {
    // This is the specific test that's failing
    const numericCategory = taxonomyMapper.normalizeAddressForDisplay('W.002.003.001', 'hfn');
    expect(numericCategory).toBe('W.STG.FES.001');
  });
});