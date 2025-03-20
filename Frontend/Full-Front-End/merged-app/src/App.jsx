import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuthContext } from './context/AuthProvider';
import { ReportGeneratorProvider } from './context/ReportGeneratorContext';
import { getCookie } from './utils/cookies';

// Common components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import './styles/navbar-fix.css';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import FfrPage from './pages/FfrPage';
import SignupPage from './pages/SignupPage';
import FaceModelPage from './pages/FaceModelPage';
import CastingPage from './pages/CastingPage';
import CastingApplicationPage from './pages/CastingApplicationPage';
import StudyPage from './pages/StudyPage';
import ProfilePage from './pages/ProfilePage';
import PricingPage from './pages/PricingPage';
import RetailPage from './pages/RetailPage';

// Payment related pages
import PaymentNotifyPage from './pages/PaymentNotifyPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';

// Import global styles
import './styles/global.css';
import './styles/pricing/pricing-page.css';

// Import retail styles
import './styles/retail/Hero.css';
import './styles/retail/Slider.css';
import './styles/retail/fiton.css';

function App() {
  const { isLoggedIn, userName, userEmail, userProfilePicture, logout, isAuthReady } = useAuthContext();
  const location = useLocation();
  
  // Check if we're on pages where navbar should be hidden
  const hideNavbar = 
    location.pathname.includes('/signup') || 
    location.pathname.includes('/face-model') ||
    location.pathname.includes('/profile') ||
    location.pathname.includes('/pricing');
  
  // Check if we should hide footer
  const hideFooter = 
    location.pathname.includes('/signup') || 
    location.pathname.includes('/face-model') || 
    location.pathname.includes('/casting') ||
    location.pathname === '/' ||
    location.pathname === '/ffr' ||
    location.pathname === '/study' ||
    location.pathname === '/profile' ||
    location.pathname === '/retail' ||
    location.pathname === '/pricing';
  
  // Define navigation links based on current route
  const [navLinks, setNavLinks] = useState(['Home', 'FFR', 'Study', 'Casting', 'Retail', 'Community']);
  
  // Determine if navbar should use scroll detection based on route
  const [enableScrollDetection, setEnableScrollDetection] = useState(false);

  // Fix for tab switching issues and page-specific styles
  useEffect(() => {
    // Reset scroll position on page navigation (except for casting page)
    if (!location.pathname.includes('/casting') || location.pathname.includes('/apply')) {
      window.scrollTo(0, 0);
    }
    
    // Force GSAP to recalculate scroll positions
    if (window.ScrollTrigger) {
      setTimeout(() => {
        window.ScrollTrigger.refresh();
      }, 100);
    }
    
    // Dispatch resize event
    window.dispatchEvent(new Event('resize'));
    
    // Enable scroll detection only on FFR page
    setEnableScrollDetection(location.pathname === '/' || location.pathname === '/ffr');
    
    // Clean up any existing body classes
    document.body.classList.remove(
      'ffr-page', 
      'signup-page', 
      'casting-page', 
      'application-form-page', 
      'study-page', 
      'profile-page', 
      'pricing-page',
      'retail-page'
    );
    
    // Apply specific body classes based on route
    if (location.pathname.includes('/signup') || location.pathname.includes('/face-model')) {
      document.body.classList.add('signup-page');
    } else if (location.pathname.includes('/casting') && !location.pathname.includes('/apply')) {
      document.body.classList.add('casting-page');
      document.body.style.overflow = 'hidden';
    } else if (location.pathname.includes('/apply')) {
      document.body.classList.add('application-form-page');
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
    } else if (location.pathname.includes('/study')) {
      document.body.classList.add('study-page');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else if (location.pathname.includes('/retail')) {
      document.body.classList.add('retail-page');
      document.body.style.overflow = 'auto';
    } else if (location.pathname.includes('/profile')) {
      document.body.classList.add('profile-page');
      document.body.style.overflow = 'auto';
    } else if (location.pathname.includes('/pricing')) {
      document.body.classList.add('pricing-page');
      document.body.style.overflow = 'auto';
    } else {
      document.body.classList.add('ffr-page');
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [location.pathname]);

  // Update navLinks active state based on current path
  useEffect(() => {
    const path = location.pathname.split('/')[1] || 'home';
    
    const linkObjects = navLinks.map(link => {
      const linkName = typeof link === 'object' ? link.name : link;
      return {
        name: linkName,
        active: linkName.toLowerCase() === path || 
              (linkName.toLowerCase() === 'casting' && path === 'apply') ||
              (linkName.toLowerCase() === 'home' && path === '')
      };
    });
    
    const currentActiveIndex = linkObjects.findIndex(link => link.active);
    const previousActiveIndex = navLinks.findIndex(link => {
      if (typeof link === 'object') return link.active;
      return false;
    });
    
    if (currentActiveIndex !== previousActiveIndex) {
      setNavLinks(linkObjects);
    }
  }, [location.pathname, navLinks]);

  // Loading state while authentication is being determined
  if (!isAuthReady) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <ReportGeneratorProvider>
      {!hideNavbar && (
        <Navbar 
          isLoggedIn={isLoggedIn}
          userName={userName}
          userEmail={userEmail}
          userProfilePicture={userProfilePicture}
          setIsLoggedIn={logout}
          navLinks={navLinks}
          enableScrollDetection={enableScrollDetection}
        />
      )}
      <div className="app-container">
      <Routes>
        <Route path="/" element={<FfrPage />} />
        <Route path="/ffr" element={<FfrPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/face-model" element={<FaceModelPage />} />
        <Route path="/casting" element={<CastingPage />} />
        <Route path="/apply" element={
          <ProtectedRoute>
            <CastingApplicationPage />
          </ProtectedRoute>
        } />
        <Route path="/study" element={<StudyPage />} />
        <Route path="/retail" element={<RetailPage />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/pricing" element={<PricingPage />} />
        
        {/* Payment related routes */}
        <Route path="/payment-notify" element={<PaymentNotifyPage />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        
        {/* ADDED: Catch-all route to handle 404 issues */}
        <Route path="*" element={<FfrPage />} />
      </Routes>
      </div>

      {!hideFooter && <Footer />}
    </ReportGeneratorProvider>
  );
}

export default App;