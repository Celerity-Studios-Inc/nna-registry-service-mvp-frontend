/**
 * SubcategoryPreserver
 * 
 * A utility to store and retrieve subcategory selections across page navigations.
 * This helps maintain selection state when users navigate through the registration process.
 */

// Storage key for selections
const STORAGE_KEY = 'taxonomy_subcategory_selections';

/**
 * Interface for stored selection data
 */
interface SubcategorySelection {
  layer: string;
  category: string;
  subcategory: string;
  timestamp: number;
}

/**
 * Store the subcategory selection for a layer and category
 * 
 * @param layer The selected layer code
 * @param category The selected category code
 * @param subcategory The selected subcategory code
 */
const storeSelection = (layer: string, category: string, subcategory: string): void => {
  try {
    // Create selection object
    const selection: SubcategorySelection = {
      layer,
      category,
      subcategory,
      timestamp: Date.now()
    };
    
    // Store in session storage
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
    console.log(`[SubcategoryPreserver] Stored selection: ${layer}.${category}.${subcategory}`);
  } catch (error) {
    console.error('[SubcategoryPreserver] Error storing selection:', error);
  }
};

/**
 * Retrieve the stored subcategory for a layer and category
 * 
 * @param layer The layer code to retrieve subcategory for
 * @param category The category code to retrieve subcategory for
 * @returns The stored subcategory code, or empty string if not found
 */
const getSelection = (layer: string, category: string): string => {
  try {
    // Retrieve from session storage
    const storedData = sessionStorage.getItem(STORAGE_KEY);
    if (!storedData) return '';
    
    // Parse stored data
    const selection: SubcategorySelection = JSON.parse(storedData);
    
    // Validate selection matches current layer and category
    if (selection.layer === layer && selection.category === category) {
      console.log(`[SubcategoryPreserver] Retrieved selection: ${selection.subcategory}`);
      return selection.subcategory;
    }
    
    return '';
  } catch (error) {
    console.error('[SubcategoryPreserver] Error retrieving selection:', error);
    return '';
  }
};

/**
 * Clear all stored subcategory selections
 */
const clearSelection = (): void => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    console.log('[SubcategoryPreserver] Cleared selections');
  } catch (error) {
    console.error('[SubcategoryPreserver] Error clearing selections:', error);
  }
};

/**
 * Check if there is a stored selection for the given layer and category
 * 
 * @param layer The layer code to check
 * @param category The category code to check
 * @returns True if a selection exists, false otherwise
 */
const hasSelection = (layer: string, category: string): boolean => {
  return getSelection(layer, category) !== '';
};

// Export the utility functions
export const SubcategoryPreserver = {
  storeSelection,
  getSelection,
  clearSelection,
  hasSelection
};

export default SubcategoryPreserver;