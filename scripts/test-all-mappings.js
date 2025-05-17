/**
 * Comprehensive testing script for the NNA taxonomy flattened implementation
 * This script tests all MVP layers and verifies specific mappings
 * Run with: node scripts/test-all-mappings.js
 */

const fs = require('fs');
const path = require('path');

// Layer numeric codes mapping
const LAYER_NUMERIC_CODES = {
  'G': '1', 'S': '2', 'L': '3', 'M': '4', 'W': '5',
  'B': '6', 'P': '7', 'T': '8', 'C': '9', 'R': '10'
};

// Load all layer data
const loadAllLayers = () => {
  const layers = {};
  const layerCodes = Object.keys(LAYER_NUMERIC_CODES);
  
  layerCodes.forEach(layer => {
    try {
      const filePath = path.join(__dirname, `../src/taxonomyLookup/${layer}_layer.ts`);
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract the lookup object using regex
        const lookupMatch = content.match(/export const \w+_LAYER_LOOKUP = ({[\s\S]*?});/);
        const subcategoriesMatch = content.match(/export const \w+_SUBCATEGORIES = ({[\s\S]*?});/);
        
        if (lookupMatch && subcategoriesMatch) {
          // Convert the string representations to objects (not safe for production, but ok for testing)
          const lookup = eval(`(${lookupMatch[1]})`);
          const subcategories = eval(`(${subcategoriesMatch[1]})`);
          layers[layer] = { lookup, subcategories };
        }
      }
    } catch (error) {
      console.error(`Error loading ${layer} layer:`, error.message);
    }
  });
  
  return layers;
};

// Simple HFN to MFA converter using the loaded layers
const convertHFNtoMFA = (hfn, layersData) => {
  try {
    const parts = hfn.split('.');
    if (parts.length < 3) {
      throw new Error(`Invalid HFN format: ${hfn}`);
    }
    
    const [layer, categoryCode, subcategoryCode, sequential, ...rest] = parts;
    
    // Get layer numeric code
    const layerNumeric = LAYER_NUMERIC_CODES[layer];
    if (!layerNumeric) {
      throw new Error(`Unknown layer: ${layer}`);
    }
    
    // Get layer data
    const layerData = layersData[layer];
    if (!layerData) {
      throw new Error(`Layer data not found: ${layer}`);
    }
    
    // Get category numeric code
    const categoryInfo = layerData.lookup[categoryCode];
    if (!categoryInfo) {
      throw new Error(`Category not found: ${layer}.${categoryCode}`);
    }
    
    // Get subcategory numeric code
    const fullSubcategoryCode = `${categoryCode}.${subcategoryCode}`;
    const subcategoryInfo = layerData.lookup[fullSubcategoryCode];
    if (!subcategoryInfo) {
      throw new Error(`Subcategory not found: ${fullSubcategoryCode}`);
    }
    
    // Build MFA
    const suffix = rest.length > 0 ? '.' + rest.join('.') : '';
    return `${layerNumeric}.${categoryInfo.numericCode}.${subcategoryInfo.numericCode}.${sequential}${suffix}`;
  } catch (error) {
    console.error(`Error converting HFN to MFA:`, error);
    return 'ERROR';
  }
};

// Load all layer data
console.log('Loading all layer data...');
const allLayers = loadAllLayers();
console.log(`Loaded ${Object.keys(allLayers).length} layers`);
console.log('');

// Test specific mappings for each layer
console.log('=== TESTING SPECIFIC MAPPINGS ===');

