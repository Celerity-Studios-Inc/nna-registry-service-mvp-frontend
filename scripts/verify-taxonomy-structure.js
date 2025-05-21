/**
 * Taxonomy Structure Verification Script
 * 
 * This script analyzes the taxonomy structure in the enriched_nna_layer_taxonomy_v1.3.json file
 * to understand how the data is organized and verify the existence of layer/category/subcategory combinations.
 */

const fs = require('fs');
const path = require('path');

// Path to the taxonomy JSON file
const taxonomyDataPath = path.join(__dirname, '../src/assets/enriched_nna_layer_taxonomy_v1.3.json');

try {
  // Read and parse the taxonomy JSON file
  const rawData = fs.readFileSync(taxonomyDataPath, 'utf8');
  const taxonomyData = JSON.parse(rawData);
  
  console.log('=== TAXONOMY DATA STRUCTURE VERIFICATION ===');
  
  // Check top-level structure
  console.log('\n1. TOP-LEVEL STRUCTURE');
  console.log('Top level keys:', Object.keys(taxonomyData));
  
  // Check structure for specific layers (L and S)
  console.log('\n2. LAYER STRUCTURE');
  
  // L layer structure
  if (taxonomyData.L) {
    console.log('\nL layer exists');
    console.log('L layer top-level keys:', Object.keys(taxonomyData.L));
    
    // Check categories for L layer
    if (taxonomyData.L.categories) {
      console.log('L categories keys:', Object.keys(taxonomyData.L.categories));
      
      // Find PRF category
      const prfCategory = Object.values(taxonomyData.L.categories)
        .find(cat => cat.code === 'PRF');
      
      if (prfCategory) {
        console.log('\nPRF category found:');
        console.log('  - code:', prfCategory.code);
        console.log('  - name:', prfCategory.name);
        console.log('  - numericCode:', prfCategory.numericCode);
        
        // Check subcategories for L.PRF
        if (prfCategory.subcategories) {
          console.log('  - subcategories:', Object.keys(prfCategory.subcategories).length);
          console.log('  - subcategory codes:', 
            Object.values(prfCategory.subcategories).map(s => s.code));
        } else {
          console.log('  - subcategories: None found');
        }
      } else {
        console.log('\nPRF category not found in L layer');
      }
    } else {
      console.log('Categories not found in L layer');
    }
  } else {
    console.log('\nL layer not found in taxonomy data');
  }
  
  // S layer structure
  if (taxonomyData.S) {
    console.log('\nS layer exists');
    console.log('S layer top-level keys:', Object.keys(taxonomyData.S));
    
    // Check categories for S layer
    if (taxonomyData.S.categories) {
      console.log('S categories keys:', Object.keys(taxonomyData.S.categories));
      
      // Find DNC category
      const dncCategory = Object.values(taxonomyData.S.categories)
        .find(cat => cat.code === 'DNC');
      
      if (dncCategory) {
        console.log('\nDNC category found:');
        console.log('  - code:', dncCategory.code);
        console.log('  - name:', dncCategory.name);
        console.log('  - numericCode:', dncCategory.numericCode);
        
        // Check subcategories for S.DNC
        if (dncCategory.subcategories) {
          console.log('  - subcategories:', Object.keys(dncCategory.subcategories).length);
          console.log('  - subcategory codes:', 
            Object.values(dncCategory.subcategories).map(s => s.code));
        } else {
          console.log('  - subcategories: None found');
        }
      } else {
        console.log('\nDNC category not found in S layer');
      }
    } else {
      console.log('Categories not found in S layer');
    }
  } else {
    console.log('\nS layer not found in taxonomy data');
  }
  
  // Compare with hardcoded subcategories
  console.log('\n3. MAPPING BETWEEN JSON AND HARDCODED SUBCATEGORIES');
  
  // Add mock imports to emulate the imports in the actual code
  console.log('\nNote: This script cannot directly access the hardcoded subcategories in the TS files.');
  console.log('You should compare these results with the contents of L_SUBCATEGORIES and S_SUBCATEGORIES');
  console.log('in the L_layer.ts and S_layer.ts files respectively.');
  
  console.log('\n=== VERIFICATION COMPLETE ===');
  
} catch (error) {
  console.error('Error executing taxonomy structure verification:', error);
}