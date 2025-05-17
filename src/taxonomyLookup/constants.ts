// This file re-exports layer specific lookups as full objects
import * as lookups from './index';

// Create LAYER_LOOKUPS mapping
export const LAYER_LOOKUPS: Record<string, Record<string, any>> = {
  'W': lookups.W_LAYER_LOOKUP,
  'G': lookups.G_LAYER_LOOKUP,
  'S': lookups.S_LAYER_LOOKUP,
  'L': lookups.L_LAYER_LOOKUP,
  'M': lookups.M_LAYER_LOOKUP,
  'B': lookups.B_LAYER_LOOKUP,
  'P': lookups.P_LAYER_LOOKUP,
  'T': lookups.T_LAYER_LOOKUP,
  'C': lookups.C_LAYER_LOOKUP,
  'R': lookups.R_LAYER_LOOKUP
};

// Create LAYER_SUBCATEGORIES mapping
export const LAYER_SUBCATEGORIES: Record<string, Record<string, string[]>> = {
  'W': lookups.W_SUBCATEGORIES,
  'G': lookups.G_SUBCATEGORIES,
  'S': lookups.S_SUBCATEGORIES,
  'L': lookups.L_SUBCATEGORIES,
  'M': lookups.M_SUBCATEGORIES,
  'B': lookups.B_SUBCATEGORIES,
  'P': lookups.P_SUBCATEGORIES,
  'T': lookups.T_SUBCATEGORIES,
  'C': lookups.C_SUBCATEGORIES,
  'R': lookups.R_SUBCATEGORIES
};