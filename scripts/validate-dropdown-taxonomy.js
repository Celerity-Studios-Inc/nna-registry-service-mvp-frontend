// Quick validation script for the dropdown-based taxonomy selector implementation
const fs = require('fs');
const path = require('path');

// Validate files are present
console.log('Validating implementation files...');

const filesToCheck = [
  'src/components/taxonomy/DropdownBasedTaxonomySelector.tsx',
  'src/services/simpleTaxonomyService.ts',
  'src/pages/RegisterAssetPage.tsx'
];

let allFilesExist = true;
filesToCheck.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ Found: ${filePath}`);
  } else {
    console.log(`❌ Missing: ${filePath}`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.error('Some required files are missing. Implementation is incomplete.');
  process.exit(1);
}

// Check for key components in the DropdownBasedTaxonomySelector file
console.log('\nValidating component implementation...');
const selectorPath = path.join(process.cwd(), 'src/components/taxonomy/DropdownBasedTaxonomySelector.tsx');
const selectorContent = fs.readFileSync(selectorPath, 'utf8');

const requiredFeatures = [
  { name: 'formatNNAAddressForDisplay import', regex: /import.*formatNNAAddressForDisplay/ },
  { name: 'Category dropdown implementation', regex: /category-select-label/ },
  { name: 'Subcategory dropdown implementation', regex: /subcategory-select-label/ },
  { name: 'HFN/MFA display', regex: /NNA Address Preview/ },
  { name: 'Special case handling for S.POP.HPM', regex: /S\.POP\.HPM/ },
  { name: 'Special case handling for W.BCH.SUN', regex: /W\.BCH\.SUN/ }
];

let allFeaturesImplemented = true;
requiredFeatures.forEach(feature => {
  if (feature.regex.test(selectorContent)) {
    console.log(`✅ Implementation includes: ${feature.name}`);
  } else {
    console.log(`❌ Missing: ${feature.name}`);
    allFeaturesImplemented = false;
  }
});

// Check RegisterAssetPage for proper integration
console.log('\nValidating integration with RegisterAssetPage...');
const pagePath = path.join(process.cwd(), 'src/pages/RegisterAssetPage.tsx');
const pageContent = fs.readFileSync(pagePath, 'utf8');

if (/import DropdownBasedTaxonomySelector/.test(pageContent)) {
  console.log('✅ RegisterAssetPage imports DropdownBasedTaxonomySelector');
} else {
  console.log('❌ RegisterAssetPage does not import DropdownBasedTaxonomySelector');
  allFeaturesImplemented = false;
}

if (/<DropdownBasedTaxonomySelector/.test(pageContent)) {
  console.log('✅ RegisterAssetPage uses DropdownBasedTaxonomySelector component');
} else {
  console.log('❌ RegisterAssetPage does not use DropdownBasedTaxonomySelector component');
  allFeaturesImplemented = false;
}

// Final result
console.log('\nValidation result:');
if (allFilesExist && allFeaturesImplemented) {
  console.log('✅ Dropdown-based taxonomy selector implementation is complete and properly integrated!');
  console.log('💡 To test the implementation, run: npm start');
} else {
  console.log('❌ Implementation is incomplete or has issues that need to be addressed');
}