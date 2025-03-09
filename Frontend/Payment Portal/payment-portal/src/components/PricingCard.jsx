import React, { useState } from 'react';

const PricingCard = ({ 
  title, 
  price, 
  originalPrice, 
  features, 
  buttonColor, 
  variant = 'pro', 
  buttonText = 'Get Started',
  showOriginalPrice = true,
  tagline
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div className="relative w-96">
      <div
        className="text-white rounded-lg p-6 w-full relative z-0"
        onMouseMove={handleMouseMove}
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: variant === 'pro' 
            ? 'linear-gradient(135deg, rgb(17, 1, 48) 0%, rgb(49, 35, 73) 100%)' 
            : 'linear-gradient(135deg, rgb(31, 41, 55) 0%, rgb(55, 65, 81) 100%)',
        }}
      >
        {/* Gradient effect that follows mouse */}
        <div
          style={{
            position: 'absolute',
            background: `radial-gradient(circle 100px at ${mousePosition.x}px ${mousePosition.y}px, ${variant === 'pro' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(156, 163, 175, 0.2)'}, transparent)`,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0
          }}
        />

        {/* Card content with a relative positioning to appear above gradient */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="text-2xl font-bold text-center mb-4">{title}</h2>
          <div className="flex flex-col items-center mb-4">
            <div className="flex items-baseline">
              <span className="text-5xl font-bold">
                {price === "0" && !showOriginalPrice ? "Free" : price}
              </span>
              {showOriginalPrice && originalPrice && (
                <span className="text-gray-400 text-lg line-through ml-2">
                  ${originalPrice}
                </span>
              )}
            </div>
            <p className="text-gray-400 mt-1">
              {tagline || (variant === 'pro' ? 'Pay once. Own forever!' : 'No payment required')}
            </p>
          </div>
          <button 
            className={`font-bold py-3 px-4 rounded mb-6 w-full text-center relative overflow-hidden ${buttonColor}`}
          >
            <span className="relative z-10">{buttonText}</span>
          </button>
          <ul className="space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center">
                {feature.included ? 
                  <i className="fas fa-check text-white bg-blue-500 p-1 rounded-full mr-3 text-xs"></i> : 
                  <i className="fas fa-times text-white bg-red-500 p-1 rounded-full mr-3 text-xs"></i>
                }
                <span>{feature.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PricingCard;