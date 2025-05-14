/**
 * Test file for enhanced code mapping utilities
 * 
 * This file contains tests for the enhanced code mapping functions
 * that ensure consistent conversion between HFN and MFA formats
 */

import * as codeMapping from './codeMapping.enhanced';

// Mock taxonomyService here for testing
jest.mock('./taxonomyService', () => ({
  __esModule: true,
  default: {
    getLayer: jest.fn((layerCode: string) => {
      const mockLayers: Record<string, { name: string }> = {
        G: { name: 'Songs' },
        S: { name: 'Stars' },
        L: { name: 'Looks' },
        W: { name: 'Worlds' }
      };
      return mockLayers[layerCode] || null;
    }),
    getCategories: jest.fn((layerCode: string) => {
      const mockCategories: Record<string, Array<{ code: string, name: string, numericCode: number }>> = {
        S: [
          { code: 'POP', name: 'Pop', numericCode: 1 },
          { code: 'ROK', name: 'Rock', numericCode: 2 },
          { code: 'HIP', name: 'Hip-Hop', numericCode: 3 }
        ],
        W: [
          { code: 'NAT', name: 'Natural', numericCode: 15 },
          { code: 'HIP', name: 'Urban', numericCode: 3 }
        ]
      };
      return mockCategories[layerCode] || [];
    }),
    getSubcategories: jest.fn((layerCode: string, categoryCode: string) => {
      // Special case for Stars layer with Pop category
      if (layerCode === 'S' && (categoryCode === 'POP' || categoryCode === '001')) {
        return [
          { code: 'BAS', name: 'Base', numericCode: 1 },
          { code: 'DIV', name: 'Pop_Diva_Female_Stars', numericCode: 2 },
          { code: 'HPM', name: 'Pop_Hipster_Male_Stars', numericCode: 7 }
        ];
      }

      // Special case for Worlds layer with Urban category
      if (layerCode === 'W' && (categoryCode === 'HIP' || categoryCode === '003')) {
        return [
          { code: 'BAS', name: 'Base', numericCode: 1 },
          { code: 'STR', name: 'Street', numericCode: 2 }
        ];
      }

      // Default case
      return [
        { code: 'BAS', name: 'Base', numericCode: 1 }
      ];
    }),
    getCategoryAlphabeticCode: jest.fn((layerCode: string, numericCode: number) => {
      if (layerCode === 'S' && numericCode === 1) return 'POP';
      if (layerCode === 'W' && numericCode === 15) return 'NAT';
      if (layerCode === 'W' && numericCode === 3) return 'HIP';
      return '';
    }),
    getSubcategoryAlphabeticCode: jest.fn((layerCode: string, categoryNumericCode: number, subcategoryNumericCode: number) => {
      if (layerCode === 'S' && categoryNumericCode === 1 && subcategoryNumericCode === 7) return 'HPM';
      if (layerCode === 'W' && categoryNumericCode === 3 && subcategoryNumericCode === 1) return 'BAS';
      return 'BAS';
    }),
    getCategoryNumericCode: jest.fn((layerCode: string, categoryCode: string) => {
      if (layerCode === 'S' && categoryCode === 'POP') return 1;
      if (layerCode === 'W' && categoryCode === 'NAT') return 15;
      if (layerCode === 'W' && categoryCode === 'HIP') return 3;
      return 1;
    }),
    getSubcategoryNumericCode: jest.fn((layerCode: string, categoryCode: string, subcategoryCode: string) => {
      if (layerCode === 'S' && categoryCode === 'POP' && subcategoryCode === 'HPM') return 7;
      return 1;
    })
  }
}));

