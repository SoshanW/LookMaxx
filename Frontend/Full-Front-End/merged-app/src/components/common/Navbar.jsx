import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import '../../styles/common/Navbar.css';

/**
 * A reusable Navbar component that can be used across different parts of the app
 */
const Navbar = ({ 
  isLoggedIn, 
  userName = 'User', 
  setIsLoggedIn,
  navLinks = ['Home', 'FFR', 'Study', 'Casting', 'Retail', 'Community'],
  enableScrollDetection = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navLinksRef = useRef([]);
  const authRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // Determine active link based on current path
  const [activeLink, setActiveLink] = useState(() => {
    const path = location.pathname.substring(1); // remove leading slash
    if (path === '') return 'home';
    if (path.startsWith('signup') || path.startsWith('face-model')) return '';
    return path.toLowerCase();
  });

  useEffect(() => {
    // Update active link when location changes
    const path = location.pathname.substring(1);
    if (path === '') setActiveLink('home');
    else if (path.startsWith('signup') || path.startsWith('face-model')) setActiveLink('');
    else setActiveLink(path.toLowerCase());
  }, [location]);

  useEffect(() => {
    // Animate nav links on mount
    gsap.set(navLinksRef.current, {
      opacity: 0,
      y: -20
    });

    gsap.to(navLinksRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.07,
      delay: 0.2,
      ease: "power2.out"
    });
    
    // Animate auth buttons/profile icon
    gsap.set(authRef.current, {
      opacity: 0,
      scale: 0.8,
      y: -15
    });
    
    gsap.to(authRef.current, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.6,
      delay: 0.8,
      ease: "back.out(1.7)"
    });

    // Handle scroll detection
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 30);
      
      // If scroll detection is enabled and user is not logged in
      if (enableScrollDetection && !isLoggedIn && scrollPosition > 100) {
        // Instead of navigating, dispatch a custom event
        const promptEvent = new CustomEvent('showLoginPrompt');
        window.dispatchEvent(promptEvent);
      }
    };

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [enableScrollDetection, isLoggedIn]);

  const addToRefs = (el) => {
    if (el && !navLinksRef.current.includes(el)) {
      navLinksRef.current.push(el);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    // Update login status to false
    if (setIsLoggedIn) setIsLoggedIn(false);
    setDropdownOpen(false);
    // Scroll back to top when logging out
    window.scrollTo(0, 0);
    
    // Reset scroll detection state
    setTimeout(() => {
      const resetEvent = new CustomEvent('resetScrollDetection');
      window.dispatchEvent(resetEvent);
    }, 100);
  };

  const handleLinkClick = (linkName, e) => {
    e.preventDefault(); // Prevent default navigation
    const lowercaseLink = linkName.toLowerCase();
    setActiveLink(lowercaseLink);
    
    // Handle navigation based on link name
    if (lowercaseLink === 'home') {
      navigate('/');
    } else if (lowercaseLink === 'ffr') {
      navigate('/ffr');
    } else if (lowercaseLink === 'signup' || lowercaseLink === 'login') {
      navigate('/signup');
    } else {
      navigate(`/${lowercaseLink}`);
    }
  };

  const handleLoginSignup = (type) => {
    navigate('/signup', { state: { activeTab: type === 'login' ? 'login' : 'signup' } });
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="nav-links">
          {navLinks.map((link) => (
            <a  // This opening <a> tag was missing
              key={link.toLowerCase()}
              ref={addToRefs}
              href={`/${link.toLowerCase()}`}
              className={`nav-link ${activeLink === link.toLowerCase() ? 'active' : ''}`}
              onClick={(e) => handleLinkClick(link, e)}
            >
              {link}
            </a>
          ))}
        </div>
        
        <div className="auth-section" ref={authRef}>
          {isLoggedIn ? (
            <div className="profile-dropdown" ref={dropdownRef}>
              <div className="user-avatar" onClick={toggleDropdown}>
                <span className="avatar-initials">{userName.charAt(0)}</span>
                <div className="avatar-pulse"></div>
              </div>
              
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <span className="user-name">{userName}</span>
                    <span className="user-email">user@example.com</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <a href="/profile" className="dropdown-item">
                    <i className="icon profile-icon"></i>
                    Profile
                  </a>
                  <a href="/settings" className="dropdown-item">
                    <i className="icon settings-icon"></i>
                    Settings
                  </a>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout-btn">
                    <i className="icon logout-icon"></i>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <a 
                href="/signup" 
                className="btn btn-login" 
                onClick={(e) => {
                  e.preventDefault();
                  handleLoginSignup('login');
                }}
              >
                <span className="btn-text">Login</span>
              </a>
              <a 
                href="/signup" 
                className="btn btn-signup" 
                onClick={(e) => {
                  e.preventDefault();
                  handleLoginSignup('signup');
                }}
              >
                <span className="btn-text">Sign Up</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;