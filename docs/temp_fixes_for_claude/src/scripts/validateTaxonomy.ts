import axios from 'axios';
import { Taxonomy } from '../types/taxonomy.types';

const frontendTaxonomy: Taxonomy = require('../assets/enriched_nna_layer_taxonomy_v1.3.json');

async function validateTaxonomy() {
  try {
    const response = await axios.get('https://registry.reviz.dev/api/taxonomy');
    const backendTaxonomy: Taxonomy = response.data;

    for (const layer in frontendTaxonomy) {
      if (!backendTaxonomy[layer]) {
        console.error(`Layer ${layer} missing in backend taxonomy`);
        continue;
      }
      for (const category in frontendTaxonomy[layer]) {
        if (!backendTaxonomy[layer][category]) {
          console.error(`Category ${category} in layer ${layer} missing in backend taxonomy`);
          continue;
        }
        for (const subcat of frontendTaxonomy[layer][category]) {
          const backendSubcat = backendTaxonomy[layer][category].find((s: any) => s.code === subcat.code);
          if (!backendSubcat) {
            console.error(`Subcategory ${subcat.code} in ${layer}.${category} missing in backend taxonomy`);
          } else if (backendSubcat.numericCode !== subcat.numericCode) {
            console.error(`Numeric code mismatch for ${layer}.${category}.${subcat.code}: Frontend=${subcat.numericCode}, Backend=${backendSubcat.numericCode}`);
          }
        }
      }
    }
    console.log('Taxonomy validation complete');
  } catch (error) {
    console.error('Error validating taxonomy:', error);
  }
}

validateTaxonomy();