import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SignUp from '../components/signup/Signup';
import '../styles/signup/signupstyles.css';
import '../styles/signup/signup-fixes.css'; // Import the fixes

function SignupPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract the active tab from location state if available
  const activeTab = location.state?.activeTab || 'signup';

  useEffect(() => {
    // Clear any other page classes
    document.body.classList.remove('study-page', 'ffr-page', 'casting-page', 'application-form-page');
    
    // Apply signup-specific styles
    document.body.classList.add('signup-page');
    
    // Restore normal scrolling
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    
    // Fix any margin/padding issues
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    return () => {
      // Remove signup-specific styles on unmount
      document.body.classList.remove('signup-page');
    };
  }, []);

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="signup-page-container" style={{
      paddingTop: '80px', // Add padding to prevent navbar overlap
      minHeight: '100vh',
      position: 'relative',
      zIndex: 5
    }}>
      <SignUp initialActiveTab={activeTab} onBackToHome={handleBackToHome} />
    </div>
  );
}

export default SignupPage;