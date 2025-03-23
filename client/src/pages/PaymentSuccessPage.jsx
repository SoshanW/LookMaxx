import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { updateUserAfterPayment } from '../utils/paymentUtils';
import { getCookie, setCookie } from '../utils/cookies';
import axios from 'axios';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [verificationStatus, setVerificationStatus] = useState('verifying');

  useEffect(() => {
    const verifyPaymentWithBackend = async () => {
      try {
        // Get the status code from cookie
        const statusCode = getCookie('payhere_status_code') || '2';
        
        // Get JWT token from cookies
        const token = getCookie('access_token');
        console.log('Token being sent:', token ? token.substring(0, 10) + '...' : 'No token');
        
        if (!token) {
          console.error('No authentication token found');
          setVerificationStatus('failed');
          return false;
        }
        
        const formData = new FormData();
        formData.append('status_code', statusCode);
        
        // Make sure Authorization header is properly set
        const response = await axios.post('/payments/verify-payment', 
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            withCredentials: true // Add this line to include cookies
          }
        );
        
        console.log('Backend verification response from success page:', response.data);
        
        if (response.data.status === 'success') {
          setVerificationStatus('success');
          return true;
        } else {
          setVerificationStatus('failed');
          return false;
        }
      } catch (error) {
        console.error('Error verifying payment with backend from success page:', error);
        setVerificationStatus('failed');
        return false;
      }
    };
    
    const processPayment = async () => {
      // First try to verify with backend
      const backendVerified = await verifyPaymentWithBackend();
      
      // Update user data in cookies regardless of backend verification (fallback)
      updateUserAfterPayment();
      
      // Redirect to profile page after verification attempt
      setTimeout(() => {
        navigate('/profile', { 
          state: { 
            paymentSuccess: backendVerified !== false,
            message: backendVerified !== false 
              ? 'Payment successful! You are now a premium user.' 
              : 'Payment processed but verification with server failed. Please contact support.'
          } 
        });
      }, 3000);
    };
    
    processPayment();
    
    return () => {
      // Clean up any timers if needed
    };
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