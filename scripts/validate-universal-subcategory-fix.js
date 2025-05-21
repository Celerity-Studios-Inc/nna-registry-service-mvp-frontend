// Universal validation script for subcategory loading
// Tests all layer/category combinations to ensure our solution is generic

const fs = require('fs');
const path = require('path');

// Import all layer files from the taxonomyLookup directory
const taxonomyDir = path.join(__dirname, '../src/taxonomyLookup');
const layerFiles = fs.readdirSync(taxonomyDir)
  .filter(file => file.match(/^[A-Z]_layer\.ts$/));

console.log(`Testing subcategory loading for all ${layerFiles.length} layers...`);

// Create a mock version of the simpleTaxonomyService
// This uses the same core logic but in a simplified form for testing
function createMockTaxonomyService() {
  const layerLookups = {};
  const layerSubcategories = {};
  
  // Load all layer data
  for (const layerFile of layerFiles) {
    const layerCode = layerFile.charAt(0);
    const layerContent = fs.readFileSync(path.join(taxonomyDir, layerFile), 'utf8');
    
    // Extract the layer lookup object using regex
    const lookupMatch = layerContent.match(/export const ([A-Z])_LAYER_LOOKUP = ({[\s\S]*?});/);
    if (lookupMatch) {
      try {
        // Extract just the object literal part
        const objectStr = lookupMatch[2];
        
        // Make it into valid JSON by replacing single quotes with double quotes
        const jsonStr = objectStr
          .replace(/'/g, '"')
          .replace(/(\w+):/g, '"$1":'); // Convert property names to quoted strings
        
        // Parse the lookup object
        layerLookups[layerCode] = JSON.parse(jsonStr);
      } catch (e) {
        console.error(`Error parsing ${layerFile} lookup:`, e);
      }
    }
    
    // Extract the subcategories object using regex
    const subcatsMatch = layerContent.match(/export const ([A-Z])_SUBCATEGORIES = ({[\s\S]*?});/);
    if (subcatsMatch) {
      try {
        // Extract just the object literal part
        const objectStr = subcatsMatch[2];
        
        // Make it into valid JSON by replacing single quotes with double quotes
        const jsonStr = objectStr
          .replace(/'/g, '"')
          .replace(/(\w+):/g, '"$1":'); // Convert property names to quoted strings
        
        // Parse the subcategories object
        layerSubcategories[layerCode] = JSON.parse(jsonStr);
      } catch (e) {
        console.error(`Error parsing ${layerFile} subcategories:`, e);
      }
    }
  }
  
  // Create a simplified version of the getSubcategories function
  // This implements our new universal approach
  function getSubcategories(layer, categoryCode) {
    console.log(`Testing subcategories for ${layer}.${categoryCode}...`);
    
    // Skip if layer doesn't exist
    if (!layerLookups[layer]) {
      console.error(`Layer lookups not found for layer: ${layer}`);
      return [];
    }
    
    if (!layerSubcategories[layer]) {
      console.error(`Layer subcategories not found for layer: ${layer}`);
      return [];
    }
    
    // START UNIVERSAL APPROACH
    let subcategoryCodes = [];
    
    // Approach 1: Get from standard subcategories mapping
    if (layerSubcategories[layer][categoryCode]) {
      const rawCodes = layerSubcategories[layer][categoryCode];
      subcategoryCodes = Array.isArray(rawCodes) ? 
        rawCodes.filter(code => !!code && typeof code === 'string') : [];
        
      console.log(`  Found ${subcategoryCodes.length} subcategories from primary source`);
    }
    
    // Approach 2: Derive from LAYER_LOOKUPS by finding entries with the proper prefix
    if (subcategoryCodes.length === 0) {
      console.log(`  Using fallback to derive subcategories`);
      
      // Look for any entry in LAYER_LOOKUPS that starts with the categoryCode
      const derivedCodes = Object.keys(layerLookups[layer])
        .filter(key => {
          // Match entries like 'PRF.BAS', 'PRF.LEO', etc. for 'PRF' category
          return key.startsWith(`${categoryCode}.`) && key.split('.').length === 2;
        });
        
      if (derivedCodes.length > 0) {
        console.log(`  Successfully derived ${derivedCodes.length} subcategories from lookups`);
        subcategoryCodes = derivedCodes;
      }
    }
    
    // Approach 3: Try pattern matching as last resort
    if (subcategoryCodes.length === 0) {
      console.log(`  Using pattern matching as last resort`);
      
      // Look for all entries in the layer and extract ones that might match our category
      const allLayerKeys = Object.keys(layerLookups[layer]);
      
      // Try to find category prefix pattern in the keys
      const keyPattern = new RegExp(`^${categoryCode}\\.\\w+$`, 'i');
      const matchingKeys = allLayerKeys.filter(key => keyPattern.test(key));
      
      if (matchingKeys.length > 0) {
        console.log(`  Found ${matchingKeys.length} subcategory candidates using pattern matching`);
        subcategoryCodes = matchingKeys;
      }
    }
    
    if (!subcategoryCodes.length) {
      console.error(`  ❌ NO SUBCATEGORIES FOUND for ${layer}.${categoryCode} after all attempts`);
      return [];
    }
    
    // Process subcategories into TaxonomyItems
    const results = [];
    for (const fullCode of subcategoryCodes) {
      try {
        if (!fullCode) continue;
        
        const subcategoryEntry = layerLookups[layer][fullCode];
        if (!subcategoryEntry) {
          console.warn(`  Subcategory entry not found: ${layer}.${fullCode}`);
          continue;
        }
        
        const parts = fullCode.split('.');
        const subcategoryCode = parts[1]; // Get the part after the dot
        
        results.push({
          code: subcategoryCode,
          numericCode: subcategoryEntry.numericCode,
          name: subcategoryEntry.name,
        });
      } catch (e) {
        console.error(`  Error processing subcategory ${fullCode}:`, e);
      }
    }
    
    console.log(`  ✅ Processed ${results.length}/${subcategoryCodes.length} subcategories`);
    return results;
  }
  
  return {
    getSubcategories,
    layerLookups,
    layerSubcategories
  };
}

// Create our mock service
const mockService = createMockTaxonomyService();

// Function to test all category/subcategory combinations for a layer
function testLayer(layer) {
  console.log(`\n===============================`);
  console.log(`Testing Layer: ${layer}`);
  console.log(`===============================`);
  
  // Get all categories for this layer
  const categories = Object.keys(mockService.layerSubcategories[layer] || {});
  
  if (categories.length === 0) {
    console.error(`❌ No categories found for layer ${layer}`);
    return 0;
  }
  
  console.log(`Found ${categories.length} categories to test`);
  
  // Test each category
  let passCount = 0;
  let failCount = 0;
  
  for (const category of categories) {
    const subcategories = mockService.getSubcategories(layer, category);
    
    if (subcategories.length > 0) {
      console.log(`✅ ${layer}.${category}: Found ${subcategories.length} subcategories`);
      passCount++;
    } else {
      console.error(`❌ ${layer}.${category}: FAILED - No subcategories found`);
      failCount++;
    }
  }
  
  console.log(`\nLayer ${layer} Summary: ${passCount} passed, ${failCount} failed`);
  return passCount;
}

// Test all layers
let totalPassed = 0;
const layersToTest = Object.keys(mockService.layerLookups);

for (const layer of layersToTest) {
  totalPassed += testLayer(layer);
}

console.log(`\n==================================`);
console.log(`OVERALL SUMMARY: ${totalPassed} category/layer combinations tested successfully`);
console.log(`==================================`);