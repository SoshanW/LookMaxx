import React, { useState, useEffect } from "react";
 import { motion } from "framer-motion";
 import "../app.css";
 
 const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile");
     
  const userData = {
  
    firstName: "Mariyam",
    lastName: "Jameela",
    email: "mjameela@gmail.com",
    gender: "Female",
    username: "@mariyamj",
    profileImage: "pfp.jpg"
  };
     return (
       <div className="profile-container">
         <h1>Profile Page</h1>
         <div className="profile-header-bg">
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

            <div className="profile-nav">
            <ul>
              <li 
                className={activeTab === "profile" ? "active" : ""}
                onClick={() => setActiveTab("profile")}
              >
                Profile
              </li>
              <li 
                className={activeTab === "collections" ? "active" : ""}
                onClick={() => setActiveTab("collections")}
              >
                Collections
              </li>
              <li 
                className={activeTab === "gallery" ? "active" : ""}
                onClick={() => setActiveTab("gallery")}
              >
                Gallery
              </li>
              <li 
                className={activeTab === "settings" ? "active" : ""}
                onClick={() => setActiveTab("settings")}
              >
                Settings
              </li>
            </ul>
            </div>

            {/* Tab Content - Empty placeholders for now */}
            <div className="tab-content">
            {activeTab === "profile" && (
              <div className="content-section">
                <h2>Personal Information</h2>
                <p className="placeholder-text">Profile information will appear here</p>
              </div>
            )}

            {activeTab === "collections" && (
              <div className="content-section">
                <h2>Your Collections</h2>
                <p className="placeholder-text">Your collections will appear here</p>
              </div>
            )}

            {activeTab === "gallery" && (
              <div className="content-section">
                <h2>Your Gallery</h2>
                <p className="placeholder-text">Your gallery will appear here</p>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="content-section">
                <h2>Account Settings</h2>
                <p className="placeholder-text">Settings options will appear here</p>
              </div>
            )}
            </div>
            </div>
            


              
   );
 };

 export default Profile;