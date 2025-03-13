import React, { useState, useEffect } from "react";
import axios from 'axios'; // Import axios for making HTTP requests
import '../styles/Profilesection.css';
import '../styles/avatarsection.css';
import '../styles/settingssection.css';
import AvatarModel from './AvatarModel'; 

const Profile = () => {
  // Define the loading state
  const [loading, setLoading] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [userData, setUserData] = useState(null); // State to store user data

  // UseEffect to fetch the user data from backend on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get JWT token from local storage
        const token = localStorage.getItem("access_token");
        if (!token) {
          alert("Authentication token not found. Please log in again.");
          return;
        }
  
        // Send GET request to backend
        const response = await axios.get('http://your-backend-url/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        // Set user data to state
        setUserData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        alert("An error occurred while fetching the user data.");
      }
    };

    fetchUserData();
  }, []);

  // Handler for delete user button
  const handleDeleteUser = async (username) => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        console.log("User deletion initiated");
  
        // Get JWT token from local storage
        const token = localStorage.getItem("access_token");
        if (!token) {
          alert("Authentication token not found. Please log in again.");
          return;
        }
  
        // Send DELETE request to backend
        const response = await axios.delete(
          `http://your-backend-url/users/${username}`,                                  //add the backend url here
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        alert(response.data.message);
  
        // Remove token from local storage and redirect user
        localStorage.removeItem("access_token");
        window.location.href = "/login"; // Redirect to login page after deletion
      } catch (error) {
        console.error("Error deleting user:", error);
        alert(
          error.response?.data?.error || "An error occurred while deleting the account."
        );
      }
    }
  };
  
  // Handler for upgrading the acc
  const handleUpgradeAccount = () => {
    alert("Redirecting to premium upgrade page");
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
      <button className="backbtn"><span>Back</span></button>

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

export default Profile;
