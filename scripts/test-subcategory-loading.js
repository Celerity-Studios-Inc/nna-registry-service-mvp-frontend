/**
 * Test Subcategory Loading
 * 
 * This script tests the subcategory loading functionality for problematic layer/category combinations.
 * It mimics the logic in simpleTaxonomyService.ts to verify that the universal fallback mechanism works.
 */

const fs = require('fs');
const path = require('path');

// Mock the logger
const logger = {
  debug: console.log,
  info: console.log,
  warn: console.warn,
  error: console.error
};

// Load Layer TS files to check LAYER_SUBCATEGORIES and LAYER_LOOKUPS
// (This is a simplified approach - in the actual code this would come from imports)
function extractLayerData(filePath, layer) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract LAYER_LOOKUPS
    const lookupsMatch = content.match(new RegExp(`export const ${layer}_LAYER_LOOKUP\\s*=\\s*({[\\s\\S]*?});`, 'm'));
    
    // Extract LAYER_SUBCATEGORIES
    const subcategoriesMatch = content.match(new RegExp(`export const ${layer}_SUBCATEGORIES\\s*=\\s*({[\\s\\S]*?});`, 'm'));
    
    return {
      lookups: lookupsMatch ? lookupsMatch[1] : null,
      subcategories: subcategoriesMatch ? subcategoriesMatch[1] : null
    };
  } catch (error) {
    console.error(`Error reading or parsing ${filePath}:`, error);
    return { lookups: null, subcategories: null };
  }
}

// Load the L_layer.ts content
const lLayerPath = path.join(__dirname, '../src/taxonomyLookup/L_layer.ts');
const lLayerData = extractLayerData(lLayerPath, 'L');

// Load the S_layer.ts content
const sLayerPath = path.join(__dirname, '../src/taxonomyLookup/S_layer.ts');
const sLayerData = extractLayerData(sLayerPath, 'S');

console.log('=== Testing Subcategory Loading for Problematic Combinations ===');

