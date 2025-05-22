// src/utils/taxonomyQuickTest.js
import { 
  getLayers, 
  getCategories, 
  getSubcategories 
} from '../services/enhancedTaxonomyService';

export function runQuickTaxonomyTest() {
  console.log('=== QUICK TAXONOMY TEST ===');
  
  // Test problematic combinations
  const testCases = [
    { layer: 'S', category: 'DNC' },
    { layer: 'L', category: 'PRF' },
    { layer: 'L', category: 'URB' },
    { layer: 'S', category: 'ALT' }
  ];
  
  testCases.forEach(({ layer, category }) => {
    console.log(`\nTesting ${layer}.${category}:`);
    try {
      const subcategories = getSubcategories(layer, category);
      console.log(`Result: ${subcategories.length} subcategories`);
      console.log('Data:', subcategories);
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }
  });
  
  console.log('=== END QUICK TEST ===');
}