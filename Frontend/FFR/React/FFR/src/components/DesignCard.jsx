import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import '../styles/DesignCard.css';

gsap.registerPlugin(ScrollTrigger);

const DesignCard = ({ 
  isVisible, 
  position = { top: '100px', left: '-200px' },
  title = "Design Smarter",
  description = "Unlock powerful tools to create pixel-perfect designs in record time.",
  style = {},
  index = 0,
  scrollTick = 2
}) => {
  const cardRef = useRef(null);
  const scanLineRef = useRef(null);

  useEffect(() => {
    const cards = document.querySelectorAll('.acc-card');
    cards.forEach((card, idx) => {
      card.style.animationDelay = `${idx * -6}s`;
    });
  }, []);

  useEffect(() => {
    if (cardRef.current) {
      const viewportHeight = window.innerHeight;
      const triggerStart = `${scrollTick * viewportHeight}px`;
      const triggerEnd = `${(scrollTick + 0.5) * viewportHeight}px`;

      // Initial state
      gsap.set(cardRef.current, {
        clipPath: 'inset(0 100% 0 0)',
        autoAlpha: 0,
        filter: 'brightness(1.5) blur(5px)',
      });

      // Create scan line animation
      const createScanEffect = () => {
        const tl = gsap.timeline();
        
        // Reveal animation with scan effect
        tl.to(cardRef.current, {
          clipPath: 'inset(0 0% 0 0)',
          duration: 0.5,
          autoAlpha: 1,
          ease: "none",
        })
        .to(cardRef.current, {
          filter: 'brightness(1) blur(0px)',
          duration: 0.3,
          ease: "power2.out"
        }, "-=0.2");

        return tl;
      };

      // Main timeline
      const mainTl = gsap.timeline({
        scrollTrigger: {
          trigger: "body",
          start: `top -${triggerStart}`,
          end: `top -${triggerEnd}`,
          toggleActions: "play reverse play reverse",
          scrub: 0.2
        }
      });

      // Add the scan effect to main timeline
      mainTl.add(createScanEffect());

      // Add hover effect
      cardRef.current.addEventListener('mouseenter', () => {
        gsap.to(cardRef.current, {
          duration: 0.3,
          scale: 1.02,
          filter: 'brightness(1.1)',
          ease: "power2.out"
        });
      });

      cardRef.current.addEventListener('mouseleave', () => {
        gsap.to(cardRef.current, {
          duration: 0.3,
          scale: 1,
          filter: 'brightness(1)',
          ease: "power2.out"
        });
      });
    }
  }, [isVisible, index, scrollTick]);

  const cardContainerStyle = {
    top: position.top,
    left: position.left,
    visibility: 'hidden',
    ...style
  };

  return (
    <div 
      ref={cardRef}
      className={`design-card ${isVisible ? 'visible' : ''}`}
      style={cardContainerStyle}
    >
      <div className="scan-overlay"></div>
      <div className="card">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="accents">
        <div className="acc-card"></div>
        <div className="acc-card"></div>
        <div className="acc-card"></div>
        <div className="light"></div>
        <div className="light sm"></div>
        <div className="top-light"></div>
      </div>

      <style >{`
        .scan-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.2) 50%,
            transparent 100%
          );
          pointer-events: none;
          z-index: 10;
          opacity: 0;
          animation: scan 1.5s ease-in-out;
        }

        @keyframes scan {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

const DesignCards = ({ isVisible }) => {
  return (
    <>
      <DesignCard 
        isVisible={isVisible} 
        position={{ top: '100px', left: '-350px' }}
        title="Design Smarter"
        description="Create pixel-perfect designs in record time"
        index={0}
        scrollTick={4.2}
      />
      <DesignCard 
        isVisible={isVisible} 
        position={{ top: '180px', left: '300px' }}
        title="Create Faster"
        description="Speed up your workflow with powerful tools"
        index={1}
        scrollTick={4.3}
      />
      <DesignCard 
        isVisible={isVisible} 
        position={{ top: '300px', left: '-200px' }}
        title="Build Better"
        description="Craft exceptional user experiences"
        index={2}
        scrollTick={4.4}
      />
    </>
  );
};

export default DesignCards;