import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import '../../styles/ffr/Navbar.css';

/**
 * A reusable Navbar component that can be used across different projects
 * 
 * @param {Object} props
 * @param {boolean} props.isLoggedIn - Whether the user is logged in
 * @param {string} props.userName - The name of the logged in user
 * @param {Function} props.setIsLoggedIn - Function to update the login state
 * @param {boolean} props.requiresAuth - Whether the current page requires authentication
 * @param {Array} props.navLinks - Array of navigation links to display
 * @param {string} props.activeLink - The currently active link
 * @param {Function} props.setActiveLink - Function to update the active link
 * @param {Function} props.onPageRestricted - Called when a non-logged in user attempts to access a restricted area
 * @param {boolean} props.enableScrollDetection - Whether to enable scroll detection for login prompts
 */
const Navbar = ({ 
  isLoggedIn, 
  userName = 'User', 
  setIsLoggedIn,
  requiresAuth = false,
  navLinks = ['Home', 'FFR', 'Study', 'Casting', 'Retail', 'Community'],
  activeLink = 'home',
  setActiveLink = () => {},
  onPageRestricted = () => {},
  enableScrollDetection = false
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navLinksRef = useRef([]);
  const authRef = useRef(null);
  const dropdownRef = useRef(null);

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
      
      // If scroll detection is enabled and we're in a page that requires auth
      if (enableScrollDetection && requiresAuth && !isLoggedIn && scrollPosition > 100) {
        onPageRestricted();
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
  }, [enableScrollDetection, isLoggedIn, onPageRestricted, requiresAuth]);

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
    setIsLoggedIn(false);
    setDropdownOpen(false);
    // Scroll back to top when logging out
    window.scrollTo(0, 0);
    
    // Reset scroll detection state in the parent component
    // We need to add a slight delay to ensure the App component's useEffect 
    // has time to detect the logout state change
    setTimeout(() => {
      const resetEvent = new CustomEvent('resetScrollDetection');
      window.dispatchEvent(resetEvent);
    }, 100);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLinkClick = (linkName, e) => {
    e.preventDefault(); // Prevent default navigation
    setActiveLink(linkName.toLowerCase());
    
    // If this is a restricted page and user isn't logged in
    if (requiresAuth && !isLoggedIn) {
      onPageRestricted();
      return;
    }
    
    // Otherwise navigate or handle link click
    // In a real app with React Router, you would use navigate here
    // navigate(`/${linkName.toLowerCase()}`);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="nav-links">
          {navLinks.map((link) => (
            <a
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
              <a href="/login" className="btn btn-login" onClick={(e) => {
                e.preventDefault();
                handleLogin();
              }}>
                <span className="btn-text">Login</span>
              </a>
              <a href="/signup" className="btn btn-signup" onClick={(e) => {
                e.preventDefault();
                handleLogin();
              }}>
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