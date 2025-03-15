import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // Import the auth hook
import '../../styles/common/LoginPrompt.css';
import '../../styles/common/LoginPrompt-fixes.css';

const LoginPrompt = ({ isOpen, onClose, onLogin }) => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Get the login function from auth hook

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
    // Use our new cookie-based login method
    login('Guest', 'guest_token', { username: 'Guest', isGuest: true });
    
    // Dispatch global auth state event
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { isLoggedIn: true, userName: 'Guest' } 
    }));
    
    // Call the onLogin callback first to update auth state
    if (onLogin) {
      onLogin();
    }
    
    // Then navigate to signup page
    navigate('/signup', { state: { activeTab: 'signup' } });
  };

  const handleLoginClick = () => {
    // Use our new cookie-based login method
    login('Guest', 'guest_token', { username: 'Guest', isGuest: true });
    
    // Dispatch global auth state event
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { isLoggedIn: true, userName: 'Guest' } 
    }));
    
    // Call the onLogin callback first to update auth state
    if (onLogin) {
      onLogin();
    }
    
    // Then navigate to login page
    navigate('/signup', { state: { activeTab: 'login' } });
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
          <div className="login-prompt-buttons">
            <button className="login-button" onClick={handleLoginClick}>
              Login
            </button>
            <button className="signup-button" onClick={handleSignupClick}>
              Sign Up
            </button>
            <button className="close-button" onClick={onClose}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt;