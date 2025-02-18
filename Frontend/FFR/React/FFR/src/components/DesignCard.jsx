import React, { useEffect } from 'react';
import '../styles/DesignCard.css';

const DesignCard = () => {
  useEffect(() => {
    const cards = document.querySelectorAll('.acc-card');
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * -6}s`;
    });
  }, []);

  return (
    <div className="design-card-section">
      <div className="card">
        <h2>Design Smarter, Not Harder</h2>
        <p>Unlock powerful tools to create pixel-perfect designs in record time.</p>
        <div className="button">Get Started</div>
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

export default DesignCard;