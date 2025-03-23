// src/utils/jwtDiagnostic.js
import { getCookie } from './cookies';

/**
 * Debug function to check JWT token validity
 * @returns {Object} Diagnostic information about the token
 */
export const checkJwtToken = () => {
  try {
    // Get the token
    const token = getCookie('access_token');
    
    if (!token) {
      console.error('❌ No access_token found in cookies');
      return {
        exists: false,
        valid: false,
        error: 'No token found'
      };
    }
    
    console.log('✅ Found access_token in cookies');
    
    // Check token format (should start with 'ey')
    if (!token.startsWith('ey')) {
      console.error('❌ Token does not appear to be a valid JWT (should start with "ey")');
      console.log('Token value:', token);
      return {
        exists: true,
        valid: false,
        error: 'Token format invalid'
      };
    }
    
    // Split and decode the token
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('❌ Token does not have 3 parts (header.payload.signature)');
      return {
        exists: true,
        valid: false,
        error: 'Token structure invalid'
      };
    }
    
    // Decode payload
    try {
      const payload = JSON.parse(atob(parts[1]));
      
      // Check expiration
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp && payload.exp < currentTime;
      
      if (isExpired) {
        console.error(`❌ Token is expired. Expired at: ${new Date(payload.exp * 1000).toLocaleString()}`);
        return {
          exists: true,
          valid: false,
          expired: true,
          payload,
          error: 'Token expired'
        };
      }
      
      // Check for user ID
      if (!payload.sub) {
        console.error('❌ Token does not contain a user ID (sub claim)');
        return {
          exists: true,
          valid: false,
          payload,
          error: 'No user ID in token'
        };
      }
      
      console.log('✅ Token appears valid with user ID:', payload.sub);
      console.log('✅ Token expires at:', new Date(payload.exp * 1000).toLocaleString());
      return {
        exists: true,
        valid: true,
        payload,
        userId: payload.sub
      };
    } catch (e) {
      console.error('❌ Could not decode token payload:', e);
      return {
        exists: true,
        valid: false,
        error: 'Could not decode payload'
      };
    }
  } catch (error) {
    console.error('❌ Error checking JWT token:', error);
    return {
      exists: false,
      valid: false,
      error: error.message
    };
  }
};

// Function to run diagnostic check and debug
export const runJwtDiagnostic = () => {
  console.group('🔍 JWT Token Diagnostic');
  
  // Check the token
  const tokenStatus = checkJwtToken();
  
  // Test Authorization header composition
  const token = getCookie('access_token');
  if (token) {
    const authHeader = `Bearer ${token}`;
    console.log('Authorization header would be:', authHeader);
  }
  
  // Check cookie settings
  console.log('📝 Cookies found:');
  document.cookie.split(';').forEach(cookie => {
    console.log(cookie.trim());
  });
  
  console.groupEnd();
  
  return tokenStatus;
};

export default runJwtDiagnostic;