// Parse L_SUBCATEGORIES to find PRF subcategories
if (lLayerData.subcategories) {
  console.log('\n--- L.PRF Test ---');
  const prfMatch = lLayerData.subcategories.match(/['"]PRF['"]:\s*\[(.*?)\]/s);
  
  if (prfMatch) {
    const prfSubcategories = prfMatch[1].trim()
      .split(',')
      .map(s => s.trim().replace(/['"]/g, ''))
      .filter(s => s);
    
    console.log('L_SUBCATEGORIES for PRF:', prfSubcategories);
    console.log('Count:', prfSubcategories.length);
    
    // Check if these subcategories exist in L_LOOKUPS
    if (lLayerData.lookups) {
      console.log('\nVerifying subcategories exist in L_LOOKUPS:');
      
      // Count PRF.* entries in L_LOOKUPS
      const prfLookupCount = (lLayerData.lookups.match(/['"]PRF\.[A-Z0-9]+['"]/g) || []).length;
      console.log(`Found ${prfLookupCount} PRF.* entries in L_LOOKUPS`);
      
      // Check each subcategory
      prfSubcategories.forEach(sub => {
        const fullCode = sub.includes('.') ? sub : `PRF.${sub}`;
        const exists = lLayerData.lookups.includes(`'${fullCode}'`) || 
                       lLayerData.lookups.includes(`"${fullCode}"`);
        console.log(`${fullCode}: ${exists ? 'Found' : 'Not found'} in L_LOOKUPS`);
      });
    }
  } else {
    console.log('PRF not found in L_SUBCATEGORIES!');
  }
}

// Parse S_SUBCATEGORIES to find DNC subcategories
if (sLayerData.subcategories) {
  console.log('\n--- S.DNC Test ---');
  const dncMatch = sLayerData.subcategories.match(/['"]DNC['"]:\s*\[(.*?)\]/s);
  
  if (dncMatch) {
    const dncSubcategories = dncMatch[1].trim()
      .split(',')
      .map(s => s.trim().replace(/['"]/g, ''))
      .filter(s => s);
    
    console.log('S_SUBCATEGORIES for DNC:', dncSubcategories);
    console.log('Count:', dncSubcategories.length);
    
    // Check if these subcategories exist in S_LOOKUPS
    if (sLayerData.lookups) {
      console.log('\nVerifying subcategories exist in S_LOOKUPS:');
      
      // Count DNC.* entries in S_LOOKUPS
      const dncLookupCount = (sLayerData.lookups.match(/['"]DNC\.[A-Z0-9]+['"]/g) || []).length;
      console.log(`Found ${dncLookupCount} DNC.* entries in S_LOOKUPS`);
      
      // Check each subcategory
      dncSubcategories.forEach(sub => {
        const fullCode = sub.includes('.') ? sub : `DNC.${sub}`;
        const exists = sLayerData.lookups.includes(`'${fullCode}'`) || 
                       sLayerData.lookups.includes(`"${fullCode}"`);
        console.log(`${fullCode}: ${exists ? 'Found' : 'Not found'} in S_LOOKUPS`);
      });
    }
  } else {
    console.log('DNC not found in S_SUBCATEGORIES!');
  }
}

// Simulate our universal fallback mechanism
console.log('\n=== Simulating Universal Fallback Mechanism ===');

function simulateGetSubcategories(layer, categoryCode) {
  console.log(`\nTesting getSubcategories for ${layer}.${categoryCode}`);
  
  // Step 1: Try to get from SUBCATEGORIES
  const layerData = layer === 'L' ? lLayerData : sLayerData;
  let subcategoriesList = [];
  
  if (layerData.subcategories) {
    // Simplified regex to find the category's subcategories
    const match = layerData.subcategories.match(new RegExp(`['"]${categoryCode}['"]:\\s*\\[(.*?)\\]`, 's'));
    
    if (match) {
      subcategoriesList = match[1].trim()
        .split(',')
        .map(s => s.trim().replace(/['"]/g, ''))
        .filter(s => s);
      
      console.log(`Primary method: Found ${subcategoriesList.length} subcategories for ${layer}.${categoryCode}`);
    } else {
      console.log(`Primary method: No subcategories found for ${layer}.${categoryCode}`);
    }
  }
  
  // Step 2: If no subcategories found, try the fallback method
  if (subcategoriesList.length === 0 && layerData.lookups) {
    console.log('Using universal fallback...');
    
    // Look for entries in LOOKUPS that match the pattern
    const regex = new RegExp(`['"]${categoryCode}\\.[A-Z0-9]+['"]`, 'g');
    const matches = layerData.lookups.match(regex) || [];
    
    if (matches.length > 0) {
      subcategoriesList = matches.map(m => m.replace(/['"]/g, ''));
      console.log(`Universal fallback: Found ${subcategoriesList.length} subcategories for ${layer}.${categoryCode}`);
    } else {
      console.log(`Universal fallback: No subcategories found for ${layer}.${categoryCode}`);
    }
  }
  
  return subcategoriesList;
}

// Test the problematic combinations
const lPrfSubcategories = simulateGetSubcategories('L', 'PRF');
console.log('L.PRF subcategories:', lPrfSubcategories);

const sDncSubcategories = simulateGetSubcategories('S', 'DNC');
console.log('S.DNC subcategories:', sDncSubcategories);

// Test with different case
console.log('\n=== Testing Case Sensitivity ===');
const lPrfLowerSubcategories = simulateGetSubcategories('L', 'prf');
console.log('L.prf (lowercase) subcategories count:', lPrfLowerSubcategories.length);

const sDncLowerSubcategories = simulateGetSubcategories('S', 'dnc');
console.log('S.dnc (lowercase) subcategories count:', sDncLowerSubcategories.length);

console.log('\nTest complete!');