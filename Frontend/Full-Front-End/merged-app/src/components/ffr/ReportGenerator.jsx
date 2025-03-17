import React, { useState, useEffect, useRef } from 'react';
import { X, Minimize2, Maximize2, Download } from 'lucide-react';
import { setCookie, getCookie, deleteCookie } from '../../utils/cookies';
import '../../styles/ffr/ReportGenerator.css';

const ReportGenerator = ({ 
  isActive, 
  onClose, 
  onMinimize,
  isMinimized = false,
  duration = 240000, // Default duration in ms (1 minute)
  onReportComplete,
  pdfUrl = null,
  error = null
}) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing report generation...');
  const [isComplete, setIsComplete] = useState(false);
  const progressInterval = useRef(null);
  const startTime = useRef(Date.now());

  // Status messages for the progress simulation
  const statusMessages = [
    "Initializing report generation...",
    "Analyzing facial structure data...",
    "Processing advanced facial metrics...",
    "Generating personalized insights...",
    "Compiling comprehensive report...",
    "Finalizing report details...",
    "Report generation almost complete..."
  ];

  // Stop the progress animation and mark as complete
  const completeProgressAnimation = () => {
    clearInterval(progressInterval.current);
    setProgress(100);
    setStatus("Report generation complete!");
    setIsComplete(true);
    
    // Call the onReportComplete callback
    if (onReportComplete) {
      onReportComplete();
    }
  };

  // Start progress animation
  useEffect(() => {
    if (isActive && !isComplete) {
      // Clear any existing interval
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }

      // Reset progress and start time
      setProgress(0);
      startTime.current = Date.now();

      // Create new interval for progress animation
      progressInterval.current = setInterval(() => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime.current;
        
        // Calculate progress percentage
        const newProgress = Math.min((elapsedTime / duration) * 100, 100);
        setProgress(newProgress);

        // Update status message based on progress
        const statusIndex = Math.floor((newProgress / 100) * statusMessages.length);
        setStatus(statusMessages[Math.min(statusIndex, statusMessages.length - 1)]);

        // Complete progress if duration is reached
        if (elapsedTime >= duration) {
          completeProgressAnimation();
        }
      }, 100); // Update every 100ms for smooth animation

      // Cleanup function
      return () => {
        clearInterval(progressInterval.current);
      };
    }
  }, [isActive, duration, isComplete]);

  // Handle minimizing the report generator
  const handleMinimize = () => {
    if (onMinimize) {
      onMinimize(true);
    }
  };

  // Handle maximizing the report generator
  const handleMaximize = () => {
    if (onMinimize) {
      onMinimize(false);
    }
  };

  // Handle closing the report generator
  const handleClose = () => {
    clearInterval(progressInterval.current);
    
    if (onClose) {
      onClose();
    }
  };

  // Handle PDF download
  const handleDownloadPDF = () => {
    if (pdfUrl) {
      // Create a hidden link element to trigger the download
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = `facial-analysis-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
      }, 100);
    } else {
      console.log('No PDF URL available for download');
    }
  };

  // If not active, return null
  if (!isActive) return null;

  // Minimized view
  if (isMinimized) {
    return (
      <div className="minimized-progress-container">
        <div className="minimized-progress-content">
          <div className="minimized-progress-bar">
            <div 
              className="minimized-progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="minimized-progress-text">
            {isComplete ? 'Done' : `${Math.round(progress)}%`}
          </div>
          {isComplete && pdfUrl && (
            <button 
              className="minimized-download-btn" 
              onClick={handleDownloadPDF} 
              title="Download Report"
            >
              <Download size={16} />
            </button>
          )}
          <button 
            className="minimized-maximize-btn" 
            onClick={handleMaximize}
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Full view
  return (
    <div className="report-generator-overlay">
      <div className="report-generator-container">
        <div className="report-generator-header">
          <h2>{isComplete ? 'Report Complete' : 'Generating Your Report'}</h2>
          <div className="report-generator-controls">
            <button className="minimize-btn" onClick={handleMinimize}>
              <Minimize2 size={18} />
            </button>
            <button className="close-btn" onClick={handleClose}>
              <X size={18} />
            </button>
          </div>
        </div>
        
        <div className="report-generator-content">
          {error ? (
            <div className="error-message">
              <h3>Error Processing Your Request</h3>
              <p>{error}</p>
              <button className="retry-button" onClick={onClose}>Try Again</button>
            </div>
          ) : (
            <>
              <div className="progress-visual">
                {!isComplete ? (
                  <>
                    <div className="scanner-animation"></div>
                    <div className="face-outline">
                      <div className="face-grid"></div>
                      <div className="face-points"></div>
                    </div>
                  </>
                ) : (
                  <div className="complete-animation">
                    <div className="checkmark"></div>
                  </div>
                )}
              </div>
              
              <div className="progress-info">
                <p className="status-message">{status}</p>
                <div className="progress-bar-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="progress-percentage">{Math.round(progress)}%</span>
                </div>
                
                {isComplete ? (
                  <div className="download-section">
                    <p className="complete-message">Your facial analysis report has been generated successfully.</p>
                    <button 
                      className="download-pdf-button" 
                      onClick={handleDownloadPDF} 
                      disabled={!pdfUrl}
                    >
                      <Download size={18} />
                      Download Report PDF
                    </button>
                    {!pdfUrl && <p className="pdf-not-ready">PDF is still being prepared. Please wait...</p>}
                  </div>
                ) : (
                  <p className="wait-message">Please don't close this window. Your comprehensive analysis is being generated.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;