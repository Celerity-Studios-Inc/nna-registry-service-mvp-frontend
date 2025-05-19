// Test script to debug taxonomy loading issues
const { S_LAYER_LOOKUP, S_SUBCATEGORIES } = require('./taxonomyLookup/S_layer');
const {
  LAYER_LOOKUPS,
  LAYER_SUBCATEGORIES,
} = require('./taxonomyLookup/constants');

console.log('S_LAYER_LOOKUP keys:', Object.keys(S_LAYER_LOOKUP).length);
console.log('S_SUBCATEGORIES keys:', Object.keys(S_SUBCATEGORIES).length);

console.log(
  'LAYER_LOOKUPS["S"] keys:',
  Object.keys(LAYER_LOOKUPS['S'] || {}).length
);
console.log(
  'LAYER_SUBCATEGORIES["S"] keys:',
  Object.keys(LAYER_SUBCATEGORIES['S'] || {}).length
);

// Test for specific layer and category
const layer = 'S';
const categoryCode = 'POP';

console.log(`Subcategories for ${layer}.${categoryCode}:`);
const subcategoryCodes = LAYER_SUBCATEGORIES[layer]?.[categoryCode] || [];
console.log('subcategoryCodes:', subcategoryCodes);

if (subcategoryCodes.length > 0) {
  console.log('First subcategory code:', subcategoryCodes[0]);
  console.log(
    'First subcategory entry:',
    LAYER_LOOKUPS[layer]?.[subcategoryCodes[0]]
  );

  const results = subcategoryCodes
    .map(fullCode => {
      const parts = fullCode.split('.');
      const subcategoryCode = parts[1]; // Get the part after the dot
      const subcategoryEntry = LAYER_LOOKUPS[layer]?.[fullCode];

      if (!subcategoryEntry) {
        console.error(
          `Subcategory entry not found for ${fullCode} in layer ${layer}`
        );
        return null;
      }

      return {
        code: subcategoryCode,
        numericCode: subcategoryEntry.numericCode,
        name: subcategoryEntry.name,
      };
    })
    .filter(Boolean); // Filter out null entries

  console.log(`Mapped ${results.length} subcategories`);
  console.log('Results:', results);
} else {
  console.log('No subcategories found');
}
