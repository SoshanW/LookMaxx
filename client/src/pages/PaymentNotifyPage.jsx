import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { handlePaymentNotification, updateUserAfterPayment } from '../utils/paymentUtils';
import { setCookie, getCookie } from '../utils/cookies';
import axios from 'axios';

const PaymentNotifyPage = () => {
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract payment data from URL search parameters
    const searchParams = new URLSearchParams(location.search);
    
    // Create an object from the search parameters
    const paymentData = {};
    for (const [key, value] of searchParams.entries()) {
      paymentData[key] = value;
    }
    
    // Extract form data if this is a POST from PayHere
    const handleFormData = async () => {
      try {
        // If there's form data in the request
        const form = document.querySelector('form');
        if (form) {
          const formData = new FormData(form);
          for (const [key, value] of formData.entries()) {
            paymentData[key] = value;
          }
        }
      } catch (error) {
        // If no form data, continue with URL params only
        console.log('No form data found, using URL params only');
      }
    };

    const verifyPaymentWithBackend = async (statusCode) => {
      try {
        // Get JWT token from cookies
        const token = getCookie('access_token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        console.log('Calling backend verification endpoint with status_code:', statusCode);
        
        // Create form data for the API call
        const formData = new FormData();
        formData.append('status_code', statusCode);
        
        // Call the backend verification endpoint
        const response = await axios.post('/payments/verify-payment', 
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        console.log('Backend verification response:', response.data);
        
        return {
          success: response.data.status === 'success',
          message: response.data.message
        };
      } catch (error) {
        console.error('Error verifying payment with backend:', error);
        return {
          success: false,
          error: error.response?.data?.message || 'Payment verification failed'
        };
      }
    };

    const processPayment = async () => {
      // Log the raw data for debugging
      console.log('Raw payment notification data:', paymentData);
      
      try {
        await handleFormData();
        
        // Get status code from the PayHere response
        const statusCode = paymentData.status_code || '0';
        
        // Log status_code specifically as requested
        console.log('PayHere Status Code:', statusCode);
        
        // Store status code in a cookie for verification
        setCookie('payhere_status_code', statusCode, { expires: 1 });
        console.log('Status code stored in cookie:', getCookie('payhere_status_code'));
        
        // Call backend to verify payment
        const verificationResult = await verifyPaymentWithBackend(statusCode);
        
        if (verificationResult.success) {
          // Update the user data in cookies for immediate UI update
          updateUserAfterPayment();
          
          // Redirect to profile page
          setTimeout(() => {
            navigate('/profile', { 
              state: { 
                paymentSuccess: true,
                message: 'Payment successful! You are now a premium user.' 
              } 
            });
          }, 1500);
        } else {
          setError(verificationResult.error || 'Payment verification failed');
          // Redirect to profile with error
          setTimeout(() => {
            navigate('/profile', { 
              state: { 
                paymentError: true,
                message: verificationResult.error || 'Payment verification failed' 
              } 
            });
          }, 3000);
        }
      } catch (error) {
        console.error('Error processing payment notification:', error);
        setError('Failed to process payment notification');
        
        // Redirect to profile with error
        setTimeout(() => {
          navigate('/profile', { 
            state: { 
              paymentError: true,
              message: 'Failed to process payment notification' 
            } 
          });
        }, 3000);
      } finally {
        setProcessing(false);
      }
    };

    processPayment();
  }, [location, navigate]);

  return (
    <div className="payment-notify-page">
      <div className="payment-notify-container">
        {processing ? (
          <div className="processing-payment">
            <h2>Processing Payment</h2>
            <div className="loading-spinner"></div>
            <p>Please wait while we verify your payment...</p>
          </div>
        ) : error ? (
          <div className="payment-error">
            <h2>Payment Verification Failed</h2>
            <p>{error}</p>
            <p>Redirecting to profile page...</p>
          </div>
        ) : (
          <div className="payment-success">
            <h2>Payment Successful!</h2>
            <p>Your account has been upgraded to Premium!</p>
            <p>Redirecting to profile page...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentNotifyPage;