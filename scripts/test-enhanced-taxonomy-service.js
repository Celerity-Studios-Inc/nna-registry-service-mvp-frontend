/**
 * Test Enhanced Taxonomy Service
 * 
 * This script tests the functionality of the enhanced taxonomy service by:
 * 1. Loading taxonomy data directly from source files
 * 2. Simulating the service's behavior for problematic layer/category combinations
 * 3. Comparing results from different data sources
 */

const fs = require('fs');
const path = require('path');

console.log('=== ENHANCED TAXONOMY SERVICE TEST ===');

// Problematic combinations to test
const TEST_CASES = [
  { layer: 'L', category: 'PRF', description: 'Looks - Modern_Performance' },
  { layer: 'S', category: 'DNC', description: 'Stars - Dance_Electronic' },
  { layer: 'S', category: 'POP', description: 'Stars - Pop (for comparison)' }
];

// Mock the taxonomyFallbackData
const mockFallbackData = {
  L_SUBCATEGORIES: {
    PRF: [
      'PRF.BAS',
      'PRF.LEO',
      'PRF.SEQ',
      'PRF.LED',
      'PRF.ATH',
      'PRF.MIN',
      'PRF.SPK',
    ]
  },
  S_SUBCATEGORIES: {
    DNC: [
      'DNC.BAS',
      'DNC.PRD',
      'DNC.HSE',
      'DNC.TEC',
      'DNC.TRN',
      'DNC.DUB',
      'DNC.FUT',
      'DNC.DNB',
      'DNC.AMB',
      'DNC.LIV',
      'DNC.EXP',
    ],
    POP: [
      'POP.BAS',
      'POP.DIV',
      'POP.IDF',
      'POP.LGF',
      'POP.LGM',
      'POP.ICM',
      'POP.HPM',
      // ... more items
    ]
  },
  FALLBACK_SUBCATEGORIES: {
    L: {
      PRF: [
        { code: 'BAS', numericCode: '001', name: 'Base' },
        { code: 'LEO', numericCode: '002', name: 'Leotard' },
        // ... more items
      ]
    },
    S: {
      DNC: [
        { code: 'BAS', numericCode: '001', name: 'Base' },
        { code: 'PRD', numericCode: '002', name: 'Producer' },
        // ... more items
      ]
    }
  }
};

// Read taxonomy JSON
const taxonomyPath = path.join(__dirname, '../src/assets/enriched_nna_layer_taxonomy_v1.3.json');
const taxonomyData = JSON.parse(fs.readFileSync(taxonomyPath, 'utf8'));

// Mock the logger
const logger = {
  debug: (...args) => console.log('[DEBUG]', ...args),
  info: (...args) => console.log('[INFO]', ...args),
  warn: (...args) => console.log('[WARN]', ...args),
  error: (...args) => console.log('[ERROR]', ...args),
  group: (name) => console.group(name),
  groupEnd: () => console.groupEnd()
};

/**
 * Simulate the enhanced taxonomy service's getSubcategories function
 */
