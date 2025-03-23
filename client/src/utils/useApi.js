// src/hooks/useApi.js
import { useState, useCallback } from 'react';
import { api } from '../utils/apiClient';
import { useAuth } from './useAuth';

/**
 * Custom hook for API calls with auth handling and loading states
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { logout } = useAuth();

  /**
   * Execute an API request with automatic loading state and error handling
   * @param {Function} apiMethod - The API method to call (e.g., api.get, api.post)
   * @param {Array} params - Parameters to pass to the API method
   * @param {Object} options - Additional options
   * @returns {Promise} - The API response data
   */
  const executeRequest = useCallback(async (apiMethod, params = [], options = {}) => {
    const { 
      handleError = true, 
      logoutOnAuthError = true,
      customErrorHandler = null,
      successMessage = null,
      silentError = false,
    } = options;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiMethod(...params);
      
      // Handle success message if provided
      if (successMessage && window.showNotification) {
        window.showNotification(successMessage, 'success');
      }
      
      return response.data;
    } catch (err) {
      // Handle authentication errors
      if (err.response?.status === 401 && logoutOnAuthError) {
        // Force logout and redirect to login
        logout();
        
        // Throw error to stop execution
        throw new Error('Authentication error. Please log in again.');
      }
      
      // Set error state
      if (handleError) {
        setError(err.response?.data?.message || err.message);
        
        // Display error notification if not silent
        if (!silentError && window.showNotification) {
          window.showNotification(
            err.response?.data?.message || 'An error occurred',
            'error'
          );
        }
        
        // Apply custom error handler if provided
        if (customErrorHandler) {
          customErrorHandler(err);
        }
      }
      
      // Re-throw the error for the caller to handle
      throw err;
    } finally {
      setLoading(false);
    }
  }, [logout]);

  /**
   * API method wrappers with loading/error handling
   */
  const apiMethods = {
    // GET requests
    get: useCallback((url, options = {}) => {
      return executeRequest(api.get, [url], options);
    }, [executeRequest]),
    
    // POST requests
    post: useCallback((url, data, options = {}) => {
      return executeRequest(api.post, [url, data], options);
    }, [executeRequest]),
    
    // PUT requests
    put: useCallback((url, data, options = {}) => {
      return executeRequest(api.put, [url, data], options);
    }, [executeRequest]),
    
    // PATCH requests
    patch: useCallback((url, data, options = {}) => {
      return executeRequest(api.patch, [url, data], options);
    }, [executeRequest]),
    
    // DELETE requests
    delete: useCallback((url, options = {}) => {
      return executeRequest(api.delete, [url], options);
    }, [executeRequest]),
    
    // Form data uploads (files, etc.)
    uploadFormData: useCallback((url, formData, options = {}) => {
      return executeRequest(api.postFormData, [url, formData], options);
    }, [executeRequest]),
  };

  return {
    ...apiMethods,
    loading,
    error,
    clearError: () => setError(null),
  };
};

export default useApi;