describe('NNA Code Mapping Utilities', () => {
  // Test layer code conversion
  describe('Layer code conversion', () => {
    test('getNumericLayerCode converts layer codes correctly', () => {
      expect(codeMapping.getNumericLayerCode('S')).toBe(2);
      expect(codeMapping.getNumericLayerCode('G')).toBe(1);
      expect(codeMapping.getNumericLayerCode('W')).toBe(5);
    });
    
    test('getLayerCodeFromNumeric converts numeric codes to layer codes', () => {
      expect(codeMapping.getLayerCodeFromNumeric(1)).toBe('G');
      expect(codeMapping.getLayerCodeFromNumeric(2)).toBe('S');
      expect(codeMapping.getLayerCodeFromNumeric(5)).toBe('W');
    });
    
    test('getLayerName returns full layer name', () => {
      expect(codeMapping.getLayerName('S')).toBe('Stars');
      expect(codeMapping.getLayerName('G')).toBe('Songs');
    });
  });
  
  // Test category code conversion
  describe('Category code conversion', () => {
    test('getCategoryAlphabeticCode converts various formats to alphabetic codes', () => {
      // From numeric code
      expect(codeMapping.getCategoryAlphabeticCode('S', '001')).toBe('POP');
      
      // From full name
      expect(codeMapping.getCategoryAlphabeticCode('W', 'Natural')).toBe('NAT');
      
      // Already alphabetic
      expect(codeMapping.getCategoryAlphabeticCode('S', 'POP')).toBe('POP');
    });
    
    test('getCategoryNumericCode converts various formats to numeric codes', () => {
      // From alphabetic code
      expect(codeMapping.getCategoryNumericCode('S', 'POP')).toBe(1);
      
      // From full name
      expect(codeMapping.getCategoryNumericCode('W', 'Natural')).toBe(15);
      
      // Already numeric
      expect(codeMapping.getCategoryNumericCode('S', '001')).toBe(1);
    });
  });
  
  // Test subcategory code conversion
  describe('Subcategory code conversion', () => {
    test('getSubcategoryAlphabeticCode converts various formats to alphabetic codes', () => {
      // From numeric code
      expect(codeMapping.getSubcategoryAlphabeticCode('S', 'POP', '007')).toBe('HPM');
      
      // From full name
      expect(codeMapping.getSubcategoryAlphabeticCode('S', 'POP', 'Pop_Hipster_Male_Stars')).toBe('HPM');
      
      // Already alphabetic
      expect(codeMapping.getSubcategoryAlphabeticCode('S', 'POP', 'HPM')).toBe('HPM');
      
      // Base case
      expect(codeMapping.getSubcategoryAlphabeticCode('W', 'NAT', 'Base')).toBe('BAS');
    });
    
    test('getSubcategoryNumericCode converts various formats to numeric codes', () => {
      // From alphabetic code
      expect(codeMapping.getSubcategoryNumericCode('S', 'POP', 'HPM')).toBe(7);
      
      // From full name
      expect(codeMapping.getSubcategoryNumericCode('S', 'POP', 'Pop_Hipster_Male_Stars')).toBe(7);
      
      // Already numeric
      expect(codeMapping.getSubcategoryNumericCode('S', 'POP', '007')).toBe(7);
      
      // Base case
      expect(codeMapping.getSubcategoryNumericCode('W', 'NAT', 'Base')).toBe(1);
    });
  });
  
  // Test address conversion
  describe('NNA address conversion', () => {
    test('convertHFNToMFA converts human-friendly to machine-friendly addresses', () => {
      expect(codeMapping.convertHFNToMFA('S.POP.HPM.001')).toBe('2.001.007.001');
      expect(codeMapping.convertHFNToMFA('W.HIP.BAS.001')).toBe('5.003.001.001');
      expect(codeMapping.convertHFNToMFA('G.POP.BAS.001')).toBe('1.001.001.001');
    });
    
    test('convertMFAToHFN converts machine-friendly to human-friendly addresses', () => {
      expect(codeMapping.convertMFAToHFN('2.001.007.001')).toBe('S.POP.HPM.001');
      expect(codeMapping.convertMFAToHFN('5.003.001.001')).toBe('W.HIP.BAS.001');
      expect(codeMapping.convertMFAToHFN('1.001.001.001')).toBe('G.POP.BAS.001');
    });
  });
  
  // Test formatted display
  describe('formatNNAAddressForDisplay', () => {
    test('handles S.POP.HPM case correctly', () => {
      const result = codeMapping.formatNNAAddressForDisplay('S', 'POP', 'HPM');
      expect(result.hfn).toBe('S.POP.HPM.000');
      expect(result.mfa).toBe('2.001.007.000');
    });
    
    test('handles numeric inputs correctly', () => {
      const result = codeMapping.formatNNAAddressForDisplay('S', '001', '007');
      expect(result.hfn).toBe('S.POP.HPM.000');
      expect(result.mfa).toBe('2.001.007.000');
    });
    
    test('handles W.HIP case correctly', () => {
      const result = codeMapping.formatNNAAddressForDisplay('W', 'HIP', 'BAS');
      expect(result.hfn).toBe('W.HIP.BAS.000');
      expect(result.mfa).toBe('5.003.001.000');
    });
    
    test('handles W.NAT case correctly', () => {
      const result = codeMapping.formatNNAAddressForDisplay('W', 'NAT', 'BAS');
      expect(result.hfn).toBe('W.NAT.BAS.000');
      expect(result.mfa).toBe('5.015.001.000');
    });
    
    test('handles sequential numbers correctly', () => {
      const result = codeMapping.formatNNAAddressForDisplay('S', 'POP', 'HPM', 42);
      expect(result.hfn).toBe('S.POP.HPM.042');
      expect(result.mfa).toBe('2.001.007.042');
    });
    
    test('handles full category names correctly', () => {
      const result = codeMapping.formatNNAAddressForDisplay('W', 'Natural', 'Base');
      expect(result.hfn).toBe('W.NAT.BAS.000');
      expect(result.mfa).toBe('5.015.001.000');
    });
  });
});