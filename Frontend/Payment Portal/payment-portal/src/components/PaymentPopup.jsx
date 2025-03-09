import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const VisaLogo = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 80 50" 
    className="w-10 h-6"
  >
    {/* Blue background */}
    <rect width="80" height="50" rx="4" fill="#1434CB"/>
    
    {/* VISA Text in white */}
    <text 
      x="40" 
      y="32" 
      textAnchor="middle" 
      fontFamily="Arial, sans-serif" 
      fontWeight="bold" 
      fontSize="22"  
      fill="white" 
      letterSpacing="1"
    >
      VISA
    </text>
  </svg>
);

const MastercardLogo = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 100 60" 
    className="w-10 h-6"
  >
    <rect width="100" height="60" rx="10" fill="#FF5F00"/>
    <circle cx="50" cy="30" r="20" fill="#EB001B"/>
    <circle cx="70" cy="30" r="20" fill="#F79E1B"/>
    <path 
      d="M60 30c0-8.284 3.744-15.622 9.5-20C65.744 4.622 58.284 1 50 1S34.256 4.622 30.5 10C36.256 14.378 40 21.716 40 30s-3.744 15.622-9.5 20c3.756 5.378 11.216 9 19.5 9s15.744-3.622 19.5-9C63.744 45.622 60 38.284 60 30z"
      fill="transparent"
    />
  </svg>
);

const AmexLogo = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 100 60" 
    className="w-10 h-6"
  >
    <rect width="100" height="60" rx="10" fill="#016FD0"/>
    <text 
      x="50" 
      y="35" 
      textAnchor="middle" 
      fontWeight="bold" 
      fontSize="24" 
      fill="white"
    >
      AMEX
    </text>
  </svg>
);

const PaymentPopup = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('+94');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardType, setCardType] = useState('');

  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, mobile, cardNumber, cardHolder, expiryDate, cvv });
    onClose();
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/g, '');
    // Format card number with spaces every 4 digits
    const formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(formattedValue);

    // Validate card type
    if (/^4[0-9]{3}\s?[0-9]{4}\s?[0-9]{4}\s?[0-9]{4}$/.test(formattedValue)) {
      setCardType('visa');
    } else if (/^5[1-5][0-9]{2}\s?[0-9]{4}\s?[0-9]{4}\s?[0-9]{4}$/.test(formattedValue)) {
      setCardType('mastercard');
    } else if (/^3[47][0-9]{2}\s?[0-9]{4}\s?[0-9]{4}\s?[0-9]{3}$/.test(formattedValue)) {
      setCardType('amex');
    } else {
      setCardType('');
    }
  };
  
  // Add a function to render the appropriate card logo
  const renderCardLogo = () => {
    switch(cardType) {
      case 'visa':
        return <VisaLogo />;
      case 'mastercard':
        return <MastercardLogo />;
      case 'amex':
        return <AmexLogo />;
      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-[500px] bg-gradient-to-br from-[rgb(31,41,55)] to-[rgb(55,65,81)] rounded-xl shadow-2xl p-8 relative overflow-hidden"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-green-300 font-medium mr-2">Secure</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              className="w-5 h-5 text-green-500"
              fill="currentColor"
            >
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
          </div>

          <button 
            onClick={onClose}
            className="group transition-all duration-300 hover:bg-gray-700 p-1.5 rounded-full"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors duration-300 transform group-hover:rotate-90"
              fill="currentColor"
            >
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white text-center mb-6">Complete Your Purchase</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 placeholder-gray-500"
              />
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
                className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 placeholder-gray-500"
              />
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Card Number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                required
                className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 placeholder-gray-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <input
                type="text"
                placeholder="Expiry (MM/YY)"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
                className="p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 placeholder-gray-500"
              />
              <input
                type="text"
                placeholder="CVV"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                required
                className="p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 placeholder-gray-500"
              />
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Card Holder Name"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                required
                className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 placeholder-gray-500"
              />
            </div>

            <motion.button 
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-blue-600 text-white py-4 rounded-md font-bold text-lg hover:bg-blue-700 transition-all duration-300 mt-2"
            >
              Complete Payment
            </motion.button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PaymentPopup;