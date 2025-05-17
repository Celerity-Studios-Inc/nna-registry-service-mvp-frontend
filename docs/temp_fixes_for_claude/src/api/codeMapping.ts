import { taxonomyService } from './taxonomyService';

export const getLayerNumericCode = (layer: string): string => {
  const layerMap: { [key: string]: string } = {
    S: '1',
    W: '5',
    L: '3',
    M: '2',
    G: '4',
  };
  return layerMap[layer] || '0';
};

export const getCategoryNumericCode = (layer: string, category: string): string => {
  return taxonomyService.getCategoryNumericCode(layer, category);
};

export const getSubcategoryNumericCode = (layer: string, category: string, subcategory: string): string => {
  return taxonomyService.getSubcategoryNumericCode(layer, category, subcategory);
};

export const convertToMFA = (layer: string, category: string, subcategory: string, sequential: string): string => {
  const layerCode = getLayerNumericCode(layer);
  const categoryCode = getCategoryNumericCode(layer, category);
  const subcategoryCode = getSubcategoryNumericCode(layer, category, subcategory);
  return `${layerCode}.${categoryCode}.${subcategoryCode}.${sequential}`;
};