// Define test cases for each layer using actual implemented categories
const testCases = {
  'W': [
    { hfn: 'W.BCH.SUN.001', expectedMfa: '5.004.003.001', description: 'Beach - Sunset' },
    { hfn: 'W.STG.FES.001', expectedMfa: '5.002.003.001', description: 'Stage - Festival' }
  ],
  'G': [
    { hfn: 'G.POP.BAS.001', expectedMfa: '1.001.001.001', description: 'Pop - Base' },
    { hfn: 'G.RAP.BAS.001', expectedMfa: '1.002.001.001', description: 'Rap - Base' }
  ],
  'S': [
    { hfn: 'S.POP.HPM.001', expectedMfa: '2.001.007.001', description: 'Pop - Hipster Male' },
    { hfn: 'S.POP.BAS.001', expectedMfa: '2.003.001.001', description: 'Pop - Base' }
  ],
  'L': [
    { hfn: 'L.CAS.BAS.001', expectedMfa: '3.001.001.001', description: 'Casual - Base' },
    { hfn: 'L.FRM.BAS.001', expectedMfa: '3.002.001.001', description: 'Formal - Base' }
  ],
  'M': [
    { hfn: 'M.POP.BAS.001', expectedMfa: '4.001.001.001', description: 'Pop - Base' },
    { hfn: 'M.HIP.BAS.001', expectedMfa: '4.002.001.001', description: 'Hip Hop - Base' }
  ],
  'B': [
    { hfn: 'B.LUX.GUC.001', expectedMfa: '6.001.001.001', description: 'Luxury - Gucci' },
    { hfn: 'B.BEV.PEP.001', expectedMfa: '6.002.001.001', description: 'Beverage - Pepsi' }
  ],
  'P': [
    { hfn: 'P.FAC.SWP.001', expectedMfa: '7.001.001.001', description: 'Face - Swap' },
    { hfn: 'P.VOI.FIL.001', expectedMfa: '7.002.001.001', description: 'Voice - Filter' }
  ],
  'T': [
    { hfn: 'T.DAT.SET.001', expectedMfa: '8.001.001.001', description: 'Data - Set' },
    { hfn: 'T.PRO.TXT.001', expectedMfa: '8.002.001.001', description: 'Prompt - Text' }
  ],
  'C': [
    { hfn: 'C.MIX.BAS.001', expectedMfa: '9.001.001.001', description: 'Mix - Basic' },
    { hfn: 'C.RMX.PRO.001', expectedMfa: '9.002.001.001', description: 'Remix - Professional' }
  ],
  'R': [
    { hfn: 'R.HST.OWN.001', expectedMfa: '10.001.001.001', description: 'Host - Owner' },
    { hfn: 'R.DEC.LAW.001', expectedMfa: '10.002.001.001', description: 'Decision - Law' }
  ]
};

// Run tests for all layers
Object.keys(testCases).forEach(layer => {
  console.log(`Layer ${layer} (${LAYER_NUMERIC_CODES[layer]}):`);
  
  if (!allLayers[layer]) {
    console.log(`  ❌ Layer data not found`);
    return;
  }
  
  testCases[layer].forEach(testCase => {
    const actualMfa = convertHFNtoMFA(testCase.hfn, allLayers);
    const isCorrect = actualMfa === testCase.expectedMfa;
    
    console.log(`  ${isCorrect ? '✅' : '❌'} ${testCase.hfn} -> ${actualMfa}`);
    console.log(`    Expected: ${testCase.expectedMfa}`);
    console.log(`    Description: ${testCase.description}`);
  });
  
  console.log('');
});

// Test W.BCH.SUN specifically
console.log('=== SPECIAL CASE: W.BCH.SUN ===');
const wbchsunHfn = 'W.BCH.SUN.001';
const wbchsunMfa = convertHFNtoMFA(wbchsunHfn, allLayers);
const isWbchsunCorrect = wbchsunMfa === '5.004.003.001';

console.log(`${isWbchsunCorrect ? '✅' : '❌'} ${wbchsunHfn} -> ${wbchsunMfa}`);
console.log(`  Expected: 5.004.003.001`);
console.log(`  Description: This is the special case that needed fixing`);
console.log('');

// Test S.POP.HPM specifically
console.log('=== SPECIAL CASE: S.POP.HPM ===');
const spopHpnHfn = 'S.POP.HPM.001';
const spopHpnMfa = convertHFNtoMFA(spopHpnHfn, allLayers);
// Note: Our implementation maps S.POP.HPM to 2.001.007.001
const isSpopHpnCorrect = spopHpnMfa === '2.001.007.001';

console.log(`${isSpopHpnCorrect ? '✅' : '❌'} ${spopHpnHfn} -> ${spopHpnMfa}`);
console.log(`  Expected: 2.001.007.001`);
console.log(`  Description: This is another special case that needed verification`);
console.log('');

// Test generating all possible HFN/MFA pairs for each layer
console.log('=== GENERATING ALL MAPPINGS ===');

Object.keys(allLayers).forEach(layer => {
  console.log(`Layer ${layer}:`);
  
  const layerData = allLayers[layer];
  let totalMappings = 0;
  
  // Get all categories
  const categories = Object.keys(layerData.subcategories);
  
  categories.forEach(categoryCode => {
    const subcategories = layerData.subcategories[categoryCode];
    
    subcategories.forEach(fullSubcategoryCode => {
      const subcategoryCode = fullSubcategoryCode.split('.')[1];
      const hfn = `${layer}.${categoryCode}.${subcategoryCode}.001`;
      const mfa = convertHFNtoMFA(hfn, allLayers);
      
      if (mfa !== 'ERROR') {
        totalMappings++;
      }
    });
  });
  
  console.log(`  Generated ${totalMappings} valid mappings`);
});

console.log('\n=== TESTING COMPLETE ===');