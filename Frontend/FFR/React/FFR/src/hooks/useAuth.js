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
    return savedLoginState === 'true';
  });
  
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('userName') || 'Guest';
  });

  // Update localStorage whenever auth state changes
  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
    
    // If user logs out, clear any auth-related data from localStorage
    if (!isLoggedIn) {
      localStorage.removeItem('userName');
    }
  }, [isLoggedIn]);

  // Login function with optional user info
  const login = (name = 'Guest') => {
    setIsLoggedIn(true);
    setUserName(name);
    localStorage.setItem('userName', name);
  };

  // Logout function
  const logout = () => {
    setIsLoggedIn(false);
    setUserName('');
    
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