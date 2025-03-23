import React, { useEffect } from 'react';
import FaceModelComponent from '../components/signup/FaceModelPage';
import '../styles/signup/signupstyles.css';

function FaceModelPage() {
  useEffect(() => {
    // Apply signup-specific styles
    document.body.classList.add('signup-page');
    
    return () => {
      // Remove signup-specific styles on unmount
      document.body.classList.remove('signup-page');
    };
  }, []);

  return <FaceModelComponent />;
}

export default FaceModelPage;