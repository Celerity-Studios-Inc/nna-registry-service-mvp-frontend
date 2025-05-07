import axios from 'axios';

// Configuration for API requests
export const apiConfig = {
  // Always use relative URL for the API when deployed to avoid CORS issues
  // This ensures requests go through Vercel's proxy defined in vercel.json
  baseURL: '/api',
};

// Create an Axios instance
const api = axios.create({
  baseURL: apiConfig.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common error cases
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
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
      console.log("No response received from server.");
    }
    
    return Promise.reject(error);
  }
);

export default api;
