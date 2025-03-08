import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for routing
import '../styles/BottomNavBar.css';

const BottomNavBar = () => {
  const [isVisible, setIsVisible] = useState(true);

  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    setIsVisible(scrollPosition < 50); // Show when at the top, hide when scrolled down
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // External links handler
  const handleExternalLink = (url) => {
    window.open(url, '_blank'); // Opens in a new tab
  };

  return (
    <div className={`bottom-nav ${isVisible ? 'visible' : 'hidden'}`}>
      <span>© 2023 LookMaxx</span>
      <a href="/about" className="nav-item">About</a>
      <a href="/contact" className="nav-item">Contact</a>
    </div>
  );
};

export default BottomNavBar;