import React, { useState, useEffect } from 'react';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (linkName) => (e) => {
    e.preventDefault();
    setActiveLink(linkName);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-links">
        <a 
          href="#home" 
          className={`nav-link ${activeLink === 'home' ? 'active' : ''}`}
          onClick={handleLinkClick('home')}
        >
          Home
        </a>
        <a 
          href="#retail" 
          className={`nav-link ${activeLink === 'retail' ? 'active' : ''}`}
          onClick={handleLinkClick('retail')}
        >
          Retail
        </a>
        <a 
          href="#community" 
          className={`nav-link ${activeLink === 'community' ? 'active' : ''}`}
          onClick={handleLinkClick('community')}
        >
          Community
        </a>
        <a 
          href="#study" 
          className={`nav-link ${activeLink === 'study' ? 'active' : ''}`}
          onClick={handleLinkClick('study')}
        >
          Study
        </a>
        <a 
          href="#about" 
          className={`nav-link ${activeLink === 'about' ? 'active' : ''}`}
          onClick={handleLinkClick('about')}
        >
          About
        </a>
        <a 
          href="#ffr" 
          className={`nav-link ${activeLink === 'ffr' ? 'active' : ''}`}
          onClick={handleLinkClick('ffr')}
        >
          FFR
        </a>
      </div>
    </nav>
  );
};

export default Navbar;