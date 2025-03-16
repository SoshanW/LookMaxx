// src/hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import { setCookie, getCookie, deleteCookie } from '../utils/cookies';
import axios from 'axios';  

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return getCookie('access_token') !== null;
  });
  
  const [userName, setUserName] = useState(() => {
    const userData = getCookie('user_data');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        return parsed.name || parsed.username || 'Guest';
      } catch (e) {
        console.error('Error parsing user data:', e);
        return 'Guest';
      }
    }
    return 'Guest';
  });
  
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  // Initialize auth state on mount
  useEffect(() => {
    setIsAuthReady(true);
  }, []);

  // Updated login function that connects to the backend
  const login = useCallback(async (username, password, userData = null, options = {}) => {
    try {
      let token, userInfo;
      
      // If username and password are provided, perform actual login
      if (password && !userData) {
        // Call the API function
        const response = await axios.post('http://localhost:5000/auth/login', 
          new URLSearchParams({
            username: username,
            password: password
          }), 
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            withCredentials: true
          }
        );
        
        token = response.data.access_token;
        userInfo = response.data.user;
        
        // Store the token in a cookie
        setCookie('access_token', token, { expires: 7 });
        
        // Store user data
        setCookie('user_data', JSON.stringify(userInfo), { expires: 7 });
      } else {
        // This is a mock/test login or for signup flow
        if (token) {
          setCookie('access_token', token, { expires: 7 });
        }
        
        // Store user data
        if (userData) {
          setCookie('user_data', JSON.stringify(userData), { expires: 7 });
        } else {
          setCookie('user_data', JSON.stringify({ name: username }), { expires: 7 });
        }
      }
      
      // Update state
      setIsLoggedIn(true);
      setUserName(userInfo?.username || username);
      
      // Handle redirect options
      const redirectPath = options.redirectPath || '/profile';
      const redirectQuery = options.redirectQuery || window.location.search;
      const loginSource = options.source || 'general';
      
      // Store redirect information
      sessionStorage.setItem('auth_redirect', redirectPath);
      sessionStorage.setItem('auth_query', redirectQuery);
      
      // Store login info with source for specialized handling
      sessionStorage.setItem('post_login_action', JSON.stringify({
        action: 'login_complete',
        username: userInfo?.username || username,
        source: loginSource
      }));
      
      if (!options.skipRefresh) {
        window.location.href = redirectPath;
      }
      
      return { success: true, user: userInfo };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  }, []);

  // Define the signup function to match the expected interface
  const signup = useCallback(async (userData, profilePicture) => {
    try {
      const formData = new FormData();
      
      // Add user data to form
      formData.append('username', userData.username);
      formData.append('firstName', userData.firstName);
      formData.append('lastName', userData.lastName);
      formData.append('email', userData.email);
      formData.append('gender', userData.gender);
      formData.append('password', userData.password);
      
      // Add profile picture if provided
      if (profilePicture) {
        formData.append('profile_picture', profilePicture);
      }
      
      const response = await axios.post('http://localhost:5000/auth/signup', formData, {
        withCredentials: true
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Signup failed'
      };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Clear auth cookies
      deleteCookie('access_token');
      deleteCookie('user_data');
      deleteCookie('isLoggedIn');
      
      // Reset any scroll detection or app state
      window.scrollTo(0, 0);
      
      // Store current location for redirect after refresh
      sessionStorage.setItem('auth_redirect', '/');
      
      // Update local state
      setIsLoggedIn(false);
      setUserName('');
      
      // Force redirect to home page
      window.location.href = '/';
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      
      // Still delete cookies even if backend logout fails
      deleteCookie('access_token');
      deleteCookie('user_data');
      deleteCookie('isLoggedIn');
      
      setIsLoggedIn(false);
      setUserName('');
      
      window.location.href = '/';
      
      return { success: false, error: error.message };
    }
  }, []);

  // Return the hook methods and state
  return {
    isLoggedIn,
    userName,
    login,
    signup,  // Now properly defined
    logout,
    isAuthReady
  };
};

export default useAuth;