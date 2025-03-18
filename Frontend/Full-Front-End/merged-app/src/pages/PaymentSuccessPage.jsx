import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { updateUserAfterPayment } from '../utils/paymentUtils';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Update user data in cookies for immediate UI update
    updateUserAfterPayment();
    
    // Redirect to profile page after 3 seconds
    const timer = setTimeout(() => {
      navigate('/profile', { 
        state: { 
          paymentSuccess: true,
          message: 'Payment successful! You are now a premium user.' 
        } 
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-purple">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl border border-blue-500"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              delay: 0.2,
              type: "spring",
              stiffness: 200,
              damping: 15
            }}
            className="w-24 h-24 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12 text-white" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={3} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-white mb-4"
          >
            Payment Successful!
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-300 mb-8"
          >
            Thank you for your purchase. Your account has been upgraded to Premium!
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-gray-400 text-sm">
              Redirecting to your profile...
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccessPage;