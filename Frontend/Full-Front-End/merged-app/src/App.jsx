import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuthContext } from './context/AuthProvider';

// Common components
import Navbar from './components/common/Navbar';

// Pages
import FfrPage from './pages/FfrPage';
import SignupPage from './pages/SignupPage';
import FaceModelPage from './pages/FaceModelPage';

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

  // Initialize auth state on app load
  useEffect(() => {
    // Check if user should be logged in
    const savedLoginState = localStorage.getItem('isLoggedIn');
    const hasToken = localStorage.getItem('access_token') !== null;
    const savedUserName = localStorage.getItem('userName');
    
    // If there's evidence of a logged in state but context doesn't show it,
    // force a refresh of the app to ensure state is loaded
    if ((savedLoginState === 'true' || hasToken) && !isLoggedIn && savedUserName) {
      window.location.reload();
    }
  }, [isLoggedIn]);
  
  useEffect(() => {
    // Enable scroll detection only on FFR page
    if (location.pathname === '/' || location.pathname === '/ffr') {
      setEnableScrollDetection(true);
    } else {
      setEnableScrollDetection(false);
    }
    
    // Clean up any existing body classes first
    document.body.classList.remove('ffr-page', 'signup-page');
    
    // Apply specific body classes based on route
    if (location.pathname.includes('/signup') || location.pathname.includes('/face-model')) {
      document.body.classList.add('signup-page');
    } else {
      document.body.classList.add('ffr-page');
    }
    
    // Cleanup on unmount
    return () => {
      // We'll leave this empty since we don't want to remove classes
      // until another route is loaded
    };
  }, [location.pathname]);

  return (
    <>
      {/* Only show navbar if not on signup or face-model pages */}
      {!hideNavbar && (
        <Navbar 
          isLoggedIn={isLoggedIn}
          userName={userName}
          setIsLoggedIn={logout}
          navLinks={navLinks}
          enableScrollDetection={enableScrollDetection}
        />
      )}
      
      <div className="app-container">
        <Routes>
          {/* Main routes */}
          <Route path="/" element={<FfrPage />} />
          <Route path="/ffr" element={<FfrPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/face-model" element={<FaceModelPage />} />
          
          {/* Add additional routes for other pages here */}
          
          {/* Fallback route - redirect to home */}
          <Route path="*" element={<FfrPage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;