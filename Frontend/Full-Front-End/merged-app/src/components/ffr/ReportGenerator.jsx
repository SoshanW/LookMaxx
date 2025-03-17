import React, { useState, useEffect, useRef } from 'react';
import { X, Minimize2, Maximize2, Download } from 'lucide-react';
import { setCookie, getCookie, deleteCookie } from '../../utils/cookies';
import '../../styles/ffr/ReportGenerator.css';

const ReportGenerator = ({ 
  isActive, 
  onClose, 
  onMinimize,
  isMinimized = false,
  duration = 60000, // Default duration in ms
  progress = null, // Accept external progress value
  status = null, // Accept external status value
  pdfUrl = null, // PDF URL for download
  error = null // Error message
}) => {
  const [internalProgress, setInternalProgress] = useState(progress !== null ? progress : 0);
  const [internalStatus, setInternalStatus] = useState(status !== null ? status : 'Initializing...');
  const [isComplete, setIsComplete] = useState(false);
  const progressInterval = useRef(null);
  const startTime = useRef(null);
  const endTime = useRef(null);
  
  // Using the provided progress/status if available, otherwise use internal state
  const currentProgress = progress !== null ? progress : internalProgress;
  const currentStatus = status !== null ? status : internalStatus;
  
  // Status messages to show during generation
  const statusMessages = [
    "Initializing facial recognition...",
    "Analyzing facial structure...",
    "Processing symmetry metrics...",
    "Comparing with database...",
    "Evaluating facial harmony...",
    "Calculating aesthetic ratios...",
    "Generating personalized insights...",
    "Finalizing your report..."
  ];

  // Set isComplete when progress reaches 100
  useEffect(() => {
    if (currentProgress >= 100) {
      setIsComplete(true);
      setCookie('reportComplete', 'true');
    }
  }, [currentProgress]);

  // Load progress from cookies on initial render
  useEffect(() => {
    if (isActive) {
      const savedProgress = getCookie('reportProgress');
      const savedStatus = getCookie('reportStatus');
      const savedStartTime = getCookie('reportStartTime');
      const savedEndTime = getCookie('reportEndTime');
      const savedComplete = getCookie('reportComplete');
      
      // Set complete state based on saved value
      if (savedComplete !== null) {
        setIsComplete(savedComplete === 'true');
      }
      
      if (savedProgress && savedStartTime && savedEndTime) {
        const parsedProgress = parseFloat(savedProgress);
        startTime.current = parseInt(savedStartTime);
        endTime.current = parseInt(savedEndTime);
        
        // If the report was completed in a previous session
        if (parsedProgress >= 100 || savedComplete === 'true') {
          setInternalProgress(100);
          setInternalStatus("Report complete!");
          setIsComplete(true);
          setCookie('reportComplete', 'true');
          return;
        }
        
        // If the report was in progress
        setInternalProgress(parsedProgress);
        if (savedStatus) setInternalStatus(savedStatus);
        
        // Calculate how much time has passed and adjust progress accordingly
        const now = Date.now();
        const elapsedTime = now - startTime.current;
        const totalDuration = endTime.current - startTime.current;
        const remainingDuration = totalDuration - elapsedTime;
        
        // If there's still time remaining, continue the progress
        if (remainingDuration > 0) {
          startProgressWithDuration(remainingDuration, 100 - parsedProgress);
        } else {
          // If time should be up but progress wasn't completed, complete it now
          setInternalProgress(100);
          setInternalStatus("Report complete!");
          setIsComplete(true);
          setCookie('reportComplete', 'true');
        }
      } else if (progress === null) {
        // Start a new progress tracking if no saved state and no external progress
        initializeNewProgress();
      }
    }
    
    return () => {
      clearInterval(progressInterval.current);
    };
  }, [isActive, duration, progress]);

  // Initialize new progress tracking
  const initializeNewProgress = () => {
    // Clear any previous progress
    setInternalProgress(0);
    setInternalStatus(statusMessages[0]);
    setIsComplete(false);
    
    // Set start and end times
    startTime.current = Date.now();
    endTime.current = startTime.current + duration;
    
    // Save to cookies
    setCookie('reportStartTime', startTime.current.toString());
    setCookie('reportEndTime', endTime.current.toString());
    setCookie('reportProgress', '0');
    setCookie('reportStatus', statusMessages[0]);
    setCookie('reportMinimized', 'false');
    setCookie('reportComplete', 'false');
    
    // Start progress tracking
    startProgressWithDuration(duration, 100);
  };

  // Start progress with a specific duration and target progress
  const startProgressWithDuration = (remainingDuration, remainingProgress) => {
    // Clear any existing interval
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    // Fixed at 100 steps (1% each)
    const totalSteps = 100;
    // Calculate tick interval based on duration
    const tickInterval = remainingDuration / totalSteps;
    
    // Start the interval
    progressInterval.current = setInterval(() => {
      setInternalProgress(prevProgress => {
        // Increment by exactly 1%
        const newProgress = Math.min(prevProgress + 1, 100);
        
        // Update status text based on progress percentage
        const statusIndex = Math.floor((newProgress / 100) * statusMessages.length);
        const newStatus = statusMessages[Math.min(statusIndex, statusMessages.length - 1)];
        setInternalStatus(newStatus);
        
        // Save to cookies
        setCookie('reportProgress', newProgress.toString());
        setCookie('reportStatus', newStatus);
        
        // When completed
        if (newProgress >= 100) {
          clearInterval(progressInterval.current);
          setInternalStatus("Report complete!");
          setIsComplete(true);
          setCookie('reportStatus', "Report complete!");
          setCookie('reportComplete', 'true');
        }
        
        return newProgress;
      });
    }, tickInterval);
  };

  const handleMinimize = () => {
    if (onMinimize) {
      onMinimize(true); // Pass true to indicate minimized state
      setCookie('reportMinimized', 'true');
    }
  };

  const handleMaximize = () => {
    if (onMinimize) {
      onMinimize(false); // Pass false to indicate maximized state
      setCookie('reportMinimized', 'false');
    }
  };
  
  const handleClose = () => {
    clearInterval(progressInterval.current);
    // Clear cookies when closing
    deleteCookie('reportProgress');
    deleteCookie('reportStatus');
    deleteCookie('reportStartTime');
    deleteCookie('reportEndTime');
    deleteCookie('reportMinimized');
    deleteCookie('reportComplete');
    if (onClose) onClose();
  };
  
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
      // For demonstration, create a sample filename with date
      const date = new Date();
      const filename = `facial-analysis-report-${date.toISOString().split('T')[0]}.pdf`;
      
      // In a real implementation, you would generate or fetch the PDF here
      console.log(`No PDF URL available. Would download ${filename} if available`);
    }
  };

  if (!isActive) return null;

  if (isMinimized) {
    return (
      <div className="minimized-progress-container">
        <div className="minimized-progress-content">
          <div className="minimized-progress-bar">
            <div 
              className="minimized-progress-fill" 
              style={{ width: `${currentProgress}%` }}
            ></div>
          </div>
          <div className="minimized-progress-text">
            {isComplete ? 'Done' : `${Math.round(currentProgress)}%`}
          </div>
          {isComplete && pdfUrl && (
            <button className="minimized-download-btn" onClick={handleDownloadPDF} title="Download Report">
              <Download size={16} />
            </button>
          )}
          <button className="minimized-maximize-btn" onClick={handleMaximize}>
            <Maximize2 size={16} />
          </button>
        </div>
      </div>
    );
  }

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
                <p className="status-message">{currentStatus}</p>
                <div className="progress-bar-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${currentProgress}%` }}
                    ></div>
                  </div>
                  <span className="progress-percentage">{Math.round(currentProgress)}%</span>
                </div>
                
                {isComplete ? (
                  <div className="download-section">
                    <p className="complete-message">Your facial analysis has been completed successfully.</p>
                    <button className="download-pdf-button" onClick={handleDownloadPDF} disabled={!pdfUrl}>
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