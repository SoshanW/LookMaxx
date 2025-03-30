import React, { useState, useEffect } from 'react';
import { getCookie } from '../../utils/cookies';
import { useReportGenerator } from '../../context/ReportGeneratorContext';
import '../../styles/ffr/UploadPhoto.css';

const UploadPhoto = ({ isVisible, onStartReportGeneration }) => {
  const [file, setFile] = useState(null);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [error, setError] = useState(null);
  const { startReportGeneration, updateReportStatus } = useReportGenerator();

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

  const handleDisclaimerAccept = async () => {
    setDisclaimerAccepted(true);
    setShowDisclaimer(false);
    document.body.style.overflow = 'auto';
    
    if (!file) {
      setError("No file selected. Please upload a photo.");
      return;
    }
    
    // Start the report generation UI
    startReportGeneration();
    
    // Create form data for the file upload
    const formData = new FormData();
    formData.append('image', file);
    
    // Get JWT token from cookies
    const token = getCookie('access_token');
    
    try {
      // Get username from cookie
      const userData = getCookie('user_data');
      if (!userData) {
        throw new Error('User data not found. Please log in again.');
      }
      
      const userInfo = JSON.parse(userData);
      const username = userInfo.username;
      
      // Get full API URL
      const API_URL = import.meta.env.VITE_API_URL || '';
      
      // Log API request for debugging
      console.log(`Sending FFR request to: ${API_URL}/ffr/analyze-face`);
      console.log('Authorization header present:', !!token);
      
      // Use fetch API for direct control over request
      const response = await fetch(`${API_URL}/ffr/analyze-face`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
        credentials: 'include'
      });
      
      // Enhanced error handling
      if (!response.ok) {
        const errorText = await response.text();
        console.error('FFR API Error:', {
          status: response.status,
          statusText: response.statusText,
          responseText: errorText
        });
        
        throw new Error(`Server returned ${response.status}: ${errorText || response.statusText}`);
      }
      
      const data = await response.json();
      
      // Update the report generator with initial results
      updateReportStatus({
        progress: 30,
        status: 'Facial analysis completed. Generating detailed report...',
        files: data.files
      });
      
      // If onStartReportGeneration callback exists, call it
      if (onStartReportGeneration) {
        onStartReportGeneration();
      }
      
    } catch (err) {
      console.error('Error during file upload:', err);
      setError(`Failed to process image: ${err.message}`);
      // Update report generator with error
      updateReportStatus({
        progress: 0,
        status: `Error: ${err.message}`,
        error: true
      });
    }
  };

  const handleDisclaimerDecline = () => {
    setShowDisclaimer(false);
    document.body.style.overflow = 'auto';
    window.scrollTo(0, 0);
  };

  const handleUploadClick = () => {
    setShowDisclaimer(true);
    document.body.style.overflow = 'hidden';
  };

  // Clean up effect to ensure body scroll is restored if component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

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
            style={{ display: 'none' }}
            id="file-input"
            accept="image/*"
          />
          <label htmlFor="file-input" className="upload-label">
            {file ? file.name : 'Drag & drop your photo here or click to browse'}
          </label>
          {error && <div className="error-alert">{error}</div>}
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
          <img src="../assets/naflan.jpg" alt="Guide for optimum photo" />
        </div>
      </div>

      {showDisclaimer && (
        <div id="disclaimerContainer">
          <div className="disclaimer-modal-overlay"></div>
          <div className="disclaimer-modal">
            <h2>Important Notice About Your Wellbeing</h2>
            
            <p>
              We understand that this analysis may touch on sensitive aspects of your personal journey. 
              Before proceeding, we want to ensure you're in the right emotional space to receive this information.
            </p>
            
            <p>
              The information provided is meant for guidance only and is not a professional medical assessment.
              Results should be viewed as suggestions rather than definitive conclusions about your condition.
              We encourage you to approach this process with self-compassion and gentleness.
            </p>
            
            <p>
              If you're feeling vulnerable today, it might be better to return when you feel more emotionally prepared.
              Your mental and emotional wellbeing are our priority. This tool is designed to support, 
              not to cause distress.
            </p>
            
            <p>
              If you've been experiencing heightened sensitivity or emotional fragility recently, 
              please consider consulting with a healthcare professional before proceeding.
              We care deeply about your emotional safety throughout this process.
            </p>
            
            <p>
              This analysis is not meant to diagnose or treat any condition. It is simply a tool
              that may provide insights that you may find helpful on your personal journey.
              The results are not a reflection of your worth or capabilities as a person.
            </p>
            
            <p>
              Everyone processes information differently, and what may be helpful for some
              might be challenging for others. We respect your unique emotional landscape
              and encourage you to honor your own boundaries.
            </p>
            
            <p>
              By continuing, you acknowledge that you understand the limitations of this analysis,
              you're in an emotionally stable state to receive this information,
              you have support resources available should you need them,
              and you'll practice self-care during and after this process.
            </p>
            
            <p>
              Remember: You can stop at any time. Your journey belongs to you, and your comfort matters most.
              This is a safe space created with compassion and understanding of the delicate nature of 
              personal growth and self-discovery.
            </p>
            
            <p>
              We believe in your resilience, but also honor your boundaries. The analysis provided 
              is meant to empower, not to define you. You are more than any analysis could ever capture.
            </p>
            
            <p>
              Take a moment to check in with yourself. Are you in a calm, centered place? 
              Do you have the emotional capacity to receive potentially challenging information?
              If not, there's no rush. We'll be here when you're ready.
            </p>
            
            <p>
              Your wellbeing is paramount. If at any point during this process you feel overwhelmed,
              we encourage you to take a break, practice self-care, or reach out to a trusted friend,
              family member, or mental health professional.
            </p>
            
            <p>
              We recognize the courage it takes to engage in self-reflection and seek insights.
              Whatever you discover through this process, approach it with kindness toward yourself.
              You are on a journey of understanding, and every step is valuable.
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