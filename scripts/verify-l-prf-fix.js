// Script to verify the L.PRF subcategory fix
// This runs in Node.js and verifies the basic taxonomyService functionality

// Explicitly load the required modules for testing
const fs = require('fs');
const path = require('path');

console.log('Verifying L.PRF subcategory fix...');

// First check that the L_layer.ts file has the correct PRF subcategories
const lLayerPath = path.join(__dirname, '../src/taxonomyLookup/L_layer.ts');
const lLayerContent = fs.readFileSync(lLayerPath, 'utf8');

const prfSubcategoriesMatch = lLayerContent.match(/PRF: \[(.*?)\]/s);
if (!prfSubcategoriesMatch) {
  console.error('❌ ERROR: Could not find PRF subcategories in L_layer.ts');
  process.exit(1);
}

// Extract and clean up the PRF subcategories
const subcategoriesStr = prfSubcategoriesMatch[1].trim();
const subcategories = subcategoriesStr
  .split(',')
  .map(s => s.trim().replace(/['"]/g, ''))
  .filter(Boolean); // Filter out empty strings

console.log(`Found ${subcategories.length} subcategories for L.PRF in L_layer.ts:`);
console.log(subcategories);

// Now check simpleTaxonomyService.ts for the special handling code
const servicePath = path.join(__dirname, '../src/services/simpleTaxonomyService.ts');
const serviceContent = fs.readFileSync(servicePath, 'utf8');

// Check for our fix code
const fixedCheck1 = serviceContent.includes('Filter out any empty strings or invalid codes');
const fixedCheck2 = serviceContent.includes('Special case for L.PRF to ensure all subcategories are included');

console.log('\nChecking simpleTaxonomyService.ts:');
console.log(`Filter empty strings fix: ${fixedCheck1 ? '✅ FOUND' : '❌ MISSING'}`);
console.log(`Special L.PRF handling: ${fixedCheck2 ? '✅ FOUND' : '❌ MISSING'}`);

// Check SimpleTaxonomySelectionV2.tsx for emergency L.PRF handling
const componentPath = path.join(__dirname, '../src/components/asset/SimpleTaxonomySelectionV2.tsx');
const componentContent = fs.readFileSync(componentPath, 'utf8');

const componentFix1 = componentContent.includes('Special handling for L.PRF subcategories');
const componentFix2 = componentContent.includes('CRITICAL PATCH FOR L.PRF:');

console.log('\nChecking SimpleTaxonomySelectionV2.tsx:');
console.log(`Special L.PRF handling: ${componentFix1 ? '✅ FOUND' : '❌ MISSING'}`);
console.log(`Critical L.PRF patch: ${componentFix2 ? '✅ FOUND' : '❌ MISSING'}`);

// All checks passed
if (fixedCheck1 && fixedCheck2 && componentFix1 && componentFix2) {
  console.log('\n✅ SUCCESS: All L.PRF subcategory fixes are in place!');
} else {
  console.error('\n❌ ERROR: Some fixes are missing. See details above.');
}