import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './index.css';
import PricingCard from './components/PricingCard';

function App() {
  const freeFeatures = [
    { text: 'Study Section Materials', included: true },
    { text: 'Retail Services', included: true },
    { text: 'Community Services', included: true },
    { text: 'Facial Feature Recognition (Full Report)', included: false },
    { text: 'Casting Section', included: false },
  ];
  
  const platinumFeatures = [
    { text: 'Study Section Materials', included: true },
    { text: 'Retail Services', included: true },
    { text: 'Community Services', included: true },
    { text: 'Facial Feature Recognition (Full Report)', included: true },
    { text: 'Casting Section', included: true },
  ];
  
  return (
    <div className="bg-dark-purple flex flex-col items-center justify-center min-h-screen p-8">
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-16">
        {/* Free Card */}
        <PricingCard
          title="Free"
          price="$0"
          features={freeFeatures}
          buttonColor="bg-gray-600 hover:bg-gray-700 text-white"
          variant="free"
          buttonText="Get Started"
          tagline="No payment required"
        />
        
        {/* Pro Card */}
        <PricingCard
          title="PRO Mewer"
          price="$15"
          originalPrice="20"
          features={platinumFeatures}
          buttonColor="bg-blue-500 hover:bg-blue-600 text-white"
          variant="pro"
          buttonText="Get PRO"
          tagline="Per 3 months"
        />
      </div>
    </div>
  );
}

export default App;