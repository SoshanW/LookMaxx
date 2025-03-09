// src/components/PricingCard.jsx (initial)
import React from 'react';

const PricingCard = ({ 
  title, 
  price, 
  features, 
  buttonColor,
  buttonText = 'Get Started'
}) => {
  return (
    <div className="bg-gray-800 text-white rounded-lg p-6 w-96">
      <h2 className="text-2xl font-bold text-center mb-4">{title}</h2>
      <div className="flex flex-col items-center mb-4">
        <span className="text-5xl font-bold">{price}</span>
      </div>
      <button 
        className={`font-bold py-3 px-4 rounded mb-6 w-full text-center ${buttonColor}`}
      >
        {buttonText}
      </button>
      <ul className="space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            {feature.included ? 
              <i className="fas fa-check text-green-500 mr-3"></i> : 
              <i className="fas fa-times text-red-500 mr-3"></i>
            }
            <span>{feature.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PricingCard;