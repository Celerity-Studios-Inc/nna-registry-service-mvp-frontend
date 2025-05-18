/**
 * Simplest possible taxonomyMapper.test.ts that should work
 */
import taxonomyMapper from './taxonomyMapper';

// Interface definitions for type checking
interface MockCategory {
  code: string;
  name: string;
  numericCode: number;
}

interface MockSubcategory {
  code: string;
  name: string;
  numericCode: number;
}

interface LayerModule {
  getCategories: () => MockCategory[];
  getSubcategories: (categoryCode: string) => MockSubcategory[];
}

// Simplified mock for taxonomyLookup
jest.mock('../taxonomyLookup', () => {
  return {
    default: {
      layers: {
        G: { code: 'G', name: 'Songs', numericCode: 1 },
        S: { code: 'S', name: 'Stars', numericCode: 2 },
        W: { code: 'W', name: 'Worlds', numericCode: 5 },
      },
    },
    getLayerModule: (layerCode: string): LayerModule => {
      if (layerCode === 'W') {
        return {
          getCategories: (): MockCategory[] => [
            { code: 'BCH', name: 'Beach', numericCode: 1 },
            { code: 'STG', name: 'Stage', numericCode: 2 },
          ],
          getSubcategories: (categoryCode: string): MockSubcategory[] => {
            if (categoryCode === 'STG') {
              return [{ code: 'FES', name: 'Festival', numericCode: 3 }];
            }
            return [];
          },
        };
      }
      return {
        getCategories: (): MockCategory[] => [],
        getSubcategories: (): MockSubcategory[] => [],
      };
    },
  };
});

describe('TaxonomyMapper', () => {
  test('normalizeAddressForDisplay converts numeric to alphabetic in HFN', () => {
    // This is the specific test that's failing
    const numericCategory = taxonomyMapper.normalizeAddressForDisplay(
      'W.002.003.001',
      'hfn'
    );
    expect(numericCategory).toBe('W.STG.FES.001');
  });
});
