// Simple test script for our universal subcategory loading solution
// Focusing on L.PRF but testing a few other combinations to verify approach is general

// Mock the logger to avoid cluttering output
global.logger = {
  error: console.error,
  warn: console.warn,
  info: console.log,
  debug: console.log,
  taxonomy: () => {}
};

// Import key constants from taxonomy files directly
const L_LAYER = require('../src/taxonomyLookup/L_layer');
const S_LAYER = require('../src/taxonomyLookup/S_layer');

// Create simple versions of the required objects
const LAYER_LOOKUPS = {
  'L': L_LAYER.L_LAYER_LOOKUP,
  'S': S_LAYER.S_LAYER_LOOKUP
};

const LAYER_SUBCATEGORIES = {
  'L': L_LAYER.L_SUBCATEGORIES,
  'S': S_LAYER.S_SUBCATEGORIES
};

// Simplified version of the improved getSubcategories function
function getSubcategories(layer, categoryCode) {
  console.log(`\nTesting ${layer}.${categoryCode}...`);
  
  if (!LAYER_LOOKUPS[layer]) {
    console.error(`Layer lookups not found: ${layer}`);
    return [];
  }
  
  if (!LAYER_SUBCATEGORIES[layer]) {
    console.error(`Layer subcategories not found: ${layer}`);
    return [];
  }
  
  // IMPROVED APPROACH: First try to get subcategories from LAYER_SUBCATEGORIES
  let subcategoryCodes = [];
  
  if (LAYER_SUBCATEGORIES[layer][categoryCode]) {
    // Standard approach: Get from the subcategories mapping
    const rawCodes = LAYER_SUBCATEGORIES[layer][categoryCode];
    subcategoryCodes = Array.isArray(rawCodes) ? 
      rawCodes.filter(code => !!code && typeof code === 'string') : [];
      
    console.log(`Found ${subcategoryCodes.length} subcategories from primary source`);
  }
  
  // UNIVERSAL FALLBACK: If no subcategories found in the mapping,
  // derive them directly from LAYER_LOOKUPS by finding entries with the proper prefix
  if (subcategoryCodes.length === 0) {
    console.log(`Using universal fallback to derive subcategories`);
    
    // Look for any entry in LAYER_LOOKUPS that starts with the categoryCode
    const derivedCodes = Object.keys(LAYER_LOOKUPS[layer])
      .filter(key => {
        // Match entries like 'PRF.BAS', 'PRF.LEO', etc. for 'PRF' category
        return key.startsWith(`${categoryCode}.`) && key.split('.').length === 2;
      });
      
    if (derivedCodes.length > 0) {
      console.log(`Successfully derived ${derivedCodes.length} subcategories from lookups`);
      subcategoryCodes = derivedCodes;
    }
  }
  
  // If we still have no subcategories, try one more universal approach
  if (subcategoryCodes.length === 0) {
    // Look for all entries in the layer and extract ones that might match our category
    const allLayerKeys = Object.keys(LAYER_LOOKUPS[layer]);
    
    // Try to find category prefix pattern in the keys
    const keyPattern = new RegExp(`^${categoryCode}\\.\\w+$`, 'i');
    const matchingKeys = allLayerKeys.filter(key => keyPattern.test(key));
    
    if (matchingKeys.length > 0) {
      console.log(`Found ${matchingKeys.length} subcategory candidates using pattern matching`);
      subcategoryCodes = matchingKeys;
    }
  }

  if (!subcategoryCodes.length) {
    console.error(`NO SUBCATEGORIES FOUND for ${layer}.${categoryCode} after all fallback attempts`);
    return [];
  }
  
  // Process subcategories into results
  const results = [];
  for (const fullCode of subcategoryCodes) {
    try {
      if (!fullCode) continue;
      
      const subcategoryEntry = LAYER_LOOKUPS[layer][fullCode];
      if (!subcategoryEntry) {
        console.warn(`Subcategory entry not found: ${layer}.${fullCode}`);
        continue;
      }
      
      const parts = fullCode.split('.');
      const subcategoryCode = parts[1]; // Get the part after the dot
      
      // Filter out missing/malformed entries
      if (!subcategoryCode || !subcategoryEntry.numericCode || !subcategoryEntry.name) {
        console.warn(`Invalid subcategory entry for ${fullCode}`);
        continue;
      }
      
      results.push({
        code: subcategoryCode,
        numericCode: subcategoryEntry.numericCode,
        name: subcategoryEntry.name,
      });
    } catch (e) {
      console.error(`Error processing subcategory ${fullCode}:`, e);
    }
  }
  
  console.log(`✅ Processed ${results.length}/${subcategoryCodes.length} subcategories`);
  
  // Print them out
  if (results.length > 0) {
    console.log(`\nSubcategories for ${layer}.${categoryCode}:`);
    results.forEach(subcat => {
      console.log(`  ${subcat.code} (${subcat.numericCode}): ${subcat.name}`);
    });
  }
  
  return results;
}

// TEST CASES

// Test the previously problematic L.PRF case
const LPRFSubcategories = getSubcategories('L', 'PRF');
console.log(`\nL.PRF Results: ${LPRFSubcategories.length} subcategories found`);

// Test another L layer category
const LTRDSubcategories = getSubcategories('L', 'TRD');
console.log(`\nL.TRD Results: ${LTRDSubcategories.length} subcategories found`);

// Test an S layer category
const SPOPSubcategories = getSubcategories('S', 'POP');
console.log(`\nS.POP Results: ${SPOPSubcategories.length} subcategories found`);