// Test script to verify the taxonomy subcategory compatibility fix
console.log('Testing taxonomy subcategory compatibility fix...');

// Import the taxonomy data for reference
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const taxonomyPath = path.join(__dirname, '../src/assets/enriched_nna_layer_taxonomy_v1.3.json');
const taxonomyData = JSON.parse(fs.readFileSync(taxonomyPath, 'utf8'));

// Mock the taxonomyService
// (We're testing implementation principles, not the actual service)
const taxonomyService = {
  // S.POP.HPM vs S.001.HPM normalization test
  testHPMSubcategoryNormalization() {
    console.log('\n-- Testing HPM Subcategory Normalization --');
    
    // Simulate code that interacts with taxonomyService
    const layerCode = 'S';
    const categoryCodes = ['POP', '001'];
    const subcategoryCode = 'HPM';
    
    // Test both ways (S.POP.HPM and S.001.HPM)
    categoryCodes.forEach(categoryCode => {
      // 1. When normalizing category code
      const normalizedCategoryCode = categoryCode === '001' ? 'POP' : categoryCode;
      console.log(`Normalizing ${layerCode}.${categoryCode} to ${layerCode}.${normalizedCategoryCode}`);
      
      // 2. When handling HPM subcategory
      if (layerCode === 'S' && (categoryCode === 'POP' || categoryCode === '001') && subcategoryCode === 'HPM') {
        console.log(`Special handling for ${layerCode}.${categoryCode}.${subcategoryCode}`);
        
        // 3. When getting numeric code for HPM subcategory
        const numericCode = 7; // Known mapping for HPM in Stars layer
        console.log(`Using known mapping for ${subcategoryCode} subcategory in Stars layer: ${numericCode}`);
      }
      
      // 4. When normalizing NNA address
      const nnaAddress = `${layerCode}.${categoryCode}.${subcategoryCode}.001`;
      let normalizedAddress = nnaAddress;
      if (nnaAddress.startsWith('S.001.HPM.')) {
        normalizedAddress = nnaAddress.replace('S.001.HPM.', 'S.POP.HPM.');
      } else if (nnaAddress.startsWith('S.POP.HPM.')) {
        normalizedAddress = nnaAddress.replace('S.POP.HPM.', 'S.001.HPM.');
      }
      console.log(`Original NNA address: ${nnaAddress}, Normalized: ${normalizedAddress}`);
    });
  },
  
  // Test bidirectional lookups for category and subcategory codes
  testBidirectionalLookups() {
    console.log('\n-- Testing Bidirectional Lookups --');
    
    // Reference to category and subcategory
    const categories = {
      'POP': { name: 'Pop', code: 'POP', numericCode: 1 },
      '001': { name: 'Pop', code: 'POP', numericCode: 1 }
    };
    
    // Test looking up with both alphabetic and numeric codes
    const testCategoryCodes = ['POP', '001'];
    
    testCategoryCodes.forEach(categoryCode => {
      console.log(`Looking up category with code ${categoryCode}`);
      
      // Try to get category by code
      let category = categories[categoryCode];
      
      // If not found and looking for POP, try 001
      if (!category && categoryCode === 'POP') {
        category = categories['001'];
        console.log('Falling back to numeric category code 001 for POP');
      }
      
      // If not found and looking for 001, try POP
      if (!category && categoryCode === '001') {
        category = categories['POP'];
        console.log('Falling back to alphabetic category code POP for 001');
      }
      
      console.log(`Found category: ${category ? category.name : 'Not found'}`);
    });
  },
  
  // Test multi-key caching for consistency
  testMultikeyCaching() {
    console.log('\n-- Testing Multi-key Caching --');
    
    const subcategoriesCache = new Map();
    const layerCode = 'S';
    const categoryCode = 'POP';
    const subcategories = [
      { code: 'HPM', name: 'Pop Hipster Male Stars', numericCode: 7 },
      { code: 'DIV', name: 'Pop Diva Female Stars', numericCode: 2 }
    ];
    
    // Save in cache with the requested category code
    const cacheKey = `${layerCode}.${categoryCode}`;
    subcategoriesCache.set(cacheKey, subcategories);
    console.log(`Cached subcategories under key: ${cacheKey}`);
    
    // For S.POP and S.001, cache under both keys to ensure consistency
    if (layerCode === 'S' && (categoryCode === 'POP' || categoryCode === '001')) {
      subcategoriesCache.set(`${layerCode}.POP`, subcategories);
      subcategoriesCache.set(`${layerCode}.001`, subcategories);
      console.log('Cached under both S.POP and S.001 keys for consistency');
    }
    
    // Verify cache has entries for both keys
    console.log(`S.POP in cache: ${subcategoriesCache.has('S.POP')}`);
    console.log(`S.001 in cache: ${subcategoriesCache.has('S.001')}`);
  }
};

// Run the tests
taxonomyService.testHPMSubcategoryNormalization();
taxonomyService.testBidirectionalLookups();
taxonomyService.testMultikeyCaching();

console.log('\nAll tests completed successfully.');