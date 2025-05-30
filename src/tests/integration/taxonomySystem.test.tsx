/**
 * Integration tests for the taxonomy system
 */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TaxonomyExample from '../../components/examples/TaxonomyExample';
import { FeedbackProvider } from '../../contexts/FeedbackContext';
import { taxonomyService } from '../../services/simpleTaxonomyService';
import {
  createMockGetCategories,
  createMockGetSubcategories,
  createMockConvertHFNtoMFA,
} from '../utils/taxonomyTestUtils';

// Mock the taxonomy service
jest.mock('../../services/simpleTaxonomyService', () => ({
  taxonomyService: {
    getCategories: jest.fn(),
    getSubcategories: jest.fn(),
    convertHFNtoMFA: jest.fn(),
  },
}));

// Mock the taxonomyErrorRecovery service
jest.mock('../../services/taxonomyErrorRecovery', () => ({
  taxonomyErrorRecovery: {
    getFallbackCategories: jest
      .fn()
      .mockReturnValue([{ code: 'BCH', name: 'Beach', numericCode: '001' }]),
    getFallbackSubcategories: jest
      .fn()
      .mockReturnValue([{ code: 'SUN', name: 'Sunset', numericCode: '001' }]),
  },
}));

describe('Taxonomy System Integration', () => {
  // Setup mock implementations before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mocks
    taxonomyService.getCategories = createMockGetCategories();
    taxonomyService.getSubcategories = createMockGetSubcategories();
    taxonomyService.convertHFNtoMFA = createMockConvertHFNtoMFA();
  });

  it('should allow selecting a layer, category, and subcategory', async () => {
    render(
      <BrowserRouter>
        <FeedbackProvider>
          <TaxonomyExample />
        </FeedbackProvider>
      </BrowserRouter>
    );

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText(/Select a Layer/i)).toBeInTheDocument();
    });

    // Select the Worlds layer
    const worldsButton = screen.getByText(/worlds/i);
    fireEvent.click(worldsButton);

    // Wait for categories to load
    await waitFor(() => {
      expect(taxonomyService.getCategories).toHaveBeenCalledWith('W');
    });

    // Select the Beach category
    const beachButton = screen.getByText(/beach/i);
    fireEvent.click(beachButton);

    // Wait for subcategories to load
    await waitFor(() => {
      expect(taxonomyService.getSubcategories).toHaveBeenCalledWith('W', 'BCH');
    });

    // Select the Sunset subcategory
    const sunsetButton = screen.getByText(/sunset/i);
    fireEvent.click(sunsetButton);

    // Verify HFN is displayed
    await waitFor(() => {
      expect(screen.getByText(/W\.BCH\.SUN\.001/i)).toBeInTheDocument();
    });

    // Verify MFA is displayed
    await waitFor(() => {
      expect(screen.getByText(/5\.001\.001\.001/i)).toBeInTheDocument();
    });
  });

  it('should handle taxonomy loading failures gracefully', async () => {
    // Mock taxonomy service to fail
    taxonomyService.getCategories = jest.fn().mockImplementation(() => {
      throw new Error('Failed to load categories');
    });

    render(
      <BrowserRouter>
        <FeedbackProvider>
          <TaxonomyExample />
        </FeedbackProvider>
      </BrowserRouter>
    );

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText(/Select a Layer/i)).toBeInTheDocument();
    });

    // Select the Worlds layer
    const worldsButton = screen.getByText(/worlds/i);
    fireEvent.click(worldsButton);

    // Should show an error message or fallback
    await waitFor(() => {
      // Either the error message or fallback data should be visible
      const errorElement = screen.queryByText(/error/i);
      const fallbackElement = screen.queryByText(/fallback/i);
      expect(errorElement || fallbackElement).toBeTruthy();
    });
  });
});
