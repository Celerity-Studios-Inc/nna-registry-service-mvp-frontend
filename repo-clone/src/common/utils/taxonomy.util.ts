// src/common/utils/taxonomy.util.ts
import * as fs from 'fs';
import * as path from 'path';

export const getTaxonomyData = () => {
  const taxonomyPath = path.join(
    __dirname,
    '../../../taxonomy/enriched_nna_layer_taxonomy_v1.3.json',
  );
  try {
    const taxonomyData = JSON.parse(fs.readFileSync(taxonomyPath, 'utf8'));
    return taxonomyData;
  } catch (error) {
    console.error('Error loading taxonomy data:', error);
    throw new Error('Failed to load taxonomy data');
  }
};
