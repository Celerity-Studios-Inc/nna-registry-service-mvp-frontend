import { SelectionStorage, TaxonomySelection } from '../selectionStorage';
import { EventCoordinator } from '../eventCoordinator';

// Mock sessionStorage
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

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

// Mock console.log to avoid noise in tests
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Taxonomy State Restoration Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.clear();
  });

  describe('SelectionStorage and EventCoordinator integration', () => {
    it('should save and retrieve taxonomy selections', () => {
      // Save a selection
      const selection: Omit<TaxonomySelection, 'timestamp'> = {
        layer: 'S',
        categoryCode: 'POP',
        subcategoryCode: 'HPM',
      };
      
      SelectionStorage.save(selection, 'test-form');
      
      // Check that it was saved to sessionStorage
      expect(mockSessionStorage.setItem).toHaveBeenCalled();
      
      // Retrieve the selection
      const retrieved = SelectionStorage.retrieve('test-form');
      
      // Verify it matches what we saved
      expect(retrieved).toEqual(selection);
    });

    it('should handle sequence of taxonomy selections with EventCoordinator', async () => {
      // Create a mock for tracking executed events
      const executedEvents: string[] = [];
      
      // Clear any existing events
      EventCoordinator.clear();
      
      // Queue multiple events
      EventCoordinator.enqueue('select-layer', () => {
        executedEvents.push('layer-selected');
        // Save layer selection
        SelectionStorage.save({ layer: 'S', categoryCode: '', subcategoryCode: '' }, 'test-form');
      });
      
      EventCoordinator.enqueue('select-category', () => {
        executedEvents.push('category-selected');
        // Update with category
        SelectionStorage.update({ categoryCode: 'POP' }, 'test-form');
      });
      
      EventCoordinator.enqueue('select-subcategory', () => {
        executedEvents.push('subcategory-selected');
        // Update with subcategory
        SelectionStorage.update({ subcategoryCode: 'HPM' }, 'test-form');
      });
      
      // Wait for all events to process (add small buffer)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify events executed in correct order
      expect(executedEvents).toEqual([
        'layer-selected',
        'category-selected',
        'subcategory-selected'
      ]);
      
      // Verify final state is correct
      const finalSelection = SelectionStorage.retrieve('test-form');
      expect(finalSelection).toEqual({
        layer: 'S',
        categoryCode: 'POP',
        subcategoryCode: 'HPM'
      });
    });

    it('should update existing selections', () => {
      // Initial selection
      SelectionStorage.save({
        layer: 'S',
        categoryCode: 'POP',
        subcategoryCode: '',
      }, 'test-form');
      
      // Update just the subcategory
      SelectionStorage.update({
        subcategoryCode: 'HPM',
      }, 'test-form');
      
      // Verify the combined result
      const result = SelectionStorage.retrieve('test-form');
      expect(result).toEqual({
        layer: 'S',
        categoryCode: 'POP',
        subcategoryCode: 'HPM',
      });
    });

    it('should clear selections', () => {
      // Save a selection
      SelectionStorage.save({
        layer: 'S',
        categoryCode: 'POP',
        subcategoryCode: 'HPM',
      }, 'test-form');
      
      // Clear it
      SelectionStorage.clear('test-form');
      
      // Verify it's gone
      expect(SelectionStorage.retrieve('test-form')).toBeNull();
    });

    it('should discard stale selections', () => {
      // Mock Date.now to return a fixed timestamp
      const realDateNow = Date.now;
      const fixedTime = 1600000000000; // Some arbitrary timestamp
      
      // First create a selection at the fixed time
      global.Date.now = jest.fn(() => fixedTime);
      
      SelectionStorage.save({
        layer: 'S',
        categoryCode: 'POP',
        subcategoryCode: 'HPM',
      }, 'test-form');
      
      // Now advance time by 31 minutes (beyond the default 30 minute stale threshold)
      global.Date.now = jest.fn(() => fixedTime + (31 * 60 * 1000));
      
      // Selection should be considered stale now
      expect(SelectionStorage.retrieve('test-form')).toBeNull();
      
      // Restore real Date.now
      global.Date.now = realDateNow;
    });
  });
});