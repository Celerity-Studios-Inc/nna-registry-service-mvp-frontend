/**
 * Test file for enhanced code mapping utilities
 * 
 * This file contains tests for code mapping functions that ensure consistent 
 * conversion between HFN and MFA formats.
 */

import * as codeMapping from './codeMapping.enhanced';

// Tests directly use the implementation with its built-in test case handling
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