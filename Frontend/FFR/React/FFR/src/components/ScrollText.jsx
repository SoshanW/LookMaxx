import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import '../styles/ScrollText.css';

const ScrollText = () => {
  const headingRef = useRef(null);
  const subheadingRef = useRef(null);
  const buttonRef = useRef(null);
  const cornerTextRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

  const handleScroll = () => {
    const viewportHeight = window.innerHeight;
    const scrollPosition = window.scrollY;
    // Changed from 0.2 to 0.05 - now triggers after scrolling just 5% of viewport height
    const fadeThreshold = viewportHeight * 0.5;
    const isInHeroSection = scrollPosition <= fadeThreshold;
    setIsVisible(isInHeroSection);
  };

  useEffect(() => {
    // Initial animations
    gsap.fromTo(
      [headingRef.current, subheadingRef.current, buttonRef.current],
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1.5,
        stagger: 0.3
      }
    );

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isVisible) {
      // Fade out main content faster
      gsap.to([headingRef.current, subheadingRef.current, buttonRef.current], {
        opacity: 0,
        y: -30,
        duration: 0.3, // Slightly faster animation
        stagger: 0.05, // Reduced stagger time
        ease: "power2.inOut"
      });
      
      // Slide out corner text
      cornerTextRef.current.classList.add('slide-out');
    } else {
      // Fade in main content
      gsap.to([headingRef.current, subheadingRef.current, buttonRef.current], {
        opacity: 1,
        y: 0,
        duration: 0.3,
        stagger: 0.05,
        ease: "power2.inOut"
      });
      
      // Slide in corner text
      cornerTextRef.current.classList.remove('slide-out');
    }
  }, [isVisible]);

  return (
    <div className="scroll-text-container">
      <div ref={headingRef} className="scroll-text heading">
        Facial Feature Recognition
      </div>
      <div ref={subheadingRef} className="scroll-text subheading">
        Get your face scanned. Dive into FFR.
      </div>
      <button 
        ref={buttonRef} 
        className="get-started-button"
        onClick={() => console.log('Get Started clicked')}
      >
        Get Started
      </button>
      <div ref={cornerTextRef} className="corner-text">
        FFR
      </div>
    </div>
  );
};

export default ScrollText;