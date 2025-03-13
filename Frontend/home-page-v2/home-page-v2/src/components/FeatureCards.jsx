import { useEffect } from 'react';
import PropTypes from 'prop-types';
import gsap from 'gsap';
import '../styles/FeatureCards.css';

const FeatureCards = ({ scrollProgress }) => {
  // Effect to handle card animations based on scroll progress
  useEffect(() => {
    // Optimize card animations based on visibility ranges
    if (scrollProgress > 0.5 && scrollProgress < 0.66) {
      gsap.to(".feature-card-1", { autoAlpha: 1, duration: 0.8 });
    } else {
      gsap.to(".feature-card-1", { autoAlpha: 0, duration: 0.5 });
    }
    
    if (scrollProgress > 0.66 && scrollProgress < 0.82) {
      gsap.to(".feature-card-2", { autoAlpha: 1, duration: 0.8 });
    } else {
      gsap.to(".feature-card-2", { autoAlpha: 0, duration: 0.5 });
    }
    
    if (scrollProgress > 0.82 && scrollProgress < 0.95) {
      gsap.to(".feature-card-3", { autoAlpha: 1, duration: 0.8 });
    } else {
      gsap.to(".feature-card-3", { autoAlpha: 0, duration: 0.5 });
    }
  }, [scrollProgress]);

  return (
    <>
      {/* Feature cards that appear during scroll */}
      <div className="feature-card feature-card-1">
        <div className="card-content">
          <h2>Interested about facial aesthetics?</h2>
          <button className="card-button">GET STARTED</button>
        </div>
      </div>
      
      <div className="feature-card feature-card-2">
        <div className="card-content">
          <h2>Looking for Modelling opportunities?</h2>
          <button className="card-button">GET STARTED</button>
        </div>
      </div>
      
      <div className="feature-card feature-card-3">
        <div className="card-content">
          <h2>Find your Style</h2>
          <button className="card-button">Learn More</button>
        </div>
      </div>
    </>
  );
};

FeatureCards.propTypes = {
  scrollProgress: PropTypes.number.isRequired
};

export default FeatureCards;