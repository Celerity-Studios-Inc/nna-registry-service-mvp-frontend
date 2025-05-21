/**
 * Simple Taxonomy Structure Check
 * 
 * This script simply checks the structure of the taxonomy JSON file
 * to help diagnose issues with subcategory loading.
 */

const fs = require('fs');
const path = require('path');

const taxonomyDataPath = path.join(__dirname, '../src/assets/enriched_nna_layer_taxonomy_v1.3.json');

try {
  // Read the taxonomy JSON
  const rawData = fs.readFileSync(taxonomyDataPath, 'utf8');
  console.log('Successfully read taxonomy file');
  
  // Log the file size
  console.log(`Taxonomy file size: ${rawData.length} bytes`);
  
  // Parse the JSON
  const taxonomyData = JSON.parse(rawData);
  console.log('Successfully parsed taxonomy JSON');
  
  // Log the high-level structure
  console.log('\n=== TAXONOMY STRUCTURE ===\n');
  console.log('Top-level keys:', Object.keys(taxonomyData));
  
  // Check if layers exist
  if (!taxonomyData.layers) {
    console.log('ERROR: No "layers" key found in taxonomy data!');
  } else {
    console.log(`Found ${taxonomyData.layers.length} layers`);
    
    // Print the layer codes
    const layerCodes = taxonomyData.layers.map(layer => layer.code);
    console.log('Layer codes:', layerCodes.join(', '));
    
    // Check L and S layers specifically
    const lLayer = taxonomyData.layers.find(layer => layer.code === 'L');
    const sLayer = taxonomyData.layers.find(layer => layer.code === 'S');
    
    console.log('\n--- L Layer Check ---');
    if (!lLayer) {
      console.log('ERROR: L layer not found!');
    } else {
      console.log('L layer found');
      
      // Check categories
      if (!lLayer.categories) {
        console.log('ERROR: No categories in L layer!');
      } else {
        console.log(`Found ${lLayer.categories.length} categories in L layer`);
        
        // Look for PRF category
        const prfCategory = lLayer.categories.find(cat => cat.code === 'PRF');
        if (!prfCategory) {
          console.log('ERROR: PRF category not found in L layer!');
        } else {
          console.log('PRF category found in L layer');
          
          // Check subcategories
          if (!prfCategory.subcategories) {
            console.log('ERROR: No subcategories for PRF category!');
          } else {
            console.log(`Found ${prfCategory.subcategories.length} subcategories for PRF`);
            prfCategory.subcategories.forEach((sub, i) => {
              console.log(`  ${i+1}. ${sub.name || 'unnamed'} (${sub.code || 'no code'})`);
            });
          }
        }
      }
    }
    
    console.log('\n--- S Layer Check ---');
    if (!sLayer) {
      console.log('ERROR: S layer not found!');
    } else {
      console.log('S layer found');
      
      // Check categories
      if (!sLayer.categories) {
        console.log('ERROR: No categories in S layer!');
      } else {
        console.log(`Found ${sLayer.categories.length} categories in S layer`);
        
        // Look for DNC category
        const dncCategory = sLayer.categories.find(cat => cat.code === 'DNC');
        if (!dncCategory) {
          console.log('ERROR: DNC category not found in S layer!');
        } else {
          console.log('DNC category found in S layer');
          
          // Check subcategories
          if (!dncCategory.subcategories) {
            console.log('ERROR: No subcategories for DNC category!');
          } else {
            console.log(`Found ${dncCategory.subcategories.length} subcategories for DNC`);
            dncCategory.subcategories.forEach((sub, i) => {
              console.log(`  ${i+1}. ${sub.name || 'unnamed'} (${sub.code || 'no code'})`);
            });
          }
        }
      }
    }
  }
  
  // Now check L_layer.ts and S_layer.ts
  console.log('\n=== CHECKING LAYER TS FILES ===\n');
  
  const lLayerPath = path.join(__dirname, '../src/taxonomyLookup/L_layer.ts');
  const sLayerPath = path.join(__dirname, '../src/taxonomyLookup/S_layer.ts');
  
  if (fs.existsSync(lLayerPath)) {
    console.log('L_layer.ts file exists');
    const content = fs.readFileSync(lLayerPath, 'utf8');
    
    // Simple check for PRF subcategories
    if (content.includes('PRF:')) {
      console.log('L_layer.ts contains PRF category definition');
      
      // Extract the PRF subcategories section
      const prfMatch = content.match(/['"]PRF['"]:\s*\[(.*?)\]/s);
      if (prfMatch) {
        console.log('Found PRF subcategories array:');
        console.log(prfMatch[1].trim());
      } else {
        console.log('Could not extract PRF subcategories array');
      }
    } else {
      console.log('WARNING: PRF category not found in L_layer.ts');
    }
  } else {
    console.log('ERROR: L_layer.ts file not found!');
  }
  
  if (fs.existsSync(sLayerPath)) {
    console.log('\nS_layer.ts file exists');
    const content = fs.readFileSync(sLayerPath, 'utf8');
    
    // Simple check for DNC subcategories
    if (content.includes('DNC:')) {
      console.log('S_layer.ts contains DNC category definition');
      
      // Extract the DNC subcategories section
      const dncMatch = content.match(/['"]DNC['"]:\s*\[(.*?)\]/s);
      if (dncMatch) {
        console.log('Found DNC subcategories array:');
        console.log(dncMatch[1].trim());
      } else {
        console.log('Could not extract DNC subcategories array');
      }
    } else {
      console.log('WARNING: DNC category not found in S_layer.ts');
    }
  } else {
    console.log('ERROR: S_layer.ts file not found!');
  }
  
  // Check simpleTaxonomyService.ts
  console.log('\n=== CHECKING TAXONOMY SERVICE ===\n');
  
  const serviceFilePath = path.join(__dirname, '../src/services/simpleTaxonomyService.ts');
  
  if (fs.existsSync(serviceFilePath)) {
    console.log('simpleTaxonomyService.ts file exists');
    const content = fs.readFileSync(serviceFilePath, 'utf8');
    
    // Check for getSubcategories method
    if (content.includes('getSubcategories')) {
      console.log('getSubcategories method found in simpleTaxonomyService.ts');
      
      // Check for universal fallback mechanism
      if (content.includes('universal fallback') || content.includes('UNIVERSAL FALLBACK')) {
        console.log('Universal fallback mechanism IS implemented in getSubcategories');
      } else {
        console.log('WARNING: Universal fallback mechanism NOT found in getSubcategories');
      }
      
      // Check for error handling
      if (content.includes('try {') && content.includes('catch (error)')) {
        console.log('Error handling IS implemented in taxonomy service');
      } else {
        console.log('WARNING: Complete error handling NOT found in taxonomy service');
      }
    } else {
      console.log('ERROR: getSubcategories method not found in simpleTaxonomyService.ts');
    }
  } else {
    console.log('ERROR: simpleTaxonomyService.ts file not found!');
  }
  
  console.log('\n=== TAXONOMY CHECK COMPLETE ===\n');
  
} catch (error) {
  console.error('Error executing taxonomy check script:', error);
}