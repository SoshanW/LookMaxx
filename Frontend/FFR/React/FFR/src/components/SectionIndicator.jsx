import React, { useEffect, useState } from 'react';
import '../styles/SectionIndicator.css';

const SectionIndicator = () => {
  const [activeSection, setActiveSection] = useState(0);

  // Define the sections with their scroll ranges
  const sections = [
    { id: 0, start: 0, end: window.innerHeight }, // First viewport
    { id: 1, start: window.innerHeight, end: window.innerHeight *3 }, // Second viewport
    { id: 2, start: window.innerHeight *3, end: window.innerHeight * 5}, // Third viewport
    { id: 3, start: window.innerHeight * 5, end: window.innerHeight * 6 }, // Fourth viewport
  ];

  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    
    // Find the active section based on scroll position
    const currentSection = sections.find(
      section => scrollPosition >= section.start && scrollPosition < section.end
    );

    if (currentSection) {
      setActiveSection(currentSection.id);
    }
  };

  useEffect(() => {
    // Initial check
    handleScroll();

    // Add scroll listener
    window.addEventListener('scroll', handleScroll);

    // Handle window resize
    const handleResize = () => {
      // Update section ranges when window is resized
      sections.forEach((section, index) => {
        section.start = window.innerHeight * index;
        section.end = window.innerHeight * (index + 1);
      });
      handleScroll();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="section-indicator">
      {sections.map((section) => (
        <div
          key={section.id}
          className={`indicator ${activeSection === section.id ? 'active' : ''}`}
        >
          <div className="indicator-inner"></div>
        </div>
      ))}
    </div>
  );
};

export default SectionIndicator;