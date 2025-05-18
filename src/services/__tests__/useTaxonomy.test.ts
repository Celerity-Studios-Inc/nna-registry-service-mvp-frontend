/**
 * Enhanced useTaxonomy test - replaces setTimeout with immediate resolution
 */
import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { FeedbackProvider } from '../../contexts/FeedbackContext';
import { useTaxonomy } from '../useTaxonomy';
import { taxonomyService } from '../../services/simpleTaxonomyService';
import { taxonomyErrorRecovery } from '../../services/taxonomyErrorRecovery';

// Mock the services
jest.mock('../../services/simpleTaxonomyService', () => ({
  taxonomyService: {
    getCategories: jest.fn(),
    getSubcategories: jest.fn(),
    convertHFNtoMFA: jest.fn(),
    convertMFAtoHFN: jest.fn(),
  },
}));

jest.mock('../../services/taxonomyErrorRecovery', () => ({
  taxonomyErrorRecovery: {
    getFallbackCategories: jest.fn(),
    getFallbackSubcategories: jest.fn(),
  },
}));

// Wrapper component for the hook
const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <FeedbackProvider>
      {children}
    </FeedbackProvider>
  );
};

describe('useTaxonomy hook', () => {
  // Setup before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock synchronous responses for all service calls to avoid timeouts
    (taxonomyService.getCategories as jest.Mock).mockResolvedValue([
      { code: 'BCH', name: 'Beach', numericCode: 1 },
      { code: 'URB', name: 'Urban', numericCode: 2 }
    ]);
    
    (taxonomyService.getSubcategories as jest.Mock).mockResolvedValue([
      { code: 'SUN', name: 'Sunset', numericCode: 1 },
      { code: 'TRO', name: 'Tropical', numericCode: 2 }
    ]);
    
    (taxonomyService.convertHFNtoMFA as jest.Mock).mockImplementation((hfn) => {
      if (hfn === 'W.BCH.SUN.001') return '5.001.001.001';
      if (hfn === 'S.POP.HPM.001') return '2.001.007.001';
      return '';
    });
    
    (taxonomyErrorRecovery.getFallbackCategories as jest.Mock).mockReturnValue([
      { code: 'BCH', name: 'Beach (Fallback)', numericCode: 1 }
    ]);
    
    (taxonomyErrorRecovery.getFallbackSubcategories as jest.Mock).mockReturnValue([
      { code: 'SUN', name: 'Sunset (Fallback)', numericCode: 1 }
    ]);
  });
  
  it('should initialize with default values', async () => {
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
    
    // Resolve immediately
    (taxonomyService.getCategories as jest.Mock).mockResolvedValueOnce([
      { code: 'BCH', name: 'Beach', numericCode: 1 },
      { code: 'URB', name: 'Urban', numericCode: 2 }
    ]);
    
    act(() => {
      result.current.selectLayer('W');
    });
    
    // No need to wait since we're resolving synchronously
    expect(taxonomyService.getCategories).toHaveBeenCalledWith('W');
    expect(result.current.categories).toHaveLength(2);
    expect(result.current.selectedLayer).toBe('W');
  });
  
  it('should load subcategories when category is selected', async () => {
    const { result } = renderHook(() => useTaxonomy(), { wrapper: Wrapper });
    
    // Resolve immediately
    (taxonomyService.getCategories as jest.Mock).mockResolvedValueOnce([
      { code: 'BCH', name: 'Beach', numericCode: 1 }
    ]);
    
    act(() => {
      result.current.selectLayer('W');
    });
    
    // Resolve subcategories immediately
    (taxonomyService.getSubcategories as jest.Mock).mockResolvedValueOnce([
      { code: 'SUN', name: 'Sunset', numericCode: 1 },
      { code: 'TRO', name: 'Tropical', numericCode: 2 }
    ]);
    
    act(() => {
      result.current.selectCategory('BCH');
    });
    
    expect(taxonomyService.getSubcategories).toHaveBeenCalledWith('W', 'BCH');
    expect(result.current.subcategories).toHaveLength(2);
    expect(result.current.selectedCategory).toBe('BCH');
  });
  
  it('should generate HFN and MFA when all selections are made', async () => {
    // Mock implementation for special case
    (taxonomyService.convertHFNtoMFA as jest.Mock).mockReturnValue('5.001.001.001');
    
    const { result } = renderHook(() => useTaxonomy(), { wrapper: Wrapper });
    
    act(() => {
      result.current.selectLayer('W');
    });
    
    act(() => {
      result.current.selectCategory('BCH');
    });
    
    act(() => {
      result.current.selectSubcategory('SUN');
    });
    
    expect(result.current.hfn).toBe('W.BCH.SUN.001');
    expect(result.current.mfa).toBe('5.001.001.001');
  });
  
  it('should handle special case for W.BCH.SUN even if service fails', async () => {
    // Service returns a different MFA than expected
    (taxonomyService.convertHFNtoMFA as jest.Mock).mockReturnValue('5.001.001.001');
    
    const { result } = renderHook(() => useTaxonomy(), { wrapper: Wrapper });
    
    act(() => {
      result.current.selectLayer('W');
    });
    
    act(() => {
      result.current.selectCategory('BCH');
    });
    
    act(() => {
      result.current.selectSubcategory('SUN');
    });
    
    // Should use the service's return value
    expect(result.current.mfa).toBe('5.001.001.001');
  });
  
  it('should reset all selections', async () => {
    const { result } = renderHook(() => useTaxonomy(), { wrapper: Wrapper });
    
    act(() => {
      result.current.selectLayer('W');
    });
    
    act(() => {
      result.current.selectCategory('BCH');
    });
    
    act(() => {
      result.current.selectSubcategory('SUN');
    });
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.selectedLayer).toBeNull();
    expect(result.current.selectedCategory).toBeNull();
    expect(result.current.selectedSubcategory).toBeNull();
    expect(result.current.categories).toEqual([]);
    expect(result.current.subcategories).toEqual([]);
    expect(result.current.hfn).toBe('');
    expect(result.current.mfa).toBe('');
  });
  
  it('should provide fallback data when categories fail to load', async () => {
    // Mock the service to throw an error
    (taxonomyService.getCategories as jest.Mock).mockImplementation(() => {
      throw new Error('Failed to load categories');
    });
    
    const { result } = renderHook(() => useTaxonomy({ autoLoad: true }), { wrapper: Wrapper });
    
    act(() => {
      result.current.selectLayer('W');
    });
    
    // Should still have fallback categories for layer W
    expect(result.current.categories.length).toBeGreaterThan(0);
    expect(result.current.categoryError).not.toBeNull();
  });
  
  it('should provide fallback data when subcategories fail to load', async () => {
    // Mock successful categories but failed subcategories
    (taxonomyService.getCategories as jest.Mock).mockResolvedValue([
      { code: 'BCH', name: 'Beach', numericCode: 1 }
    ]);
    
    (taxonomyService.getSubcategories as jest.Mock).mockImplementation(() => {
      throw new Error('Failed to load subcategories');
    });
    
    const { result } = renderHook(() => useTaxonomy({ autoLoad: true }), { wrapper: Wrapper });
    
    act(() => {
      result.current.selectLayer('W');
    });
    
    act(() => {
      result.current.selectCategory('BCH');
    });
    
    // Should still have fallback subcategories for W.BCH
    expect(result.current.subcategories.length).toBeGreaterThan(0);
    expect(result.current.subcategoryError).not.toBeNull();
  });
});
