import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('study');
  const navLinksRef = useRef([]);

  useEffect(() => {
    // Set initial state
    gsap.set(navLinksRef.current, {
      opacity: 0,
      y: -20
    });

    // Create entrance animation
    gsap.to(navLinksRef.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      stagger: 0.1,
      delay: 0.1, // Start slightly before the main content
      ease: "power3.out"
    });

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

  // Add links to ref array
  const addToRefs = (el) => {
    if (el && !navLinksRef.current.includes(el)) {
      navLinksRef.current.push(el);
    }
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-links">
        {['Home', 'Retail', 'Community', 'Study', 'About', 'FFR'].map((link, index) => (
          <a
            key={link.toLowerCase()}
            ref={addToRefs}
            href={`#${link.toLowerCase()}`}
            className={`nav-link ${activeLink === link.toLowerCase() ? 'active' : ''}`}
            onClick={handleLinkClick(link.toLowerCase())}
          >
            {link}
          </a>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;