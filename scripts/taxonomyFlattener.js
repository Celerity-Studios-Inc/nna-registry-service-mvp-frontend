const fs = require('fs');
const path = require('path');

// Path to the original taxonomy JSON
const taxonomyPath = path.join(__dirname, '../src/assets/enriched_nna_layer_taxonomy_v1.3.json');
// Output directory for flattened lookup tables
const outputDir = path.join(__dirname, '../src/taxonomyLookup');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Load the taxonomy data
let taxonomy;
try {
  const data = fs.readFileSync(taxonomyPath, 'utf8');
  taxonomy = JSON.parse(data);
  console.log('Successfully loaded taxonomy data');
} catch (error) {
  console.error('Error loading taxonomy data:', error);
  process.exit(1);
}

// Process each layer
Object.keys(taxonomy).forEach(layer => {
  const layerData = taxonomy[layer];
  
  // Create lookup object and subcategories mapping
  const lookup = {};
  const subcategories = {};
  
  // Process each category in the layer
  Object.keys(layerData).forEach(categoryCode => {
    const categorySubcategories = layerData[categoryCode];
    
    // Add category to lookup
    // Use numericCode from first subcategory (first 3 digits)
    const firstSubcategory = categorySubcategories[0];
    const categoryNumericCode = firstSubcategory ? firstSubcategory.numericCode.slice(0, 3) : '000';
    
    lookup[categoryCode] = {
      numericCode: categoryNumericCode,
      name: categoryCode // Default to code as name
    };
    
    // Initialize subcategories array for this category
    subcategories[categoryCode] = [];
    
    // Process each subcategory
    categorySubcategories.forEach(subcategory => {
      const fullCode = `${categoryCode}.${subcategory.code}`;
      
      // Add subcategory to lookup
      lookup[fullCode] = {
        numericCode: subcategory.numericCode,
        name: subcategory.name || subcategory.code
      };
      
      // Add to subcategories list
      subcategories[categoryCode].push(fullCode);
    });
  });
  
  // Create TypeScript file content
  const tsContent = `// Auto-generated lookup table for ${layer} layer
export const ${layer}_LAYER_LOOKUP = ${JSON.stringify(lookup, null, 2)};

// Category to subcategory mapping
export const ${layer}_SUBCATEGORIES = ${JSON.stringify(subcategories, null, 2)};
`;

  // Write to file
  const outputPath = path.join(outputDir, `${layer}_layer.ts`);
  fs.writeFileSync(outputPath, tsContent);
  console.log(`Generated lookup table for ${layer} layer: ${outputPath}`);
});

console.log('All lookup tables generated successfully');