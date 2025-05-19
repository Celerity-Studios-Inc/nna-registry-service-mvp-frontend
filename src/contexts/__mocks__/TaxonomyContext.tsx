import React from 'react';

// Create a mock version of the taxonomy context
const mockTaxonomyContext = {
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

// Create the context with the mock data
export const TaxonomyContext = React.createContext(mockTaxonomyContext);

// Custom hook to use the taxonomy context
export const useTaxonomyContext = jest.fn(
  (_options = {}) => mockTaxonomyContext
);

// Mock provider component
export const TaxonomyProvider: React.FC<{
  children: React.ReactNode;
  options?: {
    autoLoad?: boolean;
    showFeedback?: boolean;
  };
}> = ({ children }) => {
  return (
    <TaxonomyContext.Provider value={mockTaxonomyContext}>
      {children}
    </TaxonomyContext.Provider>
  );
};

// Helper function to log taxonomy state (for debugging)
export const logTaxonomyState = jest.fn();
