import { debugLog } from './logger';

/**
 * Type definition for taxonomy selection state
 */
export interface TaxonomySelection {
  layer: string;
  categoryCode: string;
  subcategoryCode: string;
  timestamp?: number;
  // Add any other relevant fields
}

/**
 * Utility for persisting and retrieving taxonomy selection state
 * This allows selections to be preserved during page refreshes or navigation
 */
export const SelectionStorage = {
  /**
   * Saves the current taxonomy selection to sessionStorage
   * @param selection The current selection state
   * @param formId Optional identifier for multiple forms
   */
  save: (selection: Omit<TaxonomySelection, 'timestamp'>, formId = 'default'): void => {
    try {
      const key = `taxonomySelection_${formId}`;
      sessionStorage.setItem(key, JSON.stringify({
        ...selection,
        timestamp: Date.now()
      }));
      debugLog(`[SelectionStorage] Saved selection for form "${formId}":`, selection);
    } catch (error) {
      console.error('[SelectionStorage] Error saving selection:', error);
    }
  },
  
  /**
   * Retrieves a previously saved taxonomy selection
   * @param formId Optional identifier for multiple forms
   * @param maxAgeMinutes Maximum age in minutes before considering data stale
   * @returns The saved selection or null if not found or stale
   */
  retrieve: (formId = 'default', maxAgeMinutes = 30): Omit<TaxonomySelection, 'timestamp'> | null => {
    try {
      const key = `taxonomySelection_${formId}`;
      const saved = sessionStorage.getItem(key);
      
      if (!saved) return null;
      
      const parsed = JSON.parse(saved) as TaxonomySelection;
      
      // Check for stale data
      if (parsed.timestamp) {
        const ageInMinutes = (Date.now() - parsed.timestamp) / (1000 * 60);
        
        // Consider selections older than maxAgeMinutes as stale
        if (ageInMinutes > maxAgeMinutes) {
          debugLog(`[SelectionStorage] Discarding stale selection (${ageInMinutes.toFixed(1)} minutes old)`);
          sessionStorage.removeItem(key);
          return null;
        }
      }
      
      debugLog(`[SelectionStorage] Retrieved selection for form "${formId}":`, parsed);
      
      // Return selection without the timestamp
      const { timestamp, ...selection } = parsed;
      return selection;
    } catch (error) {
      console.error('[SelectionStorage] Error retrieving selection:', error);
      return null;
    }
  },
  
  /**
   * Clears a saved taxonomy selection
   * @param formId Optional identifier for multiple forms
   */
  clear: (formId = 'default'): void => {
    try {
      const key = `taxonomySelection_${formId}`;
      sessionStorage.removeItem(key);
      debugLog(`[SelectionStorage] Cleared selection for form "${formId}"`);
    } catch (error) {
      console.error('[SelectionStorage] Error clearing selection:', error);
    }
  },
  
  /**
   * Updates only specific fields of a saved selection
   * @param updates Partial selection with only the fields to update
   * @param formId Optional identifier for multiple forms
   * @returns True if update was successful
   */
  update: (updates: Partial<Omit<TaxonomySelection, 'timestamp'>>, formId = 'default'): boolean => {
    try {
      const key = `taxonomySelection_${formId}`;
      const saved = sessionStorage.getItem(key);
      
      // If no existing selection, create a new one with the updates
      if (!saved) {
        this.save(updates as any, formId);
        return true;
      }
      
      // Otherwise, merge with existing selection
      const parsed = JSON.parse(saved) as TaxonomySelection;
      const { timestamp } = parsed;
      
      const updated = {
        ...parsed,
        ...updates,
        timestamp: Date.now() // Always update timestamp
      };
      
      sessionStorage.setItem(key, JSON.stringify(updated));
      debugLog(`[SelectionStorage] Updated selection for form "${formId}":`, updates);
      return true;
    } catch (error) {
      console.error('[SelectionStorage] Error updating selection:', error);
      return false;
    }
  },
  
  /**
   * Gets all saved selections
   * @returns Object with all form IDs and their selections
   */
  getAll: (): Record<string, Omit<TaxonomySelection, 'timestamp'>> => {
    try {
      const result: Record<string, Omit<TaxonomySelection, 'timestamp'>> = {};
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        
        if (key && key.startsWith('taxonomySelection_')) {
          const formId = key.replace('taxonomySelection_', '');
          const selection = this.retrieve(formId);
          
          if (selection) {
            result[formId] = selection;
          }
        }
      }
      
      return result;
    } catch (error) {
      console.error('[SelectionStorage] Error getting all selections:', error);
      return {};
    }
  },
  
  /**
   * Clears all saved selections
   */
  clearAll: (): void => {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        
        if (key && key.startsWith('taxonomySelection_')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        sessionStorage.removeItem(key);
      });
      
      debugLog(`[SelectionStorage] Cleared all selections (${keysToRemove.length} items)`);
    } catch (error) {
      console.error('[SelectionStorage] Error clearing all selections:', error);
    }
  }
};