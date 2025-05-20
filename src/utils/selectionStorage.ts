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
 * Storage type options
 */
export type StorageType = 'session' | 'local';

/**
 * Storage strategy interface for dependency injection
 */
interface StorageStrategy {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  key(index: number): string | null;
  readonly length: number;
}

/**
 * Storage event handler type for cross-tab synchronization
 */
export type StorageEventHandler = (event: StorageEvent) => void;

/**
 * Class for handling both session and local storage with fallbacks
 */
class CustomStorage implements StorageStrategy {
  private primaryType: StorageType;
  private fallbackType: StorageType;
  private eventHandlers: Map<string, StorageEventHandler> = new Map();
  
  constructor(type: StorageType = 'session', fallbackType: StorageType = 'local') {
    this.primaryType = type;
    this.fallbackType = fallbackType;
    
    // Setup cross-tab synchronization if using localStorage
    if (this.primaryType === 'local' || this.fallbackType === 'local') {
      this.setupStorageEventListener();
    }
  }
  
  /**
   * Setup storage event listener for cross-tab synchronization
   */
  private setupStorageEventListener(): void {
    window.addEventListener('storage', (event) => {
      // Only process events for our keys
      if (event.key && event.key.startsWith('taxonomySelection_')) {
        debugLog(`[Storage] Cross-tab storage event: ${event.key}`);
        
        // Notify any registered handlers
        this.eventHandlers.forEach((handler) => {
          handler(event);
        });
      }
    });
  }
  
  /**
   * Register a callback for storage events (cross-tab synchronization)
   * @param id Unique identifier for the handler
   * @param handler Function to call when storage changes in another tab
   */
  public registerStorageEventHandler(id: string, handler: StorageEventHandler): void {
    this.eventHandlers.set(id, handler);
  }
  
  /**
   * Unregister a storage event handler
   * @param id Identifier of the handler to remove
   */
  public unregisterStorageEventHandler(id: string): void {
    this.eventHandlers.delete(id);
  }
  
  /**
   * Check if storage is available
   * @param type Storage type to check
   * @returns True if storage is available
   */
  private isStorageAvailable(type: StorageType): boolean {
    try {
      const storage = type === 'session' ? window.sessionStorage : window.localStorage;
      const testKey = '__storage_test__';
      storage.setItem(testKey, 'test');
      storage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn(`[Storage] ${type}Storage is not available:`, e);
      return false;
    }
  }
  
  /**
   * Get storage object based on type with availability check
   * @param type Storage type
   * @returns Storage object or null if not available
   */
  private getStorage(type: StorageType): globalThis.Storage | null {
    if (this.isStorageAvailable(type)) {
      return type === 'session' ? window.sessionStorage : window.localStorage;
    }
    return null;
  }
  
  /**
   * Get the best available storage
   * @returns The best available storage or null if none available
   */
  private getBestStorage(): globalThis.Storage | null {
    // Try primary storage first
    const primaryStorage = this.getStorage(this.primaryType);
    if (primaryStorage) return primaryStorage;
    
    // Try fallback storage if primary not available
    const fallbackStorage = this.getStorage(this.fallbackType);
    if (fallbackStorage) return fallbackStorage;
    
    // No storage available
    return null;
  }
  
  /**
   * Get an item from storage with fallback support
   */
  public getItem(key: string): string | null {
    try {
      // Try primary storage first
      const primaryStorage = this.getStorage(this.primaryType);
      if (primaryStorage) {
        const value = primaryStorage.getItem(key);
        if (value !== null) return value;
      }
      
      // Try fallback storage if not found in primary
      const fallbackStorage = this.getStorage(this.fallbackType);
      if (fallbackStorage) {
        return fallbackStorage.getItem(key);
      }
      
      return null;
    } catch (e) {
      console.error(`[Storage] Error getting item ${key}:`, e);
      return null;
    }
  }
  
