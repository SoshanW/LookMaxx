// src/App.jsx - Updated to include the casting routes
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
  
  // Check if we're on the signup or face-model pages
  const hideNavbar = location.pathname.includes('/signup') || location.pathname.includes('/face-model');
  
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
  
  useEffect(() => {
    // Enable scroll detection only on FFR page
    if (location.pathname === '/' || location.pathname === '/ffr') {
      setEnableScrollDetection(true);
    } else {
      setEnableScrollDetection(false);
    }
    
    // Clean up any existing body classes first
    document.body.classList.remove('ffr-page', 'signup-page', 'casting-page');
    
    // Apply specific body classes based on route
    if (location.pathname.includes('/signup') || location.pathname.includes('/face-model')) {
      document.body.classList.add('signup-page');
    } else if (location.pathname.includes('/casting') || location.pathname.includes('/apply')) {
      document.body.classList.add('casting-page');
    } else {
      document.body.classList.add('ffr-page');
    }
    
    // Cleanup on unmount
    return () => {
      // We'll leave this empty since we don't want to remove classes
      // until another route is loaded
    };
  }, [location.pathname]);

  // Update navLinks active state based on current path
  useEffect(() => {
    // Set the active navigation link based on the current path
    const path = location.pathname.split('/')[1]; // Get the first part of the path
    const newNavLinks = navLinks.map(link => ({
      name: link,
      active: link.toLowerCase() === (path || 'home')
    }));
    
    if (JSON.stringify(newNavLinks) !== JSON.stringify(navLinks)) {
      setNavLinks(newNavLinks);
    }
  }, [location.pathname]);

  // Determine whether to show the footer
  const showFooter = !location.pathname.includes('/signup') && 
                    !location.pathname.includes('/face-model');

  return (
    <>
      {/* Only show navbar if not on signup or face-model pages */}
      {!hideNavbar && (
        <Navbar 
          isLoggedIn={isLoggedIn}
          userName={userName}
          setIsLoggedIn={logout}
          navLinks={navLinks.map(link => typeof link === 'object' ? link.name : link)}
          enableScrollDetection={enableScrollDetection}
          key={`navbar-${isLoggedIn}-${forceUpdate}`} // Force re-render when auth state changes
        />
      )}
      
      <div className="app-container">
        <Routes>
          {/* Main routes */}
          <Route path="/" element={<FfrPage key={`ffr-page-${isLoggedIn}-${forceUpdate}`} />} />
          <Route path="/ffr" element={<FfrPage key={`ffr-page-${isLoggedIn}-${forceUpdate}`} />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/face-model" element={<FaceModelPage />} />
          
          {/* Casting routes */}
          <Route path="/casting" element={<CastingPage />} />
          <Route path="/apply" element={<CastingApplicationPage />} />
          
          {/* Add additional routes for other pages here */}
          
          {/* Fallback route - redirect to home */}
          <Route path="*" element={<FfrPage />} />
        </Routes>
      </div>

      {/* Only show footer on appropriate pages */}
      {showFooter && <Footer />}
    </>
  );
}

export default App;