import taxonomyMapper from './taxonomyMapper';

/**
 * Tests for the taxonomy mapper to ensure it correctly handles all edge cases
 * and provides consistent display formatting across all components.
 */
describe('TaxonomyMapper', () => {
  // Clear the cache before each test for consistent results
  beforeEach(() => {
    taxonomyMapper.clearCache();
  });
  
  describe('formatNNAAddress', () => {
    it('should correctly format S.POP.HPM addresses', () => {
      // Special case: S.POP.HPM
      const { hfn, mfa } = taxonomyMapper.formatNNAAddress('S', 'POP', 'HPM', '001');
      expect(hfn).toBe('S.POP.HPM.001');
      expect(mfa).toBe('2.001.007.001');
      
      // Same case with numeric codes
      const numericFormat = taxonomyMapper.formatNNAAddress('S', '001', '007', '001');
      expect(numericFormat.hfn).toBe('S.POP.HPM.001');
      expect(numericFormat.mfa).toBe('2.001.007.001');
    });
    
    it('should correctly format W.STG.FES addresses', () => {
      // World layer with Stage Festival subcategory
      const { hfn, mfa } = taxonomyMapper.formatNNAAddress('W', 'STG', 'FES', '001');
      expect(hfn).toBe('W.STG.FES.001');
      expect(mfa).toBe('5.002.003.001');
      
      // Same using numeric codes
      const numericFormat = taxonomyMapper.formatNNAAddress('W', '002', '003', '001');
      expect(numericFormat.hfn).toBe('W.STG.FES.001');
      expect(numericFormat.mfa).toBe('5.002.003.001');
    });
    
    it('should correctly format W.HIP/W.URB addresses', () => {
      // Special case for urban/hipster in Worlds layer
      const { hfn, mfa } = taxonomyMapper.formatNNAAddress('W', 'HIP', 'BAS', '001');
      expect(hfn).toBe('W.HIP.BAS.001');
      expect(mfa).toBe('5.003.001.001');
      
      // Same using numeric codes
      const numericFormat = taxonomyMapper.formatNNAAddress('W', '003', '001', '001');
      expect(numericFormat.hfn).toBe('W.HIP.BAS.001');
      expect(numericFormat.mfa).toBe('5.003.001.001');
    });
    
    it('should handle edge cases gracefully', () => {
      // Invalid layer code
      const invalidLayer = taxonomyMapper.formatNNAAddress('X', 'POP', 'BAS', '001');
      expect(invalidLayer.hfn).toBe('X.POP.BAS.001');
      expect(invalidLayer.mfa).toBe('0.001.001.001');
      
      // Invalid category
      const invalidCategory = taxonomyMapper.formatNNAAddress('S', 'INVALID', 'BAS', '001');
      expect(invalidCategory.hfn).toBe('S.INV.BAS.001');
      expect(invalidCategory.mfa).toBe('2.001.001.001');
      
      // Invalid subcategory
      const invalidSubcategory = taxonomyMapper.formatNNAAddress('S', 'POP', 'INVALID', '001');
      expect(invalidSubcategory.hfn).toBe('S.POP.INV.001');
      expect(invalidSubcategory.mfa).toBe('2.001.001.001');
    });
  });
  
  describe('normalizeAddressForDisplay', () => {
    it('should ensure HFN addresses use alphabetic codes', () => {
      // Fix numeric category code in HFN
      const numericCategory = taxonomyMapper.normalizeAddressForDisplay('W.002.FES.001', 'hfn');
      expect(numericCategory).toBe('W.STG.FES.001');
      
      // Already correct HFN should remain unchanged
      const correctHfn = taxonomyMapper.normalizeAddressForDisplay('S.POP.HPM.001', 'hfn');
      expect(correctHfn).toBe('S.POP.HPM.001');
      
      // HFN with numeric subcategory should be fixed too
      const numericSubcategory = taxonomyMapper.normalizeAddressForDisplay('S.POP.007.001', 'hfn');
      expect(numericSubcategory).toBe('S.POP.HPM.001');
    });
    
    it('should handle converting MFA to HFN if needed', () => {
      // Convert MFA to HFN if requested
      const mfaToHfn = taxonomyMapper.normalizeAddressForDisplay('2.001.007.001', 'hfn');
      expect(mfaToHfn).toBe('S.POP.HPM.001');
      
      // Keeping MFA as is
      const keepMfa = taxonomyMapper.normalizeAddressForDisplay('2.001.007.001', 'mfa');
      expect(keepMfa).toBe('2.001.007.001');
    });
    
    it('should not change invalid formats', () => {
      // Invalid format should return unchanged
      const invalid = taxonomyMapper.normalizeAddressForDisplay('invalid-format', 'hfn');
      expect(invalid).toBe('invalid-format');
      
      // Empty string should remain empty
      const empty = taxonomyMapper.normalizeAddressForDisplay('', 'hfn');
      expect(empty).toBe('');
    });
  });
  
  describe('Special cases handling', () => {
    it('should handle S.POP.HPM case correctly', () => {
      // Test getting subcategory numeric code
      const hpmNumeric = taxonomyMapper.getSubcategoryNumericCode('S', 'POP', 'HPM');
      expect(hpmNumeric).toBe(7);
      
      // Test getting subcategory alphabetic code
      const hpmAlpha = taxonomyMapper.getSubcategoryAlphabeticCode('S', '001', '007');
      expect(hpmAlpha).toBe('HPM');
    });
    
    it('should handle W.URB/HIP case correctly', () => {
      // Test getting category numeric code
      const hipNumeric = taxonomyMapper.getCategoryNumericCode('W', 'HIP');
      expect(hipNumeric).toBe(3);
      
      // Test getting category alphabetic code
      const hipAlpha = taxonomyMapper.getCategoryAlphabeticCode('W', '003');
      expect(hipAlpha).toBe('HIP');
    });
  });
});