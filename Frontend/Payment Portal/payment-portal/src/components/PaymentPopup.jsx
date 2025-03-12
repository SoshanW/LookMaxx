import React, { useState } from 'react';
import { motion } from 'framer-motion';
import md5 from 'crypto-js/md5';
import PayHereComponent from "./PayHereComponent";

// PayHere configuration
const PAYHERE_CONFIG = {
  MERCHANT_ID: "1229752",
  MERCHANT_SECRET: "MTk3MzMwOTU3NjI2MjU0ODIxMTMzMTE2MjQzMDgyMzA4MzQxNDg4NA==",
  SANDBOX_URL: "https://sandbox.payhere.lk/pay/checkout",
  RETURN_URL: "http://localhost:5173/",
  CANCEL_URL: "http://localhost:5000/payment/cancel",
  NOTIFY_URL: "http://localhost:5000/api/payment/notify"
};

const PaymentPopup = ({ onClose, planId, planName, planPrice }) => {
  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('+94');
  const [selectedCountryCode, setSelectedCountryCode] = useState('+94');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Sri Lanka');
  const [error, setError] = useState('');


 // Generate hash for PayHere
  const generateHash = (orderId, amount, currency) => {
  const merchantId = PAYHERE_CONFIG.MERCHANT_ID;
  const merchantSecret = PAYHERE_CONFIG.MERCHANT_SECRET;
  
  const rupee = "4500";

  // Format amount to have 2 decimal places
  const formattedAmount = parseFloat(rupee).toFixed(2);
  
  // Generate hash according to PayHere documentation
  const hashedSecret = md5(merchantSecret).toString().toUpperCase();
  const hash = md5(
    merchantId + 
    orderId + 
    formattedAmount + 
    currency + 
    hashedSecret
  ).toString().toUpperCase();
  
  return hash;
};

// Generate a unique order ID
const generateOrderId = () => {
  return `ORDER_${planId}_${Date.now()}`;
};

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!firstName || !lastName || !email || !mobile || !address || !city || !country) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Generate order ID
    const orderId = generateOrderId();
    
    // Set currency and format price
    const currency = "LKR";
    const formattedPrice = parseFloat(planPrice).toFixed(2);
    
    // Generate hash
    const hash = generateHash(orderId, formattedPrice, currency);
    
    // Create form and submit to PayHere
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = PAYHERE_CONFIG.SANDBOX_URL;
    
    // Define all required parameters
    const paymentData = {
      sandbox: true,
      merchant_id: PAYHERE_CONFIG.MERCHANT_ID,
      return_url: PAYHERE_CONFIG.RETURN_URL,
      cancel_url: PAYHERE_CONFIG.CANCEL_URL,
      notify_url: PAYHERE_CONFIG.NOTIFY_URL,
      order_id: orderId,
      items: planName || "PRO Subscription",
      amount: 4500,
      currency: currency,
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: mobile.replace(/\+/g, ''), // Remove + from country code
      address: address,
      city: city,
      country: country,
      recurrence: "1 Month",
      duration : "1 Month",
      hash: hash
    };
    
    // Add form fields
    Object.entries(paymentData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });
    
    // Add form to document and submit it
    document.body.appendChild(form);
    form.submit();
    
    // Clean up
    document.body.removeChild(form);

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
        <PayHereComponent />
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
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 placeholder-gray-500"
                />
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Email Field */}
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

            {/* Phone Field */}
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

            {/* Address Field */}
            <div className="relative">
              <input
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 placeholder-gray-500"
              />
            </div>

            {/* City and Country Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 placeholder-gray-500"
                />
              </div>
              <div className="relative">
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                >
                  <option value="Sri Lanka">Sri Lanka</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Canada">Canada</option>
                  <option value="India">India</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Japan">Japan</option>
                  <option value="China">China</option>
                </select>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="mt-6 bg-gray-800 p-4 rounded-md">
              <h3 className="text-lg font-semibold text-white mb-2">Payment Summary</h3>
              <div className="flex justify-between text-gray-300 mb-1">
                <span>Plan:</span>
                <span>{planName || "PRO Mewer"}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-white">
                <span>Total:</span>
                <span>{planPrice || "4500"}</span>
              </div>
            </div>

            <motion.button 
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-blue-600 text-white py-4 rounded-md font-bold text-lg hover:bg-blue-700 transition-all duration-300 mt-2"
            >
              Proceed to Payment
            </motion.button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};
export default PaymentPopup;