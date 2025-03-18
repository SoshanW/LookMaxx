import { setCookie, getCookie } from './cookies';
import axios from 'axios';

/**
 * Handle payment notification from PayHere
 * @param {Object} paymentData - Payment data received from PayHere
 * @returns {Promise} - Promise resolving to payment verification result
 */
export const handlePaymentNotification = async (paymentData) => {
  // Log the payment data for debugging
  console.log('Payment notification received:', paymentData);
  
  // Check if status code exists
  if (!paymentData.status_code) {
    console.error('No status code in payment notification');
    return { success: false, error: 'Invalid payment data' };
  }
  
  // Store status code in a cookie for verification
  setCookie('payhere_status_code', paymentData.status_code, { expires: 1 }); // 1 day expiry
  
  // Log the status code for verification as requested
  console.log('PayHere Status Code stored in cookie:', paymentData.status_code);
  
  try {
    // Get JWT token from cookies
    const token = getCookie('access_token');
    
    if (!token) {
      console.error('No authentication token found');
      return { success: false, error: 'Authentication required' };
    }
    
    // Call backend verification API (using FormData as the backend expects it)
    const formData = new FormData();
    formData.append('status_code', paymentData.status_code);
    
    const response = await axios.post('/payments/verify-payment', 
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData, browser will set it
        }
      }
    );
    
    // Check response
    if (response.data.status === 'success') {
      // Clear the payment status cookie after successful verification
      setCookie('user_subscription', 'premium', { expires: 30 }); // Store subscription status
      return { success: true };
    } else {
      return { success: false, error: response.data.message };
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Payment verification failed'
    };
  }
};

/**
 * Check if the current user has premium subscription
 * @returns {boolean} - True if user has premium subscription
 */
export const hasUserPremium = () => {
  // First check cookie for fast access
  const subscriptionStatus = getCookie('user_subscription');
  if (subscriptionStatus === 'premium') return true;
  
  // If not in cookie, check user data from profile
  try {
    const userData = getCookie('user_data');
    if (userData) {
      const parsedData = JSON.parse(userData);
      return parsedData.subscription === 'paid';
    }
  } catch (error) {
    console.error('Error checking user subscription status:', error);
  }
  
  return false;
};

/**
 * Update user data after successful payment
 */
export const updateUserAfterPayment = () => {
  try {
    const userData = getCookie('user_data');
    if (userData) {
      const parsedData = JSON.parse(userData);
      parsedData.subscription = 'paid';
      setCookie('user_data', JSON.stringify(parsedData), { expires: 7 });
      
      // Dispatch a custom event for other components to react
      const event = new CustomEvent('subscriptionUpdated', { 
        detail: { subscription: 'paid' } 
      });
      window.dispatchEvent(event);
      
      return true;
    }
  } catch (error) {
    console.error('Error updating user data after payment:', error);
  }
  
  return false;
};