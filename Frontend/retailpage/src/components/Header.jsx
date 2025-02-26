import React from "react";
import { Link } from "react-router-dom";
import { User, LogIn } from "lucide-react";
import '../styles/Header.css';

function Header() {
  return (
    <header className="header">
      {/* Logo Section */}
      <div className="logo"></div>

      {/* Navigation Menu */}
      <nav className="nav-menu">
        <ul className="nav-list">
          <li><a href="#home">Home</a></li>
          <li><Link to="/retail">Retail</Link></li>
          <li><a href="#community">Community</a></li>
          <li><a href="#study">Study</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#ffr">FFR</a></li>
        </ul>
      </nav>

      {/* Sign-in & User Profile Icons */}
      <div className="auth-icons">
        <Link to="/login">
          <LogIn size={28} className="icon" />
        </Link>
        <Link to="/profile">
          <User size={28} className="icon" />
        </Link>
      </div>
    </header>
  );
}

export default Header;
