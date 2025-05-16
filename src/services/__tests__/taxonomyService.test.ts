/**
 * Tests for the Taxonomy Service
 */

import taxonomyService from '../taxonomyService';

describe('TaxonomyService', () => {
  describe('getCategories', () => {
    it('should return categories for a valid layer', () => {
      const categories = taxonomyService.getCategories('W');
      expect(categories.length).toBeGreaterThan(0);
      
      // Each category should have required properties
      const firstCategory = categories[0];
      expect(firstCategory).toHaveProperty('code');
      expect(firstCategory).toHaveProperty('numericCode');
      expect(firstCategory).toHaveProperty('name');
      expect(firstCategory).toHaveProperty('label');
    });

    it('should return an empty array for an invalid layer', () => {
      const categories = taxonomyService.getCategories('INVALID');
      expect(categories).toEqual([]);
    });
  });

  describe('getSubcategories', () => {
    it('should return subcategories for a valid layer and category', () => {
      const subcategories = taxonomyService.getSubcategories('W', 'BCH');
      expect(subcategories.length).toBeGreaterThan(0);
      
      // Each subcategory should have required properties
      const firstSubcategory = subcategories[0];
      expect(firstSubcategory).toHaveProperty('code');
      expect(firstSubcategory).toHaveProperty('numericCode');
      expect(firstSubcategory).toHaveProperty('name');
      expect(firstSubcategory).toHaveProperty('label');
    });

    it('should return an empty array for an invalid category', () => {
      const subcategories = taxonomyService.getSubcategories('W', 'INVALID');
      expect(subcategories).toEqual([]);
    });
    
    it('should handle the special case for W.BCH.SUN', () => {
      const subcategories = taxonomyService.getSubcategories('W', 'BCH');
      const sunSubcategory = subcategories.find(s => s.code === 'SUN');
      expect(sunSubcategory).toBeDefined();
      expect(sunSubcategory?.numericCode).toBe('003');
    });
  });

  describe('convertHFNtoMFA', () => {
    it('should correctly convert a standard HFN to MFA', () => {
      const testCases = [
        { hfn: 'G.POP.BAS.001', expected: '1.001.001.001' },
        { hfn: 'S.POP.BAS.001', expected: '2.001.001.001' },
        { hfn: 'L.STG.RED.001', expected: '3.001.001.001' },
        { hfn: 'G.POP.BAS.001.mp3', expected: '1.001.001.001.mp3' }
      ];
      
      testCases.forEach(({ hfn, expected }) => {
        expect(taxonomyService.convertHFNtoMFA(hfn)).toBe(expected);
      });
    });

    it('should handle the problematic W.BCH.SUN mapping correctly', () => {
      const testCases = [
        { hfn: 'W.BCH.SUN.001', expected: '5.004.003.001' },
        { hfn: 'W.BCH.SUN.002', expected: '5.004.003.002' },
        { hfn: 'W.BCH.SUN.003.mp4', expected: '5.004.003.003.mp4' }
      ];
      
      testCases.forEach(({ hfn, expected }) => {
        expect(taxonomyService.convertHFNtoMFA(hfn)).toBe(expected);
      });
    });

    it('should handle invalid HFNs gracefully', () => {
      const invalidHfns = [
        'INVALID',
        'W',
        'W.INVALID'
      ];
      
      invalidHfns.forEach(hfn => {
        const result = taxonomyService.convertHFNtoMFA(hfn);
        expect(result).toBe('');
      });
    });
  });

  describe('getTaxonomyPath', () => {
    it('should generate correct paths for layers', () => {
      expect(taxonomyService.getTaxonomyPath('W')).toBe('Worlds');
      expect(taxonomyService.getTaxonomyPath('G')).toBe('Songs');
    });
    
    it('should generate correct paths for layer and category', () => {
      expect(taxonomyService.getTaxonomyPath('W', 'BCH')).toBe('Worlds > Beach');
      expect(taxonomyService.getTaxonomyPath('G', 'POP')).toBe('Songs > Pop');
    });
    
    it('should generate correct paths for layer, category, and subcategory', () => {
      expect(taxonomyService.getTaxonomyPath('W', 'BCH', 'SUN')).toBe('Worlds > Beach > Sunset');
      expect(taxonomyService.getTaxonomyPath('G', 'POP', 'BAS')).toBe('Songs > Pop > Base');
    });
    
    it('should handle invalid inputs gracefully', () => {
      expect(taxonomyService.getTaxonomyPath('INVALID')).toBe('INVALID');
      expect(taxonomyService.getTaxonomyPath('W', 'INVALID')).toBe('Worlds > INVALID');
      expect(taxonomyService.getTaxonomyPath('W', 'BCH', 'INVALID')).toBe('Worlds > Beach > INVALID');
    });
  });
});