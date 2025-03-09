// src/App.jsx (updated)
import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './index.css';
import PricingCard from './components/PricingCard';

function App() {
  const freeFeatures = [
    { text: 'Study Section Materials', included: true },
    { text: 'Retail Services', included: true },
    { text: 'Community Services', included: true },
    { text: 'Facial Feature Recognition', included: false },
    { text: 'Casting Section', included: false },
  ];
  
  return (
    <div className="bg-gray-900 flex flex-col items-center justify-center min-h-screen p-8">
      <PricingCard
        title="Free"
        price="$0"
        features={freeFeatures}
        buttonColor="bg-gray-600 hover:bg-gray-700 text-white"
        buttonText="Get Started"
      />
    </div>
  );
}

export default App;