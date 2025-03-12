import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from "../../context/AuthProvider";
import "../../styles/casting/CastingApplicationForm.css";

function CastingApplicationForm() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthContext();
  
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

  // Add body class for proper styling
  useEffect(() => {
    document.body.classList.add('casting-page');
    
    return () => {
      document.body.classList.remove('casting-page');
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
  const toggleFfrResults = () => {
    setShowFfrResults(!showFfrResults);
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
    <div className="scrollable-container">
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
            <h3>Your FFR Analysis Results</h3>
            <div className="ffr-pdf-container">
              {/* This would be replaced with actual user data in production */}
              <img src="/assets/casting/report.jpeg" alt="Sample FFR Results" className="ffr-sample-image" />
              <p className="ffr-disclaimer">These results are generated from your FFR analysis completed on the FFR page. The data helps agencies evaluate facial symmetry, proportions, and other model-relevant metrics.</p>
            </div>
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

