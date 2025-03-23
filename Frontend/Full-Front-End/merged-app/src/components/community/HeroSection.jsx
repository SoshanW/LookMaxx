import React from 'react';
import '../../styles/community/HeroSection.css';
import heroImage from '/assets/community/banner.jpg'; 

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
        <img src={heroImage} alt="Hero" className="hero-image" />
      </div>
    </section>
  );
};

export default HeroSection;
