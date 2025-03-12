// In src/context/AuthProvider.jsx
import React, { createContext, useContext } from 'react';
import useAuth from '../hooks/useAuth';

// Create the auth context
const AuthContext = createContext(null);

/**
 * Authentication Provider component that wraps your application
 * to provide authentication state and functions to all components
 */
export const AuthProvider = ({ children }) => {
  const auth = useAuth();
  
  // Log auth state for debugging
  console.log('Auth Provider state:', auth);
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use the auth context
 * @returns {Object} Authentication state and functions
 */
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  
  if (context === null) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthProvider;