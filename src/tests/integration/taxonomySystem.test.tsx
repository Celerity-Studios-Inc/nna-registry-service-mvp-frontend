/**
 * Integration tests for the taxonomy system
 */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TaxonomyExample from '../../components/examples/TaxonomyExample';
import { FeedbackProvider } from '../../contexts/FeedbackContext';
import {
  SPECIAL_HFN_MFA_TEST_CASES,
  executeAllHfnMfaTests
} from '../utils/taxonomyTestUtils';

// Mock the direct imports from taxonomyService to avoid mocking the entire service
jest.mock('../../hooks/useTaxonomy', () => {
  // Import the real module
  const originalModule = jest.requireActual('../../hooks/useTaxonomy');
  
  // Only override specific methods for testing
  return {
    ...originalModule,
    // Preserve the original implementation
  };
});

// Wrapper component for providing necessary context
const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <FeedbackProvider>
      {children}
    </FeedbackProvider>
  </BrowserRouter>
);

describe('Taxonomy System Integration Tests', () => {
  it('should pass special case tests', () => {
    // Run all HFN to MFA tests
    const results = executeAllHfnMfaTests();
    
    // Check special cases
    for (const testCase of SPECIAL_HFN_MFA_TEST_CASES) {
      expect(results.specialCases[testCase.hfn]).toBe(true);
    }
    
    // Check overall results
    expect(results.totalFailed).toBe(0);
    expect(results.totalPassed).toBeGreaterThan(0);
  });
  
  it('should render the TaxonomyExample component', async () => {
    render(<TaxonomyExample />, { wrapper: Wrapper });
    
    // Component should render
    expect(screen.getByText('Taxonomy Selection Example')).toBeInTheDocument();
    expect(screen.getByText('Layer Selection')).toBeInTheDocument();
    
    // Layer buttons should be present
    expect(screen.getByText('W')).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();
    
    // Select a layer
    fireEvent.click(screen.getByText('W'));
    
    // Categories should load
    await waitFor(() => {
      expect(screen.getByText('Categories for W')).toBeInTheDocument();
    });
    
    // Wait for categories to be displayed
    await waitFor(() => {
      const categoryElements = screen.getAllByRole('button');
      expect(categoryElements.length).toBeGreaterThan(2); // At least layer buttons + some categories
    });
    
    // Select the first category button that's not a layer button
    const categoryButtons = screen.getAllByRole('button').filter(
      button => !['G', 'S', 'L', 'M', 'W', 'B', 'P', 'T', 'C', 'R'].includes(button.textContent || '')
    );
    
    if (categoryButtons.length > 0) {
      fireEvent.click(categoryButtons[0]);
      
      // Subcategories should load
      await waitFor(() => {
        expect(screen.getByText(/Subcategories for W/)).toBeInTheDocument();
      });
      
      // Wait for subcategories to be displayed
      await waitFor(() => {
        const allButtons = screen.getAllByRole('button');
        // Should have more buttons now (layers + categories + subcategories + reset)
        expect(allButtons.length).toBeGreaterThan(categoryButtons.length + 2);
      });
      
      // Should have a reset button
      const resetButton = screen.getByText('Reset');
      expect(resetButton).toBeInTheDocument();
      
      // Reset should clear selections
      fireEvent.click(resetButton);
      
      // After reset, subcategories should not be displayed
      await waitFor(() => {
        expect(screen.queryByText(/Subcategories for/)).not.toBeInTheDocument();
      });
    }
  });
});