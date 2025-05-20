import { useState, useEffect, useCallback, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { debugLog } from '../utils/logger';

/**
 * Custom hook to synchronize form state with UI state
 * This solves the problem of React's batched state updates by providing
 * a separate UI state that can be updated immediately for visual feedback
 * while ensuring the underlying form state is properly updated.
 * 
 * @param formMethods React Hook Form methods
 * @param defaultValues Default UI state values
 * @returns An object with UI state and functions to update both UI and form state
 */
export function useFormUISync<T extends Record<string, any>>(
  formMethods: UseFormReturn<any>,
  defaultValues: T
) {
  const { watch, setValue, getValues } = formMethods;
  const [uiState, setUIState] = useState<T>(defaultValues);
  const isSyncingRef = useRef(false);
  
  // Track form updates to update UI state
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      // Prevent infinite loop when we're updating the form from syncUpdate
      if (isSyncingRef.current) return;
      
      if (name && value[name] !== undefined) {
        debugLog(`[FormUISync] Form field "${name}" changed to: ${value[name]} (${type})`);
        
        setUIState(prev => ({
          ...prev,
          [name]: value[name]
        }));
      }
    });
    
    // Load initial values from form
    const currentValues = getValues();
    const initialState = { ...defaultValues };
    
    Object.keys(defaultValues).forEach(key => {
      const typedKey = key as keyof T;
      if (currentValues[key] !== undefined) {
        initialState[typedKey] = currentValues[key];
      }
    });
    
    setUIState(initialState);
    
    return () => subscription.unsubscribe();
  }, [watch, getValues, defaultValues]);
  
  /**
   * Update both UI state and form state
   * @param field Field name to update
   * @param value New value
   * @param options Additional options for setValue
   */
  const syncUpdate = useCallback((
    field: keyof T, 
    value: any, 
    options?: { 
      shouldValidate?: boolean, 
      shouldDirty?: boolean,
      delayed?: boolean 
    }
  ) => {
    // Update UI state immediately for responsive feedback
    setUIState(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Schedule form update
    const updateForm = () => {
      isSyncingRef.current = true;
      
      try {
        setValue(field as string, value, {
          shouldValidate: options?.shouldValidate ?? true,
          shouldDirty: options?.shouldDirty ?? true
        });
        
        debugLog(`[FormUISync] Updated form field "${String(field)}" to: ${value}`);
      } finally {
        // Always reset the flag, even if there's an error
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 0);
      }
    };
    
    if (options?.delayed) {
      setTimeout(updateForm, 10);
    } else {
      updateForm();
    }
  }, [setValue]);
  
  /**
   * Updates multiple fields at once
   * @param updates Object containing field/value pairs to update
   * @param options Additional options for setValue
   */
  const syncUpdateMultiple = useCallback((
    updates: Partial<T>,
    options?: { 
      shouldValidate?: boolean, 
      shouldDirty?: boolean,
      delayed?: boolean 
    }
  ) => {
    // Update UI state immediately
    setUIState(prev => ({
      ...prev,
      ...updates
    }));
    
    // Schedule form updates
    const updateForm = () => {
      isSyncingRef.current = true;
      
      try {
        Object.entries(updates).forEach(([field, value]) => {
          setValue(field, value, {
            shouldValidate: options?.shouldValidate ?? true,
            shouldDirty: options?.shouldDirty ?? true
          });
        });
        
        debugLog(`[FormUISync] Updated multiple form fields:`, updates);
      } finally {
        // Always reset the flag, even if there's an error
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 0);
      }
    };
    
    if (options?.delayed) {
      setTimeout(updateForm, 10);
    } else {
      updateForm();
    }
  }, [setValue]);
  
  /**
   * Force refresh UI state from form values
   */
  const refreshFromForm = useCallback(() => {
    const currentValues = getValues();
    const updatedState = { ...uiState };
    let changed = false;
    
    Object.keys(uiState).forEach(key => {
      const typedKey = key as keyof T;
      if (currentValues[key] !== undefined && currentValues[key] !== uiState[typedKey]) {
        updatedState[typedKey] = currentValues[key];
        changed = true;
      }
    });
    
    if (changed) {
      debugLog('[FormUISync] Refreshed UI state from form values');
      setUIState(updatedState);
    }
  }, [getValues, uiState]);
  
  return { 
    uiState, 
    setUIState,
    syncUpdate,
    syncUpdateMultiple,
    refreshFromForm
  };
}