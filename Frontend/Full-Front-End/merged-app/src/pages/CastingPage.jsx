import React, { useEffect } from 'react';
import CastingPageComponent from '../components/casting/CastingPage';

function CastingPage() {
  // Apply casting-specific styles
  useEffect(() => {
    document.body.classList.add('casting-page');
    
    return () => {
      document.body.classList.remove('casting-page');
    };
  }, []);

  return <CastingPageComponent />;
}

export default CastingPage;