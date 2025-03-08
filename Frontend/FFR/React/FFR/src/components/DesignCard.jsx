import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import '../styles/DesignCard.css';

gsap.registerPlugin(ScrollTrigger);

const DesignCard = ({ 
  position = { top: '100px', left: '-200px' },
  title = "Design Smarter",
  description = "Unlock powerful tools to create pixel-perfect designs in record time.",
  style = {},
  index = 0,
  scrollTick = 2
}) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const cards = document.querySelectorAll('.acc-card');
    cards.forEach((card, idx) => {
      card.style.animationDelay = `${idx * -6}s`;
    });

    if (cardRef.current) {
      const viewportHeight = window.innerHeight;
      const appearPoint = scrollTick * viewportHeight;

      const disappearPoint = (scrollTick + 0.7) * viewportHeight;

      // Initial state
      gsap.set(cardRef.current, {
        opacity: 0,
        y: 20
      });

      // Create the animation timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "body",
          start: `top -${appearPoint}px`,
          end: `top -${disappearPoint}px`,
          toggleActions: "play reverse play reverse",
          scrub: 0.5,
          onEnter: () => {
            gsap.to(cardRef.current, {
              opacity: 1,
              y: 0,
              duration: 0.2,  
              ease: "power2.out"
            });
          },
          onLeave: () => {
            gsap.to(cardRef.current, {
              opacity: 0,
              y: -20,
              duration: 0.2,  
              ease: "power2.in"
            });
          },
          onEnterBack: () => {
            gsap.to(cardRef.current, {
              opacity: 1,
              y: 0,
              duration: 0.2,  // Reduced from 0.5 to 0.2 seconds
              ease: "power2.out"
            });
          },
          onLeaveBack: () => {
            gsap.to(cardRef.current, {
              opacity: 0,
              y: 20,
              duration: 0.2,  // Reduced from 0.5 to 0.2 seconds
              ease: "power2.in"
            });
          }
        }
      });

      // Add hover effect
      cardRef.current.addEventListener('mouseenter', () => {
        gsap.to(cardRef.current, {
          scale: 1.02,
          duration: 0.3,
          ease: "power2.out"
        });
      });

      cardRef.current.addEventListener('mouseleave', () => {
        gsap.to(cardRef.current, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      });

      return () => {
        tl.kill();
      };
    }
  }, [scrollTick, index]);

  const cardStyle = {
    top: position.top,
    left: position.left,
    ...style
  };

  return (
    <div 
      ref={cardRef}
      className="design-card"
      style={cardStyle}
    >
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
    </div>
  );
};

const DesignCards = () => {
  return (
    <>
      <DesignCard 
        position={{ top: '100px', left: '-350px' }}
        title="Research-Backed Insights"
        description="Evidence-based analysis from peer-reviewed clinical studies"
        index={0}
        scrollTick={4.2}
      />
      <DesignCard 
        position={{ top: '180px', left: '300px' }}
        title="Advanced Facial Scanning"
        description="Precision diagnostics with cutting-edge biometric technology"
        index={1}
        scrollTick={4.3}
      />
      <DesignCard 
        position={{ top: '300px', left: '-200px' }}
        title="Visual Pattern Analysis"
        description="Detailed reports with annotated imagery and custom insights"
        index={2}
        scrollTick={4.4}
      />
    </>
  );
};

export default DesignCards;