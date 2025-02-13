import React from 'react';
import { Link } from "react-router-dom";
import './styles.css'; // Import the separate CSS file

function Header() {
  return (
    <header className="header">
      {/* Logo Section */}
      <div className="logo">
        
      </div>

      {/* Navigation Menu */}
      <nav className="nav-menu">
        <ul className="nav-list">
          <li><a href="#home">Home</a></li>
          <li><a href="#retail">Retail</a></li>
          <li><a href="#community">Community</a></li>
          <li><a href="#study">Study</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#ffr">FFR</a></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
