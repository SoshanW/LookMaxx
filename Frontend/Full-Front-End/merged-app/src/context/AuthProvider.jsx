// src/context/AuthProvider.jsx
import React, { createContext, useContext, useEffect, useRef } from 'react';
import useAuth from '../hooks/useAuth';
import { getCookie } from '../utils/cookies';

// Create the auth context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const auth = useAuth();
  const initialCheckDoneRef = useRef(false);
  
  // Listen for external auth state changes (from cookies)
  useEffect(() => {
    // Skip if we've already done the initial check
    if (initialCheckDoneRef.current) return;
    
    const checkAuthState = () => {
      const savedLoginState = getCookie('access_token') !== null;
      const savedUserName = getCookie('user_data');
      
      if (savedLoginState !== auth.isLoggedIn) {
        // If there's a mismatch, update the context state
        auth.setIsLoggedIn(savedLoginState);
        
        // If we have user data, parse and use it
        if (savedUserName) {
          try {
            const userData = JSON.parse(savedUserName);
            if (userData.name && userData.name !== auth.userName) {
              auth.setUserName(userData.name);
            }
          } catch (e) {
            console.error('Error parsing user data from cookie:', e);
          }
        }
      }
    };
    
    // Perform the initial check
    checkAuthState();
    initialCheckDoneRef.current = true;
    
    // Set up a storage event listener, but NOT a recursive re-check
    const handleStorageChange = (e) => {
      if (e.key === 'access_token' || e.key === 'user_data') {
        checkAuthState();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [auth]); // Add auth to dependencies, but use ref to prevent infinite updates
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  
  if (context === null) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthProvider;