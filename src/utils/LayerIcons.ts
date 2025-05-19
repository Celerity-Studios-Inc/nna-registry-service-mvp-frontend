/**
 * LayerIcons Utility
 *
 * This utility handles layer icon loading and provides fallbacks
 * when icons are missing.
 */
import { logger } from './logger';

// Layer color mapping for generating fallback icons
const LAYER_COLORS: Record<string, string> = {
  G: '#8bc34a', // Ground - Green
  S: '#ffeb3b', // Star - Yellow
  L: '#795548', // Land - Brown
  M: '#ff9800', // Man - Orange
  W: '#03a9f4', // Wave - Blue
  B: '#e91e63', // Body - Pink
  P: '#4caf50', // Plant - Green
  T: '#9c27b0', // Transportation - Purple
  C: '#f44336', // Clothing - Red
  R: '#607d8b', // Rock - Gray
};

// Layer name mapping
const LAYER_NAMES: Record<string, string> = {
  G: 'Ground',
  S: 'Star',
  L: 'Land',
  M: 'Man',
  W: 'Wave',
  B: 'Body',
  P: 'Plant',
  T: 'Transportation',
  C: 'Clothing',
  R: 'Rock',
};

/**
 * Get the URL for a layer icon
 * @param layer Layer code
 * @returns The URL of the layer icon or null if not found
 */
export const getLayerIconUrl = (layer: string): string | null => {
  try {
    const iconPath = require(`../assets/layer-icons/${layer.toLowerCase()}.svg`);
    return iconPath;
  } catch (error) {
    logger.warn(`Layer icon not found for layer ${layer}:`, error);
    return null;
  }
};

/**
 * Generate an SVG data URL for a layer
 * @param layer Layer code
 * @returns An SVG data URL
 */
export const generateLayerIconSvg = (layer: string): string => {
  const color = LAYER_COLORS[layer] || '#cccccc';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="30" fill="${color}" />
      <text x="32" y="32" font-family="Arial" font-size="24" font-weight="bold" 
        text-anchor="middle" dominant-baseline="central" fill="white">
        ${layer}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Get the icon for a layer, with fallback to generated SVG
 * @param layer Layer code
 * @returns The URL of the layer icon (real or generated)
 */
export const getLayerIcon = (layer: string): string => {
  const iconUrl = getLayerIconUrl(layer);

  if (iconUrl) {
    return iconUrl;
  }

  return generateLayerIconSvg(layer);
};

/**
 * Get the name for a layer
 * @param layer Layer code
 * @returns The name of the layer
 */
export const getLayerName = (layer: string): string => {
  return LAYER_NAMES[layer] || layer;
};

/**
 * Get all layer information
 * @returns Array of layer information objects
 */
export const getAllLayers = (): Array<{
  code: string;
  name: string;
  color: string;
}> => {
  return Object.keys(LAYER_NAMES).map(code => ({
    code,
    name: LAYER_NAMES[code],
    color: LAYER_COLORS[code] || '#cccccc',
  }));
};
