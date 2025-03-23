import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import gsap from 'gsap';
import '../../styles/ffr/DynamicScrollButton.css';

const DynamicScrollButton = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const buttonRef = useRef(null);
  const isFirstScroll = useRef(true);

  useEffect(() => {
    // Faster initial animation
    gsap.fromTo(buttonRef.current,
      {
        y: 100,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.4,
        delay: 0.2, 
        ease: "power2.out"
      }
    );

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (isFirstScroll.current && scrollPosition > 0) {
        isFirstScroll.current = false;
      }
      setIsScrolled(scrollPosition > window.innerHeight * 0.02);
    };

    // Initial check
    handleScroll();
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
      ref={buttonRef}
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