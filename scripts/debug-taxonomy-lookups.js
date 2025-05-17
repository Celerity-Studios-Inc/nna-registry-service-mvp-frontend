/**
 * Debug Taxonomy Lookups
 * Script to validate and debug the flattened taxonomy lookup tables
 */

// Import required modules
const fs = require('fs');
const path = require('path');

// Path to the taxonomy lookup directory
const LOOKUP_DIR = path.join(__dirname, '../src/taxonomyLookup');

// Layers to check
const LAYERS = ['G', 'S', 'L', 'M', 'W', 'B', 'P', 'T', 'C', 'R'];

// Special mappings to test
const SPECIAL_MAPPINGS = [
  { layer: 'W', category: 'BCH', subcategory: 'SUN', expected: '5.004.003.001' },
  { layer: 'S', category: 'POP', subcategory: 'HPM', expected: '2.001.007.001' }
];

// Layer numeric codes for reference
const LAYER_NUMERIC_CODES = {
  'G': '1', 'S': '2', 'L': '3', 'M': '4', 'W': '5',
  'B': '6', 'P': '7', 'T': '8', 'C': '9', 'R': '10'
};

// Function to check if a file exists
function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

// Function to load a layer lookup module
function loadLayerLookup(layer) {
  const filePath = path.join(LOOKUP_DIR, `${layer}_layer.ts`);
  
  if (!fileExists(filePath)) {
    console.error(`ERROR: File does not exist: ${filePath}`);
    return null;
  }
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Extract the lookup object using regex
    const lookupMatch = fileContent.match(new RegExp(`export const ${layer}_LAYER_LOOKUP = (\\{[\\s\\S]+?\\});`));
    const subcategoriesMatch = fileContent.match(new RegExp(`export const ${layer}_SUBCATEGORIES = (\\{[\\s\\S]+?\\});`));
    
    if (!lookupMatch || !subcategoriesMatch) {
      console.error(`ERROR: Could not find lookup or subcategories for layer ${layer}`);
      return null;
    }
    
    // Dangerous but simple for a debug script - convert the objects
    const lookupStr = lookupMatch[1].replace(/'/g, '"');
    const subcategoriesStr = subcategoriesMatch[1].replace(/'/g, '"');
    
    try {
      const lookup = eval(`(${lookupStr})`);
      const subcategories = eval(`(${subcategoriesStr})`);
      
      return { lookup, subcategories };
    } catch (evalError) {
      console.error(`ERROR: Failed to parse layer data: ${evalError.message}`);
      return null;
    }
  } catch (error) {
    console.error(`ERROR: Failed to read file ${filePath}: ${error.message}`);
    return null;
  }
}

// Function to validate a layer's lookup tables
function validateLayer(layer) {
  console.log(`\n=== Validating Layer ${layer} ===`);
  
  const layerData = loadLayerLookup(layer);
  if (!layerData) {
    console.error(`Failed to load layer ${layer} data`);
    return false;
  }
  
  const { lookup, subcategories } = layerData;
  
  // Check that the layer has categories
  console.log(`Categories: ${Object.keys(subcategories).join(', ')}`);
  console.log(`Total categories: ${Object.keys(subcategories).length}`);
  
  // Check each category
  let valid = true;
  Object.keys(subcategories).forEach(category => {
    // Verify category exists in lookup
    if (!lookup[category]) {
      console.error(`ERROR: Category ${category} missing from lookup table`);
      valid = false;
    }
    
    // Check subcategories
    const categorySubcategories = subcategories[category];
    console.log(`\nCategory ${category} has ${categorySubcategories.length} subcategories: ${categorySubcategories.join(', ')}`);
    
    // Verify each subcategory exists in lookup
    categorySubcategories.forEach(subcategoryCode => {
      if (!lookup[subcategoryCode]) {
        console.error(`ERROR: Subcategory ${subcategoryCode} missing from lookup table`);
        valid = false;
      }
    });
  });
  
  return valid;
}

// Function to validate special mappings
function validateSpecialMappings(specialMapping) {
  const { layer, category, subcategory, expected } = specialMapping;
  console.log(`\n=== Testing Special Mapping: ${layer}.${category}.${subcategory}.001 ===`);
  
  const layerData = loadLayerLookup(layer);
  if (!layerData) {
    console.error(`Failed to load layer ${layer} data`);
    return false;
  }
  
  const { lookup, subcategories } = layerData;
  
  // Check that category exists
  if (!lookup[category]) {
    console.error(`ERROR: Category ${category} missing from ${layer} lookup table`);
    return false;
  }
  
  // Check that category has subcategories
  if (!subcategories[category]) {
    console.error(`ERROR: Category ${category} missing from ${layer} subcategories`);
    return false;
  }
  
  // Check that subcategory exists
  const fullSubcategoryCode = `${category}.${subcategory}`;
  if (!lookup[fullSubcategoryCode]) {
    console.error(`ERROR: Subcategory ${fullSubcategoryCode} missing from lookup table`);
    return false;
  }
  
  // Generate the MFA
  const layerNumeric = LAYER_NUMERIC_CODES[layer];
  const categoryNumeric = lookup[category].numericCode;
  const subcategoryNumeric = lookup[fullSubcategoryCode].numericCode;
  const mfa = `${layerNumeric}.${categoryNumeric}.${subcategoryNumeric}.001`;
  
  console.log(`HFN: ${layer}.${category}.${subcategory}.001`);
  console.log(`MFA: ${mfa}`);
  console.log(`Expected: ${expected}`);
  console.log(`Result: ${mfa === expected ? 'MATCH ✅' : 'MISMATCH ❌'}`);
  
  return mfa === expected;
}

// Main function to run the script
function main() {
  console.log('=== TAXONOMY LOOKUP DEBUG SCRIPT ===');
  console.log(`Checking ${LAYERS.length} layers...`);
  
  // Check all layers
  const results = {};
  LAYERS.forEach(layer => {
    results[layer] = validateLayer(layer);
  });
  
  // Check special mappings
  const specialResults = {};
  SPECIAL_MAPPINGS.forEach(mapping => {
    const key = `${mapping.layer}.${mapping.category}.${mapping.subcategory}`;
    specialResults[key] = validateSpecialMappings(mapping);
  });
  
  // Print summary
  console.log('\n=== SUMMARY ===');
  console.log('Layer Validation:');
  LAYERS.forEach(layer => {
    console.log(`${layer}: ${results[layer] ? 'VALID ✅' : 'INVALID ❌'}`);
  });
  
  console.log('\nSpecial Mappings:');
  Object.keys(specialResults).forEach(key => {
    console.log(`${key}: ${specialResults[key] ? 'VALID ✅' : 'INVALID ❌'}`);
  });
}

// Run the script
main();