import React, { useEffect } from 'react';
import CastingApplicationForm from '../components/casting/CastingApplicationForm';

function CastingApplicationPage() {
  // Apply casting-specific styles
  useEffect(() => {
    document.body.classList.add('casting-page');
    
    return () => {
      document.body.classList.remove('casting-page');
    };
  }, []);

  return <CastingApplicationForm />;
}

export default CastingApplicationPage;