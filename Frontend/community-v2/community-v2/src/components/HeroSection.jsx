import React from 'react';
import '../styles/HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1>LookSci - Community</h1>
        <p>Let's talk about Facial Aesthetics</p>
        <div className="hero-buttons">
          <button className="primary-button">Explore</button>
          <button className="secondary-button">Join</button>
        </div>
      </div>
      <div className="hero-visual">
        <div className="hero-image-placeholder"></div>
      </div>
    </section>
  );
};

export default HeroSection;