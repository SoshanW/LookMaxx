import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setCookie, getCookie, deleteCookie } from '../utils/cookies';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Initialize from cookies on mount
    return getCookie('access_token') !== null;
  });
  
  const [userName, setUserName] = useState(() => {
    // Initialize user data from cookies
    const userData = getCookie('user_data');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        return parsed.first_name || parsed.name || parsed.username || 'Guest';
      } catch (e) {
        console.error('Error parsing user data:', e);
        return 'Guest';
      }
    }
    return 'Guest';
  });
  
  // Add userEmail state
  const [userEmail, setUserEmail] = useState(() => {
    const userData = getCookie('user_data');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        return parsed.email || '';
      } catch (e) {
        console.error('Error parsing user email:', e);
        return '';
      }
    }
    return '';
  });
  
  // Add userProfilePicture state
  const [userProfilePicture, setUserProfilePicture] = useState(() => {
    const userData = getCookie('user_data');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        return parsed.profile_picture || '';
      } catch (e) {
        console.error('Error parsing user profile picture:', e);
        return '';
      }
    }
    return '';
  });
  
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  // Initialize auth state on mount
  useEffect(() => {
    // Mark auth as ready after initial state is set
    setIsAuthReady(true);
  }, []);

  // Login function that returns a Promise
  const login = useCallback(async (name = 'Guest', token = null, userData = null) => {
    return new Promise((resolve) => {
      // Set cookie first to ensure it's available immediately
      if (token) {
        setCookie('access_token', token, { expires: 7 });
      }
      
      // Store user data
      if (userData) {
        setCookie('user_data', JSON.stringify(userData), { expires: 7 });
        // Set email if available
        if (userData.email) {
          setUserEmail(userData.email);
        }
        // Set profile picture if available
        if (userData.profile_picture) {
          setUserProfilePicture(userData.profile_picture);
        }
      } else {
        setCookie('user_data', JSON.stringify({ name }), { expires: 7 });
      }
      
      // Update state after cookies are set
      setIsLoggedIn(true);
      setUserName(userData?.first_name || name);
      
      // Small delay to ensure cookies are properly set
      setTimeout(resolve, 50);
    });
  }, []);

  // Logout function that returns a Promise
  const logout = useCallback(async () => {
    return new Promise((resolve) => {
      // Delete cookies first
      deleteCookie('access_token');
      deleteCookie('user_data');
      deleteCookie('isLoggedIn');
      
      // Update state after cookies are deleted
      setIsLoggedIn(false);
      setUserName('');
      setUserEmail('');
      setUserProfilePicture('');
      
      // Small delay to ensure cookies are properly deleted
      setTimeout(resolve, 50);
    });
  }, []);

  // Context value with all auth-related states and functions
  const contextValue = {
    isLoggedIn,
    userName,
    userEmail,
    userProfilePicture,
    login,
    logout,
    isAuthReady
  };

  return (
    <AuthContext.Provider value={contextValue}>
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