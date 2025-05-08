/**
 * Code mapping utilities for NNA Registry
 * Handles conversions between human-friendly codes and machine-friendly codes
 */

// Layer mappings (if needed in the future)
export const layerMappings: Record<string, { name: string, numeric: number }> = {
  G: { name: 'Songs', numeric: 1 },
  S: { name: 'Stars', numeric: 2 },
  L: { name: 'Looks', numeric: 3 },
  M: { name: 'Moves', numeric: 4 },
  W: { name: 'Worlds', numeric: 5 },
  B: { name: 'Branded', numeric: 6 },
  P: { name: 'Personalize', numeric: 7 },
  T: { name: 'Training Data', numeric: 8 },
  C: { name: 'Composite', numeric: 9 },
  R: { name: 'Rights', numeric: 10 },
};

/**
 * Attempts to convert a numeric code to an alphabetic one based on patterns
 * This is useful for generating human-friendly codes from numeric identifiers
 * 
 * @param layerCode The layer code (e.g., 'G', 'S', 'L', etc.)
 * @param code The code to process
 * @returns The alphabetic code or the original code if no transformation is needed
 */
export function getAlphabeticCode(layerCode: string, code: string): string {
  // If code is already alphabetic, return as is
  if (/^[A-Za-z]+$/.test(code)) {
    return code.toUpperCase();
  }
  
  // If code is numeric, check if we have a mapping for it in our taxonomy
  // For now, just return the code as-is since we're using mock data
  // In a full implementation, we would look up in the taxonomy service
  return code;
}

/**
 * Converts a human-friendly NNA address to its machine-friendly equivalent
 * 
 * @param hfnAddress The human-friendly NNA address (e.g., G.POP.SHK.001)
 * @returns The machine-friendly address (e.g., 1.001.003.001)
 */
export function convertHFNToMFA(hfnAddress: string): string {
  const parts = hfnAddress.split('.');
  if (parts.length !== 4) {
    return hfnAddress; // Not a valid NNA address format
  }
  
  const [layer, category, subcategory, sequential] = parts;
  
  // Convert layer to numeric
  const layerNumeric = layerMappings[layer]?.numeric || 0;
  
  // Convert category to numeric (format as 3-digit code)
  // In a real implementation, we would look up the actual numeric code
  // For now, we'll use a simple mapping based on the category position
  // Use a mock numeric code for the category (001, 002, etc.)
  let categoryNumeric = '001'; // Default
  if (category === 'POP' || category === 'pop') categoryNumeric = '001';
  if (category === 'ROK' || category === 'rok') categoryNumeric = '002';
  if (category === 'HIP' || category === 'hip') categoryNumeric = '003';
  
  // Convert subcategory to numeric (format as 3-digit code)
  // In a real implementation, we would look up the actual numeric code
  // For now, we'll use a simple mapping based on the subcategory
  let subcategoryNumeric = '001'; // Default
  if (subcategory === 'BAS' || subcategory === 'bas') subcategoryNumeric = '001';
  if (subcategory === 'GLB' || subcategory === 'glb') subcategoryNumeric = '002';
  if (subcategory === 'TEN' || subcategory === 'ten') subcategoryNumeric = '003';
  
  // Format as machine-friendly address with all numeric codes
  return `${layerNumeric}.${categoryNumeric}.${subcategoryNumeric}.${sequential}`;
}

/**
 * Converts a machine-friendly NNA address to its human-friendly equivalent
 * 
 * @param mfaAddress The machine-friendly NNA address (e.g., 1.001.003.001)
 * @returns The human-friendly address (e.g., G.POP.SHK.001)
 */
export function convertMFAToHFN(mfaAddress: string): string {
  const parts = mfaAddress.split('.');
  if (parts.length !== 4) {
    return mfaAddress; // Not a valid NNA address format
  }
  
  const [layerNumeric, categoryNumeric, subcategoryNumeric, sequential] = parts;
  
  // Convert numeric layer to alphabetic
  const layerAlpha = Object.entries(layerMappings).find(
    ([_, value]) => value.numeric.toString() === layerNumeric
  )?.[0] || layerNumeric;
  
  // Convert category numeric code to alphabetic
  // In a real implementation, we would look up the actual mapping
  let categoryAlpha = 'POP'; // Default
  if (categoryNumeric === '001') categoryAlpha = 'POP';
  if (categoryNumeric === '002') categoryAlpha = 'ROK';
  if (categoryNumeric === '003') categoryAlpha = 'HIP';
  
  // Convert subcategory numeric code to alphabetic
  // In a real implementation, we would look up the actual mapping
  let subcategoryAlpha = 'BAS'; // Default
  if (subcategoryNumeric === '001') subcategoryAlpha = 'BAS';
  if (subcategoryNumeric === '002') subcategoryAlpha = 'GLB';
  if (subcategoryNumeric === '003') subcategoryAlpha = 'TEN';
  
  // Format as human-friendly name with alphabetic codes
  return `${layerAlpha}.${categoryAlpha}.${subcategoryAlpha}.${sequential}`;
}

/**
 * Generates a formatted NNA address string
 * 
 * @param layer Layer code
 * @param category Category code
 * @param subcategory Subcategory code
 * @param sequential Sequential number (formatted as 3 digits)
 * @returns Formatted NNA address
 */
export function formatNNAAddress(
  layer: string,
  category: string,
  subcategory: string,
  sequential: number | string
): string {
  // Convert numeric category code to alphabetic if needed
  let categoryAlpha = category;
  if (category === '001') categoryAlpha = 'POP';
  if (category === '002') categoryAlpha = 'ROK';
  if (category === '003') categoryAlpha = 'HIP';
  
  // Convert numeric subcategory code to alphabetic if needed
  let subcategoryAlpha = subcategory;
  if (subcategory === '001') subcategoryAlpha = 'BAS';
  if (subcategory === '002') subcategoryAlpha = 'GLB';
  if (subcategory === '003') subcategoryAlpha = 'TEN';
  
  // Format sequential as 3 digits
  const formattedSequential = typeof sequential === 'number'
    ? sequential.toString().padStart(3, '0')
    : sequential.padStart(3, '0');
    
  return `${layer}.${categoryAlpha}.${subcategoryAlpha}.${formattedSequential}`;
} 