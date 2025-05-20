# NNA Registry Service: Persistent State Implementation

## Overview

This document provides a comprehensive overview of the state persistence implementation for the NNA Registry Service frontend. The implementation focuses on preserving taxonomy selections (layer, category, subcategory) during page navigation and refreshes, ensuring a seamless user experience when creating or editing assets.

## Architecture

The persistence mechanism consists of several key components:

1. **Core Storage Utility** (`src/utils/selectionStorage.ts`)
   - Provides a unified API for storing and retrieving taxonomy selections
   - Implements fallback mechanisms between sessionStorage and localStorage
   - Handles storage availability detection and quota management
   - Supports cross-tab synchronization via the Storage event API

2. **Integration with Forms** (`src/pages/new/RegisterAssetPageNew.tsx`)
   - Auto-saves selections during navigation and user actions
   - Auto-restores selections from storage when returning to forms
   - Implements navigation warnings when user attempts to leave with unsaved changes
   - Coordinates state between form values and taxonomy context

3. **User Feedback** (`src/components/feedback/StorageOperationFeedback.tsx`)
   - Provides visual feedback for storage operations
   - Notifies users of successful saves, retrieves, and potential issues
   - Uses non-intrusive notifications that don't disrupt workflow

4. **Testing & Validation** (`src/utils/__tests__/selectionStorage.test.ts`)
   - Comprehensive test suite for storage operations
   - Validates edge cases and error handling
   - Tests cross-tab synchronization behavior

## Key Technical Features

### 1. Storage Strategy with Fallback

The implementation uses a tiered storage strategy, starting with sessionStorage (for session-only persistence) and falling back to localStorage if sessionStorage is unavailable:

```typescript
class CustomStorage implements StorageStrategy {
  private primaryType: StorageType;
  private fallbackType: StorageType;
  
  constructor(primaryType: StorageType = 'session', fallbackType: StorageType = 'local') {
    this.primaryType = primaryType;
    this.fallbackType = fallbackType;
  }
  
  isStorageAvailable(type: StorageType): boolean {
    const storage = type === 'session' ? window.sessionStorage : window.localStorage;
    try {
      const testKey = '__storage_test__';
      storage.setItem(testKey, testKey);
      storage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  private getStorage(type: StorageType): globalThis.Storage | null {
    if (this.isStorageAvailable(type)) {
      return type === 'session' ? window.sessionStorage : window.localStorage;
    }
    return null;
  }
  
  // Get the best available storage option (primary or fallback)
  getAvailableStorage(): globalThis.Storage | null {
    const primaryStorage = this.getStorage(this.primaryType);
    if (primaryStorage) return primaryStorage;
    
    const fallbackStorage = this.getStorage(this.fallbackType);
    if (fallbackStorage) return fallbackStorage;
    
    return null;
  }
}
```

### 2. Cross-Tab Synchronization

The implementation includes support for synchronizing taxonomy selections across multiple browser tabs using the Storage event API:

```typescript
// In selectionStorage.ts
private setupCrossTabSync(): void {
  window.addEventListener('storage', (event) => {
    // Only process events from our application
    if (event.key && event.key.startsWith(STORAGE_KEY_PREFIX)) {
      try {
        const formId = event.key.substring(STORAGE_KEY_PREFIX.length);
        const newData = event.newValue ? JSON.parse(event.newValue) : null;
        
        // Notify all registered handlers about the cross-tab update
        this.notifyCrossTabSyncHandlers(formId, newData);
      } catch (error) {
        console.error('Error processing cross-tab storage event', error);
      }
    }
  });
}

// Registration API for components
registerForCrossTabSync(
  handlerId: string, 
  callback: CrossTabSyncHandler
): void {
  this.crossTabSyncHandlers.set(handlerId, callback);
}

unregisterFromCrossTabSync(handlerId: string): void {
  this.crossTabSyncHandlers.delete(handlerId);
}
```

### 3. Event System for UI Coordination

The implementation includes an event system that allows UI components to respond to storage events:

```typescript
// Event types
export enum EventType {
  SAVE = 'save',
  RETRIEVE = 'retrieve',
  CLEAR = 'clear',
  UPDATE = 'update',
  ERROR = 'error'
}

// Handler registration
registerEventHandler(handlerId: string, handler: StorageEventHandler): void {
  this.eventHandlers.set(handlerId, handler);
}

unregisterEventHandler(handlerId: string): void {
  this.eventHandlers.delete(handlerId);
}

// Trigger events to notify UI components
private triggerEvent(
  eventType: EventType,
  formId: string,
  data?: any,
  error?: Error
): void {
  this.eventHandlers.forEach((handler) => {
    try {
      handler(eventType, formId, data, error);
    } catch (handlerError) {
      console.error('Error in storage event handler', handlerError);
    }
  });
}
```

