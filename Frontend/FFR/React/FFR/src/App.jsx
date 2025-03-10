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
import './App.css';
import BottomNavBar from './components/BottomNavBar';

function App() {
  const [showDesignCard, setShowDesignCard] = useState(false);
  const [showUploadPhoto, setShowUploadPhoto] = useState(false);
  const [showBlogCard, setShowBlogCard] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('User');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const hasScrolled = useRef(false);
  const initialScrollLock = useRef(false);
  const bottomSectionRef = useRef(null);

  // Handle login functions
  const handleLogin = () => {
    setIsLoggedIn(true);
    setUserName('Guest');
    setShowLoginPrompt(false);
    document.body.style.overflow = 'auto';
    initialScrollLock.current = false;
    hasScrolled.current = false;
  };

  // Close login prompt and go back to home
  const handleClosePrompt = () => {
    setShowLoginPrompt(false);
    window.scrollTo(0, 0);
    hasScrolled.current = false;
    document.body.style.overflow = 'auto';
  };

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
      
      // Show UploadPhoto only at the very bottom
      if (isLoggedIn) {
        // Calculate if user is at the bottom of the page
        // We check if they've scrolled to within 10px of the maximum possible scroll position
        const maxScroll = documentHeight - viewportHeight;
        const isAtBottom = scrollPosition >= maxScroll - 100;
        
        // Or if they're in the last section
        const bottomSection = document.getElementById('bottom-section');
        let isInBottomSection = false;
        
        if (bottomSection) {
          const bottomSectionRect = bottomSection.getBoundingClientRect();
          isInBottomSection = bottomSectionRect.top < viewportHeight;
        }
        
        setShowUploadPhoto(isAtBottom || isInBottomSection);
      } else {
        setShowUploadPhoto(false);
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
  }, [isLoggedIn]);

  return (
    <div className="app">
      <Navbar isLoggedIn={isLoggedIn} userName={userName} setIsLoggedIn={setIsLoggedIn} />
      
      <div className={`app-content ${showLoginPrompt ? 'blur' : ''}`}>
        <main>
          <ImageSequence frameCount={225} imageFormat="jpg" />
          <ScrollText />
          
          {showBlogCard && <BlogCard isVisible={showBlogCard} />}
          {showDesignCard && <DesignCard isVisible={showDesignCard} />}
          {showUploadPhoto && <UploadPhoto isVisible={showUploadPhoto} />}
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
    </div>
  );
}

export default App;