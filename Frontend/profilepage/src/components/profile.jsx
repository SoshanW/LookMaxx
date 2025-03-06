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
        profileImage: "https://via.placeholder.com/150"
      };

    return (
      <div className="profile-container">
        <div className="profile-header-bg">
            
        </div>
      </div>
    );
  }

export default Profile;