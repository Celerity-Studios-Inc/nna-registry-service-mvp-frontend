import axios from 'axios';

// Configuration for API requests
export const apiConfig = {
  baseURL: process.env.REACT_APP_API_URL || 'https://registry.reviz.dev/api',
};

// Create an Axios instance
const api = axios.create({
  baseURL: apiConfig.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
