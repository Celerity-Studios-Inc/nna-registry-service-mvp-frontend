/**
 * Taxonomy Validation Script
 * 
 * This script validates the enriched_nna_layer_taxonomy_v1.3.json file to ensure:
 * 1. All layers have at least one category
 * 2. All categories have at least one subcategory
 * 3. All subcategories have code, numericCode, and name properties
 * 4. All category codes are 3-letter uppercase alphabetic codes
 * 5. All subcategory codes are 3-letter uppercase alphabetic codes
 * 6. All numericCodes are 3-digit strings
 */

import * as fs from 'fs';
import * as path from 'path';

interface Subcategory {
  code: string;
  numericCode: string;
  name: string;
}

interface Category {
  [category: string]: Subcategory[];
}

interface Taxonomy {
  [layer: string]: Category;
}

// Load the taxonomy file
const taxonomyPath = path.resolve(__dirname, '../assets/enriched_nna_layer_taxonomy_v1.3.json');
const taxonomyContent = fs.readFileSync(taxonomyPath, 'utf8');
const taxonomy: Taxonomy = JSON.parse(taxonomyContent);

// Results arrays
const errors: string[] = [];
const warnings: string[] = [];
const stats: any = {
  layers: 0,
  categories: 0,
  subcategories: 0,
  issues: 0,
};

// Required layers
const requiredLayers = ['G', 'S', 'L', 'M', 'W'];

// Validate the taxonomy structure
console.log('Validating taxonomy structure...');

// Check required layers
requiredLayers.forEach(layer => {
  if (!taxonomy[layer]) {
    errors.push(`Required layer ${layer} is missing from taxonomy`);
    stats.issues++;
  }
});

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
      
      // Check subcategory structure
      if (!subcategory.code) {
        errors.push(`Subcategory in ${layer}.${category} is missing code property`);
        stats.issues++;
      }
      
      if (!subcategory.numericCode) {
        errors.push(`Subcategory ${subcategory.code || 'unknown'} in ${layer}.${category} is missing numericCode property`);
        stats.issues++;
      }
      
      if (!subcategory.name) {
        errors.push(`Subcategory ${subcategory.code || 'unknown'} in ${layer}.${category} is missing name property`);
        stats.issues++;
      }
      
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
}

if (warnings.length > 0) {
  console.log('Warnings:');
  warnings.forEach(warning => console.log(`  - ${warning}`));
  console.log('--------------------------------------');
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ Taxonomy validation passed. No issues found.');
} else {
  console.log(`❌ Taxonomy validation failed with ${errors.length} errors and ${warnings.length} warnings.`);
  process.exit(1);
}