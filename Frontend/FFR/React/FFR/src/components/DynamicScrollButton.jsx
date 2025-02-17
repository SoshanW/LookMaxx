import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import '../styles/DynamicScrollButton.css';

const DynamicScrollButton = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      setIsScrolled(scrollPosition > windowHeight * 0.5);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`dynamic-scroll-button ${isScrolled ? 'circular' : 'tall'}`}
    >
      {isScrolled ? (
        <ArrowUp className="arrow-icon" />
      ) : (
        <span className="button-text">
          LookMaxx
        </span>
      )}
    </button>
  );
};

export default DynamicScrollButton;