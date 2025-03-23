import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/profile/ProfileSection.css';
import '../../styles/profile/AvatarSection.css';
import '../../styles/profile/SettingsSection.css';
import AvatarModel from './AvatarModel';
import { useAuthContext } from '../../context/AuthProvider';
import { getCookie } from '../../utils/cookies';

const ProfileSection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, userName, logout } = useAuthContext();
  
  // Define the loading state
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    if (!isLoggedIn) {
      navigate('/signup', { state: { activeTab: 'login' } });
      return;
    }

    //debug lines to check whether the cookie is being stored
    console.log('Access token in cookie:', getCookie('access_token'));
    console.log('User data in cookie:', getCookie('user_data'));

    // Check if we should show settings tab by default
    const activeTab = location.state?.activeTab;
    if (activeTab === 'settings') {
      setShowSettings(true);
    }
    
    // Check for payment success/error messages from location state
    if (location.state?.paymentSuccess) {
      setError(null); // Clear any existing errors
      // Display success message temporarily
      const successMsg = document.createElement('div');
      successMsg.className = 'payment-success-message';
      successMsg.innerHTML = `
        <div style="position: fixed; top: 80px; left: 50%; transform: translateX(-50%); 
                    background-color: rgba(76, 175, 80, 0.9); color: white; padding: 15px 25px; 
                    border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 1000;
                    display: flex; align-items: center; gap: 10px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z" 
                  fill="currentColor"/>
          </svg>
          ${location.state.message || 'Payment successful! Your account has been upgraded to Premium!'}
        </div>
      `;
      document.body.appendChild(successMsg);
      
      // Remove the message after 5 seconds
      setTimeout(() => {
        if (successMsg.parentNode) {
          document.body.removeChild(successMsg);
        }
      }, 5000);
      
      // Clear the location state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
    } else if (location.state?.paymentError) {
      setError(location.state.message || 'Payment verification failed. Please try again.');
      
      // Clear the location state to prevent showing the error again on refresh
      window.history.replaceState({}, document.title);
    }

    // Get user data from cookies and transform for our component
    const fetchUserDataFromCookies = () => {
      try {
        const userDataString = getCookie('user_data');
        if (!userDataString) {
          throw new Error("User data not found. Please log in again.");
        }
        
        const cookieData = JSON.parse(userDataString);
        console.log("User data from cookie:", cookieData);
        
        // Check for premium subscription from the backend data
        const isPremium = cookieData.subscription === 'paid';
        
        // Transform the data to match our component's expected structure
        setUserData({
          fullName: `${cookieData.first_name} ${cookieData.last_name}`,
          username: cookieData.username,
          email: cookieData.email,
          gender: cookieData.gender || 'Male', // Default if not available
          accountType: isPremium ? 'premium' : 'regular',
          profileImage: cookieData.profile_picture || 'https://i.pravatar.cc/300' // Use actual S3 URL or fallback
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error parsing user data from cookies:", error);
        setError("Failed to load user profile. Please log in again.");
        setLoading(false);
      }
    };

    fetchUserDataFromCookies();
    
    // Listen for subscription updates from payment events
    const handleSubscriptionUpdate = (event) => {
      if (event.detail && event.detail.subscription === 'paid') {
        setUserData(prevData => ({
          ...prevData,
          accountType: 'premium'
        }));
      }
    };
    
    window.addEventListener('subscriptionUpdated', handleSubscriptionUpdate);
    
    return () => {
      window.removeEventListener('subscriptionUpdated', handleSubscriptionUpdate);
    };
  }, [isLoggedIn, navigate, location.state]);

  // Handler for delete user button
  const handleDeleteUser = async (username) => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        setIsDeleting(true);
        setError(null);
        
        console.log("User deletion initiated for:", username);
        
        // Get token from cookies for authorization
        const token = getCookie('access_token');
        if (!token) {
          throw new Error("Authentication token not found. Please log in again.");
        }
        
        // Call the backend API to delete the user
        const response = await axios.delete(`/auth/users/${username}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log("Delete user response:", response.data);
        
        // If successful, log out the user
        logout();
        navigate('/signup', { state: { activeTab: 'login' } });
      } catch (error) {
        console.error("Error deleting user:", error);
        setError(error.response?.data?.error || "An error occurred while deleting the account.");
        setIsDeleting(false);
      }
    }
  };
  
  // Handler for upgrading the account
  const handleUpgradeAccount = () => {
    navigate('/pricing');
  };

  // Handler for toggling settings visibility
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Handler for changing privacy settings
  const handlePrivacyChange = () => {
    setIsPublic(!isPublic);
  };

  // Handler for saving settings
  const saveSettings = () => {
    alert(`Privacy settings updated. Your account is now ${isPublic ? "public" : "private"}.`);
    setShowSettings(false);
  };

  // Handler for back button
  const handleBack = () => {
    navigate('/ffr');
  };
  
  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }
  
  return (
    <div className="profile-container">
      <button className="backbtn" onClick={handleBack}><span>Back</span></button>

      {error && (
        <div className="error-alert" style={{ marginBottom: '20px', padding: '10px', color: 'white', backgroundColor: '#ff4d4d', borderRadius: '4px', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <div className="profile-header-bg">
        <div id="container-stars">
          <div id="stars" />
        </div>
      </div>
      <div className="profile-content-wrapper">
        <div className="profile-main">
          {/* Left Side - Profile Info */}
          <div className="profile-info-section">
            <div className="profile-image-container">
              {userData && userData.profileImage ? (
                <img 
                  src={userData.profileImage} 
                  alt="Profile" 
                  className="profile-image" 
                />
              ) : (
                <div className="profile-image-placeholder">
                  <span>{userData?.fullName?.charAt(0) || 'U'}</span>
                </div>
              )}
              <div className="profile-status online"></div>

              {/* Premium Crown for premium users */}
              {userData.accountType === "premium" && (
                <div className="premium-crown">
                  <span className="crown-icon">👑</span>
                </div>
              )}
            </div>
    
            <div className="profile-details">
              <h1>{userData.fullName}</h1>
              <p className="username">{userData.username}</p>

              <div className={`account-type-badge ${userData.accountType}`}>
                {userData.accountType === "premium" ? "Premium" : "Regular"}
              </div>
              
              <div className="profile-data">
                <div className="data-item">
                  <span className="label">Email:</span>
                  <span className="value">{userData.email}</span>
                </div>
                <div className="data-item">
                  <span className="label">Gender:</span>
                  <span className="value">{userData.gender}</span>
                </div>
                <div className="data-item">
                  <span className="label">Account Type:</span>
                  <span className="value">{userData.accountType === "premium" ? "Premium" : "Regular"}</span>
                </div>
              </div>

              <div className="profile-actions">
                {userData.accountType !== "premium" && (
                  <button 
                    className="btn-primary upgrade-btn"
                    onClick={handleUpgradeAccount}
                  >
                    Upgrade to Premium
                  </button>
                )}
                <button 
                  className="btn-secondary"
                  onClick={toggleSettings}>
                  Settings
                </button>
                <button 
                  className="btn-danger"
                  onClick={() => handleDeleteUser(userData.username)}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </div>
          </div>

          {showSettings ? (
            <div className="settings-container">
              <div className="settings-header">
                <h2>Account Settings</h2>
                <button className="settings-close" onClick={toggleSettings}>×</button>
              </div>
              <div className="settings-content">
                <div className="settings-section">
                  <h3>Privacy Settings</h3>
                  <div className="settings-option">
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={isPublic} 
                        onChange={handlePrivacyChange}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <div className="setting-description">
                      <p className="setting-title">Public Profile</p>
                      <p className="setting-info">
                        {isPublic 
                          ? "Your profile is visible to everyone" 
                          : "Your profile is only visible to you"
                        }
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="settings-actions">
                  <button className="btn-primary" onClick={saveSettings}>
                    Save Changes
                  </button>
                  <button className="btn-secondary" onClick={toggleSettings}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="avatar-container">
              <div className="avatar-display">
                <div className="avatar-model">
                  <div className="avatar-model-placeholder">
                      {/* The AvatarModel will be rendering here */}
                      <AvatarModel gender={userData.gender} />
                  </div>
                  <h3>Your 3D Avatar</h3>
                  <p>Automatically generated based on your gender selection</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;