import { SelectionStorage, TaxonomySelection, StorageType } from '../selectionStorage';

// Mock sessionStorage and localStorage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

// Mock the browser's sessionStorage and localStorage
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock addEventListener for storage events
const mockStorageEventListeners: ((e: StorageEvent) => void)[] = [];
window.addEventListener = jest.fn((event, cb) => {
  if (event === 'storage') {
    mockStorageEventListeners.push(cb as any);
  }
});

// Helper to trigger storage events
const triggerStorageEvent = (key: string, oldValue: string | null, newValue: string | null) => {
  const event = new StorageEvent('storage', {
    key,
    oldValue,
    newValue,
    storageArea: window.localStorage,
  });
  
  mockStorageEventListeners.forEach(listener => listener(event));
};

// Mock console functions
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('SelectionStorage', () => {
  beforeEach(() => {
    // Clear mocks and storage before each test
    jest.clearAllMocks();
    mockSessionStorage.clear();
    mockLocalStorage.clear();
  });
  
  describe('Core Functionality', () => {
    it('should save and retrieve taxonomy selections', () => {
      // Create a test selection
      const selection: Omit<TaxonomySelection, 'timestamp'> = {
        layer: 'S',
        categoryCode: 'POP',
        subcategoryCode: 'HPM',
      };
      
      // Save the selection
      SelectionStorage.save(selection, 'test-form');
      
      // Check that it was saved to storage
      expect(mockSessionStorage.setItem).toHaveBeenCalled();
      
      // Retrieve the selection
      const retrieved = SelectionStorage.retrieve('test-form');
      
      // Verify it matches what we saved
      expect(retrieved).toEqual(selection);
    });
    
    it('should handle stale data', () => {
      // Create a test selection with an old timestamp
      const selection: TaxonomySelection = {
        layer: 'S',
        categoryCode: 'POP',
        subcategoryCode: 'HPM',
        timestamp: Date.now() - (60 * 60 * 1000), // 1 hour ago (older than default 30 minutes)
      };
      
      // Directly set the item in storage with a stale timestamp
      mockSessionStorage.setItem(
        'taxonomySelection_test-form',
        JSON.stringify(selection)
      );
      
      // Try to retrieve it - should return null because it's stale
      const retrieved = SelectionStorage.retrieve('test-form');
      expect(retrieved).toBeNull();
      
      // The stale data should have been removed
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('taxonomySelection_test-form');
    });
    
    it('should update existing selections', () => {
      // Create and save an initial selection
      const initialSelection: Omit<TaxonomySelection, 'timestamp'> = {
        layer: 'S',
        categoryCode: 'POP',
        subcategoryCode: '',
      };
      
      SelectionStorage.save(initialSelection, 'test-form');
      
      // Update just the subcategory
      const update: Partial<Omit<TaxonomySelection, 'timestamp'>> = {
        subcategoryCode: 'HPM',
      };
      
      const updateResult = SelectionStorage.update(update, 'test-form');
      expect(updateResult).toBe(true);
      
      // Retrieve the updated selection
      const retrieved = SelectionStorage.retrieve('test-form');
      
      // It should contain both the original data and the update
      expect(retrieved).toEqual({
        layer: 'S',
        categoryCode: 'POP',
        subcategoryCode: 'HPM',
      });
    });
    
    it('should create a new selection when updating a non-existent one', () => {
      // Update a selection that doesn't exist yet
      const update: Partial<Omit<TaxonomySelection, 'timestamp'>> = {
        layer: 'S',
        subcategoryCode: 'HPM',
      };
      
      const updateResult = SelectionStorage.update(update, 'non-existent');
      expect(updateResult).toBe(true);
      
      // Retrieve the newly created selection
      const retrieved = SelectionStorage.retrieve('non-existent');
      
      // It should contain the update data
      expect(retrieved).toEqual({
        layer: 'S',
        subcategoryCode: 'HPM',
        categoryCode: undefined, // Not included in the update
      });
    });
    
    it('should clear a specific selection', () => {
      // Create and save a selection
      const selection: Omit<TaxonomySelection, 'timestamp'> = {
        layer: 'S',
        categoryCode: 'POP',
        subcategoryCode: 'HPM',
      };
      
      SelectionStorage.save(selection, 'test-form');
      
      // Clear the selection
      SelectionStorage.clear('test-form');
      
      // Verify it was removed from storage
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('taxonomySelection_test-form');
      
      // Trying to retrieve it should return null
      const retrieved = SelectionStorage.retrieve('test-form');
      expect(retrieved).toBeNull();
    });
    
    it('should clear all selections', () => {
      // Create and save multiple selections
      SelectionStorage.save({ layer: 'S', categoryCode: 'POP', subcategoryCode: 'HPM' }, 'form1');
      SelectionStorage.save({ layer: 'G', categoryCode: 'RNB', subcategoryCode: 'SLW' }, 'form2');
      SelectionStorage.save({ layer: 'L', categoryCode: 'CAS', subcategoryCode: 'FRM' }, 'form3');
      
      // Add some non-taxonomy items to storage
      mockSessionStorage.setItem('otherItem', 'should not be cleared');
      
      // Clear all selections
      SelectionStorage.clearAll();
      
      // Verify all taxonomy items were removed
      expect(SelectionStorage.retrieve('form1')).toBeNull();
      expect(SelectionStorage.retrieve('form2')).toBeNull();
      expect(SelectionStorage.retrieve('form3')).toBeNull();
      
      // Non-taxonomy items should remain
      expect(mockSessionStorage.getItem('otherItem')).toBe('should not be cleared');
    });
    
    it('should return all saved selections', () => {
      // Create and save multiple selections
      SelectionStorage.save({ layer: 'S', categoryCode: 'POP', subcategoryCode: 'HPM' }, 'form1');
      SelectionStorage.save({ layer: 'G', categoryCode: 'RNB', subcategoryCode: 'SLW' }, 'form2');
      
      // Get all selections
      const allSelections = SelectionStorage.getAll();
      
      // Verify all selections are returned
      expect(allSelections).toEqual({
        form1: { layer: 'S', categoryCode: 'POP', subcategoryCode: 'HPM' },
        form2: { layer: 'G', categoryCode: 'RNB', subcategoryCode: 'SLW' },
      });
    });
  });
  
  describe('Event Handling', () => {
    it('should trigger event handlers on save', () => {
      // Create a mock event handler
      const mockHandler = jest.fn();
      
      // Register the handler
      SelectionStorage.registerEventHandler('test-handler', mockHandler);
      
      // Create a selection
      const selection: Omit<TaxonomySelection, 'timestamp'> = {
        layer: 'S',
        categoryCode: 'POP',
        subcategoryCode: 'HPM',
      };
      
      // Save the selection
      SelectionStorage.save(selection, 'test-form');
      
      // Verify the handler was called with the correct arguments
      expect(mockHandler).toHaveBeenCalledWith(
        SelectionStorage.EventType.SAVE,
        'test-form',
        selection
      );
      
      // Unregister the handler
      SelectionStorage.unregisterEventHandler('test-handler');
    });
    
    it('should trigger event handlers on retrieve', () => {
      // Create a mock event handler
      const mockHandler = jest.fn();
      
      // Register the handler
      SelectionStorage.registerEventHandler('test-handler', mockHandler);
      
      // Create and save a selection
      const selection: Omit<TaxonomySelection, 'timestamp'> = {
        layer: 'S',
        categoryCode: 'POP',
        subcategoryCode: 'HPM',
      };
      
      SelectionStorage.save(selection, 'test-form');
      
      // Reset the mock to clear the save event
      mockHandler.mockReset();
      
      // Retrieve the selection
      const retrieved = SelectionStorage.retrieve('test-form');
      
      // Verify the handler was called with the correct arguments
      expect(mockHandler).toHaveBeenCalledWith(
        SelectionStorage.EventType.RETRIEVE,
        'test-form',
        retrieved
      );
      
      // Unregister the handler
      SelectionStorage.unregisterEventHandler('test-handler');
    });
    
    it('should handle cross-tab synchronization', () => {
      // Create a mock callback
      const mockCallback = jest.fn();
      
      // Register for cross-tab sync
      SelectionStorage.registerForCrossTabSync('test-component', mockCallback);
      
      // Create a selection that would be set in another tab
      const selection: TaxonomySelection = {
        layer: 'S',
        categoryCode: 'POP',
        subcategoryCode: 'HPM',
        timestamp: Date.now(),
      };
      
      // Simulate a storage event from another tab
      triggerStorageEvent(
        'taxonomySelection_test-form',
        null,
        JSON.stringify(selection)
      );
      
      // Verify the callback was called with the correct arguments
      expect(mockCallback).toHaveBeenCalledWith(
        'test-form',
        selection
      );
      
      // Unregister from cross-tab sync
      SelectionStorage.unregisterFromCrossTabSync('test-component');
    });
  });
  
  describe('Error Handling', () => {
    it('should handle errors gracefully when storage is not available', () => {
      // Mock sessionStorage.setItem to throw an error
      const originalSetItem = mockSessionStorage.setItem;
      mockSessionStorage.setItem = jest.fn().mockImplementation(() => {
        throw new Error('Storage is not available');
      });
      
      // Create a selection
      const selection: Omit<TaxonomySelection, 'timestamp'> = {
        layer: 'S',
        categoryCode: 'POP',
        subcategoryCode: 'HPM',
      };
      
      // Try to save - should not throw
      expect(() => {
        SelectionStorage.save(selection, 'test-form');
      }).not.toThrow();
      
      // Should log an error
      expect(console.error).toHaveBeenCalled();
      
      // Restore the original implementation
      mockSessionStorage.setItem = originalSetItem;
    });
    
    it('should handle quota exceeded errors by trying to remove old items', () => {
      // Mock sessionStorage.setItem to throw a quota exceeded error
      const originalSetItem = mockSessionStorage.setItem;
      mockSessionStorage.setItem = jest.fn().mockImplementation(() => {
        const error = new Error('Quota exceeded') as DOMException;
        error.name = 'QuotaExceededError';
        throw error;
      });
      
      // Create a selection
      const selection: Omit<TaxonomySelection, 'timestamp'> = {
        layer: 'S',
        categoryCode: 'POP',
        subcategoryCode: 'HPM',
      };
      
      // Try to save - should not throw
      expect(() => {
        SelectionStorage.save(selection, 'test-form');
      }).not.toThrow();
      
      // Should log a warning
      expect(console.warn).toHaveBeenCalled();
      
      // Restore the original implementation
      mockSessionStorage.setItem = originalSetItem;
    });
  });
});