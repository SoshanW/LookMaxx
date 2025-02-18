import React from 'react';
import '../styles/CustomCard.css'; // Make sure to create this CSS file

const CustomCard = () => {
  return (
    <div className="card">
      <img src="https://assets.codepen.io/3421562/figma_graphic.png" alt="" />
      <h2>Design Smarter, Not Harder</h2>
      <p>Unlock powerful tools to create pixel-perfect designs in record time.</p>
      <div className="button">Get Started</div>
    </div>
  );
};

export default CustomCard;