### 4. Quota Management and Cleanup

The implementation includes quota management and stale data cleanup:

```typescript
// Handle quota exceeded errors
private handleQuotaExceededError(storage: globalThis.Storage, formId: string, newData: any): boolean {
  // Try to clean up old items first
  const cleanedUp = this.cleanupOldEntries(storage);
  
  if (cleanedUp) {
    // Try again after cleanup
    try {
      storage.setItem(
        `${STORAGE_KEY_PREFIX}${formId}`, 
        JSON.stringify({ ...newData, timestamp: Date.now() })
      );
      return true;
    } catch (e) {
      // Still failing after cleanup
      return false;
    }
  }
  
  return false;
}

// Clean up old entries when storage is full
private cleanupOldEntries(storage: globalThis.Storage): boolean {
  try {
    const keysToCheck: string[] = [];
    
    // Find all our application's keys
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        keysToCheck.push(key);
      }
    }
    
    // If we have less than the threshold, no need to clean up
    if (keysToCheck.length < CLEANUP_THRESHOLD) {
      return false;
    }
    
    // Sort by timestamp (oldest first)
    const sortedEntries = keysToCheck
      .map(key => {
        try {
          const valueStr = storage.getItem(key);
          if (!valueStr) return { key, timestamp: 0 };
          
          const value = JSON.parse(valueStr);
          return {
            key,
            timestamp: value.timestamp || 0
          };
        } catch (e) {
          return { key, timestamp: 0 };
        }
      })
      .sort((a, b) => a.timestamp - b.timestamp);
    
    // Remove the oldest entries
    const entriesToRemove = sortedEntries.slice(0, Math.ceil(sortedEntries.length * CLEANUP_PERCENTAGE));
    entriesToRemove.forEach(entry => {
      storage.removeItem(entry.key);
    });
    
    return entriesToRemove.length > 0;
  } catch (e) {
    console.error('Error cleaning up storage', e);
    return false;
  }
}
```

### 5. Timestamp-Based Stale Data Detection

The implementation includes timestamp-based validation to ensure stale data is not used:

```typescript
retrieve<T>(formId: string, maxAge?: number): T | null {
  try {
    const storage = this.getAvailableStorage();
    if (!storage) return null;
    
    const key = `${STORAGE_KEY_PREFIX}${formId}`;
    const storedValue = storage.getItem(key);
    
    if (!storedValue) return null;
    
    const parsedValue = JSON.parse(storedValue);
    const timestamp = parsedValue.timestamp || 0;
    
    // Check if data is stale
    if (maxAge && Date.now() - timestamp > maxAge) {
      // Data is too old, remove it
      storage.removeItem(key);
      this.triggerEvent(EventType.CLEAR, formId, { reason: 'stale' });
      return null;
    }
    
    // Extract the actual data (remove timestamp)
    const { timestamp: _, ...data } = parsedValue;
    
    this.triggerEvent(EventType.RETRIEVE, formId, data);
    return data as T;
  } catch (error) {
    this.triggerEvent(EventType.ERROR, formId, null, error as Error);
    return null;
  }
}
```

## Integration with React Components

### RegisterAssetPageNew.tsx Integration

The form integration handles several key scenarios:

1. **Auto-Saving Selections**:

```typescript
// Save taxonomy selections during form operations
const saveTaxonomySelection = useCallback(() => {
  const layer = getValues('layer');
  const categoryCode = getValues('categoryCode');
  const subcategoryCode = getValues('subcategoryCode');
  
  if (layer) {
    SelectionStorage.save(
      { layer, categoryCode, subcategoryCode },
      'asset-registration'
    );
  }
}, [getValues]);

// Save selections when navigating between steps
const handleNext = () => {
  saveTaxonomySelection();
  setActiveStep((prevActiveStep) => prevActiveStep + 1);
};

const handleBack = () => {
  saveTaxonomySelection();
  setActiveStep((prevActiveStep) => prevActiveStep - 1);
};
```

2. **Auto-Restoring Selections**:

