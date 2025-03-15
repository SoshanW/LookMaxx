// src/context/ReportGeneratorContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import ReportGenerator from '../components/ffr/ReportGenerator';
import { getCookie, setCookie } from '../utils/cookies';

// Create context for the report generator state
const ReportGeneratorContext = createContext(null);

export const ReportGeneratorProvider = ({ children }) => {
  // Report generator state
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const [isReportMinimized, setIsReportMinimized] = useState(false);
  const [reportProgress, setReportProgress] = useState(0);
  const [reportStatus, setReportStatus] = useState('');
  
  // Check for unfinished reports on mount
  useEffect(() => {
    // Check if there's an ongoing report from cookies
    const savedProgress = getCookie('reportProgress');
    const savedMinimized = getCookie('reportMinimized');
    const savedComplete = getCookie('reportComplete');
    const savedStatus = getCookie('reportStatus');
    
    if (savedProgress) {
      // If there's a saved progress, show the report generator
      setShowReportGenerator(true);
      setReportProgress(parseFloat(savedProgress));
      
      // Set minimized state based on saved value
      setIsReportMinimized(savedMinimized === 'true');
      
      // Set status if available
      if (savedStatus) {
        setReportStatus(savedStatus);
      }
    }
  }, []);

  // Start report generation function that can be called from any component
  const startReportGeneration = () => {
    setShowReportGenerator(true);
    setIsReportMinimized(false);
    // Scroll to top for better view of the report generator
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle closing report generator
  const handleCloseReportGenerator = () => {
    setShowReportGenerator(false);
    setIsReportMinimized(false);
  };

  // Handle minimizing/maximizing report generator
  const handleReportMinimizeChange = (isMinimized) => {
    setIsReportMinimized(isMinimized);
    setCookie('reportMinimized', isMinimized.toString());
    
    // When maximizing from minimized state, scroll to top
    if (!isMinimized) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Update progress and status
  const updateReportProgress = (progress, status) => {
    setReportProgress(progress);
    if (status) setReportStatus(status);
  };

  return (
    <ReportGeneratorContext.Provider
      value={{
        showReportGenerator,
        isReportMinimized,
        reportProgress,
        reportStatus,
        startReportGeneration,
        handleCloseReportGenerator,
        handleReportMinimizeChange,
        updateReportProgress
      }}
    >
      {children}
      
      {/* Render the ReportGenerator component here, outside of page components,
          so it persists across page changes */}
      {showReportGenerator && (
        <ReportGenerator 
          isActive={showReportGenerator}
          onClose={handleCloseReportGenerator}
          onMinimize={handleReportMinimizeChange}
          isMinimized={isReportMinimized}
          progress={reportProgress}
          status={reportStatus}
          onProgressUpdate={updateReportProgress}
        />
      )}
    </ReportGeneratorContext.Provider>
  );
};

// Custom hook to use the report generator context
export const useReportGenerator = () => {
  const context = useContext(ReportGeneratorContext);
  if (!context) {
    throw new Error('useReportGenerator must be used within a ReportGeneratorProvider');
  }
  return context;
};