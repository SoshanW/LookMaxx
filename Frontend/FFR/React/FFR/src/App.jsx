import React, { useEffect, useState, useRef } from 'react';
import ImageSequence from './components/ImageSequence';
import ScrollText from './components/ScrollText';
import Navbar from './components/Navbar';
import CustomScrollbar from './components/CustomScrollbar';
import SectionIndicator from './components/SectionIndicator';
import DynamicScrollButton from './components/DynamicScrollButton';
import DesignCard from './components/DesignCard';
import UploadPhoto from './components/UploadPhoto';
import BlogCard from './components/BlogCard';
import LoginPrompt from './components/LoginPrompt';
import ReportGenerator from './components/ReportGenerator';
import './App.css';
import BottomNavBar from './components/BottomNavBar';

function App() {
  const [showDesignCard, setShowDesignCard] = useState(false);
  const [showUploadPhoto, setShowUploadPhoto] = useState(false);
  const [showBlogCard, setShowBlogCard] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('User');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const [isReportMinimized, setIsReportMinimized] = useState(() => {
    return localStorage.getItem('reportMinimized') === 'true';
  });
  // Check if there's an ongoing report generation from a previous session
  const [reportGeneratorActive, setReportGeneratorActive] = useState(() => {
    return localStorage.getItem('reportProgress') !== null;
  });
  const hasScrolled = useRef(false);
  const initialScrollLock = useRef(false);
  const bottomSectionRef = useRef(null);
  
  // Report generator settings
  const reportDuration = 60000; // 60 seconds (adjust as needed)

  // Handle login functions
  const handleLogin = () => {
    setIsLoggedIn(true);
    setUserName('Guest');
    setShowLoginPrompt(false);
    document.body.style.overflow = 'auto';
    initialScrollLock.current = false;
    hasScrolled.current = false;
    
    // Check for unfinished report after login
    checkForUnfinishedReport();
  };

  // Check if there's an unfinished report in localStorage
  const checkForUnfinishedReport = () => {
    const savedProgress = localStorage.getItem('reportProgress');
    const savedMinimized = localStorage.getItem('reportMinimized');
    
    if (savedProgress && parseFloat(savedProgress) < 100) {
      setShowReportGenerator(true);
      setIsReportMinimized(savedMinimized === 'true');
    }
  };

  // Close login prompt and go back to home
  const handleClosePrompt = () => {
    setShowLoginPrompt(false);
    window.scrollTo(0, 0);
    hasScrolled.current = false;
    document.body.style.overflow = 'auto';
  };

  // Handle starting report generation
  const handleStartReportGeneration = () => {
    setShowReportGenerator(true);
    setIsReportMinimized(false);
    // Hide upload photo component when report generator is active
    setShowUploadPhoto(false);
    // Scroll to top for better view of the report generator
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle closing report generator
  const handleCloseReportGenerator = () => {
    setShowReportGenerator(false);
    setIsReportMinimized(false);
  };

  // Handle minimizing/maximizing report generator
  const handleReportMinimizeChange = (isMinimized) => {
    setIsReportMinimized(isMinimized);
    
    // When maximizing from minimized state, scroll to top
    if (!isMinimized) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // When minimizing, allow the user to interact with the site
    if (isMinimized) {
      document.body.style.overflow = 'auto';
    } else {
      // When maximizing, you might want to prevent scrolling of the background
      // Uncomment if you want this behavior
      // document.body.style.overflow = 'hidden';
    }
  };

  // Check for unfinished report on initial load
  useEffect(() => {
    if (isLoggedIn) {
      checkForUnfinishedReport();
    }
  }, [isLoggedIn]);

  // Add a bottom section div as the final element
  useEffect(() => {
    // Create a bottom section element if it doesn't exist
    if (!document.getElementById('bottom-section')) {
      const bottomSection = document.createElement('div');
      bottomSection.id = 'bottom-section';
      bottomSection.style.height = '100vh';
      bottomSection.style.width = '100%';
      bottomSection.style.position = 'relative';
      document.body.appendChild(bottomSection);
      bottomSectionRef.current = bottomSection;
    }

    return () => {
      // Clean up the element on unmount
      if (bottomSectionRef.current) {
        document.body.removeChild(bottomSectionRef.current);
      }
    };
  }, []);

  // Handle scroll events
  useEffect(() => {
    window.scrollTo(0, 0);
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Reset scroll detection when logging out
    const resetScrollDetection = () => {
      hasScrolled.current = false;
      initialScrollLock.current = false;
      window.scrollTo(0, 0);
    };

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const viewportHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Check login restriction
      if (scrollPosition > 100 && !isLoggedIn && !hasScrolled.current) {
        setShowLoginPrompt(true);
        hasScrolled.current = true;
        
        if (!initialScrollLock.current) {
          initialScrollLock.current = true;
        }
      }

      // Update component visibility based on scroll position
      setShowBlogCard(scrollPosition > viewportHeight * 0.7 && scrollPosition < viewportHeight * 2.5);
      setShowDesignCard(scrollPosition > viewportHeight * 1.5);
      
      // Show UploadPhoto when at bottom section (only if the report generator is not active or it's minimized)
      if (!showReportGenerator || isReportMinimized) {
        const bottomSection = document.getElementById('bottom-section');
        let isInBottomSection = false;
        
        if (bottomSection) {
          const bottomSectionRect = bottomSection.getBoundingClientRect();
          isInBottomSection = bottomSectionRect.top < viewportHeight / 2;
        } else {
          // Fallback - check if near bottom of page
          const maxScroll = documentHeight - viewportHeight;
          isInBottomSection = scrollPosition >= maxScroll - 100;
        }
        
        // Only show upload photo if logged in OR at bottom section
        if (isLoggedIn) {
          setShowUploadPhoto(isInBottomSection);
        } else if (isInBottomSection) {
          // If not logged in but at bottom, show login prompt
          setShowLoginPrompt(true);
          hasScrolled.current = true;
        }
      }
    };

    // Reset scroll detection state when isLoggedIn changes to false
    if (!isLoggedIn) {
      resetScrollDetection();
    }

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resetScrollDetection', resetScrollDetection);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resetScrollDetection', resetScrollDetection);
    };
  }, [isLoggedIn, showReportGenerator, isReportMinimized]);

  return (
    <div className="app">
      <Navbar isLoggedIn={isLoggedIn} userName={userName} setIsLoggedIn={setIsLoggedIn} />
      
      <div className={`app-content ${(showLoginPrompt || (showReportGenerator && !isReportMinimized)) ? 'blur' : ''}`}>
        <main>
          <ImageSequence frameCount={225} imageFormat="jpg" />
          <ScrollText />
          
          {showBlogCard && <BlogCard isVisible={showBlogCard} />}
          {showDesignCard && <DesignCard isVisible={showDesignCard} />}
          {showUploadPhoto && (
            <UploadPhoto 
              isVisible={showUploadPhoto} 
              onStartReportGeneration={handleStartReportGeneration}
            />
          )}
        </main>
        
        <CustomScrollbar />
        <SectionIndicator />
        <DynamicScrollButton />
        <BottomNavBar />
      </div>

      {showLoginPrompt && <div className="login-background-overlay"></div>}

      <LoginPrompt 
        isOpen={showLoginPrompt} 
        onClose={handleClosePrompt}
        onLogin={handleLogin}
      />
      
      <ReportGenerator 
        isActive={showReportGenerator}
        duration={reportDuration} // Pass the duration in milliseconds
        onClose={handleCloseReportGenerator}
        onMinimize={handleReportMinimizeChange}
      />
    </div>
  );
}

export default App;