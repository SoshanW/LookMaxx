import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import '../styles/CustomScrollbar.css';

const CustomScrollbar = () => {
  const thumbRef = useRef(null);
  const lastScrollPercent = useRef(0);

  const handleScroll = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
    
    // Use GSAP for smooth animation
    gsap.to(thumbRef.current, {
      height: `${scrollPercent}%`,
      duration: 0.5,
      ease: "power2.out"
    });

    lastScrollPercent.current = scrollPercent;
  };

  useEffect(() => {
    // Throttle the scroll event for better performance
    let ticking = false;
    
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="custom-scrollbar">
      <div className="scrollbar-track">
        <div ref={thumbRef} className="scrollbar-thumb">
          <div className="scroll-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomScrollbar;