import React, { createContext, useContext, useState, useEffect } from 'react';
import ReportGenerator from '../components/ffr/ReportGenerator';
import { getCookie, setCookie, deleteCookie } from '../utils/cookies';
import axios from 'axios';

const ReportGeneratorContext = createContext(null);

export const ReportGeneratorProvider = ({ children }) => {
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const [isReportMinimized, setIsReportMinimized] = useState(false);
  const [reportProgress, setReportProgress] = useState(0);
  const [reportStatus, setReportStatus] = useState('');
  const [reportFiles, setReportFiles] = useState(null);
  const [reportError, setReportError] = useState(null);
  const [reportPdfUrl, setReportPdfUrl] = useState(null);
  const [pollingTimer, setPollingTimer] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  
  // Load progress from cookies on initial render
  useEffect(() => {
    const savedProgress = getCookie('reportProgress');
    const savedMinimized = getCookie('reportMinimized');
    const savedComplete = getCookie('reportComplete');
    const savedStatus = getCookie('reportStatus');
    
    if (savedProgress) {
      const parsedProgress = parseFloat(savedProgress);
      setShowReportGenerator(true);
      setReportProgress(parsedProgress);
      setIsReportMinimized(savedMinimized === 'true');
      setIsComplete(savedComplete === 'true');
      
      if (savedStatus) {
        setReportStatus(savedStatus);
      }
      
      // If progress was saved but not complete, start polling
      if (parsedProgress > 0 && parsedProgress < 100) {
        startPolling();
      }
    }
  }, []);

  // Force progress update for testing
  useEffect(() => {
    if (showReportGenerator && reportProgress === 0) {
      // Set initial progress to ensure bar moves
      setTimeout(() => {
        updateReportProgress(10, "Initializing facial analysis...");
      }, 1000);
    }
  }, [showReportGenerator]);

  // Function to start polling for PDF status
  const startPolling = () => {
    if (pollingTimer) {
      clearInterval(pollingTimer);
    }
    
    // Simulate progress while real results are processing
    let simulatedProgress = reportProgress;
    
    const timer = setInterval(async () => {
      try {
        // Simulate progress incrementing
        simulatedProgress = Math.min(simulatedProgress + 5, 95);
        updateReportProgress(simulatedProgress, "Processing your facial data. Please wait...");
        
        // Check for real status updates from backend
        const token = getCookie('access_token');
        const userData = getCookie('user_data');
        if (!userData) {
          return;
        }
        
        const username = JSON.parse(userData).username;
        const response = await axios.get(`/ffr/get-ffr-results/${username}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Check if PDF is available
        if (response.data && response.data.ffr_results) {
          const latestResult = response.data.ffr_results[response.data.ffr_results.length - 1];
          
          if (latestResult.pdf_url) {
            // PDF is ready - mark as complete
            setReportPdfUrl(latestResult.pdf_url);
            setIsComplete(true);
            updateReportProgress(100, "Report complete!");
            clearInterval(timer);
            setPollingTimer(null);
          }
        }
      } catch (error) {
        console.error('Error checking report status:', error);
        // Continue polling despite errors
      }
    }, 30000);
    
    setPollingTimer(timer);
    
    return () => {
      if (timer) clearInterval(timer);
    };
  };

  // Start report generation function
  const startReportGeneration = () => {
    setReportProgress(5); // Start at 5% to show visible progress immediately
    setReportStatus('Initializing facial recognition...');
    setReportPdfUrl(null);
    setReportError(null);
    setShowReportGenerator(true);
    setIsReportMinimized(false);
    setIsComplete(false);
    
    setCookie('reportProgress', '5');
    setCookie('reportStatus', 'Initializing facial recognition...');
    setCookie('reportMinimized', 'false');
    setCookie('reportComplete', 'false');
    
    // Start polling for report status
    startPolling();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update report progress and status
  const updateReportProgress = (progress, status) => {
    setReportProgress(progress);
    setCookie('reportProgress', progress.toString());
    
    if (status) {
      setReportStatus(status);
      setCookie('reportStatus', status);
    }
    
    if (progress >= 100) {
      setIsComplete(true);
      setCookie('reportComplete', 'true');
      
      if (pollingTimer) {
        clearInterval(pollingTimer);
        setPollingTimer(null);
      }
    }
  };

  // Update report status including files and errors
  const updateReportStatus = ({ progress, status, files, error }) => {
    if (progress !== undefined) {
      updateReportProgress(progress, status || reportStatus);
    } else if (status) {
      setReportStatus(status);
      setCookie('reportStatus', status);
    }
    
    if (files) {
      setReportFiles(files);
    }
    
    if (error) {
      setReportError(error);
    }
  };

  // Handle closing report generator
  const handleCloseReportGenerator = () => {
    setShowReportGenerator(false);
    setIsReportMinimized(false);
    
    // Clear polling timer
    if (pollingTimer) {
      clearInterval(pollingTimer);
      setPollingTimer(null);
    }
    
    // Clear cookies
    deleteCookie('reportProgress');
    deleteCookie('reportStatus');
    deleteCookie('reportMinimized');
    deleteCookie('reportComplete');
  };

  // Handle minimizing/maximizing report generator
  const handleReportMinimizeChange = (isMinimized) => {
    setIsReportMinimized(isMinimized);
    setCookie('reportMinimized', isMinimized.toString());
    
    // When minimized, scroll to top of the page
    if (isMinimized) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <ReportGeneratorContext.Provider
      value={{
        showReportGenerator,
        isReportMinimized,
        reportProgress,
        reportStatus,
        reportPdfUrl,
        reportError,
        isComplete,
        startReportGeneration,
        updateReportStatus,
        updateReportProgress,
        handleCloseReportGenerator,
        handleReportMinimizeChange
      }}
    >
      {children}
      
      {showReportGenerator && (
        <ReportGenerator 
          isActive={showReportGenerator}
          onClose={handleCloseReportGenerator}
          onMinimize={handleReportMinimizeChange}
          isMinimized={isReportMinimized}
          progress={reportProgress}
          status={reportStatus}
          pdfUrl={reportPdfUrl}
          error={reportError}
          isComplete={isComplete}
        />
      )}
    </ReportGeneratorContext.Provider>
  );
};

export const useReportGenerator = () => {
  const context = useContext(ReportGeneratorContext);
  if (!context) {
    throw new Error('useReportGenerator must be used within a ReportGeneratorProvider');
  }
  return context;
};