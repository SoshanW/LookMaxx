import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthProvider';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, isAuthReady } = useAuthContext();
  const location = useLocation();
  
  // Show loading while checking authentication
  if (!isAuthReady) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/signup" state={{ returnPath: location.pathname }} replace />;
  }
  
  // Render the protected component
  return children;
};

export default ProtectedRoute;