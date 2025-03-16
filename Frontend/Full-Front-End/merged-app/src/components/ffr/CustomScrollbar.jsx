import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import '../../styles/ffr/CustomScrollbar.css';

const CustomScrollbar = () => {
  const thumbRef = useRef(null);
  const lastScrollPercent = useRef(0);
  const isInitializedRef = useRef(false);

  const handleScroll = () => {
    // Guard against null ref
    if (!thumbRef.current) return;
    
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    
    // Guard against divide by zero
    if (documentHeight <= windowHeight) return;
    
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
    // Mark the component as initialized after first render
    isInitializedRef.current = true;
    
    // Initial scroll check
    handleScroll();
    
    // Throttle the scroll event for better performance
    let ticking = false;
    
    const onScroll = () => {
      if (!ticking && isInitializedRef.current) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Cleanup function
    return () => {
      window.removeEventListener('scroll', onScroll);
      isInitializedRef.current = false;
    };
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