import React, { useEffect } from 'react';
import CastingPageComponent from '../components/casting/Casting';

function CastingPage() {
  // Apply casting-specific styles and fixes for footer
  useEffect(() => {
    // Add casting-specific class to body
    document.body.classList.add('casting-page');
    
    // Hide the footer when in casting page
    const footer = document.querySelector('footer');
    if (footer) {
      footer.style.display = 'none';
    }
    
    // Fix for any lingering scroll issues
    document.documentElement.style.overflowY = 'hidden';
    
    return () => {
      // Clean up on unmount
      document.body.classList.remove('casting-page');
      document.documentElement.style.overflowY = '';
      
      // Restore footer visibility when leaving the page
      if (footer) {
        footer.style.display = '';
      }
    };
  }, []);

  return <CastingPageComponent />;
}

export default CastingPage;