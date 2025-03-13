// ScrollAnimation.jsx
import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import PropTypes from 'prop-types'
// Remove ModelSection import since it's rendered in App.jsx
import '../styles/ScrollAnimation.css'

gsap.registerPlugin(ScrollTrigger)

const ScrollAnimation = ({ frameCount = 40, imageFormat = 'jpg' }) => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const imagesRef = useRef([])
  const faceRef = useRef({ frame: 0 })
  const [scrollProgress, setScrollProgress] = useState(0)
  const [imagesLoaded, setImagesLoaded] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const animationTimelineRef = useRef(null)
  const scrollTriggerRef = useRef(null)
  
  // Preload images with proper error handling
  useEffect(() => {
    // Use a smaller number of frames for performance if needed
    const effectiveFrameCount = Math.min(frameCount, 40);
    let loadedCount = 0;
    
    // Function to create image path
    const currentFrame = (index) => {
      const adjustedIndex = Math.floor((index / effectiveFrameCount) * frameCount) + 1;
      return `./assets/${adjustedIndex.toString()}.${imageFormat}`;
    }
    
    // Clear previous images if any
    imagesRef.current = [];
    
    // Set up loading timeout
    const loadingTimeout = setTimeout(() => {
      console.warn('Image loading timeout - some images may not have loaded correctly');
      if (loadedCount > 0) {
        // Continue with what we have if at least some images loaded
        setIsReady(true);
      }
    }, 15000); // 15 second timeout
    
    // Load images in batches to prevent memory issues
    const batchSize = 5;
    let currentBatch = 0;
    
    const loadNextBatch = () => {
      const startIdx = currentBatch * batchSize;
      const endIdx = Math.min(startIdx + batchSize, effectiveFrameCount);
      
      if (startIdx >= effectiveFrameCount) {
        clearTimeout(loadingTimeout);
        return;
      }
      
      for (let i = startIdx; i < endIdx; i++) {
        const img = new Image();
        
        // Handle successful loading
        img.onload = () => {
          loadedCount++;
          setImagesLoaded(loadedCount);
          imagesRef.current[i] = img;
          
          // Check if all images in this batch are loaded
          if (loadedCount === effectiveFrameCount) {
            clearTimeout(loadingTimeout);
            setIsReady(true);
          }
        };
        
        // Handle loading errors
        img.onerror = () => {
          console.warn(`Failed to load image: ${currentFrame(i)}`);
          // Create a placeholder canvas instead
          const canvas = document.createElement('canvas');
          canvas.width = 800;
          canvas.height = 600;
          const ctx = canvas.getContext('2d');
          // Fill with a gradient
          const gradient = ctx.createLinearGradient(0, 0, 800, 600);
          gradient.addColorStop(0, '#304352');
          gradient.addColorStop(1, '#d7d2cc');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 800, 600);
          
          // Convert to image
          const placeholderImg = new Image();
          placeholderImg.src = canvas.toDataURL();
          placeholderImg.onload = () => {
            loadedCount++;
            setImagesLoaded(loadedCount);
            imagesRef.current[i] = placeholderImg;
            
            if (loadedCount === effectiveFrameCount) {
              clearTimeout(loadingTimeout);
              setIsReady(true);
            }
          };
        };
        
        // Start loading the image
        img.src = currentFrame(i);
        
        // Add empty placeholder to maintain correct array indexing
        imagesRef.current[i] = null;
      }
      
      currentBatch++;
      // Schedule next batch with a small delay to prevent overwhelming the browser
      setTimeout(loadNextBatch, 100);
    };
    
    // Start loading the first batch
    loadNextBatch();
    
    return () => {
      clearTimeout(loadingTimeout);
      // Clear image references for garbage collection
      imagesRef.current.forEach((img, index) => {
        if (img) {
          imagesRef.current[index] = null;
        }
      });
    };
  }, [frameCount, imageFormat]);
  
  // Memoized render function to reduce rerenders
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d', { alpha: false });
    const currentFrame = Math.min(Math.floor(faceRef.current.frame), imagesRef.current.length - 1);
    const currentImage = imagesRef.current[currentFrame];
    
    if (!currentImage || !currentImage.complete) return;
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate dimensions for scaling
    const canvasAspect = canvas.width / canvas.height;
    const imageAspect = currentImage.width / currentImage.height;
    let drawWidth = canvas.width;
    let drawHeight = canvas.height;
    let x = 0;
    let y = 0;
    
    // Scale image to cover canvas while maintaining aspect ratio
    if (canvasAspect > imageAspect) {
      drawHeight = canvas.width / imageAspect;
      y = (canvas.height - drawHeight) / 2;
    } else {
      drawWidth = canvas.height * imageAspect;
      x = (canvas.width - drawWidth) / 2;
    }
    
    // Use drawImage with integer coordinates for better performance
    context.drawImage(
      currentImage, 
      Math.floor(x), 
      Math.floor(y), 
      Math.floor(drawWidth), 
      Math.floor(drawHeight)
    );
  }, []);
  
  // Set up ScrollTrigger and animations once images are loaded
  useEffect(() => {
    if (!isReady) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d', { alpha: false });
    
    // Function to update canvas size
    const updateCanvasSize = () => {
      // Use smaller canvas dimensions on mobile for better performance
      const isMobile = window.innerWidth < 768;
      const scaleFactor = isMobile ? 0.5 : 1;
      
      canvas.width = window.innerWidth * scaleFactor;
      canvas.height = window.innerHeight * scaleFactor;
      
      // Set display size to keep visual dimensions
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      
      // Update the render to reflect the new size
      render();
    };
    
    // Initial canvas setup
    updateCanvasSize();
    
    // Handle window resize with debounce for performance
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updateCanvasSize();
        
        // Update ScrollTrigger
        if (scrollTriggerRef.current) {
          scrollTriggerRef.current.update();
        }
      }, 250);
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Initial animations for brand name and tagline
    gsap.fromTo(".brand-name", 
      { autoAlpha: 0, y: -50 },
      { autoAlpha: 1, y: 0, duration: 1.5, delay: 0.5, ease: "power2.out" }
    );
    
    gsap.fromTo(".brand-tagline", 
      { autoAlpha: 0, y: 50 },
      { autoAlpha: 1, y: 0, duration: 1.5, delay: 1, ease: "power2.out" }
    );
    
    gsap.fromTo(".get-started-btn", 
      { autoAlpha: 0, scale: 0.8 },
      { autoAlpha: 1, scale: 1, duration: 1, delay: 1.5, ease: "back.out(1.7)" }
    );
    
    // Set initial state for feature cards and end indicator
    gsap.set(".feature-card", { autoAlpha: 0 });
    gsap.set(".scroll-end-indicator", { autoAlpha: 0 });
    
    // Main scroll animation timeline
    const animationTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        start: "top top",
        end: "400%", 
        scrub: 1.5,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
          
          // Update frame with lower update frequency on mobile
          const isMobile = window.innerWidth < 768;
          const newFrame = Math.floor(self.progress * (frameCount - 1));
          
          // Only update if frame has changed, or less frequently on mobile
          if (faceRef.current.frame !== newFrame || 
              (isMobile && Math.abs(faceRef.current.frame - newFrame) > 2)) {
            faceRef.current.frame = newFrame;
            render();
          }
          
          // Keep brand name visible longer by adjusting fadeout timing
          const brandOpacity = 1 - Math.max(0, (self.progress - 0.1) * 2.5);
          gsap.set(".landing-text-overlay", { opacity: brandOpacity });
          
          // Optimize card animations - use visibility ranges instead of continuous updates
          if (self.progress > 0.5 && self.progress < 0.66) {
            gsap.to(".feature-card-1", { autoAlpha: 1, duration: 0.8 });
          } else {
            gsap.to(".feature-card-1", { autoAlpha: 0, duration: 0.5 });
          }
          
          if (self.progress > 0.66 && self.progress < 0.82) {
            gsap.to(".feature-card-2", { autoAlpha: 1, duration: 0.8 });
          } else {
            gsap.to(".feature-card-2", { autoAlpha: 0, duration: 0.5 });
          }
          
          if (self.progress > 0.82 && self.progress < 0.95) {
            gsap.to(".feature-card-3", { autoAlpha: 1, duration: 0.8 });
          } else {
            gsap.to(".feature-card-3", { autoAlpha: 0, duration: 0.5 });
          }
          
          // Show end indicator near the end
          if (self.progress > 0.95) {
            gsap.to(".scroll-end-indicator", { autoAlpha: 1, duration: 0.5 });
          } else {
            gsap.to(".scroll-end-indicator", { autoAlpha: 0, duration: 0.3 });
          }
        }
      }
    });
    
    // Store the timeline in ref for cleanup
    animationTimelineRef.current = animationTimeline;
    
    // Create a separate ScrollTrigger for the transition between sections
    const sectionTrigger = ScrollTrigger.create({
      trigger: ".model-section",
      start: "top bottom-=10%",
      onEnter: () => {
        // When entering the model section, start fading out the animation section
        gsap.to(".scroll-animation-section", { autoAlpha: 0, duration: 0.5 });
      },
      onLeaveBack: () => {
        // When leaving the model section (scrolling back up), fade in the animation section
        gsap.to(".scroll-animation-section", { autoAlpha: 1, duration: 0.5 });
      }
    });
    
    // Store the ScrollTrigger in ref for cleanup
    scrollTriggerRef.current = sectionTrigger;
    
    // Render initial image
    if (imagesRef.current[0] && imagesRef.current[0].complete) {
      render();
    } else if (imagesRef.current[0]) {
      imagesRef.current[0].onload = render;
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      
      // Kill all GSAP animations and ScrollTriggers
      if (animationTimelineRef.current) {
        animationTimelineRef.current.kill();
      }
      
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      
      // Clear canvas
      if (canvas) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [isReady, render, frameCount]);
  
  return (
    <>
      {/* Loading indicator for initial image loading */}
      {!isReady && (
        <div className="scroll-animation-loading">
          <div className="loading-spinner"></div>
          <div>Loading animation frames: {imagesLoaded}/{frameCount}</div>
        </div>
      )}
    
      <div className="scroll-animation-section" style={{ visibility: isReady ? 'visible' : 'hidden' }}>
        <div ref={containerRef} className="animation-container">
          <canvas ref={canvasRef} className="scroll-animation-canvas" />
          
          {/* Text overlay for landing area */}
          <div className="landing-text-overlay">
            <div className="brand-name">LookSci</div>
            <div className="brand-tagline">
              <div>Beauty</div>
              <div>Redefined.</div>
            </div>
            <button className="get-started-btn">Get Started</button>
          </div>
          
          {/* Feature cards that appear during scroll - optimized to not all be in DOM at once */}
          <div className="feature-card feature-card-1">
            <div className="card-content">
              <h2>Interested about facial aesthetics?</h2>
              <button className="card-button">GET STARTED</button>
            </div>
          </div>
          
          <div className="feature-card feature-card-2">
            <div className="card-content">
              <h2>Looking for Modelling opportunities?</h2>
              <button className="card-button">GET STARTED</button>
            </div>
          </div>
          
          <div className="feature-card feature-card-3">
            <div className="card-content">
              <h2>Find your Style</h2>
              <button className="card-button">Learn More</button>
            </div>
          </div>
          
          {/* End of scroll indicator */}
          <div className="scroll-end-indicator">
            <span>Continue to explore</span>
            <div className="arrow-down"></div>
          </div>
        </div>
      </div>
    </>
  )
}

ScrollAnimation.propTypes = {
  frameCount: PropTypes.number,
  imageFormat: PropTypes.string
}

export default ScrollAnimation