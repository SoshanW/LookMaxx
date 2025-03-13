import React, { createContext, useContext, useState, useEffect } from 'react';
import ReportGenerator from '../components/ffr/ReportGenerator';

// Create context for the report generator state
const ReportGeneratorContext = createContext(null);

export const ReportGeneratorProvider = ({ children }) => {
  // Report generator state
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const [isReportMinimized, setIsReportMinimized] = useState(false);
  
  // Check for unfinished reports on mount
  useEffect(() => {
    // Check if there's an ongoing report from a previous session
    const savedProgress = localStorage.getItem('reportProgress');
    const savedMinimized = localStorage.getItem('reportMinimized');
    const savedComplete = localStorage.getItem('reportComplete');
    
    if (savedProgress) {
      // If there's a saved progress, show the report generator
      setShowReportGenerator(true);
      
      // Set minimized state based on saved value
      setIsReportMinimized(savedMinimized === 'true');
      
      // If the report is complete and it's minimized, keep it minimized
      // Otherwise, show the full report for completed reports
      if (savedComplete === 'true' && savedMinimized !== 'true') {
        setIsReportMinimized(false);
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
    localStorage.setItem('reportMinimized', isMinimized.toString());
    
    // When maximizing from minimized state, scroll to top
    if (!isMinimized) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <ReportGeneratorContext.Provider
      value={{
        showReportGenerator,
        isReportMinimized,
        startReportGeneration,
        handleCloseReportGenerator,
        handleReportMinimizeChange
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