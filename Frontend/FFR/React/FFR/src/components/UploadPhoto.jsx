// UploadPhoto.jsx
import React, { useState } from 'react';
import '../styles/UploadPhoto.css';

const UploadPhoto = ({ isVisible }) => {
  const [file, setFile] = useState(null);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

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
    // Proceed with the analysis or any other action
  };

  const handleDisclaimerDecline = () => {
    window.scrollTo(0, 0); // Redirect back to the top of the page
  };

  const handleUploadClick = () => {
    setShowDisclaimer(true);
  };

  return (
    <div className={`upload-photo-overlay ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="upload-photo-container">
        <div
          className="upload-area"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            onChange={handleFileChange}
            style={{ display: 'none' }} // Keep the input hidden
            id="file-input" // Ensure this matches the label's htmlFor
          />
          <label htmlFor="file-input" className="upload-label">
            {file ? file.name : 'Drag & drop your photo here or click to browse'}
          </label>
          <button 
            onClick={handleUploadClick} 
            className="upload-button" 
            disabled={!file} // Disable button if no file is selected
          >
            Upload Photo
          </button>
        </div>

        <div className="guide-photo">
          <h3>How to Take the Optimum Photo:</h3>
          <img src="../assets/naflan.jpg" alt="Guide for optimum photo" />
        </div>
      </div>

      {showDisclaimer && (
        <div className="disclaimer-modal">
          <h2>Disclaimer</h2>
          <p>
            Please read the following disclaimer carefully before proceeding:
          </p>
          <p>
            This analysis is for informational purposes only. By proceeding, you
            agree to the terms and conditions.
          </p>
          <div className="button-container">
            <button onClick={handleDisclaimerAccept} className="accept-button">
              Accept
            </button>
            <button onClick={handleDisclaimerDecline} className="decline-button">
              Decline
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPhoto;