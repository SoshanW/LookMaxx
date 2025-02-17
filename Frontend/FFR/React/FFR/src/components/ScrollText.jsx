import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import '../styles/ScrollText.css';

gsap.registerPlugin(ScrollTrigger);

const ScrollText = () => {
  const textRef = useRef(null);

  useLayoutEffect(() => {
    if (textRef.current) {
      // Initial state - hidden
      gsap.set(textRef.current, { opacity: 1 });

      // Timeline for text appearance and disappearance
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: textRef.current,
          start: "0%", // Starts animation when text is 20% from top of viewport
          end: "+=50%", // Ends animation after scrolling 400% of the viewport height
          scrub: 1, // Smooth animation with 1 second delay
          markers: true, // Enable this to see the trigger points (helpful for debugging)
          toggleActions: "play none none reverse", // Controls the animation sequence
          onEnter: () => console.log("Text entering"),
          onLeave: () => console.log("Text leaving"),
        }
      });

      // Animation sequence
      tl.to(textRef.current, {
        opacity: 1,
        duration: 1,
        ease: "power2.inOut"
      })
      .to(textRef.current, {
        opacity: 0,
        duration: 1,
        ease: "power2.inOut"
      }, "+=1"); // Delay before starting to fade out

    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div ref={textRef} className="scroll-text-container">
      <h1>Welcome to</h1>
      <h2 data-text="F.F.R." className="animated-text">
        F.F.R.
      </h2>
    </div>
  );
};

export default ScrollText;