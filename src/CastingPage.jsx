import React from "react";
import { Link } from "react-router-dom";
import "./styles.css"; // Import the CSS file

const CastingPage = () => {
  return (
    <div className="casting-container">
      {/* Left Column */}
      <div className="text-section">
        <h1>
          <span className="bold">Step into the</span> <span className="highlight">Spotlight</span>
        </h1>
        <p className="subtitle">Your Modeling Journey Starts Here!</p>
        <button className="apply-btn">APPLY NOW</button>
      </div>

      {/* Right Column */}
      <div className="image-section">
      </div>
    </div>
  );
};

export default CastingPage;
