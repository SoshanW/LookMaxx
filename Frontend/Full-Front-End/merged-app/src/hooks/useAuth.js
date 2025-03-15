import { useState, useEffect, useCallback } from 'react';
import { setCookie, getCookie, deleteCookie, hasCookie } from '../utils/cookies';

export const useAuth = (initialState = null) => {
  // Initialize from cookies if available, or use provided initialState
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (initialState !== null) return initialState;
    
    // Check for token in cookies
    return hasCookie('access_token');
  });
  
  const [userName, setUserName] = useState(() => {
    // Try to get userName from user_data cookie
    const userData = getCookie('user_data');
    
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        return parsed.name || parsed.username || 'Guest';
      } catch (e) {
        console.error('Error parsing user data from cookie:', e);
        return 'Guest';
      }
    }
    return 'Guest';
  });

  // Login function - stores auth data in cookies
  const login = useCallback((name = 'Guest', token = null, userData = null) => {
    setIsLoggedIn(true);
    setUserName(name);
    
    // Store token in cookie (if provided)
    if (token) {
      // Set token expiration to 7 days
      setCookie('access_token', token, { expires: 7 });
    }
    
    // Store user data
    if (userData) {
      setCookie('user_data', JSON.stringify(userData), { expires: 7 });
    } else {
      // Basic user data with just the name
      setCookie('user_data', JSON.stringify({ name }), { expires: 7 });
    }
    
    // Store login state in a separate cookie for quick access
    setCookie('isLoggedIn', 'true', { expires: 7 });
    
    // Dispatch global event for components to listen
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { isLoggedIn: true, userName: name } 
    }));
  }, []);

  // Logout function - removes auth cookies
  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserName('');
    
    // Clear auth cookies
    deleteCookie('access_token');
    deleteCookie('user_data');
    deleteCookie('isLoggedIn');
    
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

  // Listen for auth state changes from cookies
  useEffect(() => {
    const checkCookieChanges = () => {
      const cookieLoginState = hasCookie('access_token');
      
      // If cookie state doesn't match component state, update component state
      if (cookieLoginState !== isLoggedIn) {
        setIsLoggedIn(cookieLoginState);
        
        // Update username if needed
        if (cookieLoginState) {
          const userData = getCookie('user_data');
          if (userData) {
            try {
              const parsed = JSON.parse(userData);
              setUserName(parsed.name || parsed.username || 'Guest');
            } catch (e) {
              console.error('Error parsing user data:', e);
            }
          }
        } else {
          setUserName('');
        }
      }
    };
    
    // Check cookie changes on load
    checkCookieChanges();
    
    // Set up interval to periodically check for cookie changes (e.g., in other tabs)
    const intervalId = setInterval(checkCookieChanges, 5000);
    
    return () => {
      clearInterval(intervalId);
    };
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