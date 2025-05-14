import axios from 'axios';
import { ErrorSeverity } from '../contexts/ErrorContext';

// Types for the error handler
type ErrorMessage = {
  title?: string;
  message: string;
  severity?: ErrorSeverity;
  autoHide?: boolean;
};

type ErrorHandler = (message: string | ErrorMessage, severity?: ErrorSeverity) => void;

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

  // Allow overriding mock mode via localStorage
  useMockApi: process.env.REACT_APP_USE_MOCK_API === 'true',

  // Direct connection causes CORS errors because our domain is not allowed
  // baseURL: 'https://registry.reviz.dev/api',

  // Define debugging information for the API
  debug: {
    version: '1.2',
    timestamp: new Date().toISOString(),
    backendUrl: 'https://registry.reviz.dev/api'
  }
};

// For development, allow overriding mock mode via localStorage
try {
  const localStorageMockOverride = localStorage.getItem('forceMockApi');
  if (localStorageMockOverride !== null) {
    apiConfig.useMockApi = localStorageMockOverride === 'true';
    console.log(`Using localStorage override for mock API: ${apiConfig.useMockApi}`);
  }
} catch (e) {
  console.warn('Unable to access localStorage for mock API setting');
}

console.log('API Configuration:', apiConfig);

// Create an Axios instance
const api = axios.create({
  baseURL: apiConfig.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add withCredentials to handle CORS with credentials properly
  withCredentials: false,
});

// Log API configuration in a visible way
console.log(`🔄 API Client configured with baseURL: ${apiConfig.baseURL}`);

// Add request logging to see all outgoing requests
api.interceptors.request.use(request => {
  console.log(`🔼 API Request: ${request.method?.toUpperCase()} ${request.baseURL}${request.url}`);
  console.log('Full Request URL:', `${window.location.origin}${request.baseURL}${request.url}`);
  console.log('Request headers:', request.headers);
  console.log('Request data:', request.data);
  return request;
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Added auth token to request');
    } else {
      console.warn('⚠️ No auth token found in localStorage!');
      
      // For development/debugging in production environment
      // Create a test token if in development mode
      if (process.env.NODE_ENV === 'development') {
        // Only add this for certain endpoints where auth is required
        if (config.url?.includes('/assets')) {
          console.log('🔧 Adding test token for development');
          config.headers.Authorization = 'Bearer test-development-token';
        }
      }
    }
    return config;
  },
  (error) => {
    console.error('Error in request interceptor:', error);
    return Promise.reject(error);
  }
);

// Exported flag to check if backend is available
export let isBackendAvailable = true;

// Add response interceptor to handle common error cases
api.interceptors.response.use(
  (response) => {
    console.log(`🔽 API Response: ${response.status} ${response.statusText}`);
    console.log('Response headers:', response.headers);
    console.log('Response data preview:', 
      JSON.stringify(response.data).substring(0, 200) + 
      (JSON.stringify(response.data).length > 200 ? '...' : '')
    );
    
    // If we get a successful response, the backend is available
    isBackendAvailable = true;
    
    return response;
  },
  (error) => {
    console.log('❌ API Error:', error.message);
    
    // Extract useful error information
    let errorMessage = 'An unknown error occurred';
    let errorTitle = 'Error';
    let severity: 'error' | 'warning' | 'info' = 'error';
    
    if (error.response) {
      console.log(`Error response status: ${error.response.status} ${error.response.statusText}`);
      console.log('Error response headers:', error.response.headers);
      
      try {
        // Try to log response data if available
        if (error.response.data) {
          console.log('Error response data:', error.response.data);
          
          // Try to extract error message from various API formats
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.error?.message) {
            errorMessage = error.response.data.error.message;
          } else if (error.response.data.error) {
            errorMessage = typeof error.response.data.error === 'string' 
              ? error.response.data.error
              : JSON.stringify(error.response.data.error);
          }
        }
      } catch (e) {
        console.log('Unable to log error response data:', e);
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
        errorMessage = 'The server encountered an error. Please try again later.';
        // Set backend as potentially unavailable after multiple 500 errors
        isBackendAvailable = false;
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.log("No response received from server. Request:", error.request);
      // If we can't connect at all, backend is definitely unavailable
      isBackendAvailable = false;
      errorTitle = 'Connection Error';
      errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      console.warn("⚠️ Backend appears to be unavailable. Falling back to mock data for future requests.");
    }
    
    // Show error using our global error handler if available
    if (globalErrorHandler) {
      globalErrorHandler({
        title: errorTitle,
        message: errorMessage,
        severity: severity,
        autoHide: severity !== 'error' // Only auto-hide non-error messages
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;
