import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((props: { error: Error | null }) => ReactNode);
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component to catch and display errors in the UI
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (typeof this.props.fallback === 'function') {
        // If fallback is a function, call it with the error
        return this.props.fallback({ error: this.state.error });
      } else if (this.props.fallback) {
        // If fallback is a ReactNode, render it directly
        return this.props.fallback;
      } else {
        // Default fallback UI
        return (
          <div className="error-boundary">
            <h2>Something went wrong.</h2>
            <details style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.error && this.state.error.toString()}
            </details>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="error-retry-button"
            >
              Try again
            </button>
          </div>
        );
      }
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
