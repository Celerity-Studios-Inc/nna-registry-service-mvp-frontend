import axios from 'axios';
import {
  ErrorSeverity,
  ErrorMessage,
  ErrorHandler,
} from '../types/error.types';
import { environmentSafeLog, environmentSafeWarn, environmentSafeError, isDebuggingAllowed } from '../utils/environment';

// Create a global error handler for use outside React components
let globalErrorHandler: ErrorHandler | null = null;

// This function will be called from App to set the error handler
export const setGlobalErrorHandler = (handler: ErrorHandler) => {
  globalErrorHandler = handler;
};

// Configuration for API requests
export const apiConfig = {
  // Use the proxy approach to avoid CORS issues
  // This ensures requests go through Vercel's proxy defined in vercel.json
  baseURL: '/api',

  // Explicitly set mock mode to false for production
  useMockApi: false,

  // Define debugging information for the API
  debug: {
    version: '1.3',
    timestamp: new Date().toISOString(),
    backendUrl: 'https://registry.reviz.dev/api',
  },
};

// For development, allow overriding mock mode via localStorage
try {
  const localStorageMockOverride = localStorage.getItem('forceMockApi');
  if (localStorageMockOverride !== null) {
    apiConfig.useMockApi = localStorageMockOverride === 'true';
  }
} catch (e) {
  // Unable to access localStorage for mock API setting
}


// Create an Axios instance
const api = axios.create({
  baseURL: apiConfig.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add withCredentials to handle CORS with credentials properly
  withCredentials: false,
});



// Add request interceptor to include auth token
api.interceptors.request.use(
  config => {
    // Check for both accessToken and testToken (clean any whitespace)
    const accessToken = localStorage.getItem('accessToken');
    const testToken = localStorage.getItem('testToken');
    const token = accessToken || testToken;
    
    if (token) {
      // Clean any whitespace/newlines from the token
      const cleanToken = token.replace(/\s+/g, '');
      config.headers.Authorization = `Bearer ${cleanToken}`;
    } else {
      // For development/debugging in production environment
      // Create a test token if in development mode
      if (process.env.NODE_ENV === 'development') {
        // Only add this for certain endpoints where auth is required
        if (config.url?.includes('/assets')) {
          config.headers.Authorization = 'Bearer test-development-token';
        }
      }
    }
    return config;
  },
  error => {
    console.error('Error in request interceptor:', error);
    return Promise.reject(error);
  }
);

// Exported flag to check if backend is available
export let isBackendAvailable = true;

// Add response interceptor to handle common error cases
api.interceptors.response.use(
  response => {
    // If we get a successful response, the backend is available
    isBackendAvailable = true;

    return response;
  },
  error => {

    // Extract useful error information
    let errorMessage = 'An unknown error occurred';
    let errorTitle = 'Error';
    let severity: 'error' | 'warning' | 'info' = 'error';

    if (error.response) {
      try {
        // Try to log response data if available
        if (error.response.data) {

          // Try to extract error message from various API formats
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.error?.message) {
            errorMessage = error.response.data.error.message;
          } else if (error.response.data.error) {
            errorMessage =
              typeof error.response.data.error === 'string'
                ? error.response.data.error
                : JSON.stringify(error.response.data.error);
          }
        }
      } catch (e) {
        // Unable to log error response data
      }

      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        // Clear token and redirect to login if needed
        localStorage.removeItem('accessToken');
        errorTitle = 'Authentication Required';
        errorMessage = 'Your session has expired. Please log in again.';

        // Redirect to login after a short delay to allow error message to be seen
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }

      // Handle 403 Forbidden errors
      if (error.response.status === 403) {
        errorTitle = 'Permission Denied';
        errorMessage = 'You do not have permission to perform this action.';
      }

      // Handle 404 Not Found errors
      if (error.response.status === 404) {
        errorTitle = 'Resource Not Found';
        errorMessage = 'The requested resource could not be found.';
        severity = 'warning';
      }

      // Handle 422 Validation errors
      if (error.response.status === 422) {
        errorTitle = 'Validation Error';
        // Try to extract field-specific errors
        if (error.response.data?.errors) {
          const errorFields = Object.keys(error.response.data.errors);
          if (errorFields.length > 0) {
            errorMessage = `Validation failed: ${errorFields.join(', ')}`;
          }
        }
      }

      // Handle 500 server errors
      if (error.response.status >= 500) {
        errorTitle = 'Server Error';
        errorMessage =
          'The server encountered an error. Please try again later.';
        // Set backend as potentially unavailable after multiple 500 errors
        isBackendAvailable = false;
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.log('No response received from server. Request:', error.request);
      // If we can't connect at all, backend is definitely unavailable
      isBackendAvailable = false;
      errorTitle = 'Connection Error';
      errorMessage =
        'Unable to connect to the server. Please check your internet connection.';
      console.warn(
        'Backend appears to be unavailable. Falling back to mock data for future requests.'
      );
    }

    // Show error using our global error handler if available
    if (globalErrorHandler) {
      globalErrorHandler({
        title: errorTitle,
        message: errorMessage,
        severity: severity,
        autoHide: severity !== 'error', // Only auto-hide non-error messages
      });
    }

    return Promise.reject(error);
  }
);

export default api;