```typescript
// Load saved selections on component mount
useEffect(() => {
  const savedSelection = SelectionStorage.retrieve<TaxonomySelection>(
    'asset-registration',
    MAX_STORAGE_AGE
  );
  
  if (savedSelection) {
    // Restore values to form
    if (savedSelection.layer) {
      setValue('layer', savedSelection.layer);
      
      if (savedSelection.categoryCode) {
        setValue('categoryCode', savedSelection.categoryCode);
        
        if (savedSelection.subcategoryCode) {
          setValue('subcategoryCode', savedSelection.subcategoryCode);
        }
      }
    }
    
    // Update taxonomy context if needed
    if (taxonomyContext) {
      if (savedSelection.layer !== taxonomyContext.selectedLayer) {
        taxonomyContext.setSelectedLayer(savedSelection.layer);
      }
      
      if (savedSelection.categoryCode !== taxonomyContext.selectedCategory) {
        taxonomyContext.setSelectedCategory(savedSelection.categoryCode);
      }
      
      if (savedSelection.subcategoryCode !== taxonomyContext.selectedSubcategory) {
        taxonomyContext.setSelectedSubcategory(savedSelection.subcategoryCode);
      }
    }
  }
}, [setValue, taxonomyContext]);
```

3. **Cross-Tab Synchronization**:

```typescript
// Register for cross-tab synchronization
useEffect(() => {
  SelectionStorage.registerForCrossTabSync(
    'RegisterAssetPage',
    (formId, selection) => {
      if (formId === 'asset-registration' && selection) {
        // Handle selection updates from other tabs
        if (selection.layer) {
          setValue('layer', selection.layer);
          
          if (selection.categoryCode) {
            setValue('categoryCode', selection.categoryCode);
            
            if (selection.subcategoryCode) {
              setValue('subcategoryCode', selection.subcategoryCode);
            }
          }
        }
      }
    }
  );
  
  return () => {
    SelectionStorage.unregisterFromCrossTabSync('RegisterAssetPage');
  };
}, [setValue]);
```

4. **Navigation Warnings**:

```typescript
// Warn user before leaving page with unsaved changes
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    const formIsDirty = isDirty && !isSubmitted.current;
    if (formIsDirty) {
      // Save current state before potential navigation
      saveTaxonomySelection();
      
      // Standard way to show confirmation dialog
      e.preventDefault();
      e.returnValue = '';
      return '';
    }
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}, [isDirty, saveTaxonomySelection]);
```

5. **Cleanup After Submission**:

```typescript
const onSubmit = async (data: FormData) => {
  try {
    // Process form submission
    await submitAsset(data);
    
    // Clear storage after successful submission
    SelectionStorage.clear('asset-registration');
    
    // Mark as submitted to prevent navigation warnings
    isSubmitted.current = true;
    
    // Navigate to success page
    navigate('/asset-created', { state: { assetId: result.id } });
  } catch (error) {
    // Handle submission error
    setSubmitError(error.message);
  }
};
```

### StorageOperationFeedback Component

The feedback component provides visual cues for storage operations:

```typescript
const StorageOperationFeedback: React.FC<StorageOperationFeedbackProps> = ({ 
  enableFeedback = true
}) => {
  const [feedback, setFeedback] = useState<FeedbackState>({
    open: false,
    message: '',
    severity: 'info',
    autoHideDuration: 3000,
  });
  
  useEffect(() => {
    if (!enableFeedback) return;
    
    const handleStorageEvent = (
      eventType: EventType,
      formId: string,
      data?: any,
      error?: Error
    ) => {
      if (eventType === EventType.ERROR) {
        setFeedback({
          open: true,
          message: `Storage error: ${error?.message || 'Unknown error'}`,
          severity: 'error',
          autoHideDuration: 5000,
        });
        return;
      }
      
      // Only show feedback for asset registration form
      if (formId !== 'asset-registration') return;
      
      switch (eventType) {
        case EventType.SAVE:
          setFeedback({
            open: true,
            message: 'Progress saved',
            severity: 'success',
            autoHideDuration: 2000,
          });
          break;
        case EventType.RETRIEVE:
          setFeedback({
            open: true,
            message: 'Restored previous selections',
            severity: 'info',
            autoHideDuration: 3000,
          });
          break;
        case EventType.CLEAR:
          if (data?.reason === 'stale') {
            setFeedback({
              open: true,
              message: 'Cleared outdated saved data',
              severity: 'warning',
              autoHideDuration: 3000,
            });
          }
          break;
        default:
          // Don't show feedback for other events
          break;
      }
    };
    
    // Register with SelectionStorage
    SelectionStorage.registerEventHandler('StorageOperationFeedback', handleStorageEvent);
    
    return () => {
      SelectionStorage.unregisterEventHandler('StorageOperationFeedback');
    };
  }, [enableFeedback]);
  
  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setFeedback({ ...feedback, open: false });
  };
  
  return (
    <Snackbar
      open={feedback.open}
      autoHideDuration={feedback.autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={handleClose}
        severity={feedback.severity}
        sx={{ width: '100%' }}
      >
        {feedback.message}
      </Alert>
    </Snackbar>
  );
};
```

