import React, { useEffect } from 'react';
import CastingApplicationForm from '../components/casting/CastingApplicationForm';

function CastingApplicationPage() {
  // Apply casting-specific styles but ensure scrolling works
  useEffect(() => {
    // Apply the casting-page class for styling consistency
    document.body.classList.add('casting-page');
    
    // Override the overflow hidden that's applied to casting-page
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.documentElement.style.overflowY = 'auto';
    
    return () => {
      document.body.classList.remove('casting-page');
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflowY = '';
    };
  }, []);

  return <CastingApplicationForm />;
}

export default CastingApplicationPage;