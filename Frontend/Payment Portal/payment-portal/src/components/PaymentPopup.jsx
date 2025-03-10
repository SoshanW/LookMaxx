import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Improved Card Logo Components
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
  const [selectedCountryCode, setSelectedCountryCode] = useState('+94');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardType, setCardType] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Clear any previous errors when card number or type changes
    setError('');
  }, [cardNumber, cardType]);

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

  const handleCvvChange = (e) => {
    if (!cardType) {
      setError('Please enter card number first');
      return;
    }

    const value = e.target.value.replace(/[^0-9]/g, '');
    
    if (cardType === 'amex') {
      // Allow up to 4 digits for Amex
      setCvv(value.slice(0, 4));
    } else {
      // Limit to 3 digits for Visa and Mastercard
      setCvv(value.slice(0, 3));
    }
  };

  const handleExpiryDateChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    
    if (value.length <= 2) {
      // First two digits (month)
      setExpiryDate(value);
    } else if (value.length > 2) {
      // Auto-insert slash and keep subsequent digits
      const month = value.slice(0, 2);
      const year = value.slice(2);
      setExpiryDate(`${month}/${year}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Additional validation before submission
    if (!cardType) {
      setError('Please enter a valid card number');
      return;
    }

    // CVV validation
    if (cardType === 'amex' && cvv.length !== 4) {
      setError('American Express CVV must be 4 digits');
      return;
    }
    if ((cardType === 'visa' || cardType === 'mastercard') && cvv.length !== 3) {
      setError('CVV must be 3 digits');
      return;
    }

    console.log({ email, mobile, cardNumber, cardHolder, expiryDate, cvv });
    onClose();
  };

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
        {/* Header Section with Balanced Spacing */}
        <div className="flex justify-between items-center mb-6">
          {/* Secure Indicator */}
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

          {/* Cancel Icon with Enhanced Design */}
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
          
          {error && (
            <div className="bg-red-600 text-white p-3 rounded-md mb-4 text-center">
              {error}
            </div>
          )}
          
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
              <div className="flex space-x-2">
                <div className="relative" style={{ width: "80px" }}>
                  {/* Custom select with visible country code */}
                  <div className="relative">
                    {/* Displayed country code */}
                    <div className="p-3 bg-gray-800 text-white rounded-md border border-gray-700 flex justify-between items-center cursor-pointer">
                      <span>{selectedCountryCode}</span>
                      <svg className="h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    
                    {/* Hidden actual select element for functionality */}
                    <select
                      className="absolute opacity-0 top-0 left-0 h-full w-full cursor-pointer"
                      onChange={(e) => {
                        const countryCode = e.target.value;
                        setSelectedCountryCode(countryCode);
                        // Only update the country code part of the mobile number
                        setMobile(countryCode + mobile.substring(selectedCountryCode.length));
                      }}
                      defaultValue="+94"
                    >
                      <option value="+94">Sri Lanka</option>
                      <option value="+1">United States</option>
                      <option value="+44">United Kingdom</option>
                      <option value="+61">Australia</option>
                      <option value="+33">France</option>
                      <option value="+49">Germany</option>
                      <option value="+81">Japan</option>
                      <option value="+86">China</option>
                      <option value="+91">India</option>
                      <option value="+7">Russia</option>
                      <option value="+55">Brazil</option>
                      <option value="+52">Mexico</option>
                      <option value="+82">South Korea</option>
                      <option value="+39">Italy</option>
                      <option value="+34">Spain</option>
                      <option value="+31">Netherlands</option>
                    </select>
                  </div>
                </div>
                
                <input
                  type="text"
                  placeholder="Mobile Number"
                  value={mobile.substring(selectedCountryCode.length)}
                  onChange={(e) => {
                    // Extract only the number part (without country code)
                    let numericInput = e.target.value.replace(/[^0-9]/g, '');
                    // Limit to 9 digits maximum
                    numericInput = numericInput.slice(0, 9);
                    // Set the mobile state with the country code + new number input
                    setMobile(selectedCountryCode + numericInput);
                  }}
                  required
                  className="flex-1 p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 placeholder-gray-500"
                />
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Card Number"
                value={cardNumber}
                onChange={handleCardNumberChange}
                maxLength="19"
                required
                className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 placeholder-gray-500"
              />
              {cardType && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  {renderCardLogo()}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-5">
              <input
                type="text"
                placeholder="Expiry (MM/YY)"
                value={expiryDate}
                onChange={handleExpiryDateChange}
                maxLength="5"
                required
                className="p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 placeholder-gray-500"
              />
              <input
                type="text"
                placeholder={cardType === 'amex' ? 'CVV (4 digits)' : 'CVV (3 digits)'}
                value={cvv}
                onChange={handleCvvChange}
                maxLength={cardType === 'amex' ? '4' : '3'}
                required
                disabled={!cardType}
                className={`p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 placeholder-gray-500 
                  ${!cardType ? 'opacity-50 cursor-not-allowed' : ''}`}
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