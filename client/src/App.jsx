import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuthContext } from './context/AuthProvider';
import { ReportGeneratorProvider } from './context/ReportGeneratorContext';
import { getCookie } from './utils/cookies';
import { Helmet } from 'react-helmet';

// Common components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import './styles/navbar-fix.css';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import FfrPage from './pages/FfrPage';
import SignupPage from './pages/SignupPage';
import FaceModelPage from './pages/FaceModelPage';
import CastingPage from './pages/CastingPage';
import CastingApplicationPage from './pages/CastingApplicationPage';
import StudyPage from './pages/StudyPage';
import ProfilePage from './pages/ProfilePage';
import PricingPage from './pages/PricingPage';
import CommunityPage from './pages/CommunityPage'; // Keeping CommunityPage
import RetailPage from './pages/RetailPage'; // Keeping RetailPage

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
    location.pathname === '/ffr' ||
    location.pathname === '/profile' ||
    location.pathname === '/pricing' ||
    location.pathname === '/community' || // Keeping CommunityPage condition
    location.pathname === '/home';

  // Define navigation links based on current route
  const [navLinks, setNavLinks] = useState(['Home', 'FFR', 'Study', 'Casting', 'Retail', 'Community']);
  
  // Determine if navbar should use scroll detection based on route
  const [enableScrollDetection, setEnableScrollDetection] = useState(false);

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
    
    // Manually invalidate and recalculate ScrollTrigger on route change
    if (location.pathname === '/' || location.pathname === '/ffr') {
      if (window.ScrollTrigger) {
        const allTriggers = window.ScrollTrigger.getAll();
        allTriggers.forEach(trigger => trigger.kill());
      }
      
      setTimeout(() => {
        if (window.ScrollTrigger) {
          window.ScrollTrigger.refresh(true);
          window.dispatchEvent(new Event('resize'));
        }
      }, 300);
    }
    
    window.dispatchEvent(new Event('resize'));
    
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
      'retail-page', // Keeping retail-page
      'community-page' // Keeping community-page
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
    } else if (location.pathname.includes('/community')) {
      document.body.classList.add('community-page');
      document.body.style.overflow = 'auto';
    } else {
      document.body.classList.add('ffr-page');
      document.body.style.overflow = 'auto';
      document.body.style.overflowX = 'hidden';
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.overflowX = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [location.pathname]);

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
       <Helmet>
        <link rel="icon" href="/logo.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#5a67d8" />
        <meta name="theme-color" content="#5a67d8" />
      </Helmet>
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
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/ffr" element={<FfrPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/face-model" element={<FaceModelPage />} />
        <Route path="/casting" element={<CastingPage />} />
        <Route path="/apply" element={<ProtectedRoute><CastingApplicationPage /></ProtectedRoute>} />
        <Route path="/study" element={<StudyPage />} />
        <Route path="/retail" element={<RetailPage />} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/payment-notify" element={<PaymentNotifyPage />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      </div>
      {!hideFooter && <Footer />}
    </ReportGeneratorProvider>
  );
}

export default App;
