import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import '../styles/CastingApplicationForm.css';


function CastingApplicationForm() {
  const navigate = useNavigate();
  
  // Form state with all required fields including new measurement fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    country: '',
    height: '',           // New height field
    bustChest: '',        // New bust/chest field
    waistHips: '',        // New waist/hips field
    message: '',          // Renamed from additionalInfo
  });
  
  // Validation state tracking
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  /**
   * Handle input field changes
   * Updates form state and clears any validation errors for that field
   * 
   * @param {Event} e - The change event from the input
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    
    // Clear any validation errors for this field when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  
  const validateForm = () => {
    const errors = {};
    
    // Name validation - required
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    
    // Email validation - required and format
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email address is invalid';
    }
    
    // Phone validation - required and format (basic)
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s\-()]{8,20}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    // Age validation - required and range
    if (!formData.age) {
      errors.age = 'Age is required';
    } else if (formData.age < 16 || formData.age > 80) {
      errors.age = 'Age must be between 16 and 80';
    }
    
    // Gender validation - required
    if (!formData.gender) errors.gender = 'Please select your gender';
    
    // Country validation - required
    if (!formData.country.trim()) errors.country = 'Country of Residence is required';
    
    // Height validation - required
    if (!formData.height.trim()) errors.height = 'Height is required';
    
    // Bust/Chest validation - required
    if (!formData.bustChest.trim()) errors.bustChest = 'Bust/Chest measurement is required';
    
    // Waist/Hips validation - required
    if (!formData.waistHips.trim()) errors.waistHips = 'Waist/Hips measurement is required';
    
    // Update error state
    setFormErrors(errors);
    
    // Return true if no errors, false otherwise
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (validateForm()) {
      console.log('Form submitted:', formData);
      
      // Show success message
      setIsSubmitted(true);
      
      // Reset form fields after short delay (for user to see success message)
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
   * Handle returning to the main page
   */
  const handleReturnHome = () => {
    navigate('/');
  };

  // Show success message if form was submitted
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
    <div className="casting-form-container">
      <h1 className="form-title">
        <span className="form-title-bold">Model</span>{" "}
        <span className="form-title-highlight">Application</span>
      </h1>
      
      <form onSubmit={handleSubmit} className="casting-form">
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
              max="35"
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

        {/* New measurements section */}
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
  );
}

export default CastingApplicationForm;