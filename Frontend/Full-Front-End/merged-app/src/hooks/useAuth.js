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

  const [isAuthReady, setIsAuthReady] = useState(false);
  
  // Initialize auth state
  useEffect(() => {
    setIsAuthReady(true);
  }, []);

  // Login function with customizable redirect
  const login = useCallback(async (name = 'Guest', token = null, userData = null, options = {}) => {
    return new Promise((resolve) => {
      // Set cookies synchronously
      if (token) {
        setCookie('access_token', token, { expires: 7 });
      }
      
      if (userData) {
        setCookie('user_data', JSON.stringify(userData), { expires: 7 });
      } else {
        setCookie('user_data', JSON.stringify({ name }), { expires: 7 });
      }
      
      setCookie('isLoggedIn', 'true', { expires: 7 });
      
      // Default redirect is to current page, but can be overridden in options
      const redirectPath = options.redirectPath || window.location.pathname;
      const redirectQuery = options.redirectQuery || window.location.search;
      const loginSource = options.source || 'general';
      
      // Store redirect information
      sessionStorage.setItem('auth_redirect', redirectPath);
      sessionStorage.setItem('auth_query', redirectQuery);
      
      // Store login info with source for specialized handling
      sessionStorage.setItem('post_login_action', JSON.stringify({
        action: 'login_complete',
        username: name,
        source: loginSource
      }));
      
      // Update local state
      setIsLoggedIn(true);
      setUserName(name);
      
      // Resolve the promise before refresh
      resolve();
      
      // If skipRefresh option is provided, don't refresh yet (for multi-step flows)
      if (!options.skipRefresh) {
        // Reload the page for immediate state update
        window.location.reload();
      }
    });
  }, []);

  // Logout function - removes auth cookies and triggers refresh
  const logout = useCallback(async () => {
    return new Promise((resolve) => {
      // Clear auth cookies
      deleteCookie('access_token');
      deleteCookie('user_data');
      deleteCookie('isLoggedIn');
      
      // Reset any scroll detection or app state
      window.scrollTo(0, 0);
      
      // Store current location for redirect after refresh
      const currentPath = window.location.pathname;
      sessionStorage.setItem('auth_redirect', currentPath);
      
      // Update local state
      setIsLoggedIn(false);
      setUserName('');
      
      // Resolve the promise before refresh
      resolve();
      
      // Reload the page for immediate state update
      window.location.reload();
    });
  }, []);

  // Check for post-login actions after page load/refresh
  useEffect(() => {
    const handlePostLoginActions = () => {
      const postLoginAction = sessionStorage.getItem('post_login_action');
      if (postLoginAction) {
        try {
          const action = JSON.parse(postLoginAction);
          if (action.action === 'login_complete') {
            // Dispatch event for components that need to know
            window.dispatchEvent(new CustomEvent('authStateChanged', { 
              detail: { isLoggedIn: true, userName: action.username } 
            }));
          }
        } catch (e) {
          console.error('Error processing post-login action:', e);
        }
        
        // Only clear in certain cases - if it's a signup flow we might still need it
        if (!postLoginAction.includes('"source":"signup"')) {
          sessionStorage.removeItem('post_login_action');
        }
      }
    };
    
    // Handle redirect after refresh if there's a stored path
    const handleRedirect = () => {
      const redirectPath = sessionStorage.getItem('auth_redirect');
      const queryParams = sessionStorage.getItem('auth_query') || '';
      
      if (redirectPath) {
        // Check if we're in a special flow that shouldn't redirect
        const postLoginAction = sessionStorage.getItem('post_login_action');
        if (postLoginAction && postLoginAction.includes('"source":"signup"')) {
          // Don't redirect for signup flow
          return;
        }
        
        // Clear stored path before redirect to prevent loops
        sessionStorage.removeItem('auth_redirect');
        sessionStorage.removeItem('auth_query');
        
        // Only redirect if we're not already on the right path
        if (window.location.pathname !== redirectPath) {
          window.location.href = redirectPath + queryParams;
        }
      }
    };
    
    if (isAuthReady) {
      handlePostLoginActions();
      handleRedirect();
    }
  }, [isAuthReady]);
  
  return {
    isLoggedIn,
    userName,
    login,
    logout,
    setIsLoggedIn,
    isAuthReady
  };
};

export default useAuth;