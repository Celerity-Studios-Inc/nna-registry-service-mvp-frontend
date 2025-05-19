// src/services/taxonomyConverter.test.ts
import { TaxonomyConverter } from './taxonomyConverter';
import taxonomyService from '../api/taxonomyService';

// Mock the taxonomyService
jest.mock('../api/taxonomyService', () => ({
  __esModule: true,
  default: {
    getCategories: jest.fn(),
    getSubcategories: jest.fn(),
  },
}));

describe('TaxonomyConverter', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock category data
    (taxonomyService.getCategories as jest.Mock).mockImplementation(
      (layer: string) => {
        if (layer === 'S') {
          return [
            { code: 'POP', name: 'Pop', numericCode: 1 },
            { code: 'RCK', name: 'Rock', numericCode: 2 },
            { code: 'RAP', name: 'Rap', numericCode: 3 },
          ];
        }
        return [];
      }
    );

    // Mock subcategory data
    (taxonomyService.getSubcategories as jest.Mock).mockImplementation(
      (layer: string, categoryCode: string) => {
        if (layer === 'S' && categoryCode === 'POP') {
          return [
            { code: 'BAS', name: 'Base', numericCode: 1 },
            { code: 'DIV', name: 'Pop_Diva_Female_Stars', numericCode: 2 },
            { code: 'HPM', name: 'Pop_Hipster_Male_Stars', numericCode: 7 },
          ];
        }
        return [];
      }
    );
  });

  describe('getCategoryName', () => {
    it('should convert alphabetic category code to name', () => {
      expect(TaxonomyConverter.getCategoryName('S', 'POP')).toBe('Pop');
    });

    it('should convert numeric category code to name', () => {
      expect(TaxonomyConverter.getCategoryName('S', '001')).toBe('Pop');
    });
  });

  describe('getSubcategoryName', () => {
    it('should convert alphabetic subcategory code to name', () => {
      expect(TaxonomyConverter.getSubcategoryName('S', 'POP', 'HPM')).toBe(
        'Pop_Hipster_Male_Stars'
      );
    });

    it('should convert numeric subcategory code to name', () => {
      expect(TaxonomyConverter.getSubcategoryName('S', 'POP', '007')).toBe(
        'Pop_Hipster_Male_Stars'
      );
    });
  });

  describe('getBackendCategoryValue', () => {
    it('should return category name for backend API', () => {
      expect(TaxonomyConverter.getBackendCategoryValue('S', 'POP')).toBe('Pop');
    });

    it('should work with numeric codes too', () => {
      expect(TaxonomyConverter.getBackendCategoryValue('S', '001')).toBe('Pop');
    });
  });

  describe('getBackendSubcategoryValue', () => {
    it('should return subcategory name for backend API', () => {
      expect(
        TaxonomyConverter.getBackendSubcategoryValue('S', 'POP', 'HPM')
      ).toBe('Pop_Hipster_Male_Stars');
    });

    it('should work with numeric codes too', () => {
      expect(
        TaxonomyConverter.getBackendSubcategoryValue('S', '001', '007')
      ).toBe('Pop_Hipster_Male_Stars');
    });
  });

  describe('isValidCombination', () => {
    it('should validate a correct layer/category/subcategory combination', () => {
      expect(TaxonomyConverter.isValidCombination('S', 'POP', 'HPM')).toBe(
        true
      );
    });

    it('should reject an invalid layer/category/subcategory combination', () => {
      expect(TaxonomyConverter.isValidCombination('S', 'POP', 'XYZ')).toBe(
        false
      );
    });
  });

  describe('getAlphabeticCode', () => {
    it('should add the getAlphabeticCode method to support the existing codebase', () => {
      // Test the extended method works for category
      expect(TaxonomyConverter.getAlphabeticCode('S', 'category', '001')).toBe(
        'POP'
      );

      // Test it works for subcategory
      expect(
        TaxonomyConverter.getAlphabeticCode('S', 'subcategory', '007', 'POP')
      ).toBe('HPM');
    });
  });
});
