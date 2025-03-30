import React, { useState, useEffect } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/signup/signupstyles.css';
import '../../styles/signup/signup-fixes.css';

const SignUp = ({ initialActiveTab = 'signup', onBackToHome }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup } = useAuth(); // Make sure to get signup function from useAuth

  // Use initialActiveTab to determine if the card is flipped
  const [isFlipped, setIsFlipped] = useState(initialActiveTab === 'login');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
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
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // If token exists, check if it's still valid
      checkTokenValidity();
    }
    
    // Set initial tab based on prop
    setIsFlipped(initialActiveTab === 'login');
  }, [initialActiveTab]);

  const checkTokenValidity = async () => {
    try {
      // Make an authenticated request to a protected endpoint
      await fetch('/api/protected-route'); // Replace with an actual protected route
      
      // If the request succeeds, the token is valid
      navigate('/ffr'); // Redirect to protected page
    } catch (error) {
      // If the token is invalid, the interceptor will handle cleanup
      console.log('Token validation failed or session expired');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update formData state
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
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

  // Updated handleLoginSubmit function
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const { loginUsername, loginPassword } = formData;

    if (!loginUsername || !loginPassword) {
      setError('All fields are required.');
      return;
    }

    setIsLoading(true);
    setError('');
  
    try {
      // Check for return path from state
      const returnPath = location.state?.returnPath || '/profile';
      
      // Call the login function from useAuth
      const result = await login(loginUsername, loginPassword, null, {
        redirectPath: returnPath
      });
      
      if (result && result.success) {
        console.log('User logged in:', loginUsername);
        // No need to navigate - the login function will handle redirection
      } else {
        setError(result?.error || 'Invalid username or password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, username, email, gender, password, confirmPassword, profilePicture } = formData;  

    // Validation checks
    if (!firstName || !lastName || !username || !email || !gender || !password || !confirmPassword || !profilePicture) {
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
  
    setIsLoading(true);
  setError('');

  try {
    // Prepare user data
    const userData = {
      firstName,
      lastName,
      username,
      email,
      gender,
      password
    };
    
    // Call the signup function from useAuth hook
    const result = await signup(userData, profilePicture);
    
    if (result && result.success) {
      // Set success state
      setSuccess(true);
      
      // Log success message
      console.log('Signup successful! User data:', result.data);
      
      // Auto-login after successful signup
      try {
        const loginResult = await login(username, password, null, {
          skipRefresh: true,
          source: 'signup'
        });
        
        if (loginResult && loginResult.success) {
          // Navigate to face-model page with gender parameter
          setTimeout(() => {
            navigate(`/face-model?gender=${gender}`);
          }, 2000);
        } else {
          console.warn('Auto-login failed:', loginResult?.error);
          setError('Signup successful but automatic login failed. Please login manually.');
        }
      } catch (loginError) {
        console.error('Auto-login error:', loginError);
        setError('Signup successful but automatic login failed. Please login manually.');
      }
    } else {
      setError(result?.error || 'Registration failed. Please try again.');
    }
  } catch (error) {
    console.error('Registration error:', error);
    setError(error.message || 'Registration failed. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="auth-container">
      <div className="back-home-button-container">
        <button 
          className="back-home-button"
          onClick={() => navigate('/ffr')}
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
                <label htmlFor="loginUsername" className="form-label">Username</label>
                <div className="input-container">
                  <User className="input-icon" />
                  <input
                    id="loginUsername"
                    name="loginUsername"
                    type="text"
                    className="form-input"
                    value={formData.loginUsername}
                    onChange={handleChange}
                    placeholder="YourUsername"
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
          
          {/* Sign Up Form */}
          <div className="auth-card front">
            {error && <div className="error-alert">{error}</div>}
            {success && (
              <div className="success-alert">
                Welcome to LookSci. Time to redefine your look.
              </div>
            )}
            
            {!success && (
              <form onSubmit={handleSignUpSubmit} className="auth-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <div className="input-container">
                      <User className="input-icon" />
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        className="form-input"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Your first name"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <div className="input-container">
                      <User className="input-icon" />
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        className="form-input"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Your last name"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="username" className="form-label">Username</label>
                  <div className="input-container">
                    <User className="input-icon" />
                    <input
                      id="username"
                      name="username"
                      type="text"
                      className="form-input"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="YourUsername"
                      disabled={isLoading}
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
                      disabled={isLoading}
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
                        disabled={isLoading}
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
                        disabled={isLoading}
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
                        disabled={isLoading}
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
                      disabled={isLoading}
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
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button type="submit" className="submit-button" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Start Your Transformation'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;