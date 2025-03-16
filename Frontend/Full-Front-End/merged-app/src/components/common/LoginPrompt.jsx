import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/common/LoginPrompt.css';
import '../../styles/common/LoginPrompt-fixes.css';

const LoginPrompt = ({ isOpen, onClose, onLogin }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Prevent background scrolling when prompt is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSignupClick = () => {
    setIsLoading(true);
    
    try {
      // Store the current page for later return
      const currentPath = window.location.pathname;
      
      // Simply navigate to signup page with the signup tab active
      navigate('/signup', { 
        state: { 
          activeTab: 'signup',
          returnPath: currentPath
        }
      });
      
      // Call the onClose callback to close the prompt
      if (onClose) {
        onClose();
      }
    } catch (err) {
      setError('Failed to navigate. Please try again.');
      console.error('Navigation error:', err);
      setIsLoading(false);
    }
  };

  const handleLoginClick = () => {
    setIsLoading(true);
    
    try {
      // Store the current page for later return
      const currentPath = window.location.pathname;
      
      // Simply navigate to signup page with the login tab active
      navigate('/signup', { 
        state: { 
          activeTab: 'login',
          returnPath: currentPath
        }
      });
      
      // Call the onClose callback to close the prompt
      if (onClose) {
        onClose();
      }
    } catch (err) {
      setError('Failed to navigate. Please try again.');
      console.error('Navigation error:', err);
      setIsLoading(false);
    }
  };

  return (
    <div className="login-prompt-overlay">
      <div className="login-prompt-container">
        <div className="login-prompt-content">
          <h2>Access Restricted</h2>
          <p>Please log in to continue exploring this site.</p>
          <div className="login-prompt-warning">
            Scroll access is limited for guest users
          </div>
          <p className="login-prompt-description">
            Unlock the full experience with all features by creating an account or logging in with your existing credentials.
          </p>
          {error && <div className="error-alert">{error}</div>}
          <div className="login-prompt-buttons">
            <button 
              className="login-button" 
              onClick={handleLoginClick}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Login'}
            </button>
            <button 
              className="signup-button" 
              onClick={handleSignupClick}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Sign Up'}
            </button>
            <button 
              className="close-button" 
              onClick={onClose}
              disabled={isLoading}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt;