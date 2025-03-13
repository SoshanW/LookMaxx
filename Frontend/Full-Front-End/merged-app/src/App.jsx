import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuthContext } from './context/AuthProvider';

// Common components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Pages
import FfrPage from './pages/FfrPage';
import SignupPage from './pages/SignupPage';
import FaceModelPage from './pages/FaceModelPage';
import CastingPage from './pages/CastingPage';
import CastingApplicationPage from './pages/CastingApplicationPage';

// Import global styles
import './styles/global.css';

function App() {
  const { isLoggedIn, userName, logout } = useAuthContext();
  const location = useLocation();
  
  // Check if we're on the signup, face-model, or casting pages
  const hideNavbar = 
    location.pathname.includes('/signup') || 
    location.pathname.includes('/face-model');
  
  // Check if we should hide footer
  const hideFooter = 
    location.pathname.includes('/signup') || 
    location.pathname.includes('/face-model') || 
    location.pathname.includes('/casting') ||
    location.pathname === '/' ||
    location.pathname === '/ffr';
  
  // Define navigation links based on current route
  const [navLinks, setNavLinks] = useState(['Home', 'FFR', 'Study', 'Casting', 'Retail', 'Community']);
  
  // Determine if navbar should use scroll detection based on route
  const [enableScrollDetection, setEnableScrollDetection] = useState(false);

  // Force UI update when auth state changes
  const [forceUpdate, setForceUpdate] = useState(0);

  // Initialize auth state on app load
  useEffect(() => {
    // Check if user should be logged in
    const savedLoginState = localStorage.getItem('isLoggedIn');
    const hasToken = localStorage.getItem('access_token') !== null;
    const savedUserName = localStorage.getItem('userName');
    
    // If there's evidence of a logged in state but context doesn't show it,
    // force a refresh of the app to ensure state is loaded
    if ((savedLoginState === 'true' || hasToken) && !isLoggedIn && savedUserName) {
      // Instead of hard refresh, trigger a state update to re-render
      setForceUpdate(prev => prev + 1);
    }
  }, [isLoggedIn]);
  
  // Listen for auth state changes
  useEffect(() => {
    const handleAuthChange = () => {
      // Force a re-render by updating the state
      setForceUpdate(prev => prev + 1);
    };
    
    window.addEventListener('authStateChanged', handleAuthChange);
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);
  
  // Fix for tab switching issues and page-specific styles
  useEffect(() => {
    // Force re-render of components when location changes
    const cleanupFunctions = [];
    
    // Clear any lingering timeouts or intervals
    const clearTimeoutsAndIntervals = () => {
      // Force GSAP to recalculate scroll positions
      if (window.ScrollTrigger) {
        setTimeout(() => {
          window.ScrollTrigger.refresh();
        }, 100);
      }
      
      // Dispatch resize event to force recalculation of component dimensions
      window.dispatchEvent(new Event('resize'));
    };
    
    // Run cleanup when location changes
    clearTimeoutsAndIntervals();
    
    // Save cleanup function
    cleanupFunctions.push(clearTimeoutsAndIntervals);
    
    // Enable scroll detection only on FFR page
    if (location.pathname === '/' || location.pathname === '/ffr') {
      setEnableScrollDetection(true);
    } else {
      setEnableScrollDetection(false);
    }
    
    // Special handling for the casting page's footer
    const handleCastingPage = () => {
      const isCastingPage = location.pathname.includes('/casting');
      const footer = document.querySelector('footer');
      
      // Hide footer on casting page
      if (isCastingPage && footer) {
        footer.style.display = 'none';
      }
      
      // Clean up function
      return () => {
        if (isCastingPage && footer) {
          footer.style.display = '';
        }
      };
    };
    
    // Run the casting page handler and store its cleanup function
    const castingCleanup = handleCastingPage();
    cleanupFunctions.push(castingCleanup);
    
    // Clean up any existing body classes first
    document.body.classList.remove('ffr-page', 'signup-page', 'casting-page');
    
    // Apply specific body classes based on route
    if (location.pathname.includes('/signup') || location.pathname.includes('/face-model')) {
      document.body.classList.add('signup-page');
    } else if (location.pathname.includes('/casting') || location.pathname.includes('/apply')) {
      document.body.classList.add('casting-page');
      // Special handling for casting page overflow
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.add('ffr-page');
      // Reset overflow for other pages
      document.body.style.overflow = '';
    }
    
    // Reset scroll position on page navigation (except for casting page)
    if (!location.pathname.includes('/casting')) {
      window.scrollTo(0, 0);
    }
    
    return () => {
      // Run all cleanup functions
      cleanupFunctions.forEach(fn => fn());
      // Always reset overflow style on unmount
      document.body.style.overflow = '';
    };
  }, [location.pathname]);

  // Update navLinks active state based on current path
  useEffect(() => {
    // Set the active navigation link based on the current path
    const path = location.pathname.split('/')[1] || 'home'; // Get the first part of the path
    
    // Create array of standardized link objects
    const linkObjects = navLinks.map(link => {
      const linkName = typeof link === 'object' ? link.name : link;
      return {
        name: linkName,
        active: linkName.toLowerCase() === path || 
               (linkName.toLowerCase() === 'casting' && path === 'apply') ||
               (linkName.toLowerCase() === 'home' && path === '')
      };
    });
    
    // Only update if there's a change to prevent infinite loop
    const currentActiveIndex = linkObjects.findIndex(link => link.active);
    const previousActiveIndex = navLinks.findIndex(link => {
      if (typeof link === 'object') return link.active;
      return false;
    });
    
    if (currentActiveIndex !== previousActiveIndex) {
      setNavLinks(linkObjects);
    }
  }, [location.pathname]);

  return (
    <>
      {/* Only show navbar if not on special pages */}
      {!hideNavbar && (
        <Navbar 
          isLoggedIn={isLoggedIn}
          userName={userName}
          setIsLoggedIn={logout}
          navLinks={navLinks}
          enableScrollDetection={enableScrollDetection}
          key={`navbar-${isLoggedIn}-${forceUpdate}-${location.pathname}`} // Force re-render when auth state or location changes
        />
      )}
      
      <div className="app-container">
        <Routes>
          {/* Main routes - key prop forces re-render when changes occur */}
          <Route path="/" element={<FfrPage key={`ffr-page-${isLoggedIn}-${forceUpdate}-${location.pathname}`} />} />
          <Route path="/ffr" element={<FfrPage key={`ffr-page-${isLoggedIn}-${forceUpdate}-${location.pathname}`} />} />
          <Route path="/signup" element={<SignupPage key={`signup-page-${location.pathname}`} />} />
          <Route path="/face-model" element={<FaceModelPage key={`face-model-${location.pathname}`} />} />
          
          {/* Casting routes */}
          <Route path="/casting" element={<CastingPage key={`casting-page-${location.pathname}`} />} />
          <Route path="/apply" element={<CastingApplicationPage key={`apply-page-${location.pathname}`} />} />
          
          {/* Add additional routes for other pages here */}
          
          {/* Fallback route - redirect to home */}
          <Route path="*" element={<FfrPage key={`ffr-page-fallback-${location.pathname}`} />} />
        </Routes>
      </div>

      {/* Only show footer on appropriate pages */}
      {!hideFooter && <Footer />}
    </>
  );
}

export default App;