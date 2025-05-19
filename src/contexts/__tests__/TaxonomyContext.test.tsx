import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { TaxonomyProvider, useTaxonomyContext } from '../TaxonomyContext';
import { useTaxonomy } from '../../hooks/useTaxonomy';

// Mock useTaxonomy hook
jest.mock('../../hooks/useTaxonomy', () => ({
  useTaxonomy: jest.fn(),
}));

// Mock logger to prevent console output
jest.mock('../../utils/logger', () => ({
  logger: {
    taxonomy: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  },
  LogLevel: {
    INFO: 'INFO',
    ERROR: 'ERROR',
    DEBUG: 'DEBUG',
    WARN: 'WARN',
  },
}));

describe('TaxonomyContext', () => {
  const mockTaxonomyHook = {
    layers: ['S', 'W'],
    selectedLayer: 'W',
    selectLayer: jest.fn(),

    categories: [{ code: 'BCH', name: 'Beach', numericCode: '004' }],
    isLoadingCategories: false,
    categoryError: null,
    selectedCategory: 'BCH',
    selectCategory: jest.fn(),
    reloadCategories: jest.fn(),

    subcategories: [{ code: 'SUN', name: 'Sunset', numericCode: '003' }],
    isLoadingSubcategories: false,
    subcategoryError: null,
    selectedSubcategory: 'SUN',
    selectSubcategory: jest.fn(),
    reloadSubcategories: jest.fn(),

    hfn: 'W.BCH.SUN.001',
    mfa: '5.004.003.001',
    updateSequential: jest.fn(),
    updateFileType: jest.fn(),
    reset: jest.fn(),
    validateSelections: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTaxonomy as jest.Mock).mockReturnValue(mockTaxonomyHook);
  });

  it('provides taxonomy context to children', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TaxonomyProvider>{children}</TaxonomyProvider>
    );

    const { result } = renderHook(() => useTaxonomyContext(), { wrapper });

    expect(result.current).toEqual(mockTaxonomyHook);
    expect(useTaxonomy).toHaveBeenCalledWith({
      autoLoad: true,
      showFeedback: true,
    });
  });

  it('handles custom options', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TaxonomyProvider options={{ autoLoad: false, showFeedback: false }}>
        {children}
      </TaxonomyProvider>
    );

    const { result } = renderHook(() => useTaxonomyContext(), { wrapper });

    expect(result.current).toEqual(mockTaxonomyHook);
    expect(useTaxonomy).toHaveBeenCalledWith({
      autoLoad: false,
      showFeedback: false,
    });
  });

  it('throws an error when used outside of provider', () => {
    // Testing that it throws without a wrapper
    const { result } = renderHook(() => useTaxonomyContext());

    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toContain(
      'useTaxonomyContext must be used within a TaxonomyProvider'
    );
  });
});