function simulateGetSubcategories(layer, categoryCode) {
  console.log(`\n=== Testing ${layer}.${categoryCode} ===`);
  
  // Normalize inputs
  const normalizedLayer = layer.toUpperCase();
  const normalizedCategoryCode = categoryCode.toUpperCase();
  
  // Track source for debugging
  let source = 'unknown';
  
  try {
    // 1. Check hardcoded fallbacks
    if (mockFallbackData.FALLBACK_SUBCATEGORIES[normalizedLayer]?.[normalizedCategoryCode]) {
      console.log(`Using hardcoded fallback data for ${normalizedLayer}.${normalizedCategoryCode}`);
      return {
        source: 'hardcoded_fallback',
        subcategories: mockFallbackData.FALLBACK_SUBCATEGORIES[normalizedLayer][normalizedCategoryCode]
      };
    }
    
    // 2. Check for subcategories in LAYER_SUBCATEGORIES
    let subcategories = [];
    if (normalizedLayer === 'L' && mockFallbackData.L_SUBCATEGORIES[normalizedCategoryCode]) {
      console.log(`Using L_SUBCATEGORIES for ${normalizedCategoryCode}`);
      subcategories = mockFallbackData.L_SUBCATEGORIES[normalizedCategoryCode];
      source = 'layer_subcategories';
    } else if (normalizedLayer === 'S' && mockFallbackData.S_SUBCATEGORIES[normalizedCategoryCode]) {
      console.log(`Using S_SUBCATEGORIES for ${normalizedCategoryCode}`);
      subcategories = mockFallbackData.S_SUBCATEGORIES[normalizedCategoryCode];
      source = 'layer_subcategories';
    }
    
    if (subcategories.length > 0) {
      console.log(`Found ${subcategories.length} subcategories in ${source}`);
      
      // Convert to TaxonomyItem objects (simplified)
      const result = subcategories.map(code => {
        const parts = code.split('.');
        const subCode = parts.length > 1 ? parts[1] : code;
        return {
          code: subCode,
          numericCode: String(Math.floor(Math.random() * 900) + 100), // Mock numeric code
          name: subCode.replace(/_/g, ' ')
        };
      });
      
      return { source, subcategories: result };
    }
    
    // 3. Try to find the category in taxonomy JSON
    console.log(`Attempting to find subcategories in taxonomy JSON`);
    source = 'taxonomy_json';
    
    if (!taxonomyData[normalizedLayer] || !taxonomyData[normalizedLayer].categories) {
      console.log(`Layer ${normalizedLayer} not found in taxonomy data`);
    } else {
      // Find the category in the taxonomy data
      let targetCategory = null;
      let categoryNum = null;
      
      Object.keys(taxonomyData[normalizedLayer].categories).forEach(catNum => {
        const category = taxonomyData[normalizedLayer].categories[catNum];
        if (category.code === normalizedCategoryCode) {
          targetCategory = category;
          categoryNum = catNum;
        }
      });
      
      if (!targetCategory || !targetCategory.subcategories) {
        console.log(`Category ${normalizedCategoryCode} not found in layer ${normalizedLayer}`);
      } else {
        console.log(`Found category ${normalizedCategoryCode} with ID ${categoryNum}`);
        
        // Extract subcategories
        const jsonSubcategories = [];
        
        Object.keys(targetCategory.subcategories).forEach(subNum => {
          const subcategory = targetCategory.subcategories[subNum];
          jsonSubcategories.push({
            code: subcategory.code,
            numericCode: subNum,
            name: subcategory.name || subcategory.code.replace(/_/g, ' ')
          });
        });
        
        console.log(`Found ${jsonSubcategories.length} subcategories in taxonomy JSON`);
        return { source, subcategories: jsonSubcategories };
      }
    }
    
    // 4. If all attempts failed, return empty array
    console.log(`No subcategories found for ${normalizedLayer}.${normalizedCategoryCode}`);
    return { source: 'none', subcategories: [] };
  } catch (error) {
    console.error(`Error simulating getSubcategories:`, error);
    return { source: 'error', subcategories: [], error };
  }
}

// Test each problematic combination
TEST_CASES.forEach(testCase => {
  const { layer, category, description } = testCase;
  console.log(`\n\n=== TESTING ${description} (${layer}.${category}) ===`);
  
  // Get subcategories
  const result = simulateGetSubcategories(layer, category);
  
  // Print summary
  console.log(`\nSUMMARY FOR ${layer}.${category}:`);
  console.log(`- Source: ${result.source}`);
  console.log(`- Found: ${result.subcategories.length} subcategories`);
  
  if (result.subcategories.length > 0) {
    console.log(`- Example subcategories:`);
    result.subcategories.slice(0, 3).forEach((sub, index) => {
      console.log(`  ${index + 1}. ${sub.code} (${sub.numericCode}) - ${sub.name}`);
    });
  }
  
  if (result.error) {
    console.log(`- Error: ${result.error}`);
  }
});

console.log('\n=== ENHANCED TAXONOMY SERVICE TEST COMPLETE ===');