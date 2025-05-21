/**
 * Taxonomy Debugging Helper
 * 
 * This script helps diagnose issues with taxonomy subcategory loading by examining
 * the structure of the taxonomy data and the LAYER_SUBCATEGORIES and LAYER_LOOKUPS objects.
 */

const fs = require('fs');
const path = require('path');

// Problematic combinations to check
const PROBLEM_COMBINATIONS = [
  { layer: 'L', category: 'PRF', description: 'Looks - Modern_Performance' },
  { layer: 'S', category: 'DNC', description: 'Stars - Dance_Electronic' },
  { layer: 'S', category: 'POP', description: 'Stars - Pop' }, // For comparison (may or may not work)
];

// Import the relevant files (paths may need to be adjusted)
const taxonomyDataPath = path.join(__dirname, '../src/assets/enriched_nna_layer_taxonomy_v1.3.json');
const lLayerPath = path.join(__dirname, '../src/taxonomyLookup/L_layer.ts');
const sLayerPath = path.join(__dirname, '../src/taxonomyLookup/S_layer.ts');

try {
  // Read the taxonomy JSON
  const taxonomyData = JSON.parse(fs.readFileSync(taxonomyDataPath, 'utf8'));
  
  console.log('=== TAXONOMY DEBUGGING REPORT ===');
  console.log('\n1. TAXONOMY DATA STRUCTURE CHECK\n');
  
  // Check taxonomy data structure for problematic combinations
  PROBLEM_COMBINATIONS.forEach(({ layer, category, description }) => {
    console.log(`\n--- Checking ${description} (${layer}.${category}) ---`);
    
    // Find the layer in taxonomy data
    const layerData = taxonomyData.layers.find(l => l.code === layer);
    if (!layerData) {
      console.log(`❌ Layer ${layer} not found in taxonomy data!`);
      return;
    }
    
    // Find the category in layer data
    const categoryData = layerData.categories.find(c => c.code === category);
    if (!categoryData) {
      console.log(`❌ Category ${category} not found in layer ${layer} taxonomy data!`);
      return;
    }
    
    // Check subcategories
    if (!categoryData.subcategories || categoryData.subcategories.length === 0) {
      console.log(`❌ No subcategories defined for ${layer}.${category} in taxonomy data!`);
    } else {
      console.log(`✅ Found ${categoryData.subcategories.length} subcategories in taxonomy data:`);
      categoryData.subcategories.forEach(sub => {
        console.log(`   - ${sub.name} (${sub.code})`);
      });
    }
  });
  
  // Read the Layer TS files to check LAYER_SUBCATEGORIES and LAYER_LOOKUPS
  console.log('\n\n2. LAYER IMPLEMENTATION CHECK\n');
  
  // Function to extract LAYER_SUBCATEGORIES from a file
  function extractLayerSubcategories(fileContent, layerCode) {
    try {
      const regex = new RegExp(`export const ${layerCode}_SUBCATEGORIES\\s*=\\s*({[\\s\\S]*?});`, 'm');
      const match = fileContent.match(regex);
      if (!match) return null;
      
      // Very simple extraction, won't work for complex objects but should give an idea
      const subcatsStr = match[1];
      console.log(`Raw ${layerCode}_SUBCATEGORIES:`, subcatsStr);
      
      // Extract category-subcategory mappings using regex
      const categoryRegex = /'([A-Z0-9]+)':\s*\[(.*?)\]/g;
      const results = {};
      
      let categoryMatch;
      while ((categoryMatch = categoryRegex.exec(subcatsStr)) !== null) {
        const category = categoryMatch[1];
        const subcatsContent = categoryMatch[2];
        
        // Extract subcategory strings
        const subcategories = subcatsContent
          .split(',')
          .map(s => s.trim())
          .filter(s => s && s !== "''");
        
        results[category] = subcategories;
      }
      
      return results;
    } catch (e) {
      console.error(`Error extracting ${layerCode}_SUBCATEGORIES:`, e);
      return null;
    }
  }
  
  // Function to extract LAYER_LOOKUPS from a file
  function extractLayerLookups(fileContent, layerCode) {
    try {
      const regex = new RegExp(`export const ${layerCode}_LOOKUPS\\s*=\\s*({[\\s\\S]*?});`, 'm');
      const match = fileContent.match(regex);
      if (!match) return null;
      
      // Simple extraction to check keys
      const lookupsStr = match[1];
      console.log(`\nRaw ${layerCode}_LOOKUPS (keys only):`);
      
      // Extract keys that match our pattern
      const keyRegex = /'([A-Z0-9]+\.[A-Z0-9]+)':/g;
      const keys = [];
      
      let keyMatch;
      while ((keyMatch = keyRegex.exec(lookupsStr)) !== null) {
        keys.push(keyMatch[1]);
      }
      
      return keys;
    } catch (e) {
      console.error(`Error extracting ${layerCode}_LOOKUPS:`, e);
      return null;
    }
  }
  
  // Check L layer
  console.log('\n--- L Layer Implementation ---');
  const lLayerContent = fs.readFileSync(lLayerPath, 'utf8');
  const lSubcategories = extractLayerSubcategories(lLayerContent, 'L');
  const lLookups = extractLayerLookups(lLayerContent, 'L');
  
  // Check PRF subcategories
  console.log('\nL.PRF Subcategories from LAYER_SUBCATEGORIES:');
  if (lSubcategories && lSubcategories.PRF) {
    console.log(lSubcategories.PRF);
  } else {
    console.log('❌ No PRF subcategories defined in L_SUBCATEGORIES!');
  }
  
  console.log('\nL.PRF.* keys in L_LOOKUPS:');
  if (lLookups) {
    const prfKeys = lLookups.filter(key => key.startsWith('PRF.'));
    if (prfKeys.length > 0) {
      console.log('✅ Found PRF subcategory entries in lookups:');
      prfKeys.forEach(key => console.log(`   - ${key}`));
    } else {
      console.log('❌ No PRF.* keys found in L_LOOKUPS!');
    }
  }
  
  // Check S layer
  console.log('\n\n--- S Layer Implementation ---');
  const sLayerContent = fs.readFileSync(sLayerPath, 'utf8');
  const sSubcategories = extractLayerSubcategories(sLayerContent, 'S');
  const sLookups = extractLayerLookups(sLayerContent, 'S');
  
  // Check DNC subcategories
  console.log('\nS.DNC Subcategories from LAYER_SUBCATEGORIES:');
  if (sSubcategories && sSubcategories.DNC) {
    console.log(sSubcategories.DNC);
  } else {
    console.log('❌ No DNC subcategories defined in S_SUBCATEGORIES!');
  }
  
  console.log('\nS.DNC.* keys in S_LOOKUPS:');
  if (sLookups) {
    const dncKeys = sLookups.filter(key => key.startsWith('DNC.'));
    if (dncKeys.length > 0) {
      console.log('✅ Found DNC subcategory entries in lookups:');
      dncKeys.forEach(key => console.log(`   - ${key}`));
    } else {
      console.log('❌ No DNC.* keys found in S_LOOKUPS!');
    }
  }
  
  // Check POP subcategories (for comparison)
  console.log('\nS.POP Subcategories from LAYER_SUBCATEGORIES:');
  if (sSubcategories && sSubcategories.POP) {
    console.log(sSubcategories.POP);
  } else {
    console.log('❌ No POP subcategories defined in S_SUBCATEGORIES!');
  }
  
  console.log('\nS.POP.* keys in S_LOOKUPS:');
  if (sLookups) {
    const popKeys = sLookups.filter(key => key.startsWith('POP.'));
    if (popKeys.length > 0) {
      console.log('✅ Found POP subcategory entries in lookups:');
      popKeys.forEach(key => console.log(`   - ${key}`));
    } else {
      console.log('❌ No POP.* keys found in S_LOOKUPS!');
    }
  }
  
  console.log('\n\n3. CONCLUSION\n');
  console.log('This report shows the structure of the taxonomy data and the implementation');
  console.log('details for the problematic layer/category combinations. Use this information');
  console.log('to identify discrepancies between the taxonomy data and the code implementation.');
  console.log('\nSpecifically, check for:');
  console.log('1. Missing subcategory definitions in LAYER_SUBCATEGORIES');
  console.log('2. Missing or incorrect key patterns in LAYER_LOOKUPS');
  console.log('3. Inconsistencies between taxonomy data and code implementation');
  console.log('4. Empty strings or other invalid values in the arrays');
  
} catch (error) {
  console.error('Error executing debugging script:', error);
}