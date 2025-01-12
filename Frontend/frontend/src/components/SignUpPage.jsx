// SignUpForm
import React, { useState } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import '../styles.css';


const SignUpPage = () => {

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const { fullName, email, password, confirmPassword } = formData;

    if (!fullName || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setSuccess(true);
    console.log('Form submitted:', formData);
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <div className="logo-container">
            <svg viewBox="0 0 400 100" className="logo">
              <text x="80" y="70" className="logo-text">
                <tspan className="logo-look">Look</tspan>
                <tspan className="logo-maxx">Maxx Logo</tspan>
              </text>
            </svg>
          </div>
          <p className="slogan">Beauty Redefined</p>
        </div>
        <div className="signup-content">
          {error && (
            <div className="error-alert">
              {error}
            </div>
          )}
          {success && (
            <div className="success-alert">
              Welcome to LookMaxx. Time to redefine your look.
            </div>
          )}
          {!success && (
            <form onSubmit={handleSubmit} className="signup-form">
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">Full Name</label>
                <div className="input-container">
                  <User className="input-icon" />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    className="form-input"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Your name"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <div className="input-container">
                  <Mail className="input-icon" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="input-container">
                  <Lock className="input-icon" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="form-input"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <div className="input-container">
                  <Lock className="input-icon" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    className="form-input"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button type="submit" className="submit-button">
                Start Your Transformation
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};


export default SignUpPage;