// Mock helpers for testing with TaxonomyContext

import React from 'react';
import { TaxonomyContext } from '../../contexts/TaxonomyContext';

/**
 * Creates a mock TaxonomyContext with customizable values
 */
export const createMockTaxonomyContext = (overrides = {}) => {
  const defaultMock = {
    // Layer data
    layers: ['S', 'W', 'L', 'M', 'G', 'B', 'P', 'T', 'C', 'R'],
    selectedLayer: null,
    selectLayer: jest.fn(),

    // Category data
    categories: [
      { code: 'CAT1', numericCode: '001', name: 'Category 1' },
      { code: 'CAT2', numericCode: '002', name: 'Category 2' },
    ],
    isLoadingCategories: false,
    categoryError: null,
    selectedCategory: null,
    selectCategory: jest.fn(),
    reloadCategories: jest.fn(),

    // Subcategory data
    subcategories: [
      { code: 'SUB1', numericCode: '001', name: 'Subcategory 1' },
      { code: 'SUB2', numericCode: '002', name: 'Subcategory 2' },
    ],
    isLoadingSubcategories: false,
    subcategoryError: null,
    selectedSubcategory: null,
    selectSubcategory: jest.fn(),
    reloadSubcategories: jest.fn(),

    // HFN/MFA conversion
    hfn: '',
    mfa: '',
    updateSequential: jest.fn(),
    updateFileType: jest.fn(),

    // Reset
    reset: jest.fn(),
    resetCategoryData: jest.fn(),

    // Validation
    validateSelections: jest.fn(),
  };

  return {
    ...defaultMock,
    ...overrides,
  };
};

/**
 * A wrapper component that provides the mock taxonomy context
 */
export const MockTaxonomyProvider: React.FC<{
  children: React.ReactNode;
  value?: any;
}> = ({ children, value }) => {
  const mockContext = createMockTaxonomyContext(value);

  return (
    <TaxonomyContext.Provider value={mockContext}>
      {children}
    </TaxonomyContext.Provider>
  );
};
