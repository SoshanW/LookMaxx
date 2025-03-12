import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SignUp from '../components/signup/Signup';
import '../styles/signup/signupstyles.css';

function SignupPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract the active tab from location state if available
  const activeTab = location.state?.activeTab || 'signup';

  useEffect(() => {
    // Apply signup-specific styles
    document.body.classList.add('signup-page');
    
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