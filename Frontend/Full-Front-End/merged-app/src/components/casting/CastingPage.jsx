import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthProvider";
import "../../styles/casting/CastingPage.css";

// Keeping NeonMist as part of the CastingPage file
const NeonMist = ({ isActive }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const mistRef = useRef(null);
  
  const handleMouseMove = (e) => {
    if (mistRef.current) {
      const rect = mistRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      setMousePosition({ x, y });
      
      // Update CSS variables directly for smoother performance
      mistRef.current.style.setProperty('--x', `${x}%`);
      mistRef.current.style.setProperty('--y', `${y}%`);
    }
  };
  
  useEffect(() => {
    const section = mistRef.current?.parentElement;
    
    if (section) {
      section.addEventListener('mousemove', handleMouseMove);
      
      return () => {
        section.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, []);
  
  return (
    <div 
      ref={mistRef}
      className={`neon-mist ${isActive ? 'neon-mist--active' : ''}`}
      aria-hidden="true"
    />
  );
};

// Custom hook for smooth scrolling between sections
const useSmoothScroll = () => {
  // Store refs for all sections
  const sectionRefs = {
    hero: useRef(null),
    discovery: useRef(null),
    ffr: useRef(null)
  };

  // Track active section
  const [activeSection, setActiveSection] = useState('hero');
  
  // Function to scroll to a specific section
  const scrollToSection = (sectionId) => {
    const section = sectionRefs[sectionId]?.current;
    if (!section) return;
    
    // Scroll to the section with smooth behavior
    section.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
    
    setActiveSection(sectionId);
  };
  
  // Set up scroll event listener to update active section
  useEffect(() => {
    const handleScroll = () => {
      // Get current scroll position
      const scrollPosition = window.scrollY;
      
      // Determine which section is currently in view
      const sections = Object.entries(sectionRefs).filter(([_, ref]) => ref.current);
      
      // Find the active section based on scroll position
      for (const [id, ref] of sections) {
        const element = ref.current;
        if (!element) continue;
        
        const rect = element.getBoundingClientRect();
        const sectionTop = rect.top + scrollPosition;
        const sectionBottom = sectionTop + rect.height;
        
        // If the section is in view, set it as active
        if (scrollPosition >= sectionTop - window.innerHeight / 3 && 
            scrollPosition < sectionBottom - window.innerHeight / 3) {
          setActiveSection(id);
          break;
        }
      }
    };
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Initial check for active section
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Function to scroll to previous or next section
  const navigateSection = (direction) => {
    // Updated sections array for navigation
    const sections = ['hero', 'discovery', 'ffr'];
    const currentIndex = sections.indexOf(activeSection);
    
    // Calculate next section index
    let nextIndex;
    if (direction === 'up') {
      nextIndex = Math.max(0, currentIndex - 1);
    } else {
      nextIndex = Math.min(sections.length - 1, currentIndex + 1);
    }
    
    // Scroll to the next section
    scrollToSection(sections[nextIndex]);
  };
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp') {
        navigateSection('up');
      } else if (e.key === 'ArrowDown') {
        navigateSection('down');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeSection]);
  
  // Handle wheel events for section navigation
  useEffect(() => {
    let wheelTimeout;
    let lastScrollTime = 0;
    
    const handleWheel = (e) => {
      // Prevent too frequent scrolling (debounce)
      const now = Date.now();
      if (now - lastScrollTime < 1000) return;
      
      // Clear any existing timeout
      if (wheelTimeout) {
        clearTimeout(wheelTimeout);
      }
      
      // Set a timeout to handle the wheel event
      wheelTimeout = setTimeout(() => {
        // Determine direction
        const direction = e.deltaY > 0 ? 'down' : 'up';
        navigateSection(direction);
        lastScrollTime = now;
      }, 50);
    };
    
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (wheelTimeout) {
        clearTimeout(wheelTimeout);
      }
    };
  }, [activeSection]);
  
  return { sectionRefs, activeSection, scrollToSection };
};

/**
 * Section Navigation Component
 * Provides dot navigation for scrolling between sections
 */
const SectionNavigation = ({ sections, activeSection, onNavigate }) => {
  return (
    <nav className="section-navigation">
      <ul>
        {sections.map((section) => (
          <li key={section.id}>
            <button 
              className={activeSection === section.id ? 'active' : ''}
              onClick={() => onNavigate(section.id)}
              aria-current={activeSection === section.id ? 'page' : undefined}
            >
              <span className="sr-only">{section.label}</span>
              <span className="nav-dot"></span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

/**
 * Hero Section Component
 * Main landing section with call-to-action
 */
const HeroSection = ({ sectionRef, isActive, onApplyNow }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Animation variants
  const fadeInVariant = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1 } }
  };
  
  const fadeInDelayedVariant = {
    hidden: { opacity: 0 },
    visible: (delay) => ({ 
      opacity: 1, 
      transition: { duration: 1, delay: delay * 0.2 } 
    })
  };

  const slideInVariant = {
    hidden: { x: 100, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <section 
      ref={sectionRef}
      className={`hero-section ${isActive ? 'active-section' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="hero-section_content">
        <div className="hero-section_text">
          <motion.h1
            initial="hidden"
            animate={isActive ? "visible" : "hidden"}
            variants={fadeInVariant}
          >
            <span className="hero-section_title-bold">Step into the</span>{" "}
            <span className="hero-section_title-highlight">Spotlight</span>
          </motion.h1>
          <motion.p 
            className="hero-section_subtitle"
            initial="hidden"
            animate={isActive ? "visible" : "hidden"}
            variants={fadeInDelayedVariant}
            custom={1} // Delay factor = 1
          >
            Your Modeling Journey Starts Here!
          </motion.p>
          <motion.button 
            className="hero-section_button"
            initial="hidden"
            animate={isActive ? "visible" : "hidden"}
            variants={fadeInDelayedVariant}
            custom={2} // Delay factor = 2
            onClick={onApplyNow} // Handler for Apply Now button
          >
            APPLY NOW
          </motion.button>
        </div>
        <motion.div 
          className="hero-section_image"
          initial="hidden"
          animate={isActive ? "visible" : "hidden"}
          variants={slideInVariant}
        >
          {/* Image content */}
        </motion.div>
      </div>
      <NeonMist isActive={isHovered && isActive} />
    </section>
  );
};

/**
 * Discovery Section Component
 * Second section highlighting model discovery features
 */
const DiscoverySection = ({ sectionRef, isActive }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Slide animation variants
  const slideLeftVariant = {
    hidden: { x: -100, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
  };
  
  const slideRightVariant = {
    hidden: { x: 100, opacity: 0 },
    visible: (delay) => ({ 
      x: 0, 
      opacity: 1, 
      transition: { duration: 0.8, delay: delay * 0.2, ease: "easeOut" } 
    })
  };

  return (
    <section 
      ref={sectionRef}
      className={`discovery-section ${isActive ? 'active-section' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="discovery-section_content">
        <motion.div 
          className="discovery-section_image"
          initial="hidden"
          animate={isActive ? "visible" : "hidden"}
          variants={slideLeftVariant}
        >
          {/* Image content */}
        </motion.div>
        <div className="discovery-section_text">
          <motion.h2
            initial="hidden"
            animate={isActive ? "visible" : "hidden"}
            variants={slideRightVariant}
            custom={0} // No delay
          >
            <span className="discovery-section_title-bold">Discover Your</span>{" "}
            <span className="discovery-section_title-highlight">Potential</span>
          </motion.h2>
          <motion.p 
            className="discovery-section_subtitle"
            initial="hidden"
            animate={isActive ? "visible" : "hidden"}
            variants={slideRightVariant}
            custom={1} // Delay factor = 1
          >
            Join Our Growing Community of Models
          </motion.p>
          <motion.button 
            className="discovery-section_button"
            initial="hidden"
            animate={isActive ? "visible" : "hidden"}
            variants={slideRightVariant}
            custom={2} // Delay factor = 2
          >
            LEARN MORE
          </motion.button>
        </div>
      </div>
      <NeonMist isActive={isHovered && isActive} />
    </section>
  );
};

/**
 * FFR Section Component
 * Features section highlighting Facial Feature Recognition technology
 */
const FFRSection = ({ sectionRef, isActive }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Animation variants
  const slideLeftVariant = {
    hidden: { x: -100, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
  };
  
  const slideRightVariant = {
    hidden: { x: 100, opacity: 0 },
    visible: (delay) => ({ 
      x: 0, 
      opacity: 1, 
      transition: { duration: 0.8, delay: delay * 0.2, ease: "easeOut" } 
    })
  };

  return (
    <section 
      ref={sectionRef}
      className={`ffr-section ${isActive ? 'active-section' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="ffr-section_content">
        <div className="ffr-section_left">
          <motion.h2
            initial="hidden"
            animate={isActive ? "visible" : "hidden"}
            variants={slideLeftVariant}
          >
            <span className="ffr-section_title-bold">HOLD</span>{" "}
            <span className="ffr-section_title-highlight">ON!</span>
          </motion.h2>
        </div>
        <div className="ffr-section_center">
          {/* Center content */}
        </div>
        <div className="ffr-section_right">
          <motion.p 
            className="ffr-section_subtitle"
            initial="hidden"
            animate={isActive ? "visible" : "hidden"}
            variants={slideRightVariant}
            custom={0} // No delay
          >
            To apply for Modeling Agencies, your account must be set to Public
          </motion.p>
          <motion.button 
            className="ffr-section_button"
            initial="hidden"
            animate={isActive ? "visible" : "hidden"}
            variants={slideRightVariant}
            custom={1} // Delay factor = 1
          >
            Publicize Account
          </motion.button>
        </div>
      </div>
      <NeonMist isActive={isHovered && isActive} />
    </section>
  );
};

/**
 * Main CastingPage Component
 * Handles page structure and navigation between sections
 */
const CastingPage = () => {
  // Use react-router-dom's navigate hook for programmatic navigation
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthContext();
  
  // Use our custom smooth scroll hook
  const { sectionRefs, activeSection, scrollToSection } = useSmoothScroll();
  
  // Define section data for navigation
  const sections = [
    { id: 'hero', label: 'Hero Section' },
    { id: 'discovery', label: 'Discovery Section' },
    { id: 'ffr', label: 'FFR Section' }
  ];

  // Function to handle "APPLY NOW" button click - navigates to application form
  const handleApplyNow = () => {
    // Use navigate to go to the application form page
    navigate('/apply');
  };

  // Add body class for proper styling
  useEffect(() => {
    document.body.classList.add('casting-page');
    
    return () => {
      document.body.classList.remove('casting-page');
    };
  }, []);

  return (
    <main className="page-container">
      {/* Navigation dots on the side */}
      <SectionNavigation 
        sections={sections} 
        activeSection={activeSection} 
        onNavigate={scrollToSection} 
      />
      
      {/* Page sections */}
      <HeroSection 
        sectionRef={sectionRefs.hero} 
        isActive={activeSection === 'hero'} 
        onApplyNow={handleApplyNow} // Pass the navigation handler
      />
      <DiscoverySection 
        sectionRef={sectionRefs.discovery} 
        isActive={activeSection === 'discovery'} 
      />
      <FFRSection 
        sectionRef={sectionRefs.ffr} 
        isActive={activeSection === 'ffr'} 
      />
    </main>
  );
};

export default CastingPage;