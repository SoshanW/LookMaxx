import React, { useEffect, useState } from 'react';
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

  return (
    <div className={`bottom-nav ${isVisible ? 'visible' : 'hidden'}`}>
      <span>© 2023 LookMaxx</span>
      <span>About</span>
      <span>Contact</span>
    </div>
  );
};

export default BottomNavBar;