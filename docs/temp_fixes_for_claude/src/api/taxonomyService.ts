import { Taxonomy, Subcategory } from '../types/taxonomy.types';

class TaxonomyService {
  private taxonomy: Taxonomy;

  constructor() {
    this.taxonomy = require('../assets/enriched_nna_layer_taxonomy_v1.3.json');
  }

  getSubcategoryNumericCode(layer: string, category: string, subcategory: string): string {
    const layerData = this.taxonomy[layer];
    if (!layerData) {
      throw new Error(`Layer ${layer} not found in taxonomy`);
    }

    const categoryData = layerData[category];
    if (!categoryData) {
      throw new Error(`Category ${category} not found in layer ${layer}`);
    }

    const subcatEntry = categoryData.find((entry: Subcategory) => entry.code === subcategory);
    if (!subcatEntry) {
      throw new Error(`Subcategory ${subcategory} not found in ${layer}.${category}`);
    }

    return subcatEntry.numericCode;
  }

  getTaxonomyPath(layer: string, category: string, subcategory: string): string {
    const layerData = this.taxonomy[layer];
    if (!layerData) {
      throw new Error(`Layer ${layer} not found in taxonomy`);
    }

    const categoryData = layerData[category];
    if (!categoryData) {
      throw new Error(`Category ${category} not found in layer ${layer}`);
    }

    const subcatEntry = categoryData.find((entry: Subcategory) => entry.code === subcategory);
    if (!subcatEntry) {
      throw new Error(`Subcategory ${subcategory} not found in ${layer}.${category}`);
    }

    const layerName = {
      S: 'Stars',
      W: 'Worlds',
      L: 'Looks',
      M: 'Moves',
      G: 'Songs',
    }[layer] || layer;

    const categoryName = Object.keys(layerData).find(key => key === category) || category;
    const subcategoryName = subcatEntry.name || subcategory;

    return `${layerName} > ${categoryName} > ${subcategoryName}`;
  }

  getCategoryNumericCode(layer: string, category: string): string {
    const layerData = this.taxonomy[layer];
    if (!layerData) {
      throw new Error(`Layer ${layer} not found in taxonomy`);
    }

    const categoryData = layerData[category];
    if (!categoryData) {
      throw new Error(`Category ${category} not found in layer ${layer}`);
    }

    const categoryIndex = Object.keys(layerData).indexOf(category) + 1;
    return categoryIndex.toString().padStart(3, '0');
  }
}

export const taxonomyService = new TaxonomyService();