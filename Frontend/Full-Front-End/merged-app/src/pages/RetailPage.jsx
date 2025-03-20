import React, { useEffect } from 'react';
import RetailPageContent from '../components/retail/RetailPage';

function RetailPage() {
  // Apply retail-specific styles and ensure proper page setup
  useEffect(() => {
    // Apply retail-page class to body
    document.body.classList.add('retail-page');
    
    // Reset scroll position
    window.scrollTo(0, 0);
    
    // Ensure proper scrolling
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    
    // Clean up on unmount
    return () => {
      document.body.classList.remove('retail-page');
    };
  }, []);

  return <RetailPageContent />;
}

export default RetailPage;