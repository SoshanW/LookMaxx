import React, { createContext, useContext, useEffect } from 'react';
import useAuth from '../hooks/useAuth';

// Create the auth context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const auth = useAuth();
  
  // Listen for external auth state changes (from localStorage)
  useEffect(() => {
    const checkAuthState = () => {
      const savedLoginState = localStorage.getItem('isLoggedIn') === 'true';
      const savedUserName = localStorage.getItem('userName');
      
      if (savedLoginState !== auth.isLoggedIn) {
        // If there's a mismatch, update the context state
        auth.setIsLoggedIn(savedLoginState);
      }
    };
    
    // Check initially and also when storage changes
    checkAuthState();
    
    // Listen for storage events (in case localStorage changes in another tab)
    window.addEventListener('storage', checkAuthState);
    
    return () => {
      window.removeEventListener('storage', checkAuthState);
    };
  }, [auth]);
  
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