  /**
   * Set an item in storage with fallback support
   */
  public setItem(key: string, value: string): void {
    try {
      // Try primary storage first
      const primaryStorage = this.getStorage(this.primaryType);
      if (primaryStorage) {
        primaryStorage.setItem(key, value);
        return;
      }
      
      // Try fallback storage if primary not available
      const fallbackStorage = this.getStorage(this.fallbackType);
      if (fallbackStorage) {
        fallbackStorage.setItem(key, value);
        return;
      }
      
      // No storage available
      console.warn(`[Storage] No available storage for setting ${key}`);
    } catch (e) {
      // Handle quota exceeded errors
      if (e instanceof DOMException && (
        // Firefox
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        // Chrome
        e.name === 'QuotaExceededError' ||
        // Safari
        e.name === 'QUOTA_EXCEEDED_ERR' ||
        // General fallback
        e.code === 22 ||
        e.code === 1014
      )) {
        console.warn(`[Storage] Storage quota exceeded for ${key}`, e);
        
        // Try to remove old items to make space
        this.removeOldItems();
        
        // Try again with the fallback storage
        const fallbackStorage = this.getStorage(this.fallbackType);
        if (fallbackStorage) {
          try {
            fallbackStorage.setItem(key, value);
          } catch (fallbackError) {
            console.error(`[Storage] Fallback storage also failed for ${key}:`, fallbackError);
          }
        }
      } else {
        console.error(`[Storage] Error setting item ${key}:`, e);
      }
    }
  }
  
  /**
   * Remove old items to free up storage space
   */
  private removeOldItems(): void {
    try {
      const storage = this.getBestStorage();
      if (!storage) return;
      
      // Find and remove items older than 24 hours
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      // Collect keys to remove
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith('taxonomySelection_')) {
          const value = storage.getItem(key);
          if (value) {
            try {
              const parsed = JSON.parse(value);
              if (parsed.timestamp && (now - parsed.timestamp > maxAge)) {
                keysToRemove.push(key);
              }
            } catch (e) {
              // Invalid JSON, remove it
              keysToRemove.push(key);
            }
          }
        }
      }
      
      // Remove collected keys
      keysToRemove.forEach(key => {
        storage.removeItem(key);
      });
      
      debugLog(`[Storage] Cleared ${keysToRemove.length} old items to free up space`);
    } catch (e) {
      console.error('[Storage] Error removing old items:', e);
    }
  }
  
  /**
   * Remove an item from storage
   */
  public removeItem(key: string): void {
    try {
      // Try to remove from both storages to ensure it's fully removed
      const primaryStorage = this.getStorage(this.primaryType);
      if (primaryStorage) {
        primaryStorage.removeItem(key);
      }
      
      const fallbackStorage = this.getStorage(this.fallbackType);
      if (fallbackStorage) {
        fallbackStorage.removeItem(key);
      }
    } catch (e) {
      console.error(`[Storage] Error removing item ${key}:`, e);
    }
  }
  
  /**
   * Clear all items with our prefix
   */
  public clear(): void {
    try {
      const storages = [
        this.getStorage(this.primaryType),
        this.getStorage(this.fallbackType)
      ].filter(Boolean) as Storage[];
      
      storages.forEach(storage => {
        const keysToRemove: string[] = [];
        
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith('taxonomySelection_')) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => {
          storage.removeItem(key);
        });
      });
    } catch (e) {
      console.error('[Storage] Error clearing items:', e);
    }
  }
  
  /**
   * Get key at index (required for StorageStrategy interface)
   */
  public key(index: number): string | null {
    const storage = this.getBestStorage();
    if (storage) {
      return storage.key(index);
    }
    return null;
  }
  
  /**
   * Get storage length (required for StorageStrategy interface)
   */
  public get length(): number {
    const storage = this.getBestStorage();
    return storage ? storage.length : 0;
  }
}

// Create a storage instance with session storage as primary and local storage as fallback
const storage = new CustomStorage('session', 'local');

/**
 * Utility for persisting and retrieving taxonomy selection state
 * This allows selections to be preserved during page refreshes or navigation
 */
