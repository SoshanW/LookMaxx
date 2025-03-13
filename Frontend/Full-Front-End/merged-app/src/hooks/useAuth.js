import { useState, useEffect, useCallback } from 'react';

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

  // Use useCallback to prevent unnecessary function recreations
  const login = useCallback((name = 'Guest') => {
    setIsLoggedIn(true);
    setUserName(name);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', name);
    
    // Dispatch a custom event that other components can listen for
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { isLoggedIn: true, userName: name } 
    }));
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserName('');
    
    // Clear auth data from localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    
    // Reset any scroll detection or app state
    window.scrollTo(0, 0);
    
    // Dispatch auth change event
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { isLoggedIn: false, userName: '' } 
    }));
    
    setTimeout(() => {
      const resetEvent = new CustomEvent('resetScrollDetection');
      window.dispatchEvent(resetEvent);
    }, 100);
  }, []);

  // Listen for auth state changes from other components
  useEffect(() => {
    const handleAuthChange = (event) => {
      if (event.detail) {
        setIsLoggedIn(event.detail.isLoggedIn);
        if (event.detail.userName) {
          setUserName(event.detail.userName);
        }
      }
    };
    
    window.addEventListener('authStateChanged', handleAuthChange);
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);
  
  // Update localStorage whenever auth state changes
  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);
  
  return {
    isLoggedIn,
    userName,
    login,
    logout,
    setIsLoggedIn
  };
};

export default useAuth;