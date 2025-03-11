// src/components/SignUp.jsx
import React, { useState } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    gender: '',
    password: '',
    confirmPassword: '',
    loginUsername: '',
    loginPassword: '',
    profilePicture: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
const handleChange = (e) => {
    const updatedFormData = { ...formData, [e.target.name]: e.target.value };
    setFormData(updatedFormData);
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
    const { loginUsername, loginPassword } = formData;
  
    if (!loginUsername || !loginPassword) {
      setError('All fields are required.');
      return;
    }
  
    console.log('Login form submitted:', { username: loginUsername, password: loginPassword });
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
    const { fullName, username, email, gender, password, confirmPassword, profilePicture } = formData;
  
    if (!fullName || !username || !email || !gender || !password || !confirmPassword || !profilePicture) {
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
  
    // Navigate to face-model page with gender parameter
    navigate(`/face-model?gender=${gender}`);
  };

  // Form handlers will be added in the next commit

  return (
    <div className="auth-container">
      <div className="back-home-button-container">
        <button 
          className="back-home-button"
          onClick={() => navigate('/')}
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

        {/* Form containers will be added in the next commit */}
        <div className={`auth-wrapper ${isFlipped ? 'flipped' : ''} ${error ? 'with-error' : ''}`}>
          {/* Login form will go here */}
          <div className="auth-card back">
            {/* Login form placeholder */}
          </div>
          
          {/* Sign Up form will go here */}
          <div className="auth-card front">
            {/* Sign Up form placeholder */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;