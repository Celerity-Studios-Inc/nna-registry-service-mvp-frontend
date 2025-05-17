/**
 * Tests for the useTaxonomy hook
 */
import { renderHook, act } from '@testing-library/react-hooks';
import { useTaxonomy } from '../useTaxonomy';
import { taxonomyService } from '../../services/simpleTaxonomyService';
import { FeedbackProvider } from '../../contexts/FeedbackContext';
import React from 'react';

// Mock the taxonomy service
jest.mock('../../services/simpleTaxonomyService', () => ({
  taxonomyService: {
    getCategories: jest.fn(),
    getSubcategories: jest.fn(),
    convertHFNtoMFA: jest.fn()
  }
}));

// Mock the logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    taxonomy: jest.fn()
  },
  LogLevel: {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  },
  LogCategory: {
    GENERAL: 'GENERAL',
    TAXONOMY: 'TAXONOMY',
    UI: 'UI',
    API: 'API'
  }
}));

// Create a wrapper component that provides the required context
const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <FeedbackProvider>{children}</FeedbackProvider>
);

describe('useTaxonomy hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up default mock implementations
    (taxonomyService.getCategories as jest.Mock).mockResolvedValue([
      { code: 'CAT1', numericCode: '001', name: 'Category 1' },
      { code: 'CAT2', numericCode: '002', name: 'Category 2' }
    ]);
    
    (taxonomyService.getSubcategories as jest.Mock).mockResolvedValue([
      { code: 'SUB1', numericCode: '001', name: 'Subcategory 1' },
      { code: 'SUB2', numericCode: '002', name: 'Subcategory 2' }
    ]);
    
    (taxonomyService.convertHFNtoMFA as jest.Mock).mockImplementation(
      (hfn) => hfn.replace(/([A-Z])\.([A-Z]+)\.([A-Z]+)\.(\d+)/g, '$1.$2.$3.$4')
        .replace('W', '5')
        .replace('S', '2')
        .replace('BCH', '004')
        .replace('SUN', '003')
        .replace('POP', '004')
        .replace('HPM', '003')
    );
  });
  
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useTaxonomy({ autoLoad: false }), { wrapper: Wrapper });
    
    expect(result.current.selectedLayer).toBeNull();
    expect(result.current.selectedCategory).toBeNull();
    expect(result.current.selectedSubcategory).toBeNull();
    expect(result.current.categories).toEqual([]);
    expect(result.current.subcategories).toEqual([]);
    expect(result.current.hfn).toBe('');
    expect(result.current.mfa).toBe('');
  });
  
  it('should load categories when layer is selected', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTaxonomy(), { wrapper: Wrapper });
    
    act(() => {
      result.current.selectLayer('W');
    });
    
    // Wait for the async operations to complete
    await waitForNextUpdate();
    
    expect(taxonomyService.getCategories).toHaveBeenCalledWith('W');
    expect(result.current.categories).toHaveLength(2);
    expect(result.current.isLoadingCategories).toBe(false);
  });
  
  it('should load subcategories when category is selected', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTaxonomy(), { wrapper: Wrapper });
    
    act(() => {
      result.current.selectLayer('W');
    });
    
    await waitForNextUpdate();
    
    act(() => {
      result.current.selectCategory('CAT1');
    });
    
    await waitForNextUpdate();
    
    expect(taxonomyService.getSubcategories).toHaveBeenCalledWith('W', 'CAT1');
    expect(result.current.subcategories).toHaveLength(2);
    expect(result.current.isLoadingSubcategories).toBe(false);
  });
  
  it('should generate HFN and MFA when all selections are made', async () => {
    // Mock the convertHFNtoMFA for specific test case
    (taxonomyService.convertHFNtoMFA as jest.Mock).mockImplementation((hfn) => {
      if (hfn === 'W.BCH.SUN.001') {
        return '5.004.003.001';
      }
      return 'converted-mfa';
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useTaxonomy(), { wrapper: Wrapper });
    
    act(() => {
      result.current.selectLayer('W');
    });
    
    await waitForNextUpdate();
    
    act(() => {
      result.current.selectCategory('BCH');
    });
    
    await waitForNextUpdate();
    
    act(() => {
      result.current.selectSubcategory('SUN');
    });
    
    expect(result.current.hfn).toBe('W.BCH.SUN.001');
    expect(result.current.mfa).toBe('5.004.003.001');
  });
  
  it('should handle special case for W.BCH.SUN even if service fails', async () => {
    // Mock the service to throw an error
    (taxonomyService.convertHFNtoMFA as jest.Mock).mockImplementation(() => {
      throw new Error('Service failure');
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useTaxonomy(), { wrapper: Wrapper });
    
    act(() => {
      result.current.selectLayer('W');
    });
    
    await waitForNextUpdate();
    
    act(() => {
      result.current.selectCategory('BCH');
    });
    
    await waitForNextUpdate();
    
    act(() => {
      result.current.selectSubcategory('SUN');
    });
    
    expect(result.current.hfn).toBe('W.BCH.SUN.001');
    expect(result.current.mfa).toBe('5.004.003.001');
  });
  
  it('should reset all selections', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTaxonomy(), { wrapper: Wrapper });
    
    act(() => {
      result.current.selectLayer('W');
    });
    
    await waitForNextUpdate();
    
    act(() => {
      result.current.selectCategory('BCH');
    });
    
    await waitForNextUpdate();
    
    act(() => {
      result.current.selectSubcategory('SUN');
    });
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.selectedLayer).toBeNull();
    expect(result.current.selectedCategory).toBeNull();
    expect(result.current.selectedSubcategory).toBeNull();
    expect(result.current.hfn).toBe('');
    expect(result.current.mfa).toBe('');
  });
  
  it('should provide fallback data when categories fail to load', async () => {
    // Mock the service to throw an error
    (taxonomyService.getCategories as jest.Mock).mockImplementation(() => {
      throw new Error('Failed to load categories');
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useTaxonomy(), { wrapper: Wrapper });
    
    act(() => {
      result.current.selectLayer('W');
    });
    
    await waitForNextUpdate();
    
    // Should still have fallback categories for layer W
    expect(result.current.categories.length).toBeGreaterThan(0);
    expect(result.current.categoryError).not.toBeNull();
  });
  
  it('should provide fallback data when subcategories fail to load', async () => {
    // Mock successful categories but failed subcategories
    (taxonomyService.getCategories as jest.Mock).mockResolvedValue([
      { code: 'BCH', numericCode: '004', name: 'Beach' }
    ]);
    
    (taxonomyService.getSubcategories as jest.Mock).mockImplementation(() => {
      throw new Error('Failed to load subcategories');
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useTaxonomy(), { wrapper: Wrapper });
    
    act(() => {
      result.current.selectLayer('W');
    });
    
    await waitForNextUpdate();
    
    act(() => {
      result.current.selectCategory('BCH');
    });
    
    await waitForNextUpdate();
    
    // Should still have fallback subcategories for W.BCH
    expect(result.current.subcategories.length).toBeGreaterThan(0);
    expect(result.current.subcategoryError).not.toBeNull();
  });
});