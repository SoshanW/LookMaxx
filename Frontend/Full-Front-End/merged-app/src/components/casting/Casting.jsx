import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthProvider";
import "../../styles/casting/Casting.css";

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
    
    // Set active section immediately rather than waiting for scroll event
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
    
    // Add scroll event listener with passive option for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
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
        e.preventDefault(); // Prevent default to avoid double scrolling
        navigateSection('up');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault(); // Prevent default to avoid double scrolling
        navigateSection('down');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeSection]);
  
  // Handle wheel events for section navigation with improved debounce and scroll accumulation
  useEffect(() => {
    let scrolling = false;
    let lastScrollTime = 0;
    const scrollCooldown = 800; // ms to wait before handling another scroll event
    
    // Scroll accumulation to require multiple wheel events to change sections
    let scrollAccumulator = 0;
    const scrollThreshold = 200; // Higher threshold means more scrolls needed (increased from 100)
    const accumulatorResetTime = 500; // ms before accumulator starts to decay (increased for more time)
    let accumulatorResetTimer = null;
    let progressIndicatorTimeout = null;
    
    // Create scroll progress indicator element
    const createProgressIndicator = () => {
      // Check if it already exists
      let indicator = document.querySelector('.scroll-progress-indicator');
      if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'scroll-progress-indicator';
        
        const progressFill = document.createElement('div');
        progressFill.className = 'scroll-progress-fill';
        indicator.appendChild(progressFill);
        
        document.body.appendChild(indicator);
      }
      return indicator;
    };
    
    // Update scroll progress indicator
    const updateProgressIndicator = (progress) => {
      const indicator = createProgressIndicator();
      const progressFill = indicator.querySelector('.scroll-progress-fill');
      
      // Show indicator
      indicator.classList.add('active');
      
      // Update fill width based on progress (0-100%)
      if (progressFill) {
        progressFill.style.width = `${Math.min(100, (progress / scrollThreshold) * 100)}%`;
      }
      
      // Hide indicator after some time with no scrolling
      clearTimeout(progressIndicatorTimeout);
      progressIndicatorTimeout = setTimeout(() => {
        indicator.classList.remove('active');
      }, 1000);
    };
    
    const handleWheel = (e) => {
      // Prevent too frequent scrolling
      const now = Date.now();
      if (scrolling) return;
      
      // Prevent default wheel behavior to avoid browser's native scrolling
      e.preventDefault();
      
      // Determine direction for indicator color
      const direction = e.deltaY > 0 ? 'down' : 'up';
      const directionSign = direction === 'down' ? 1 : -1;
      
      // Add scroll delta to accumulator (store direction info too)
      scrollAccumulator += directionSign * Math.abs(e.deltaY);
      
      // Make sure we're consistent with direction - reset if direction changes
      if ((scrollAccumulator > 0 && e.deltaY < 0) || (scrollAccumulator < 0 && e.deltaY > 0)) {
        scrollAccumulator = directionSign * Math.abs(e.deltaY);
      }
      
      // Update progress indicator
      updateProgressIndicator(Math.abs(scrollAccumulator));
      
      // Clear previous reset timer
      if (accumulatorResetTimer) {
        clearTimeout(accumulatorResetTimer);
      }
      
      // Set timer to gradually reset accumulator if user stops scrolling
      accumulatorResetTimer = setTimeout(() => {
        scrollAccumulator = 0;
        // Hide indicator when accumulator resets
        const indicator = document.querySelector('.scroll-progress-indicator');
        if (indicator) {
          indicator.classList.remove('active');
        }
      }, accumulatorResetTime);
      
      // Only change section if enough scrolling has accumulated and cooldown has passed
      if (Math.abs(scrollAccumulator) >= scrollThreshold && now - lastScrollTime >= scrollCooldown) {
        scrolling = true;
        lastScrollTime = now;
        scrollAccumulator = 0; // Reset accumulator
        
        // Navigate to the next section based on the sign of the accumulator
        navigateSection(directionSign > 0 ? 'down' : 'up');
        
        // Reset scrolling flag after animation completes
        setTimeout(() => {
          scrolling = false;
        }, scrollCooldown);
      }
    };
    
    const wheelTargets = Object.values(sectionRefs)
      .filter(ref => ref.current)
      .map(ref => ref.current);
    
    // Add wheel event listener to each section
    wheelTargets.forEach(target => {
      target.addEventListener('wheel', handleWheel, { passive: false });
    });
    
    return () => {
      // Remove event listeners
      wheelTargets.forEach(target => {
        target?.removeEventListener('wheel', handleWheel);
      });
      
      // Clean up timers
      if (accumulatorResetTimer) clearTimeout(accumulatorResetTimer);
      if (progressIndicatorTimeout) clearTimeout(progressIndicatorTimeout);
      
      // Remove progress indicator from DOM
      const indicator = document.querySelector('.scroll-progress-indicator');
      if (indicator && indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
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
    visible: { opacity: 1, transition: { duration: 0.8 } }
  };
  
  const fadeInDelayedVariant = {
    hidden: { opacity: 0 },
    visible: (delay) => ({ 
      opacity: 1, 
      transition: { duration: 0.8, delay: delay * 0.2 } 
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
const Casting = () => {
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

  // Add body class for proper styling and fix footer display
  useEffect(() => {
    // Immediately hide footer when entering casting page
    const footer = document.querySelector('footer');
    if (footer) {
      footer.style.display = 'none';
    }
    
    // Add casting page class to body
    document.body.classList.add('casting-page');
    
    // Ensure smooth scrolling by disabling native scrolling
    document.body.style.overflow = 'hidden';
    
    // Fix for issues with other page elements interfering with full viewport sections
    document.body.style.height = '100vh';
    
    return () => {
      // Clean up styles when component unmounts
      document.body.classList.remove('casting-page');
      document.body.style.overflow = '';
      document.body.style.height = '';
      
      // Restore footer when leaving page
      if (footer) {
        footer.style.display = '';
      }
    };
  }, []);

  // Pre-load images to avoid flicker during section changes
  useEffect(() => {
    const preloadImages = () => {
      const images = [
        '/assets/model.jpeg',
        '/assets/model2.jpeg',
        '/assets/ffr.png'
      ];
      
      images.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    };
    
    preloadImages();
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

export default Casting;