import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { useForm, FormProvider } from 'react-hook-form';
import { useFormUISync } from '../useFormUISync';

// Mock debugLog to prevent console output during tests
jest.mock('../../utils/logger', () => ({
  debugLog: jest.fn(),
}));

// Test component that uses the hooks
const TestComponent: React.FC = () => {
  const methods = useForm({
    defaultValues: {
      testField: 'default value',
      anotherField: 'another default'
    }
  });
  
  const { uiState, syncUpdate } = useFormUISync(methods, {
    testField: '',
    anotherField: ''
  });
  
  return (
    <FormProvider {...methods}>
      <div>
        <div data-testid="ui-state-test">{uiState.testField}</div>
        <div data-testid="ui-state-another">{uiState.anotherField}</div>
        <button 
          onClick={() => syncUpdate('testField', 'updated value')}
          data-testid="update-button"
        >
          Update
        </button>
      </div>
    </FormProvider>
  );
};

// Test wrapper for the renderHook function
const FormWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const methods = useForm({
    defaultValues: {
      testField: 'default value',
      anotherField: 'another default'
    }
  });
  
  return (
    <FormProvider {...methods}>
      {children}
    </FormProvider>
  );
};

describe('useFormUISync', () => {
  test('initializes UI state from form values', () => {
    render(<TestComponent />);
    
    expect(screen.getByTestId('ui-state-test').textContent).toBe('default value');
    expect(screen.getByTestId('ui-state-another').textContent).toBe('another default');
  });
  
  test('updates UI state and form state with syncUpdate', () => {
    const { result } = renderHook(
      () => {
        const methods = useForm({
          defaultValues: {
            testField: 'initial',
          }
        });
        
        const hookResult = useFormUISync(methods, { 
          testField: 'initial'
        });
        
        return {
          ...hookResult,
          getValues: methods.getValues,
        };
      }
    );
    
    // Initial values
    expect(result.current.uiState.testField).toBe('initial');
    expect(result.current.getValues('testField')).toBe('initial');
    
    // Update values
    act(() => {
      result.current.syncUpdate('testField', 'updated');
    });
    
    // Check both UI and form state updated
    expect(result.current.uiState.testField).toBe('updated');
    expect(result.current.getValues('testField')).toBe('updated');
  });
  
  test('updates multiple fields with syncUpdateMultiple', () => {
    const { result } = renderHook(
      () => {
        const methods = useForm({
          defaultValues: {
            field1: 'value1',
            field2: 'value2',
          }
        });
        
        const hookResult = useFormUISync(methods, { 
          field1: 'value1',
          field2: 'value2',
        });
        
        return {
          ...hookResult,
          getValues: methods.getValues,
        };
      }
    );
    
    // Update multiple fields
    act(() => {
      result.current.syncUpdateMultiple({
        field1: 'new1',
        field2: 'new2',
      });
    });
    
    // Check both UI and form state
    expect(result.current.uiState.field1).toBe('new1');
    expect(result.current.uiState.field2).toBe('new2');
    expect(result.current.getValues('field1')).toBe('new1');
    expect(result.current.getValues('field2')).toBe('new2');
  });
  
  test('refreshes UI state from form values', () => {
    const { result } = renderHook(
      () => {
        const methods = useForm({
          defaultValues: {
            fieldToRefresh: 'original',
          }
        });
        
        const hookResult = useFormUISync(methods, { 
          fieldToRefresh: 'original'
        });
        
        return {
          ...hookResult,
          setValue: methods.setValue,
          getValues: methods.getValues,
        };
      }
    );
    
    // Directly update form value (not through syncUpdate)
    act(() => {
      result.current.setValue('fieldToRefresh', 'changed direct');
    });
    
    // UI state hasn't updated yet
    expect(result.current.uiState.fieldToRefresh).toBe('original');
    
    // Refresh from form
    act(() => {
      result.current.refreshFromForm();
    });
    
    // UI state should now match form state
    expect(result.current.uiState.fieldToRefresh).toBe('changed direct');
  });
});