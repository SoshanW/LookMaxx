import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { handlePaymentNotification, updateUserAfterPayment } from '../utils/paymentUtils';
import { setCookie } from '../utils/cookies';

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
        const formData = await new FormData(document.querySelector('form'));
        for (const [key, value] of formData.entries()) {
          paymentData[key] = value;
        }
      } catch (error) {
        // If no form data, continue with URL params only
        console.log('No form data found, using URL params only');
      }
    };

    const processPayment = async () => {
      // Log the raw data for debugging
      console.log('Raw payment notification data:', paymentData);
      
      try {
        await handleFormData();
        
        // Log status_code specifically as requested
        console.log('PayHere Status Code:', paymentData.status_code);
        
        // Process the payment notification
        const result = await handlePaymentNotification(paymentData);
        
        if (result.success) {
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
          setError(result.error || 'Payment verification failed');
          // Redirect to profile with error
          setTimeout(() => {
            navigate('/profile', { 
              state: { 
                paymentError: true,
                message: result.error || 'Payment verification failed' 
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