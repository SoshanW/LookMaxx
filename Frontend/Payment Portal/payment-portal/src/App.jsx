import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './index.css';
import { motion } from 'framer-motion';
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
  
  const handleBackClick = () => {
    // Navigate to the home page
    // If using React Router, you could use history.push('/') or navigate('/')
    // For simplicity, we're using window.location
    window.location.href = '/';
  };

  return (
    <div className="bg-dark-purple flex flex-col items-center justify-center min-h-screen p-8">
      {/* Back Button */}
      <motion.button
        className="absolute top-6 left-6 flex items-center text-white bg-opacity-20 bg-blue-500 px-4 py-2 rounded-full overflow-hidden"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20,
          delay: 0.2
        }}
        whileHover={{ 
          scale: 1.05, 
          backgroundColor: "rgba(59, 130, 246, 0.3)",
          boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)"
        }}
        whileTap={{ scale: 0.95 }}
        onClick={handleBackClick}
      >
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-20"
          initial={{ x: "100%" }}
          whileHover={{ x: "0%" }}
          transition={{ duration: 0.4 }}
        />
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="mr-2"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        <span className="relative z-10 font-medium">Back to Home</span>
      </motion.button>

      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 relative">
        {/* Free Card */}
        <PricingCard
          title="Free"
          price="LKR 0"
          features={freeFeatures}
          buttonColor="bg-gray-600 hover:bg-gray-700 text-white"
          variant="free"
          buttonText="Get Started"
          tagline="No payment required"
        />
        
        {/* Arrow between cards */}
        <motion.div 
          className="hidden md:flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 400,
            damping: 25,
            delay: 0.8 // Appears after the cards
          }}
        >
          <motion.div 
            initial={{ x: -10, opacity: 0.5 }}
            animate={{ x: 10, opacity: 1 }}
            transition={{ 
              x: { duration: 0.8, repeat: Infinity, repeatType: "reverse", delay: 1.2 },
              opacity: { duration: 0.8, repeat: Infinity, repeatType: "reverse", delay: 1.2 }
            }}
            className="flex flex-col items-center"
          >
            <motion.div 
              className="font-bold text-lg mb-2" 
              style={{ 
                background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              Upgrade
            </motion.div>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="url(#arrow-gradient)" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            >
              <defs>
                <linearGradient id="arrow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </motion.div>
        </motion.div>
        
        {/* Mobile arrow (visible on small screens) */}
        <motion.div 
          className="md:hidden flex items-center justify-center py-3"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 400,
            damping: 25,
            delay: 0.8 // Appears after the cards
          }}
        >
          <motion.div 
            initial={{ y: -5, opacity: 0.5 }}
            animate={{ y: 5, opacity: 1 }}
            transition={{ 
              y: { duration: 0.8, repeat: Infinity, repeatType: "reverse", delay: 1.2 },
              opacity: { duration: 0.8, repeat: Infinity, repeatType: "reverse", delay: 1.2 }
            }}
            className="flex flex-col items-center"
          >
            <motion.div 
              className="font-bold text-lg mb-2" 
              style={{ 
                background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              Upgrade
            </motion.div>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="url(#arrow-gradient-mobile)" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="rotate-90"
            >
              <defs>
                <linearGradient id="arrow-gradient-mobile" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </motion.div>
        </motion.div>
        
        {/* Pro Card */}
        <PricingCard
          title="PRO Mewer"
          price="LKR 4500"
          originalPrice="6000"
          features={platinumFeatures}
          buttonColor="bg-blue-500 hover:bg-blue-600 text-white"
          variant="pro"
          buttonText="Get PRO"
          tagline="Per 1 month"
        />
      </div>
    </div>
  );
}

export default App;