## Testing Implementation

The implementation includes comprehensive tests in `selectionStorage.test.ts`:

```typescript
describe('SelectionStorage', () => {
  // Setup mocks for storage objects
  beforeEach(() => {
    // Mock sessionStorage and localStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: createStorageMock(),
      writable: true
    });
    
    Object.defineProperty(window, 'localStorage', {
      value: createStorageMock(),
      writable: true
    });
  });
  
  it('should save and retrieve selections', () => {
    const selection = { layer: 'S', categoryCode: 'POP', subcategoryCode: 'HPM' };
    SelectionStorage.save(selection, 'test-form');
    
    const retrieved = SelectionStorage.retrieve('test-form');
    expect(retrieved).toEqual(selection);
  });
  
  it('should handle storage errors gracefully', () => {
    // Mock storage that throws errors
    Object.defineProperty(window, 'sessionStorage', {
      value: createErrorStorageMock(),
      writable: true
    });
    
    Object.defineProperty(window, 'localStorage', {
      value: createErrorStorageMock(),
      writable: true
    });
    
    const selection = { layer: 'S', categoryCode: 'POP' };
    SelectionStorage.save(selection, 'test-form');
    
    // Should not throw and return null
    const retrieved = SelectionStorage.retrieve('test-form');
    expect(retrieved).toBeNull();
  });
  
  it('should detect and handle stale data', () => {
    const selection = { layer: 'S', categoryCode: 'POP' };
    SelectionStorage.save(selection, 'test-form');
    
    // Mock timestamp to be older than maxAge
    const storageKey = `nna_registry_selection_test-form`;
    const storedData = JSON.parse(window.sessionStorage.getItem(storageKey) || '{}');
    storedData.timestamp = Date.now() - 1000 * 60 * 60; // 1 hour ago
    window.sessionStorage.setItem(storageKey, JSON.stringify(storedData));
    
    // Should return null for stale data
    const retrieved = SelectionStorage.retrieve('test-form', 1000 * 60 * 30); // 30 minutes
    expect(retrieved).toBeNull();
  });
  
  // Additional tests for cross-tab sync, event handling, etc.
});
```

## Technical Decisions and Rationale

1. **Using sessionStorage as Primary, localStorage as Fallback**
   - Rationale: sessionStorage provides better security for user data as it's cleared when the session ends, while localStorage provides a fallback for longer persistence if needed.

2. **Timestamp-Based Validation**
   - Rationale: Prevents stale data from being used, which is critical for taxonomy selections that may change over time.

3. **Modular Event System**
   - Rationale: Allows components to respond to storage events without tight coupling, enabling better separation of concerns.

4. **Cross-Tab Synchronization**
   - Rationale: Improves user experience when working with multiple tabs, preventing confusion from out-of-sync state.

5. **Storage Quota Management**
   - Rationale: Proactively handles quota exceeded errors by cleaning up old data, ensuring the system degrades gracefully.

## Potential Areas for Future Improvement

1. **Enhanced Conflict Resolution**
   - Add more sophisticated conflict resolution for cross-tab synchronization.
   - Implement merge strategies for complex data structures.

2. **IndexedDB Integration**
   - Add support for IndexedDB as a fallback for larger data storage needs.
   - Implement structured storage for more complex asset metadata.

3. **Progressive Enhancement**
   - Implement offline support for asset creation using Service Workers.
   - Add background synchronization for pending submissions.

4. **Analytics Integration**
   - Track storage usage patterns to optimize cleanup strategies.
   - Monitor quota errors to adjust storage strategies.

5. **Enhanced Form State Management**
   - Extend to handle complex nested form structures.
   - Add support for multi-page wizard forms with branching logic.

## Conclusion

The implemented state persistence solution provides a robust mechanism for preserving user selections during the asset registration process. By combining browser storage APIs with careful error handling, event coordination, and user feedback, the solution ensures that users can seamlessly navigate through the application without losing their work.

The implementation balances immediate needs with future extensibility, allowing for additional enhancements as requirements evolve. The comprehensive testing approach ensures that the system behaves correctly across various scenarios, including error conditions and cross-tab interactions.