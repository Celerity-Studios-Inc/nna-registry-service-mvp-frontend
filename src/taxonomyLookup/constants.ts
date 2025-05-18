// This file re-exports layer specific lookups as full objects
import * as lookups from './index';

// Create LAYER_LOOKUPS mapping - include only available layers 
export const LAYER_LOOKUPS: Record<string, Record<string, any>> = {
  'S': lookups.S_LAYER_LOOKUP,
  'W': lookups.W_LAYER_LOOKUP
};

// Create LAYER_SUBCATEGORIES mapping - include only available layers
export const LAYER_SUBCATEGORIES: Record<string, Record<string, string[]>> = {
  'S': lookups.S_SUBCATEGORIES,
  'W': lookups.W_SUBCATEGORIES
};