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
    const scrollPosition = window.scrollY;
    const fadeThreshold = window.innerHeight * 0.02;
    setIsVisible(scrollPosition <= fadeThreshold);
  };

  useEffect(() => {
    // First, immediately set the initial positions
    gsap.set([headingRef.current, subheadingRef.current, buttonRef.current], {
      opacity: 0,
      y: 20
    });

    gsap.set(cornerTextRef.current, {
      x: -100, // Start offscreen to the left
      opacity: 0 // Start fully transparent
    });

    // Then create the animation sequence
    const tl = gsap.timeline({
      defaults: { ease: "power2.out" }
    });

    // First make the corner text visible but still offscreen
    tl.set(cornerTextRef.current, {
      opacity: 1
    })
    // Then animate everything
    .to(cornerTextRef.current, {
      x: 0,
      duration: 0.6
    })
    .to(headingRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6
    }, "-=0.3")
    .to(subheadingRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6
    }, "-=0.4")
    .to(buttonRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6
    }, "-=0.4");

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isVisible) {
      // Fade out main content
      gsap.to([headingRef.current, subheadingRef.current, buttonRef.current], {
        opacity: 0,
        y: -30,
        duration: 0.2,
        stagger: 0.03,
        ease: "power2.inOut"
      });
      
      // Slide corner text to the left
      gsap.to(cornerTextRef.current, {
        x: -100,
        duration: 0.3,
        ease: "power2.inOut"
      });
    } else {
      // Fade in main content
      gsap.to([headingRef.current, subheadingRef.current, buttonRef.current], {
        opacity: 1,
        y: 0,
        duration: 0.3,
        stagger: 0.05,
        ease: "power2.inOut"
      });
      
      // Slide corner text back in from the left
      gsap.to(cornerTextRef.current, {
        x: 0,
        duration: 0.3,
        ease: "power2.inOut"
      });
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