import React, { useEffect } from 'react';
import AnatomyExplorer from '../components/study-section/AnatomyExplorer';
import '../styles/study-section/study-section.css';

function StudyPage() {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Store original styles to restore them later
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyPadding = document.body.style.padding;
    const originalBodyMargin = document.body.style.margin;
    
    // Clear all body classes that might interfere
    document.body.classList.remove('signup-page', 'ffr-page', 'casting-page', 'application-form-page');
    
    // Apply study-specific styles
    document.body.classList.add('study-page');
    
    // Override any overflow restrictions that might be preventing scrolling
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    
    // Reset any padding/margin that might be causing layout issues
    document.body.style.padding = '0';
    document.body.style.margin = '0';
    
    // Hide footer in Study page
    const footer = document.querySelector('footer');
    if (footer) {
      footer.style.display = 'none';
    }
    
    console.log('Study page mounted');
    
    return () => {
      // Clean up when component unmounts
      document.body.classList.remove('study-page');
      
      // Restore original styles
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.padding = originalBodyPadding;
      document.body.style.margin = originalBodyMargin;
      
      // Restore footer when leaving Study page
      if (footer) {
        footer.style.display = '';
      }
      
      console.log('Study page unmounted');
    };
  }, []);

  return <AnatomyExplorer />;
}

export default StudyPage;