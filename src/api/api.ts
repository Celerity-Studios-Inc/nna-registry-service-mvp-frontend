import axios from 'axios';

// Configuration for API requests
export const apiConfig = {
  // Always use relative URL for the API when deployed to avoid CORS issues
  // This ensures requests go through Vercel's proxy defined in vercel.json
  baseURL: '/api',
};

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

// Add response interceptor to handle common error cases
api.interceptors.response.use(
  (response) => {
    console.log(`🔽 API Response: ${response.status} ${response.statusText}`);
    console.log('Response headers:', response.headers);
    console.log('Response data preview:', 
      JSON.stringify(response.data).substring(0, 200) + 
      (JSON.stringify(response.data).length > 200 ? '...' : '')
    );
    return response;
  },
  (error) => {
    console.log('❌ API Error:', error.message);
    
    if (error.response) {
      console.log(`Error response status: ${error.response.status} ${error.response.statusText}`);
      console.log('Error response headers:', error.response.headers);
      
      try {
        // Try to log response data if available
        if (error.response.data) {
          console.log('Error response data:', error.response.data);
        }
      } catch (e) {
        console.log('Unable to log error response data:', e);
      }
      
      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        // Clear token and redirect to login if needed
        localStorage.removeItem('accessToken');
        // Could redirect to login here if needed
        console.log("Authentication required. Redirecting to login...");
      }
      
      // Handle 403 Forbidden errors
      if (error.response.status === 403) {
        console.log("Permission denied.");
      }
      
      // Handle 500 server errors
      if (error.response.status >= 500) {
        console.log("Server error, please try again later.");
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.log("No response received from server. Request:", error.request);
    }
    
    return Promise.reject(error);
  }
);

export default api;
