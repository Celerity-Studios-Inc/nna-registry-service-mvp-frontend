// Test script for L.PRF subcategories loading
const fs = require('fs');
const path = require('path');

// Read the L_layer.ts file directly
const lLayerPath = path.join(__dirname, '../src/taxonomyLookup/L_layer.ts');
const lLayerContent = fs.readFileSync(lLayerPath, 'utf8');

// Extract subcategories for PRF
console.log('Analyzing L.PRF subcategories...');
const prfSubcategoriesMatch = lLayerContent.match(/PRF: \[(.*?)\]/s);
if (prfSubcategoriesMatch && prfSubcategoriesMatch[1]) {
  const subcategoriesStr = prfSubcategoriesMatch[1].trim();
  const subcategories = subcategoriesStr.split(',').map(s => s.trim().replace(/['"]/g, ''));
  console.log(`Found ${subcategories.length} subcategories for L.PRF:`);
  console.log(subcategories);
  
  // Check each entry in L_LAYER_LOOKUP
  console.log('\nVerifying each subcategory in L_LAYER_LOOKUP:');
  for (const subcat of subcategories) {
    const searchStr = `'${subcat}': {`;
    if (lLayerContent.includes(searchStr)) {
      console.log(`✅ Found definition for ${subcat}`);
    } else {
      console.log(`❌ MISSING definition for ${subcat}`);
    }
  }
} else {
  console.error('Could not parse L.PRF subcategories');
}

// Extract subcategories for TRD for comparison
console.log('\nComparing with L.TRD subcategories...');
const trdSubcategoriesMatch = lLayerContent.match(/TRD: \[(.*?)\]/s);
if (trdSubcategoriesMatch && trdSubcategoriesMatch[1]) {
  const subcategoriesStr = trdSubcategoriesMatch[1].trim();
  const subcategories = subcategoriesStr.split(',').map(s => s.trim().replace(/['"]/g, ''));
  console.log(`Found ${subcategories.length} subcategories for L.TRD`);
}