export const SelectionStorage = {
  /**
   * Event types for selection storage
   */
  EventType: {
    SAVE: 'save',
    RETRIEVE: 'retrieve',
    CLEAR: 'clear',
    UPDATE: 'update',
  },
  
  /**
   * Event handlers for selection storage events
   */
  eventHandlers: new Map<string, (eventType: string, formId: string, data?: any) => void>(),
  
  /**
   * Register an event handler
   * @param id Handler identifier
   * @param handler Event handler function
   */
  registerEventHandler: (id: string, handler: (eventType: string, formId: string, data?: any) => void): void => {
    SelectionStorage.eventHandlers.set(id, handler);
  },
  
  /**
   * Unregister an event handler
   * @param id Handler identifier
   */
  unregisterEventHandler: (id: string): void => {
    SelectionStorage.eventHandlers.delete(id);
  },
  
  /**
   * Trigger event handlers
   * @param eventType Event type
   * @param formId Form identifier
   * @param data Optional event data
   */
  triggerEvent: (eventType: string, formId: string, data?: any): void => {
    SelectionStorage.eventHandlers.forEach(handler => {
      try {
        handler(eventType, formId, data);
      } catch (error) {
        console.error('[SelectionStorage] Error in event handler:', error);
      }
    });
  },
  
  /**
   * Register for cross-tab synchronization
   * @param componentId Component identifier
   * @param callback Function to call when changes occur in another tab
   */
  registerForCrossTabSync: (componentId: string, callback: (formId: string, selection: TaxonomySelection) => void): void => {
    storage.registerStorageEventHandler(componentId, (event) => {
      if (event.key && event.key.startsWith('taxonomySelection_') && event.newValue) {
        try {
          const formId = event.key.replace('taxonomySelection_', '');
          const selection = JSON.parse(event.newValue) as TaxonomySelection;
          callback(formId, selection);
        } catch (error) {
          console.error('[SelectionStorage] Error processing cross-tab event:', error);
        }
      }
    });
  },
  
  /**
   * Unregister from cross-tab synchronization
   * @param componentId Component identifier
   */
  unregisterFromCrossTabSync: (componentId: string): void => {
    storage.unregisterStorageEventHandler(componentId);
  },
  
  /**
   * Set storage type preference
   * @param primaryType Primary storage type
   * @param fallbackType Fallback storage type
   * @returns True if storage is available
   */
  setStorageType: (primaryType: StorageType, fallbackType: StorageType): boolean => {
    // Currently not supported as we'd need to recreate the storage instance
    // This is a placeholder for future enhancement
    console.warn('[SelectionStorage] Storage type changes are not supported in the current version');
    return true;
  },
  
  /**
   * Saves the current taxonomy selection to storage
   * @param selection The current selection state
   * @param formId Optional identifier for multiple forms
   */
  save: (selection: Omit<TaxonomySelection, 'timestamp'>, formId = 'default'): void => {
    try {
      const key = `taxonomySelection_${formId}`;
      const data = {
        ...selection,
        timestamp: Date.now()
      };
      
      storage.setItem(key, JSON.stringify(data));
      debugLog(`[SelectionStorage] Saved selection for form "${formId}":`, selection);
      
      // Trigger event handlers
      SelectionStorage.triggerEvent(SelectionStorage.EventType.SAVE, formId, selection);
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
      const saved = storage.getItem(key);
      
      if (!saved) return null;
      
      const parsed = JSON.parse(saved) as TaxonomySelection;
      
      // Check for stale data
      if (parsed.timestamp) {
        const ageInMinutes = (Date.now() - parsed.timestamp) / (1000 * 60);
        
        // Consider selections older than maxAgeMinutes as stale
        if (ageInMinutes > maxAgeMinutes) {
          debugLog(`[SelectionStorage] Discarding stale selection (${ageInMinutes.toFixed(1)} minutes old)`);
          storage.removeItem(key);
          
          // Trigger event handlers
          SelectionStorage.triggerEvent(SelectionStorage.EventType.CLEAR, formId, { reason: 'stale' });
          
          return null;
        }
      }
      
      debugLog(`[SelectionStorage] Retrieved selection for form "${formId}":`, parsed);
      
      // Return selection without the timestamp
      const { timestamp, ...selection } = parsed;
      
      // Trigger event handlers
      SelectionStorage.triggerEvent(SelectionStorage.EventType.RETRIEVE, formId, selection);
      
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
      storage.removeItem(key);
      debugLog(`[SelectionStorage] Cleared selection for form "${formId}"`);
      
      // Trigger event handlers
      SelectionStorage.triggerEvent(SelectionStorage.EventType.CLEAR, formId);
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
      const saved = storage.getItem(key);
      
      // If no existing selection, create a new one with the updates
      if (!saved) {
        SelectionStorage.save(updates as any, formId);
        return true;
      }
      
      // Otherwise, merge with existing selection
      const parsed = JSON.parse(saved) as TaxonomySelection;
      
      const updated = {
        ...parsed,
        ...updates,
        timestamp: Date.now() // Always update timestamp
      };
      
      storage.setItem(key, JSON.stringify(updated));
      debugLog(`[SelectionStorage] Updated selection for form "${formId}":`, updates);
      
      // Trigger event handlers
      SelectionStorage.triggerEvent(SelectionStorage.EventType.UPDATE, formId, updates);
      
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
      
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        
        if (key && key.startsWith('taxonomySelection_')) {
          const formId = key.replace('taxonomySelection_', '');
          const selection = SelectionStorage.retrieve(formId);
          
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
      storage.clear();
      debugLog(`[SelectionStorage] Cleared all selections`);
    } catch (error) {
      console.error('[SelectionStorage] Error clearing all selections:', error);
    }
  }
};