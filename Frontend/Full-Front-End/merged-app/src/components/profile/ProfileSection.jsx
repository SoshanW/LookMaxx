import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthProvider';
import AvatarModel from './AvatarModel';
import '../../styles/profile/ProfileSection.css';
import '../../styles/profile/AvatarSection.css';
import '../../styles/profile/SettingsSection.css';

const ProfileSection = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userName, logout } = useAuthContext();
  
  // Define the loading state
  const [loading, setLoading] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    if (!isLoggedIn) {
      navigate('/signup', { state: { activeTab: 'login' } });
      return;
    }

    // For demo purposes, creating mock user data
    // In a real app, this would be fetched from an API
    const mockUserData = {
      fullName: userName || 'Demo User',
      username: userName?.toLowerCase().replace(/\s/g, '_') || 'demo_user',
      email: 'user@example.com',
      gender: 'Male', // Default gender
      accountType: 'regular', // Default account type
      profileImage: 'https://i.pravatar.cc/300' // Default avatar
    };

    // Simulate API call delay
    setTimeout(() => {
      setUserData(mockUserData);
      setLoading(false);
    }, 1000);
  }, [isLoggedIn, userName, navigate]);

  // Handler for delete user button
  const handleDeleteUser = async (username) => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        console.log("User deletion initiated for:", username);
        
        // In a real app, send a delete request to your backend
        // For now, just log out the user
        logout();
        navigate('/signup', { state: { activeTab: 'login' } });
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("An error occurred while deleting the account.");
      }
    }
  };
  
  // Handler for upgrading the account
  const handleUpgradeAccount = () => {
    navigate('/pricing'); // Navigate to the pricing page
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
    navigate('/ffr'); // Navigate back to the FFR page
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
              <img 
                src={userData.profileImage} 
                alt="Profile" 
                className="profile-image" 
              />
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
                  onClick={() => handleDeleteUser(userData.username)}>
                  Delete Account
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