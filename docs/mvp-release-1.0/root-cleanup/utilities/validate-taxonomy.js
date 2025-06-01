// Simple script to validate the taxonomy
const fs = require('fs');
const path = require('path');

const taxonomyPath = './src/assets/enriched_nna_layer_taxonomy_v1.3.json';
const taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, 'utf8'));

const errors = [];
const stats = {
  layers: 0,
  categories: 0,
  subcategories: 0,
  issues: 0
};

console.log('Validating taxonomy in:', taxonomyPath);

// Check each layer
for (const layer in taxonomy) {
  stats.layers++;
  const categories = taxonomy[layer];
  
  if (Object.keys(categories).length === 0) {
    errors.push(`Layer ${layer} has no categories`);
    stats.issues++;
    continue;
  }
  
  // Check each category
  for (const category in categories) {
    stats.categories++;
    
    // Validate category code (should be 3-letter uppercase alphabetic)
    if (!/^[A-Z]{3}$/.test(category)) {
      errors.push(`Category ${category} in layer ${layer} is not a 3-letter uppercase alphabetic code`);
      stats.issues++;
    }
    
    const subcategories = categories[category];
    
    if (subcategories.length === 0) {
      errors.push(`Category ${layer}.${category} has no subcategories`);
      stats.issues++;
      continue;
    }
    
    // Check each subcategory
    for (const subcategory of subcategories) {
      stats.subcategories++;
      
      // Validate subcategory code (should be 3-letter uppercase alphabetic)
      if (subcategory.code && !/^[A-Z]{3}$/.test(subcategory.code)) {
        errors.push(`Subcategory code ${subcategory.code} in ${layer}.${category} is not a 3-letter uppercase alphabetic code`);
        stats.issues++;
      }
      
      // Validate numericCode (should be 3-digit string)
      if (subcategory.numericCode && !/^\d{3}$/.test(subcategory.numericCode)) {
        errors.push(`Subcategory numericCode ${subcategory.numericCode} in ${layer}.${category}.${subcategory.code} is not a 3-digit string`);
        stats.issues++;
      }
    }
  }
}

// Output validation results
console.log('Validation complete');
console.log('--------------------------------------');
console.log('Stats:');
console.log(`  Layers: ${stats.layers}`);
console.log(`  Categories: ${stats.categories}`);
console.log(`  Subcategories: ${stats.subcategories}`);
console.log(`  Issues: ${stats.issues}`);
console.log('--------------------------------------');

if (errors.length > 0) {
  console.log('Errors:');
  errors.forEach(error => console.log(`  - ${error}`));
  console.log('--------------------------------------');
  process.exit(1);
} else {
  console.log('✅ Taxonomy validation passed. No issues found.');
}