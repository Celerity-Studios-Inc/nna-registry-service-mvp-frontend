/**
 * Taxonomy Validator
 * 
 * Utility for validating taxonomy data integrity and generating mapping tables
 * for verification and debugging.
 */
import { logger } from './logger';

/**
 * Validates the taxonomy data structure for completeness and consistency
 */
export function validateTaxonomyData(taxonomyData: any): { 
  valid: boolean; 
  issues: string[] 
} {
  const issues: string[] = [];
  const requiredLayers = ['G', 'S', 'L', 'M', 'W', 'B', 'P', 'T', 'C', 'R'];
  
  // Check if all required layers are present
  for (const layer of requiredLayers) {
    if (!taxonomyData[layer]) {
      issues.push(`Missing layer: ${layer}`);
    }
  }

  // Check categories and subcategories in each layer
  Object.keys(taxonomyData).forEach(layer => {
    // Skip non-layer properties like metadata
    if (requiredLayers.includes(layer)) {
      const layerData = taxonomyData[layer];
      
      if (typeof layerData !== 'object' || layerData === null) {
        issues.push(`Layer ${layer} has invalid data structure`);
        return;
      }

      // Check categories
      Object.keys(layerData).forEach(categoryKey => {
        const categoryData = layerData[categoryKey];
        
        // Skip non-category properties
        if (Array.isArray(categoryData)) {
          // Check for empty subcategories
          if (categoryData.length === 0) {
            issues.push(`Layer ${layer}, Category ${categoryKey} has no subcategories`);
          }
          
          // Check each subcategory
          categoryData.forEach((subcategory, index) => {
            if (!subcategory.code) {
              issues.push(`Layer ${layer}, Category ${categoryKey}, Subcategory at index ${index} is missing code`);
            }
            
            if (!subcategory.numericCode) {
              issues.push(`Layer ${layer}, Category ${categoryKey}, Subcategory ${subcategory.code || index} is missing numericCode`);
            }
            
            if (!subcategory.name) {
              issues.push(`Layer ${layer}, Category ${categoryKey}, Subcategory ${subcategory.code || index} is missing name`);
            }
          });
        }
      });
    }
  });

  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Validates the W.BCH.SUN mapping specifically
 */
export function validateWBchSunMapping(convertFunction: (hfn: string) => string): { 
  valid: boolean; 
  actual: string;
  expected: string;
} {
  const hfn = 'W.BCH.SUN.001';
  const expected = '5.004.003.001';
  const actual = convertFunction(hfn);
  
  return {
    valid: actual === expected,
    actual,
    expected
  };
}

/**
 * Entry representing a mapping between HFN and MFA
 */
export interface MappingEntry {
  hfn: string;
  mfa: string;
  categoryName: string;
  subcategoryName: string;
  isSpecialCase?: boolean;
}

/**
 * Generates a mapping table for a specific layer
 * This is helpful for verification and debugging
 */
export function generateMappingTable(
  layer: string, 
  getCategories: (layer: string) => any[],
  getSubcategories: (layer: string, category: string) => any[],
  convertHFNtoMFA: (hfn: string) => string
): MappingEntry[] {
  const mappings: MappingEntry[] = [];
  const specialCases = ['W.BCH.SUN'];
  
  try {
    const categories = getCategories(layer);
    
    for (const category of categories) {
      const subcategories = getSubcategories(layer, category.code);
      
      for (const subcategory of subcategories) {
        // Generate a sample HFN with sequential number 001
        const hfn = `${layer}.${category.code}.${subcategory.code}.001`;
        
        // Convert to MFA
        const mfa = convertHFNtoMFA(hfn);
        
        // Check if this is a special case
        const isSpecialCase = specialCases.includes(`${layer}.${category.code}.${subcategory.code}`);
        
        // Add to mappings
        mappings.push({
          hfn,
          mfa,
          categoryName: category.name || category.code,
          subcategoryName: subcategory.name || subcategory.code,
          isSpecialCase
        });
      }
    }
  } catch (error) {
    logger.error('Error generating mapping table:', error);
  }
  
  return mappings;
}

/**
 * Prints a nicely formatted table of mappings
 */
export function printMappingTable(mappings: MappingEntry[]): void {
  console.log('Taxonomy Mappings');
  console.log('-----------------------------------');
  console.log('HFN                | MFA                | Category          | Subcategory');
  console.log('------------------|--------------------|--------------------|--------------------');
  
  mappings.forEach(entry => {
    const specialMarker = entry.isSpecialCase ? '* ' : '  ';
    console.log(
      `${specialMarker}${entry.hfn.padEnd(16)} | ${entry.mfa.padEnd(18)} | ${entry.categoryName.padEnd(18)} | ${entry.subcategoryName}`
    );
  });
  
  console.log('-----------------------------------');
  console.log(`Total mappings: ${mappings.length}`);
  
  // Count and print special cases
  const specialCases = mappings.filter(m => m.isSpecialCase);
  if (specialCases.length > 0) {
    console.log(`Special cases (marked with *): ${specialCases.length}`);
    specialCases.forEach(sc => {
      console.log(`* ${sc.hfn} -> ${sc.mfa}`);
    });
  }
}