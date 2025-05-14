import { ErrorSeverity } from '../contexts/ErrorContext';

/**
 * Helper function to format API errors for display
 * Extracts useful information from various API error formats
 */
export const formatApiError = (error: any): { 
  message: string; 
  title?: string;
  severity: ErrorSeverity;
} => {
  // Default values
  let message = 'An unknown error occurred';
  let title = 'Error';
  let severity: ErrorSeverity = 'error';

  // No error provided
  if (!error) {
    return { message, title, severity };
  }

  // Axios error with response
  if (error.response) {
    const { status, data } = error.response;

    // Extract message from response data
    if (typeof data === 'string') {
      message = data;
    } else if (data) {
      if (data.message) {
        message = data.message;
      } else if (data.error?.message) {
        message = data.error.message;
      } else if (data.error && typeof data.error === 'string') {
        message = data.error;
      }
    }

    // Set title and severity based on status
    if (status === 400) {
      title = 'Bad Request';
    } else if (status === 401) {
      title = 'Authentication Required';
      message = 'Your session has expired. Please log in again.';
    } else if (status === 403) {
      title = 'Permission Denied';
      message = 'You do not have permission to perform this action.';
    } else if (status === 404) {
      title = 'Resource Not Found';
      severity = 'warning';
    } else if (status === 422) {
      title = 'Validation Error';
      // Format validation errors nicely
      if (data.errors && typeof data.errors === 'object') {
        const errorDetails = Object.entries(data.errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('; ');
        
        message = errorDetails || message;
      }
    } else if (status >= 500) {
      title = 'Server Error';
      message = 'The server encountered an error. Please try again later.';
    }
  } 
  // Network error (no response)
  else if (error.request) {
    title = 'Connection Error';
    message = 'Unable to connect to the server. Please check your internet connection.';
    severity = 'warning';
  } 
  // Simple error object or string
  else if (error.message) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  return { message, title, severity };
};

/**
 * Helper function to handle errors in async operations
 * Use this with try/catch blocks for consistent error handling
 */
export const handleAsyncError = (
  error: any, 
  errorHandler: (msg: string | any, severity?: ErrorSeverity) => void,
  context?: string
): void => {
  console.error(`Error${context ? ` in ${context}` : ''}:`, error);
  
  const formattedError = formatApiError(error);
  errorHandler({
    message: formattedError.message, 
    title: formattedError.title,
    severity: formattedError.severity
  });
};