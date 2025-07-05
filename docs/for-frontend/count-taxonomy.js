const fs = require('fs');
const path = require('path');

// Function to count subcategories in a layer file
function countSubcategoriesInLayer(layerFile) {
  try {
    const content = fs.readFileSync(layerFile, 'utf8');
    
    // Extract the lookup object
    const match = content.match(/export const \w+_LAYER_LOOKUP = ({[\s\S]*?});/);
    if (!match) {
      console.error(`Could not find lookup object in ${layerFile}`);
      return null;
    }
    
    // Parse the object (simplified parsing)
    const lookupStr = match[1];
    
    // Count categories (entries without dots) and subcategories (entries with dots)
    const categories = new Set();
    const subcategories = new Set();
    
    // Extract all keys using a more robust regex
    const keyMatches = lookupStr.match(/'([^']+)':/g);
    if (keyMatches) {
      keyMatches.forEach(match => {
        const key = match.slice(1, -2); // Remove quotes and colon
        if (key.includes('.')) {
          subcategories.add(key);
          // Also add the category part
          const category = key.split('.')[0];
          categories.add(category);
        } else {
          categories.add(key);
        }
      });
    }
    
    return {
      categories: categories.size,
      subcategories: subcategories.size,
      categoryList: Array.from(categories).sort(),
      subcategoryList: Array.from(subcategories).sort()
    };
  } catch (error) {
    console.error(`Error reading ${layerFile}:`, error.message);
    return null;
  }
}

// Main function
function main() {
  const taxonomyDir = 'docs/for-backend/taxonomy';
  const layerFiles = [
    'G_layer.ts',
    'S_layer.ts', 
    'L_layer.ts',
    'M_layer.ts',
    'W_layer.ts',
    'P_layer.ts',
    'B_layer.ts',
    'T_layer.ts',
    'R_layer.ts',
    'C_layer.ts'
  ];
  
  console.log('=== TAXONOMY SUBCATEGORY COUNTING ===\n');
  
  let totalCategories = 0;
  let totalSubcategories = 0;
  
  layerFiles.forEach(layerFile => {
    const filePath = path.join(taxonomyDir, layerFile);
    const layer = layerFile.split('_')[0];
    
    if (fs.existsSync(filePath)) {
      const counts = countSubcategoriesInLayer(filePath);
      if (counts) {
        console.log(`Layer ${layer}:`);
        console.log(`  Categories: ${counts.categories}`);
        console.log(`  Subcategories: ${counts.subcategories}`);
        console.log(`  Category List: ${counts.categoryList.join(', ')}`);
        console.log('');
        
        totalCategories += counts.categories;
        totalSubcategories += counts.subcategories;
      }
    } else {
      console.log(`Layer ${layer}: File not found`);
    }
  });
  
  console.log('=== SUMMARY ===');
  console.log(`Total Categories: ${totalCategories}`);
  console.log(`Total Subcategories: ${totalSubcategories}`);
}

main(); 