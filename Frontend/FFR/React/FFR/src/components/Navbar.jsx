import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import '../styles/Navbar.css';

const Navbar = ({ isLoggedIn, userName, setIsLoggedIn }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('home');
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
  }, []);

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

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="nav-links">
          {['Home', 'Retail', 'Community', 'Study', 'About', 'FFR'].map((link) => (
            <a
              key={link.toLowerCase()}
              ref={addToRefs}
              href={`/${link.toLowerCase()}`}
              className={`nav-link ${activeLink === link.toLowerCase() ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault(); // Prevent navigation for now
                setActiveLink(link.toLowerCase());
                // Will be linked to other React projects later
              }}
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