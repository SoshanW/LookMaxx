import { useState, useEffect } from 'react';

/**
 * Custom hook to manage authentication state across the application
 * 
 * @param {boolean} initialState - Initial login state (defaults to checking localStorage)
 * @returns {Object} Authentication state and functions
 */
export const useAuth = (initialState = null) => {
  // Initialize from localStorage if available, or use provided initialState
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (initialState !== null) return initialState;
    
    const savedLoginState = localStorage.getItem('isLoggedIn');
    const hasToken = localStorage.getItem('access_token') !== null;
    return savedLoginState === 'true' || hasToken;
  });
  
  const [userName, setUserName] = useState(() => {
    const savedUserName = localStorage.getItem('userName');
    const userData = localStorage.getItem('user_data');
    
    if (savedUserName) return savedUserName;
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        return parsed.name || parsed.username || 'Guest';
      } catch (e) {
        return 'Guest';
      }
    }
    return 'Guest';
  });

  // Update localStorage whenever auth state changes
  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
    
    // If user logs out, clear any auth-related data from localStorage
    if (!isLoggedIn) {
      localStorage.removeItem('userName');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
    }
  }, [isLoggedIn]);

  // Login function with optional user info
  const login = (name = 'Guest') => {
    setIsLoggedIn(true);
    setUserName(name);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', name);
    
    // Dispatch a custom event to force components to check auth state
    window.dispatchEvent(new CustomEvent('authStateChanged'));
  };

  // Logout function
  const logout = () => {
    setIsLoggedIn(false);
    setUserName('');
    
    // Clear auth data from localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    
    // Reset any scroll detection or app state
    window.scrollTo(0, 0);
    setTimeout(() => {
      const resetEvent = new CustomEvent('resetScrollDetection');
      window.dispatchEvent(resetEvent);
    }, 100);
  };
  
  return {
    isLoggedIn,
    userName,
    login,
    logout,
    setIsLoggedIn
  };
};

export default useAuth;