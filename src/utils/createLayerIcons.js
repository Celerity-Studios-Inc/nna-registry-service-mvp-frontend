/**
 * Create Layer Icons Script
 * 
 * This script generates SVG icons for layers that don't have icons yet.
 * It saves the SVGs to the assets/layer-icons directory.
 */
const fs = require('fs');
const path = require('path');

// Layer color mapping
const LAYER_COLORS = {
  'g': '#8bc34a', // Ground - Green
  's': '#ffeb3b', // Star - Yellow
  'l': '#795548', // Land - Brown
  'm': '#ff9800', // Man - Orange
  'w': '#03a9f4', // Wave - Blue
  'b': '#e91e63', // Body - Pink
  'p': '#4caf50', // Plant - Green
  't': '#9c27b0', // Transportation - Purple
  'c': '#f44336', // Clothing - Red
  'r': '#607d8b'  // Rock - Gray
};

// Generate an SVG for a layer
const generateLayerSvg = (layer) => {
  const color = LAYER_COLORS[layer.toLowerCase()] || '#cccccc';
  
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="${color}" />
  <text x="32" y="38" font-family="Arial" font-size="24" font-weight="bold" 
    text-anchor="middle" fill="white">
    ${layer.toUpperCase()}
  </text>
</svg>`;
};

// Directory for layer icons
const iconsDir = path.resolve(__dirname, '../assets/layer-icons');

// Create the directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
  console.log(`Created directory: ${iconsDir}`);
}

// Generate icons for all layers
Object.keys(LAYER_COLORS).forEach(layer => {
  const iconPath = path.join(iconsDir, `${layer}.svg`);
  
  // Skip if the icon already exists
  if (fs.existsSync(iconPath)) {
    console.log(`Icon already exists: ${iconPath}`);
    return;
  }
  
  // Generate and save the SVG
  const svg = generateLayerSvg(layer);
  fs.writeFileSync(iconPath, svg);
  
  console.log(`Generated icon: ${iconPath}`);
});

console.log('Layer icon generation complete!');