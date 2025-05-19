/**
 * ErrorBoundary Component
 *
 * A React error boundary that catches errors in its child component tree
 * and displays a fallback UI instead of crashing the application.
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import '../../styles/ErrorBoundary.css';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Otherwise, use the default fallback UI
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p className="error-message">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <div className="error-details">
            <p>Technical details:</p>
            <pre>{this.state.error?.stack}</pre>
          </div>
          <button onClick={this.handleReset} className="error-reset-button">
            Try Again
          </button>
        </div>
      );
    }

    // If there's no error, render the children
    return this.props.children;
  }
}

export default ErrorBoundary;
