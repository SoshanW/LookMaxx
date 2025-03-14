import React, { useState, useEffect } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

// Create an axios instance for API calls
const api = axios.create({
  baseURL: 'http://your-api-url', // Replace with your actual API URL
  timeout: 10000
});

// Configure request interceptor to add JWT to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Configure response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const response = await axios.post('http://your-api-url/refresh-token', {
            refresh_token: refreshToken,
          });

          const newAccessToken = response.data.access_token;
          localStorage.setItem('access_token', newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest); // Retry the original request
        } catch (refreshError) {
          console.log('Refresh token failed, logging out');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
          window.location.href = '/signup';
        }
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
        window.location.href = '/signup';
      }
    }

    return Promise.reject(error);
  }
);


const SignUp = ({ initialActiveTab = 'signup', onBackToHome }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();

  // Use initialActiveTab to determine if the card is flipped
  const [isFlipped, setIsFlipped] = useState(initialActiveTab === 'login');
  
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
      await api.get('/protected-route'); // Replace with an actual protected route
      
      // If the request succeeds, the token is valid
      navigate('/ffr'); // Redirect to protected page
    } catch (error) {
      // If the token is invalid, the interceptor will handle cleanup
      console.log('Token validation failed or session expired');
    }
  };

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
      const response = await axios.post('http://your-api-url/login', {
        username: loginUsername,
        password: loginPassword,
      });
  
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      localStorage.setItem(
        'user_data',
        JSON.stringify({ username: loginUsername, name: loginUsername })
      );
  
      authLogin(loginUsername);
      setTimeout(() => navigate('/ffr'), 100);
    } catch (error) {
      setError(error.response?.data.error || 'Login failed. Please try again.');
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
  
    setIsLoading(true);
    setError('');

    try {
      // Split fullName into first and last name
      const nameParts = fullName.split(' ');
      const first_name = nameParts[0];
      const last_name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      // Create form data for multipart/form-data request
      const formDataToSend = new FormData();
      formDataToSend.append('username', username);
      formDataToSend.append('email', email);
      formDataToSend.append('first_name', first_name);
      formDataToSend.append('last_name', last_name);
      formDataToSend.append('gender', gender);
      formDataToSend.append('password', password);
      formDataToSend.append('profile_picture', profilePicture);

      // In a real app, send registration request
      // For now, simulate a successful registration
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store login info to auto-login after signup
      localStorage.setItem('access_token', 'mock_token_for_testing');
      localStorage.setItem('user_data', JSON.stringify({
        username: username,
        name: fullName
      }));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userName', fullName);
      
      // Call auth login with full name
      authLogin(fullName);
      
      // Mock success response
      setSuccess(true);
      
      // Navigate to face-model page with gender parameter after a short delay
      setTimeout(() => {
        navigate(`/face-model?gender=${gender}`);
      }, 2000);
      
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response) {
        // Handle specific error cases
        if (error.response.status === 409) {
          setError('Username or email already exists.');
        } else {
          setError(error.response.data.error || 'Registration failed. Please try again.');
        }
      } else if (error.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError('Registration failed. Please try again.');
      }
      
      setSuccess(false);
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
                      disabled={isLoading}
                    />
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