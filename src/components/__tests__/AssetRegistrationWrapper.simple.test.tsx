import React from 'react';
import { render, screen } from '@testing-library/react';
import AssetRegistrationWrapper from '../AssetRegistrationWrapper';

// Mock the necessary dependencies
jest.mock('../../hooks/useTaxonomy', () => ({
  useTaxonomy: () => ({
    autoLoad: false,
    showFeedback: false
  })
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    taxonomy: jest.fn(),
    LogLevel: {
      INFO: 'INFO',
      WARN: 'WARN',
      ERROR: 'ERROR'
    }
  }
}));

jest.mock('../../contexts/FeedbackContext', () => ({
  useFeedback: () => ({
    addFeedback: jest.fn()
  })
}));

jest.mock('../../pages/RegisterAssetPage', () => {
  return function MockRegisterAssetPage() {
    return <div data-testid="register-asset-page">Register Asset Page</div>;
  };
});

jest.mock('../../services/simpleTaxonomyService', () => ({
  taxonomyService: {
    getCategories: jest.fn().mockReturnValue([{ code: 'CAT1', name: 'Category 1', numericCode: '001' }]),
    getSubcategories: jest.fn().mockReturnValue([{ code: 'SUB1', name: 'Subcat 1', numericCode: '001' }]),
    convertHFNtoMFA: jest.fn().mockReturnValue('5.004.003.001')
  }
}));

// Simple test suite
describe('AssetRegistrationWrapper', () => {
  it('renders component with successful taxonomy loading', () => {
    // Mock useState to always return isLoaded: true and hasError: false
    jest.spyOn(React, 'useState')
      .mockImplementationOnce(() => [true, jest.fn()]) // isLoaded
      .mockImplementationOnce(() => [false, jest.fn()]) // hasError
      .mockImplementationOnce(() => [{ message: '' }, jest.fn()]); // errorDetails

    render(<AssetRegistrationWrapper />);
    
    // When loaded, it should render the RegisterAssetPage
    expect(screen.getByTestId('register-asset-page')).toBeInTheDocument();
  });
});