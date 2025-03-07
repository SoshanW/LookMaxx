import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "../app.css";

const Profile = () => {
  const userData = {
    firstName: "Mariyam",
    lastName: "Jameela",
    email: "mjameela@gmail.com",
    gender: "Female",
    username: "@mariyamj",

    profileImage: "pfp.png"
  };

  return (
    <div className="profile-container">
      <div className="profile-header-bg"></div>

      {/* Main Profile Content */}
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
            </div>
            
            <div className="profile-details">
              <h1>{userData.firstName} {userData.lastName}</h1>
              <p className="username">{userData.username}</p>
              
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
                  <span className="label">Location:</span>
                  <span className="value">{userData.location}</span>
                </div>
              </div>
              
              <div className="profile-bio">
                <p>{userData.bio}</p>
              </div>
              
              <div className="profile-actions">
                <button className="btn-primary">Edit Profile</button>
                <button className="btn-secondary">Settings</button>
              </div>
            </div>
          </div>
          
          {/* Right Side - 3D Avatar Display */}
          <div className="avatar-container">
            <div className="avatar-display">
              <div className="avatar-model">
                {/* Placeholder for the actual 3D model */}
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