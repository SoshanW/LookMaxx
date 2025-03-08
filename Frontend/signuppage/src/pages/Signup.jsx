import React, { useState, useEffect } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SignUpPage = () => {
  const navigate = useNavigate();

  const [isFlipped, setIsFlipped] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    gender: '',
    password: '',
    confirmPassword: '',
    loginEmail: '',
    loginPassword: '',
    profilePicture: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

const handleLoginSubmit = (e) => {
  e.preventDefault();
  const { loginEmail, loginPassword } = formData;

  if (!loginEmail || !loginPassword) {
    setError('All fields are required.');
    return;
  }

  if (!validateEmail(loginEmail)) {
    setError('Please enter a valid email address.');
    return;
  }

  console.log('Login form submitted:', { email: loginEmail, password: loginPassword });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Check if the file is an image
      if (!file.type.match('image.*')) {
        setError('Please select an image file (jpg, png, etc)');
        return;
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      // Update form data with the file
      setFormData({ ...formData, profilePicture: file });
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear any errors
      setError('');
    }
  };

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    const { fullName, email, gender, password, confirmPassword, profilePicture } = formData;

    if (!fullName || !email || !gender || !password || !confirmPassword || !profilePicture) {
      setError('All fields including profile picture are required.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
  
    setSuccess(true);
    console.log('Form submitted:', formData);
  
    if (gender === 'female') {
      setTimeout(() => {
        navigate('/face-model');
      }, 1500);
    }

    if (gender === 'male') {
      setTimeout(() => {
        navigate('/face-model');
      }, 1500);
    }
      
  };


  return (
    <div className="auth-container">

      <div className="back-home-button-container">
        <button 
          className="back-home-button"
          onClick={() => navigate('/')} // This will navigate to your home route
        >
          Back to Home
        </button>
      </div>
      
      <div className="auth-content">
        {/* Static Header */}
        <div className="header-content">
          <h1 className="logo-text">
            <span className="logo-look">Look</span>
            <span className="logo-maxx">Sci</span>
          </h1>
          <p className="slogan">Beauty Redefined</p>
        </div>

        {/* Navigation Tabs */}
        <div className="slider-tabs">
        <button 
            className={`tab-button ${isFlipped ? 'active' : ''}`}
            onClick={() => setIsFlipped(true)}
          >
            Login
          </button>
          <button 
            className={`tab-button ${!isFlipped ? 'active' : ''}`}
            onClick={() => setIsFlipped(false)}
          >
            Sign Up
          </button>
         
        </div>

        {/* Flip Cards Container */}
        
        <div className={`auth-wrapper ${isFlipped ? 'flipped' : ''} ${error ? 'with-error' : ''}`}> 

          {/* Login Form */}
          <div className="auth-card back">
            {error && <div className="error-alert">{error}</div>}
            
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="loginEmail" className="form-label">Email</label>
                <div className="input-container">
                  <Mail className="input-icon" />
                  <input
                    id="loginEmail"
                    name="loginEmail"
                    type="email"
                    className="form-input"
                    value={formData.loginEmail}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="loginPassword" className="form-label">Password</label>
                <div className="input-container">
                  <Lock className="input-icon" />
                  <input
                    id="loginPassword"
                    name="loginPassword"
                    type="password"
                    className="form-input"
                    value={formData.loginPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button type="submit" className="submit-button">
                Login
              </button>
            </form>
          </div>
          
          {/* Sign Up Form */}
          <div className="auth-card front">
            {error && <div className="error-alert">{error}</div>}
            {success && (
              <div className="success-alert">
                Welcome to LookMaxx. Time to redefine your look.
              </div>
            )}
            
            {!success && (
              <form onSubmit={handleSignUpSubmit} className="auth-form">
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
                  <label className="form-label">Gender</label>
                  <div className="gender-group">
                    <div className="gender-option">
                      <input
                        type="radio"
                        id="male"
                        name="gender"
                        value="male"
                        checked={formData.gender === 'male'}
                        onChange={handleChange}
                        className="gender-radio"
                      />
                      <label htmlFor="male" className="gender-label">Male</label>
                    </div>
                    <div className="gender-option">
                      <input
                        type="radio"
                        id="female"
                        name="gender"
                        value="female"
                        checked={formData.gender === 'female'}
                        onChange={handleChange}
                        className="gender-radio"
                      />
                      <label htmlFor="female" className="gender-label">Female</label>
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                    <label className="form-label">Profile Picture</label>
                    <div className="profile-upload-container">
                      <div className="profile-preview">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Profile preview" className="profile-image-preview" />
                        ) : (
                          <div className="profile-placeholder">
                            <User size={40} />
                          </div>
                        )}
                      </div>
                      <div className="upload-button-container">
                        <label htmlFor="profilePicture" className="upload-button">
                          {imagePreview ? 'Change Photo' : 'Upload Photo'}
                        </label>
                        <input
                          type="file"
                          id="profilePicture"
                          name="profilePicture"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="file-input"
                        />
                      </div>
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

    </div>
  );
};


export default SignUpPage;