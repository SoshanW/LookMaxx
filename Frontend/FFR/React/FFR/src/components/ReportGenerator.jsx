import React, { useState, useEffect, useRef } from 'react';
import { X, Minimize2, Maximize2, Download } from 'lucide-react';
import '../styles/ReportGenerator.css';

const ReportGenerator = ({ 
  isActive, 
  onClose, 
  onMinimize,
  duration = 30000, // Default duration in ms (30 seconds)
  progressIncrement = 1.5 // Default progress increment per tick
}) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing...');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const progressInterval = useRef(null);
  const startTime = useRef(null);
  const endTime = useRef(null);
  
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

  // Load progress from localStorage on initial render
  useEffect(() => {
    if (isActive) {
      const savedProgress = localStorage.getItem('reportProgress');
      const savedStatus = localStorage.getItem('reportStatus');
      const savedStartTime = localStorage.getItem('reportStartTime');
      const savedEndTime = localStorage.getItem('reportEndTime');
      const savedMinimized = localStorage.getItem('reportMinimized');
      const savedComplete = localStorage.getItem('reportComplete');
      
      // Set minimized state based on saved value (if exists)
      if (savedMinimized !== null) {
        setIsMinimized(savedMinimized === 'true');
      }
      
      // Set complete state based on saved value (if exists)
      if (savedComplete !== null) {
        setIsComplete(savedComplete === 'true');
      }
      
      if (savedProgress && savedStartTime && savedEndTime) {
        const parsedProgress = parseFloat(savedProgress);
        startTime.current = parseInt(savedStartTime);
        endTime.current = parseInt(savedEndTime);
        
        // If the report was completed in a previous session
        if (parsedProgress >= 100 || savedComplete === 'true') {
          setProgress(100);
          setStatus("Report complete!");
          setIsComplete(true);
          localStorage.setItem('reportComplete', 'true');
          return;
        }
        
        // If the report was in progress
        setProgress(parsedProgress);
        if (savedStatus) setStatus(savedStatus);
        
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
          setProgress(100);
          setStatus("Report complete!");
          setIsComplete(true);
          localStorage.setItem('reportComplete', 'true');
        }
      } else {
        // Start a new progress tracking if no saved state
        initializeNewProgress();
      }
    }
    
    return () => {
      clearInterval(progressInterval.current);
    };
  }, [isActive, duration]);

  // Initialize new progress tracking
  const initializeNewProgress = () => {
    // Clear any previous progress
    setProgress(0);
    setStatus(statusMessages[0]);
    setIsComplete(false);
    
    // Set start and end times
    startTime.current = Date.now();
    endTime.current = startTime.current + duration;
    
    // Save to localStorage
    localStorage.setItem('reportStartTime', startTime.current);
    localStorage.setItem('reportEndTime', endTime.current);
    localStorage.setItem('reportProgress', '0');
    localStorage.setItem('reportStatus', statusMessages[0]);
    localStorage.setItem('reportMinimized', 'false');
    localStorage.setItem('reportComplete', 'false');
    
    // Start progress tracking
    startProgressWithDuration(duration, 100);
  };

  // Start progress with a specific duration and target progress
  const startProgressWithDuration = (remainingDuration, remainingProgress) => {
    // Clear any existing interval
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    // Calculate tick interval and increment per tick
    const tickInterval = 400; // ms between ticks
    const totalTicks = Math.floor(remainingDuration / tickInterval);
    const incrementPerTick = remainingProgress / totalTicks;
    
    // Start the interval
    progressInterval.current = setInterval(() => {
      setProgress(prevProgress => {
        // Calculate new progress
        const newProgress = Math.min(prevProgress + incrementPerTick, 100);
        
        // Update status text based on progress percentage
        const statusIndex = Math.floor((newProgress / 100) * statusMessages.length);
        const newStatus = statusMessages[Math.min(statusIndex, statusMessages.length - 1)];
        setStatus(newStatus);
        
        // Save to localStorage
        localStorage.setItem('reportProgress', newProgress.toString());
        localStorage.setItem('reportStatus', newStatus);
        
        // When completed
        if (newProgress >= 100) {
          clearInterval(progressInterval.current);
          setStatus("Report complete!");
          setIsComplete(true);
          localStorage.setItem('reportStatus', "Report complete!");
          localStorage.setItem('reportComplete', 'true');
        }
        
        return newProgress;
      });
    }, tickInterval);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    localStorage.setItem('reportMinimized', 'true');
    if (onMinimize) onMinimize(true); // Pass true to indicate minimized state
  };

  const handleMaximize = () => {
    setIsMinimized(false);
    localStorage.setItem('reportMinimized', 'false');
    if (onMinimize) onMinimize(false); // Pass false to indicate maximized state
  };
  
  const handleClose = () => {
    clearInterval(progressInterval.current);
    // Clear localStorage when closing
    localStorage.removeItem('reportProgress');
    localStorage.removeItem('reportStatus');
    localStorage.removeItem('reportStartTime');
    localStorage.removeItem('reportEndTime');
    localStorage.removeItem('reportMinimized');
    localStorage.removeItem('reportComplete');
    if (onClose) onClose();
  };
  
  const handleDownloadPDF = () => {
    // Generate a sample filename with date
    const date = new Date();
    const filename = `facial-analysis-report-${date.toISOString().split('T')[0]}.pdf`;
    
    // In a real implementation, you would generate or fetch the PDF here
    console.log(`Downloading report as ${filename}`);
    
    // For demonstration, we'll create a simple blob to download
    // In a real app, this would be replaced with the actual PDF data
    const dummyPdfContent = "This is a placeholder for the facial analysis report PDF content.";
    const blob = new Blob([dummyPdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  if (!isActive) return null;

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
          {isComplete && (
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
                <p className="complete-message">Your facial analysis has been completed successfully.</p>
                <button className="download-pdf-button" onClick={handleDownloadPDF}>
                  <Download size={18} />
                  Download Report PDF
                </button>
              </div>
            ) : (
              <p className="wait-message">Please don't close this window. Your comprehensive analysis is being generated.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;