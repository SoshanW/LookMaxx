import React, { useState, useEffect } from 'react';
import '../styles/UploadPhoto.css';

const UploadPhoto = ({ isVisible = false }) => {
  const [file, setFile] = useState(null);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  
  console.log("UploadPhoto visibility:", isVisible); // Debug log

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setFile(event.dataTransfer.files[0]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDisclaimerAccept = () => {
    setDisclaimerAccepted(true);
    setShowDisclaimer(false);
    document.body.style.overflow = 'auto'; // Restore scrolling
    // Proceed with the analysis or any other action
  };

  const handleDisclaimerDecline = () => {
    setShowDisclaimer(false);
    document.body.style.overflow = 'auto'; // Restore scrolling
    window.scrollTo(0, 0); // Redirect back to the top of the page
  };

  const handleUploadClick = () => {
    setShowDisclaimer(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  };

  // Clean up effect to ensure body scroll is restored if component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // This ensures the disclaimer modal doesn't disappear when scrolling
  useEffect(() => {
    // When disclaimer is shown, completely prevent any scrolling in the main window
    if (showDisclaimer) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Function to forcefully reset scroll position if user tries to scroll
      const lockScroll = () => window.scrollTo(0, scrollY);
      
      // Add events to lock scrolling
      window.addEventListener('scroll', lockScroll);
      
      // Clean up
      return () => {
        window.removeEventListener('scroll', lockScroll);
      };
    }
  }, [showDisclaimer]);

  // If not visible, don't render anything
  if (!isVisible) {
    return null; 
  }

  return (
    <div className={`upload-photo-overlay visible`}>
      <div className="upload-photo-container">
        <div
          className="upload-area"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="file-input"
          />
          <label htmlFor="file-input" className="upload-label">
            {file ? file.name : 'Drag & drop your photo here or click to browse'}
          </label>
          <button 
            onClick={handleUploadClick} 
            className="upload-button" 
            disabled={!file}
          >
            Upload Photo
          </button>
        </div>

        <div className="guide-photo">
          <h3>How to Take the Optimum Photo:</h3>
          <img src="/assets/naflan.jpg" alt="Guide for optimum photo" />
        </div>
      </div>

      {showDisclaimer && (
        <div id="disclaimerContainer">
          {/* Add an extra overlay to prevent interaction with background */}
          <div 
            className="disclaimer-modal-overlay" 
            onClick={(e) => e.stopPropagation()} // Prevent clicks from passing through
          ></div>
          <div 
            className="disclaimer-modal" 
            onClick={(e) => e.stopPropagation()} // Prevent clicks from passing through
          >
            <h2>Important Notice About Your Wellbeing</h2>
            
            <p>
              We understand that this analysis may touch on sensitive aspects of your personal journey. 
              Before proceeding, we want to ensure you're in the right emotional space to receive this information.
            </p>
            
            {/* Shortened disclaimer text for brevity */}
            <p>
              The information provided is meant for guidance only and is not a professional medical assessment.
              Results should be viewed as suggestions rather than definitive conclusions about your condition.
            </p>
            
            <p>
              If you're feeling vulnerable today, it might be better to return when you feel more emotionally prepared.
              Your mental and emotional wellbeing are our priority.
            </p>
            
            <div className="button-container">
              <button onClick={handleDisclaimerAccept} className="accept-button">
                I Feel Ready to Proceed
              </button>
              <button onClick={handleDisclaimerDecline} className="decline-button">
                I'll Return Another Time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPhoto;