import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaxonomyErrorBoundary from '../TaxonomyErrorBoundary';

// Mock logger to prevent console output during tests
jest.mock('../../../utils/logger', () => ({
  logger: {
    taxonomy: jest.fn(),
    general: jest.fn(),
  },
  LogLevel: {
    ERROR: 'error',
    INFO: 'info',
  },
}));

// Component that throws an error for testing
const ErrorThrower: React.FC<{ shouldThrow: boolean; message?: string }> = ({ 
  shouldThrow, 
  message = 'Test taxonomy error' 
}) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>Taxonomy component working correctly</div>;
};

describe('TaxonomyErrorBoundary', () => {
  beforeEach(() => {
    // Suppress React's error boundary console error messages
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders children when no error occurs', () => {
    render(
      <TaxonomyErrorBoundary>
        <div>Working taxonomy component</div>
      </TaxonomyErrorBoundary>
    );

    expect(screen.getByText('Working taxonomy component')).toBeInTheDocument();
  });

  test('renders custom fallback UI when an error occurs', () => {
    render(
      <TaxonomyErrorBoundary>
        <ErrorThrower shouldThrow={true} />
      </TaxonomyErrorBoundary>
    );

    expect(screen.getByText(/Taxonomy Selection Error/i)).toBeInTheDocument();
    expect(screen.getByText(/There was a problem with the taxonomy selection system/i)).toBeInTheDocument();
    expect(screen.getByText(/Test taxonomy error/i)).toBeInTheDocument();
  });

  test('calls onReset when reset button is clicked', async () => {
    const onReset = jest.fn();

    render(
      <TaxonomyErrorBoundary onReset={onReset}>
        <ErrorThrower shouldThrow={true} />
      </TaxonomyErrorBoundary>
    );

    const resetButton = screen.getByText(/Reset and Try Again/i);
    await userEvent.click(resetButton);

    expect(onReset).toHaveBeenCalled();
  });

  test('calls attemptReload when reload button is clicked', async () => {
    const attemptReload = jest.fn();

    render(
      <TaxonomyErrorBoundary attemptReload={attemptReload}>
        <ErrorThrower shouldThrow={true} />
      </TaxonomyErrorBoundary>
    );

    const reloadButton = screen.getByText(/Reload Taxonomy Data/i);
    await userEvent.click(reloadButton);

    expect(attemptReload).toHaveBeenCalled();
  });

  test('does not display reload button when attemptReload is not provided', () => {
    render(
      <TaxonomyErrorBoundary>
        <ErrorThrower shouldThrow={true} />
      </TaxonomyErrorBoundary>
    );

    expect(screen.queryByText(/Reload Taxonomy Data/i)).not.toBeInTheDocument();
  });

  test('resets error state and renders children after successful recovery', async () => {
    const TestComponent = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true);
      
      const handleReset = () => {
        setShouldThrow(false);
      };
      
      return (
        <TaxonomyErrorBoundary onReset={handleReset}>
          <ErrorThrower shouldThrow={shouldThrow} />
        </TaxonomyErrorBoundary>
      );
    };
    
    render(<TestComponent />);
    
    // First, verify error boundary shows error UI
    expect(screen.getByText(/Taxonomy Selection Error/i)).toBeInTheDocument();
    
    // Click reset button to trigger error boundary reset and component fix
    const resetButton = screen.getByText(/Reset and Try Again/i);
    await userEvent.click(resetButton);
    
    // Now the component should render without error
    expect(screen.getByText('Taxonomy component working correctly')).toBeInTheDocument();
  });
});