// Convert original format taxonomy to the simplified format
const fs = require('fs');
const path = require('path');

// Read the original taxonomy file
const originalPath = './src/assets/enriched_nna_layer_taxonomy_v1.3.json';
const original = JSON.parse(fs.readFileSync(originalPath, 'utf8'));

// Create the new structure
const newTaxonomy = {};

// Process each layer
console.log('Converting taxonomy...');

// Define required layers
const requiredLayers = ['G', 'S', 'L', 'M', 'W'];

// Function to ensure three-letter uppercase codes
function ensureThreeLetterCode(code) {
  if (typeof code === 'string' && /^[A-Za-z]{3}$/i.test(code)) {
    return code.toUpperCase();
  }
  
  // If numeric code (1, 2, 3, etc.) convert to 3-letter code
  if (typeof code === 'string' && /^\d+$/.test(code)) {
    const num = parseInt(code, 10);
    // Common mappings
    const numToLetterMap = {
      1: 'POP', 2: 'ROK', 3: 'HIP', 4: 'DNC', 5: 'DSF', 
      6: 'RNB', 7: 'JZZ', 8: 'CLS', 9: 'FAN', 10: 'TRO'
    };
    return numToLetterMap[num] || `CA${num.toString().padStart(1, '0')}`;
  }
  
  // If it's an object with a code property, use that
  if (typeof code === 'object' && code.code) {
    return ensureThreeLetterCode(code.code);
  }
  
  // Last resort: take first 3 letters and uppercase
  return code.toString().substring(0, 3).toUpperCase();
}

// Process each required layer
for (const layer of requiredLayers) {
  if (!original[layer]) {
    console.error(`Layer ${layer} not found in original taxonomy. Creating empty layer.`);
    newTaxonomy[layer] = {};
    continue;
  }
  
  newTaxonomy[layer] = {};
  
  // Check if the layer has categories field
  const categories = original[layer].categories || {};
  
  // Process each category
  for (const categoryCode in categories) {
    const category = categories[categoryCode];
    const threeLetterCode = ensureThreeLetterCode(category.code || categoryCode);
    
    newTaxonomy[layer][threeLetterCode] = [];
    
    // Process subcategories
    if (category.subcategories) {
      for (const subCode in category.subcategories) {
        const subcategory = category.subcategories[subCode];
        const subThreeLetterCode = ensureThreeLetterCode(subcategory.code || subCode);
        
        newTaxonomy[layer][threeLetterCode].push({
          code: subThreeLetterCode,
          numericCode: subCode.padStart(3, '0'),
          name: subcategory.name || subThreeLetterCode
        });
      }
    }
  }
}

// Special case handling for W.BCH.SUN
if (newTaxonomy.W && newTaxonomy.W.BCH) {
  // Check if SUN exists
  const sunExists = newTaxonomy.W.BCH.some(sub => sub.code === 'SUN');
  
  if (!sunExists) {
    console.log('Adding special entry for W.BCH.SUN');
    newTaxonomy.W.BCH.push({
      code: 'SUN',
      numericCode: '003',
      name: 'Sunset'
    });
  }
}

// Special case handling for W.CST.FES
if (newTaxonomy.W && newTaxonomy.W.CST) {
  // Check if FES exists
  const fesExists = newTaxonomy.W.CST.some(sub => sub.code === 'FES');
  
  if (!fesExists) {
    console.log('Adding special entry for W.CST.FES');
    newTaxonomy.W.CST.push({
      code: 'FES',
      numericCode: '003',
      name: 'Festival'
    });
  }
}

// Special case handling for S.POP.HPM
if (newTaxonomy.S && newTaxonomy.S.POP) {
  // Check if HPM exists
  const hpmExists = newTaxonomy.S.POP.some(sub => sub.code === 'HPM');
  
  if (!hpmExists) {
    console.log('Adding special entry for S.POP.HPM');
    newTaxonomy.S.POP.push({
      code: 'HPM',
      numericCode: '007',
      name: 'Hipster Male'
    });
  }
}

// Write the new taxonomy to file
const newPath = './src/assets/enriched_nna_layer_taxonomy_v1.3.json';
fs.writeFileSync(newPath, JSON.stringify(newTaxonomy, null, 2));

console.log(`Converted taxonomy written to ${newPath}`);
console.log(`Layers: ${Object.keys(newTaxonomy).length}`);

// Count categories and subcategories
let categoryCount = 0;
let subcategoryCount = 0;

for (const layer in newTaxonomy) {
  const categories = newTaxonomy[layer];
  categoryCount += Object.keys(categories).length;
  
  for (const category in categories) {
    subcategoryCount += categories[category].length;
  }
}

console.log(`Categories: ${categoryCount}`);
console.log(`Subcategories: ${subcategoryCount}`);