import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from "../../context/AuthProvider";
import useAuth from "../../hooks/useAuth";
import axios from 'axios';
import "../../styles/casting/CastingApplicationForm.css";

function CastingApplicationForm() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthContext();
  const { getUserProfile } = useAuth();
  const scrollContainerRef = useRef(null);
  
  // Form state with all required fields including measurements
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    country: '',
    height: '',           
    bustChest: '',        
    waistHips: '',        
    message: '',          
  });
  
  // Keeping track of errors and submission status
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showFfrResults, setShowFfrResults] = useState(false);

  const [ffrData, setFfrData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingError, setLoadingError] = useState(null);

  // Create a new component for PDF rendering
  const PdfViewer = ({ pdfUrl }) => {
    const [fallbackView, setFallbackView] = useState(false);
    
    // Handle iframe load errors
    const handleError = () => {
      console.log("PDF iframe failed to load, switching to fallback view");
      setFallbackView(true);
    };
    
    return (
      <div className="pdf-viewer-container">
        {!fallbackView ? (
          <iframe 
            src={pdfUrl}
            className="ffr-pdf-viewer"
            style={{ 
              width: '100%', 
              height: '500px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
            title="FFR Analysis Report"
            onError={handleError}
            sandbox="allow-same-origin allow-scripts allow-forms"
          />
        ) : (
          <div className="pdf-fallback-view">
            <p>Unable to display the PDF directly. Please use the button below to view it:</p>
            <a 
              href={pdfUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="primary-button"
            >
              Open PDF in New Tab
            </a>
            <img 
              src="/pdf-placeholder.png" 
              alt="PDF Document Preview Placeholder" 
              style={{ 
                width: '100%', 
                maxWidth: '300px', 
                display: 'block',
                margin: '20px auto'
              }}
            />
          </div>
        )}
      </div>
    );
  };


  // Apply special class for application form page and ensure scrolling works
  useEffect(() => {
    // Apply a specific class for this page
    document.body.classList.add('application-form-page');
    
    // Override any overflow restrictions that might be preventing scrolling
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.documentElement.style.overflowY = 'auto';
    
    // Force scroll position to top when component mounts
    window.scrollTo(0, 0);
    
    return () => {
      document.body.classList.remove('application-form-page');
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflowY = '';
    };
  }, []);

  // Handle changes in any form field
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update the form data state with the new value
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    
    // Clear validation errors for this field as user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  // Validate all form fields before submission
  const validateForm = () => {
    if (!ffrDataAvailable) {
      errors.ffr = 'FFR analysis results are required to submit the application.';
    }
    const errors = {};
    
    // Name validation - both first and last names required
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    
    // Email validation - check for format and presence
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email address is invalid';
    }
    
    // Phone validation - basic format check
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s\-()]{8,20}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    // Age validation - ensure it's within model agency requirements
    if (!formData.age) {
      errors.age = 'Age is required';
    } else if (formData.age < 16 || formData.age > 80) {
      errors.age = 'Age must be between 16 and 80';
    }
    
    // Other required fields
    if (!formData.gender) errors.gender = 'Please select your gender';
    if (!formData.country.trim()) errors.country = 'Country of Residence is required';
    if (!formData.height.trim()) errors.height = 'Height is required';
    if (!formData.bustChest.trim()) errors.bustChest = 'Bust/Chest measurement is required';
    if (!formData.waistHips.trim()) errors.waistHips = 'Waist/Hips measurement is required';
    
    // Update error state with any validation errors found
    setFormErrors(errors);
    
    // Form is valid if there are no errors
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Only proceed if all validation passes
    if (validateForm()) {
      console.log('Form submitted:', formData);
      
      // Show success message to user
      setIsSubmitted(true);
      
      // Reset form fields after a small delay (for UX purposes)
      setTimeout(() => {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          age: '',
          gender: '',
          country: '',
          height: '',
          bustChest: '',
          waistHips: '',
          message: '',
        });
      }, 1500);
    }
  };

  /**
   * Navigate back to the home page
   */
  const handleReturnHome = () => {
    navigate('/casting');
  };

  /**
   * Show/hide the FFR analysis results preview
   */
  const toggleFfrResults = async() => {
    console.log('User data:', JSON.parse(localStorage.getItem('user_data') || '{}'));
    console.log('Cookies available:', document.cookie);
    if (showFfrResults) {
      setShowFfrResults(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get the data from the API
      const data = await getFfrResults();
      console.log('Raw data from API:', data);
      
      // Log the exact structure to see what we're working with
      console.log('Data type:', typeof data);
      console.log('Data keys:', data ? Object.keys(data) : 'No data received');
      
      // Check if we have the ffr_results property
      if (data && data.ffr_results) {
        console.log('FFR results exists, type:', typeof data.ffr_results);
        console.log('Is array?', Array.isArray(data.ffr_results));
        console.log('Length:', data.ffr_results.length);
        
        // If it's an array with at least one item
        if (Array.isArray(data.ffr_results) && data.ffr_results.length > 0) {
          console.log('First item in array:', data.ffr_results[0]);
          
          // Check for pdf_url field 
          if (data.ffr_results[0].pdf_url) {
            const pdfUrl = data.ffr_results[0].pdf_url;
            console.log('Found PDF URL:', pdfUrl);
            
            // Format the URL correctly
            const formattedUrl = pdfUrl.startsWith('http') 
              ? pdfUrl 
              : `${window.location.origin}${pdfUrl}`;
            
            console.log('Formatted URL:', formattedUrl);
            setFfrData({ pdf_url: formattedUrl });
          } else {
            console.log('No pdf_url field found. Available fields:', Object.keys(data.ffr_results[0]));
            setLoadingError('No FFR PDF report found. Please complete your FFR analysis first.');
          }
        } else {
          console.log('FFR results is empty or not an array');
          setLoadingError('No FFR results found. Please complete your FFR analysis first.');
        }
      } else {
        console.log('No ffr_results property found in the response');
        setLoadingError('No FFR results structure found in the response.');
      }
    } catch (error) {
      console.error('Error details:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      setLoadingError('Unable to load your FFR results. Please try again later.');
    } finally {
      setIsLoading(false);
      setShowFfrResults(true);
    }
  };

  const getFfrResults = async () => {
    try {
      const cookieString = document.cookie;
      console.log('Extracting from cookies:', cookieString);
      
      let username = null;
      
      if (cookieString.includes('user_data=')) {
        try {
          const userDataCookie = cookieString
            .split('user_data=')[1]
            ?.split(';')[0];
          if (userDataCookie) {
            // Decode the URL-encoded cookie value
            const decodedCookie = decodeURIComponent(userDataCookie);
            const userData = JSON.parse(decodedCookie);
            username = userData.username;
            console.log('Username extracted from cookie:', username);
          }
        } catch (e) {
          console.error('Error parsing user_data cookie:', e);
        }
      }
      // Fallback: Extract username from the JWT token
      if (!username && cookieString.includes('access_token=')) {
        try {
          const token = cookieString
            .split('access_token=')[1]
            ?.split(';')[0];
          
          if (token) {
            // Extract the payload from the JWT token
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join('')
            );
            
            const payload = JSON.parse(jsonPayload);
            // JWT usually has 'sub' field for the subject (username)
            username = payload.sub;
            console.log('Username extracted from JWT token:', username);
          }
        } catch (e) {
          console.error('Error parsing access_token cookie:', e);
        }
      }
      console.log('Making API call with username:', username);
      const response = await axios.get(`/ffr/get-ffr-results/${username}`, {
        // The withCredentials option is crucial for sending cookies with the request
        withCredentials: true
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching FFR results:', error);
      throw error;
    }
  };

  const sendEmailWithFormData = () => {
    const recipientEmail = 'castings@example.com'; // Replace with actual email
    const subject = `Model Application: ${formData.firstName} ${formData.lastName}`;
    
    // Format body with all form data and FFR link
    let body = `...`;
  
    // Encode parameters and open email client
    const mailtoLink = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    
    return true;
  };

  // Show success message if form was submitted successfully
  if (isSubmitted) {
    return (
      <div className="form-success">
        <h2>Application Submitted Successfully!</h2>
        <p>Thank you for your interest. Our team will review your application and contact you soon.</p>
        <button onClick={handleReturnHome} className="return-button">Return to Home</button>
      </div>
    );
  }

  return (
    <div className="scrollable-container" ref={scrollContainerRef}>
      {/* FFR Notification Message - explains the facial recognition analysis */}
      <div className="ffr-notification">
        <div className="ffr-notification-content">
          <p>We will be sending your Facial Feature Recognition (FFR) results to the casting team with your application. Click to see which details are being sent.</p>
          <button 
            className="ffr-toggle-button" 
            onClick={toggleFfrResults}
          >
            {showFfrResults ? "Hide FFR Results" : "View FFR Results"}
          </button>
        </div>
        
        {/* Collapsible section showing FFR analysis results */}
        {showFfrResults && (
        <div className="ffr-results-preview">
          <h3>Your FFR Analysis Report</h3>
          
          {isLoading ? (
            <div className="loading-indicator">Loading your FFR report...</div>
          ) : loadingError ? (
            <div className="error-message">{loadingError}</div>
          ) : !ffrData || !ffrData.pdf_url || ffrData.pdf_url === 'N/A' ? (
            <div className="no-ffr-data">
              <p>No FFR PDF report found. Complete your FFR analysis first.</p>
              <button 
                onClick={() => navigate('/ffr')} 
                className="primary-button"
              >
                Go to FFR Analysis
              </button>
            </div>
          ) : (
            <div className="ffr-pdf-container">
              <div className="pdf-direct-link">
                <p>You can also access your FFR report directly:</p>
                <a 
                  href={ffrData.pdf_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="primary-button"
                  style={{ display: 'inline-block', marginBottom: '15px' }}
                >
                  Open PDF Report
                </a>
              </div>
              
              <PdfViewer pdfUrl={ffrData.pdf_url} />

              <p className="ffr-disclaimer">
                This PDF report is generated from your FFR analysis and will be shared with casting agencies 
                when you submit your application.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
      
      <div className="casting-form-container">
        <h1 className="form-title">
          <span className="form-title-bold">Model</span>{" "}
          <span className="form-title-highlight">Application</span>
        </h1>
        
        <form onSubmit={handleSubmit} className="casting-form">
          {/* Personal information row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={formErrors.firstName ? 'error' : ''}
              />
              {formErrors.firstName && <span className="error-message">{formErrors.firstName}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={formErrors.lastName ? 'error' : ''}
              />
              {formErrors.lastName && <span className="error-message">{formErrors.lastName}</span>}
            </div>
          </div>

          {/* Contact information row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={formErrors.email ? 'error' : ''}
              />
              {formErrors.email && <span className="error-message">{formErrors.email}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={formErrors.phone ? 'error' : ''}
                placeholder="+94 123 456 789"
              />
              {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
            </div>
          </div>

          {/* Demographics row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input
                id="age"
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className={formErrors.age ? 'error' : ''}
                min="16"
                max="80"
              />
              {formErrors.age && <span className="error-message">{formErrors.age}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={formErrors.gender ? 'error' : ''}
              >
                <option value="">Select</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non-binary">Non-Binary</option>
                <option value="prefer-not-to-say">Prefer Not to Say</option>
              </select>
              {formErrors.gender && <span className="error-message">{formErrors.gender}</span>}
            </div>
          </div>
        
          <div className="form-group">
            <label htmlFor="country">Country of Residence</label>
            <input
              id="country"
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={formErrors.country ? 'error' : ''}
            />
            {formErrors.country && <span className="error-message">{formErrors.country}</span>}
          </div>

          {/* Model measurements row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="height">Height </label>
              <input
                id="height"
                type="text"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className={formErrors.height ? 'error' : ''}
                placeholder="Height in Feet"
              />
              {formErrors.height && <span className="error-message">{formErrors.height}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="bustChest">Bust / Chest </label>
              <input
                id="bustChest"
                type="text"
                name="bustChest"
                value={formData.bustChest}
                onChange={handleChange}
                className={formErrors.bustChest ? 'error' : ''}
                placeholder="Measurements in inches only"
              />
              {formErrors.bustChest && <span className="error-message">{formErrors.bustChest}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="waistHips">Waist / Hips </label>
            <input
              id="waistHips"
              type="text"
              name="waistHips"
              value={formData.waistHips}
              onChange={handleChange}
              className={formErrors.waistHips ? 'error' : ''}
              placeholder="Measurements in inches only"
            />
            {formErrors.waistHips && <span className="error-message">{formErrors.waistHips}</span>}
          </div>

          {/* Additional info - optional */}
          <div className="form-group full-width">
            <label htmlFor="message">Message (Optional)</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Any additional information about yourself you'd like to share with our casting team."
              rows="3"
            />
          </div>

          {/* Form action buttons */}
          <div className="form-actions">
            <button type="button" onClick={handleReturnHome} className="secondary-button">
              Cancel
            </button>
            <button type="submit" className="primary-button">
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CastingApplicationForm;