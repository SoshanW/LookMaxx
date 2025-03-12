import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/common/LoginPrompt.css';

const LoginPrompt = ({ isOpen, onClose, onLogin }) => {
  const navigate = useNavigate();

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
    navigate('/signup', { state: { activeTab: 'signup' } });
  };

  const handleLoginClick = () => {
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