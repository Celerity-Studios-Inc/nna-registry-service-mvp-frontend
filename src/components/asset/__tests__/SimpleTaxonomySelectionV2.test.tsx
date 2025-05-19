import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SimpleTaxonomySelectionV2 from '../SimpleTaxonomySelectionV2';
import { TaxonomyProvider } from '../../../contexts/TaxonomyContext';

// Mock the TaxonomyContext
jest.mock('../../../contexts/TaxonomyContext');

// Mock the logger
jest.mock('../../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('SimpleTaxonomySelectionV2', () => {
  const onCategorySelect = jest.fn();
  const onSubcategorySelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders categories correctly', () => {
    render(
      <TaxonomyProvider>
        <SimpleTaxonomySelectionV2
          layer="W"
          onCategorySelect={onCategorySelect}
          onSubcategorySelect={onSubcategorySelect}
        />
      </TaxonomyProvider>
    );

    expect(screen.getByText('Category 1')).toBeInTheDocument();
    expect(screen.getByText('Category 2')).toBeInTheDocument();
    expect(screen.getByTestId('category-CAT1')).toBeInTheDocument();
    expect(screen.getByTestId('category-CAT2')).toBeInTheDocument();
  });

  it('calls onCategorySelect when a category is clicked', () => {
    render(
      <TaxonomyProvider>
        <SimpleTaxonomySelectionV2
          layer="W"
          onCategorySelect={onCategorySelect}
          onSubcategorySelect={onSubcategorySelect}
        />
      </TaxonomyProvider>
    );

    fireEvent.click(screen.getByTestId('category-CAT1'));

    expect(onCategorySelect).toHaveBeenCalledWith('CAT1');
  });

  it('renders subcategories when a category is selected', () => {
    render(
      <TaxonomyProvider>
        <SimpleTaxonomySelectionV2
          layer="W"
          onCategorySelect={onCategorySelect}
          onSubcategorySelect={onSubcategorySelect}
          selectedCategory="CAT1"
        />
      </TaxonomyProvider>
    );

    expect(screen.getByText('Select Subcategory')).toBeInTheDocument();
    expect(screen.getByText('Subcategory 1')).toBeInTheDocument();
    expect(screen.getByText('Subcategory 2')).toBeInTheDocument();
    expect(screen.getByTestId('subcategory-SUB1')).toBeInTheDocument();
    expect(screen.getByTestId('subcategory-SUB2')).toBeInTheDocument();
  });

  it('calls onSubcategorySelect when a subcategory is clicked', () => {
    render(
      <TaxonomyProvider>
        <SimpleTaxonomySelectionV2
          layer="W"
          onCategorySelect={onCategorySelect}
          onSubcategorySelect={onSubcategorySelect}
          selectedCategory="CAT1"
        />
      </TaxonomyProvider>
    );

    fireEvent.click(screen.getByTestId('subcategory-SUB1'));

    expect(onSubcategorySelect).toHaveBeenCalledWith('SUB1');
  });

  it('shows selection summary when both category and subcategory are selected', () => {
    render(
      <TaxonomyProvider>
        <SimpleTaxonomySelectionV2
          layer="W"
          onCategorySelect={onCategorySelect}
          onSubcategorySelect={onSubcategorySelect}
          selectedCategory="CAT1"
          selectedSubcategory="SUB1"
        />
      </TaxonomyProvider>
    );

    expect(screen.getByText(/Selected:/)).toBeInTheDocument();
    expect(screen.getByText(/W.CAT1.SUB1/)).toBeInTheDocument();
  });
});
