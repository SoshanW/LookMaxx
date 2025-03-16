// src/utils/apiClient.js
import axios from 'axios';
import { getCookie } from './cookies';

// Base URL for API requests
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create a preconfigured axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Enable sending cookies with requests
  withCredentials: true,
});

// Request interceptor - add auth header for non-cookie approaches if needed
apiClient.interceptors.request.use(
  (config) => {
    // The auth cookie will be sent automatically with withCredentials:true
    // This is only needed if the backend requires both cookie and header auth
    const token = getCookie('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Auth errors - redirect to login
    if (error.response?.status === 401) {
      console.log('Authentication error - redirecting to login');
      
      // Only redirect if we're not already on login/signup
      if (!window.location.pathname.includes('/signup')) {
        window.location.href = '/signup';
      }
    }
    
    // Server errors - show user friendly message
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response?.data || error.message);
      // You could dispatch to a central error handler/notification system here
    }
    
    return Promise.reject(error);
  }
);

// Helper methods for common request types
export const api = {
  // GET request
  get: (url, config = {}) => apiClient.get(url, config),
  
  // POST request
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),
  
  // PUT request
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),
  
  // PATCH request
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),
  
  // DELETE request
  delete: (url, config = {}) => apiClient.delete(url, config),
  
  // For form data (multipart/form-data)
  postFormData: (url, formData, config = {}) => {
    return apiClient.post(url, formData, {
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default apiClient;