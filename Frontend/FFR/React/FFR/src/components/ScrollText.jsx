// ScrollText.jsx
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import '../styles/ScrollText.css';

const ScrollText = () => {
  const headingRef = useRef(null);
  const subheadingRef = useRef(null);
  const cornerTextRef = useRef(null);
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

  const handleScroll = () => {
    // Get viewport height
    const viewportHeight = window.innerHeight;
    // Get current scroll position
    const scrollPosition = window.scrollY;
    
    // Calculate if we're in the hero section (first viewport)
    // Adding a small buffer (100px) for smoother transition
    const isInHeroSection = scrollPosition <= (viewportHeight - 100);
    
    setIsVisible(isInHeroSection);
  };

  useEffect(() => {
    // Initial fade-in animations
    gsap.fromTo(
      headingRef.current,
      { opacity: 0, y: 20 },
      { 
        opacity: 1,
        y: 0,
        duration: 1.5,
      }
    );

    gsap.fromTo(
      subheadingRef.current,
      { opacity: 0, y: 20 },
      { 
        opacity: 1,
        y: 0,
        duration: 1.5,
        delay: 0.3,
      }
    );

    gsap.fromTo(
      cornerTextRef.current,
      { opacity: 0 },
      { 
        opacity: 1,
        duration: 1.5,
      }
    );

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Staggered fade animations based on section visibility
    if (!isVisible) {
      gsap.to(headingRef.current, {
        opacity: 0,
        duration: 0.4,
      });
      gsap.to(subheadingRef.current, {
        opacity: 0,
        duration: 0.4,
        delay: 0.15,
      });
      gsap.to(cornerTextRef.current, {
        opacity: 0,
        duration: 0.4,
      });
    } else {
      gsap.to(headingRef.current, {
        opacity: 1,
        duration: 0.4,
      });
      gsap.to(subheadingRef.current, {
        opacity: 1,
        duration: 0.4,
        delay: 0.15,
      });
      gsap.to(cornerTextRef.current, {
        opacity: 1,
        duration: 0.4,
      });
    }
  }, [isVisible]);

  return (
    <div className="scroll-text-container" ref={containerRef}>
      <div className="text-wrapper">
        <div ref={headingRef} className="scroll-text heading">
          Facial Feature Recognition
        </div>
        <div ref={subheadingRef} className="scroll-text subheading">
          Get your face scanned. Dive into FFR.
        </div>
      </div>
      <div ref={cornerTextRef} className="corner-text">
        FFR
      </div>
    </div>
  );
};

export default ScrollText;