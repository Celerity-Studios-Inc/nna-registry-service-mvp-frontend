import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from '../ErrorBoundary';

// Mock logger to prevent console output during tests
jest.mock('../../../utils/logger', () => ({
  logger: {
    general: jest.fn(),
  },
  LogLevel: {
    ERROR: 'error',
  },
}));

// Component that throws an error when the shouldThrow prop is true
const ErrorThrower: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress React's error boundary console error messages
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  test('renders fallback UI when an error occurs', () => {
    render(
      <ErrorBoundary>
        <ErrorThrower shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  });

  test('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error UI</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ErrorThrower shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
  });

  test('calls onError when an error occurs', () => {
    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ErrorThrower shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
  });

  test('supports reset functionality', async () => {
    const TestComponent = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true);

      return (
        <div>
          <button onClick={() => setShouldThrow(false)}>Fix error</button>
          <ErrorBoundary>
            {shouldThrow ? (
              <ErrorThrower shouldThrow={true} />
            ) : (
              <div>Error fixed</div>
            )}
          </ErrorBoundary>
        </div>
      );
    };

    render(<TestComponent />);

    // Initially shows the error UI
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    
    // Click the "Try to Recover" button
    const tryRecoverButton = screen.getByText('Try to Recover');
    await userEvent.click(tryRecoverButton);
    
    // Should still show error because component is still throwing
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    
    // Now fix the component
    const fixButton = screen.getByText('Fix error');
    await userEvent.click(fixButton);
    
    // Click try recover again
    await userEvent.click(screen.getByText('Try to Recover'));
    
    // Now should show fixed content
    expect(screen.getByText('Error fixed')).toBeInTheDocument();
  });

  test('supports function fallback that receives error and reset function', () => {
    const functionFallback = (error: Error, resetError: () => void) => (
      <div>
        <div>Custom error: {error.message}</div>
        <button onClick={resetError}>Reset from function fallback</button>
      </div>
    );

    render(
      <ErrorBoundary fallback={functionFallback}>
        <ErrorThrower shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error: Test error')).toBeInTheDocument();
    expect(screen.getByText('Reset from function fallback')).toBeInTheDocument();
  });
});