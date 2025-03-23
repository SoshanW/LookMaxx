import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './../../styles/common/Footer.css';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for dropdown open/closed status
  const [activeDropdowns, setActiveDropdowns] = useState({
    explore: false,
    company: false,
    support: false
  });

  // Toggle dropdown function
  const toggleDropdown = (dropdown) => {
    setActiveDropdowns(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown]
    }));
  };

  // Function to handle About Us click
  const handleAboutUsClick = (e) => {
    e.preventDefault();
    
    // If we're already on the homepage, scroll to the team section
    if (location.pathname === '/' || location.pathname === '/home') {
      const aboutUsElement = document.getElementById('about-us');
      if (aboutUsElement) {
        aboutUsElement.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If we're on a different page, navigate to homepage and then scroll after page loads
      navigate('/', { state: { scrollToAboutUs: true } });
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <h2>LookSci</h2>
          <p>Redefining beauty through science and technology</p>
        </div>
        
        <div className="footer-columns">
          {/* Explore dropdown */}
          <div className={`footer-dropdown ${activeDropdowns.explore ? 'active' : ''}`}>
            <div 
              className="footer-dropdown-header" 
              onClick={() => toggleDropdown('explore')}
            >
              <h3>Explore</h3>
              <div className="dropdown-icon"></div>
            </div>
            <div className="footer-dropdown-content">
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/ffr">FFR</Link></li>
                <li><Link to="/study">Study</Link></li>
                <li><Link to="/retail">Retail</Link></li>
              </ul>
            </div>
          </div>
          
          {/* Company dropdown */}
          <div className={`footer-dropdown ${activeDropdowns.company ? 'active' : ''}`}>
            <div 
              className="footer-dropdown-header" 
              onClick={() => toggleDropdown('company')}
            >
              <h3>Company</h3>
              <div className="dropdown-icon"></div>
            </div>
            <div className="footer-dropdown-content">
              <ul>
                <li><a href="#" onClick={handleAboutUsClick}>About Us</a></li>
                <li><Link to="/casting">Casting</Link></li>
                <li><Link to="/pricing">Pricing</Link></li>
                <li><Link to="/profile">Profile</Link></li>
              </ul>
            </div>
          </div>
          
          {/* Support dropdown */}
          <div className={`footer-dropdown ${activeDropdowns.support ? 'active' : ''}`}>
            <div 
              className="footer-dropdown-header" 
              onClick={() => toggleDropdown('support')}
            >
              <h3>Support</h3>
              <div className="dropdown-icon"></div>
            </div>
            <div className="footer-dropdown-content">
              <ul>
                <li><a href="#">FAQ</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          {/* Social section - always visible */}
          <div className="footer-social">
            <div className="footer-dropdown-header">
              <h3>Connect</h3>
            </div>
            <div className="social-icons">
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-facebook"></i></a>
              <a href="#"><i className="fab fa-linkedin"></i></a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} LookSci. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;