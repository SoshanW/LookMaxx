import axios from 'axios';
import { getCookie } from './cookies';

// Always use the full API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Create a preconfigured axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // For FormData, don't set Content-Type header (browser sets it with boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // Still include the auth token if available
    const token = getCookie('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Ensure credentials are included
    config.withCredentials = true;
    
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`Request: ${config.method.toUpperCase()} ${config.url}`, config);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
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

export const loginUser = async (username, password) => {
  try {
    // Create form data (as your backend expects form data, not JSON)
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await apiClient.post('/auth/login', formData);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}; 

// Signup function that sends user details and handles the response
export const signupUser = async (userData, profilePicture) => {
  try {
    const formData = new FormData();
    
    // Add user data fields
    formData.append('username', userData.username);
    formData.append('firstName', userData.firstName);
    formData.append('lastName', userData.lastName);
    formData.append('email', userData.email);
    formData.append('gender', userData.gender);
    formData.append('password', userData.password);
    
    // Add profile picture if available
    if (profilePicture) {
      formData.append('profile_picture', profilePicture);
    }
    
    // Use apiClient which already has the baseURL configured
    const response = await apiClient.post('/auth/signup', formData);
    
    return response.data;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

// Logout function that invalidates the token
export const logoutUser = async () => {
  try {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export default apiClient;