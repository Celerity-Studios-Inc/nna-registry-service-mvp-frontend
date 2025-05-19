/**
 * Tests for the TaxonomyInitProvider component
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import TaxonomyInitProvider from '../TaxonomyInitProvider';
import {
  initializeTaxonomy,
  isTaxonomyInitialized,
} from '../../../services/taxonomyInitializer';

// Mock the taxonomy initializer
jest.mock('../../../services/taxonomyInitializer', () => ({
  initializeTaxonomy: jest.fn(),
  isTaxonomyInitialized: jest.fn(),
  getTaxonomyInitError: jest.fn(),
  waitForTaxonomyInit: jest.fn(),
}));

describe('TaxonomyInitProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state initially', () => {
    // Mock taxonomy not initialized
    (isTaxonomyInitialized as jest.Mock).mockReturnValue(false);
    (initializeTaxonomy as jest.Mock).mockResolvedValue(true);

    render(
      <TaxonomyInitProvider>
        <div data-testid="children">Children Content</div>
      </TaxonomyInitProvider>
    );

    // Should show loading initially
    expect(screen.getByText(/Loading taxonomy data/i)).toBeInTheDocument();
    expect(screen.queryByTestId('children')).not.toBeInTheDocument();
  });

  it('should render children when taxonomy is initialized', async () => {
    // Mock taxonomy as initialized
    (isTaxonomyInitialized as jest.Mock).mockReturnValue(true);

    render(
      <TaxonomyInitProvider>
        <div data-testid="children">Children Content</div>
      </TaxonomyInitProvider>
    );

    // Should render children immediately
    expect(
      screen.queryByText(/Loading taxonomy data/i)
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('children')).toBeInTheDocument();
  });

  it('should initialize taxonomy and show children when successful', async () => {
    // Mock taxonomy not initialized initially, but initialization succeeds
    (isTaxonomyInitialized as jest.Mock).mockReturnValue(false);
    (initializeTaxonomy as jest.Mock).mockResolvedValue(true);

    render(
      <TaxonomyInitProvider>
        <div data-testid="children">Children Content</div>
      </TaxonomyInitProvider>
    );

    // Should show loading initially
    expect(screen.getByText(/Loading taxonomy data/i)).toBeInTheDocument();

    // Should render children after initialization completes
    await waitFor(() => {
      expect(screen.getByTestId('children')).toBeInTheDocument();
    });

    // Should have called initializeTaxonomy
    expect(initializeTaxonomy).toHaveBeenCalled();
  });

  it('should show error when initialization fails', async () => {
    // Mock taxonomy initialization failure
    (isTaxonomyInitialized as jest.Mock).mockReturnValue(false);
    (initializeTaxonomy as jest.Mock).mockResolvedValue(false);
    const errorMock = new Error('Initialization failed');
    const getTaxonomyInitErrorMock = jest.fn().mockReturnValue(errorMock);
    jest.requireMock(
      '../../../services/taxonomyInitializer'
    ).getTaxonomyInitError = getTaxonomyInitErrorMock;

    render(
      <TaxonomyInitProvider>
        <div data-testid="children">Children Content</div>
      </TaxonomyInitProvider>
    );

    // Should show loading initially
    expect(screen.getByText(/Loading taxonomy data/i)).toBeInTheDocument();

    // Should show error after initialization fails
    await waitFor(() => {
      expect(
        screen.getByText(/Error Loading Taxonomy Data/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Initialization failed/i)).toBeInTheDocument();
    });

    // Should not render children
    expect(screen.queryByTestId('children')).not.toBeInTheDocument();
  });

  it('should use custom fallback when provided', () => {
    // Mock taxonomy not initialized
    (isTaxonomyInitialized as jest.Mock).mockReturnValue(false);
    (initializeTaxonomy as jest.Mock).mockResolvedValue(true);

    const customFallback = (
      <div data-testid="custom-fallback">Custom Loading...</div>
    );

    render(
      <TaxonomyInitProvider fallback={customFallback}>
        <div data-testid="children">Children Content</div>
      </TaxonomyInitProvider>
    );

    // Should show custom fallback
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(
      screen.queryByText(/Loading taxonomy data/i)
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('children')).not.toBeInTheDocument();
  });
});
