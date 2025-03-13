import React, { useState, useEffect } from "react";
import '../styles/Profilesection.css';
import '../styles/avatarsection.css';

const Profile = () => {
  // Define the loading state
  const [loading, setLoading] = useState(true);
  
  // Simplified user data structure
  const userData = {
    fullName: "Mariyam Jameela",
    email: "mjameela@gmail.com",
    gender: "Female",
    username: "@mariyamj",
    profileImage: "pfp.jpg",
    accountType: "premium"
  };
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Handler for delete user button
  const handleDeleteUser = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      console.log("User deletion initiated");
      alert("Account deletion request submitted");
    }
  };

  //handler for upgrading the acc
  const handleUpgradeAccount = () => {
    alert("Redirecting to premium upgrade page");
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
      <div className="profile-header-bg"></div>
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

                </div><div className="data-item">
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
                  className="btn-danger"
                  onClick={handleDeleteUser}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
          
          {/* Right Side - 3D Avatar Display */}
          <div className="avatar-container">
            <div className="avatar-display">
              <div className="avatar-model">
                <div className="avatar-model-placeholder">
                  <span className="model-label">{userData.gender} Avatar</span>
                </div>
                <h3>Your 3D Avatar</h3>
                <p>Automatically generated based on your gender selection</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;