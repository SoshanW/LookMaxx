// Modifications to your ScrollAnimation component
// Import Three.js and FBX loader
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import PropTypes from 'prop-types'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import '../styles/ScrollAnimation.css'

gsap.registerPlugin(ScrollTrigger)

const ScrollAnimation = ({ frameCount = 40, imageFormat = 'jpg' }) => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const imagesRef = useRef([])
  const faceRef = useRef({ frame: 0 })
  const [scrollProgress, setScrollProgress] = useState(0)
  
  // Add refs for 3D model containers
  const femaleModelRef = useRef(null)
  const maleModelRef = useRef(null)
  
  // Keep existing useEffect for scroll animation
  // Add useEffect for 3D model initialization
  useEffect(() => {
    // All your existing scroll animation code...
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    // Function to update canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    // Initial canvas setup
    updateCanvasSize()
    
    // Fixed the template string syntax - added backticks
    const currentFrame = (index) => `./assets/${(index + 1).toString()}.${imageFormat}`
    
    // Load images
    for (let i = 0; i < frameCount; i++) {
      const img = new Image()
      img.src = currentFrame(i)
      imagesRef.current.push(img)
    }
    
    // Render function with proper scaling
    const render = () => {
      const currentImage = imagesRef.current[faceRef.current.frame]
      if (!currentImage || !currentImage.complete) return
      
      context.clearRect(0, 0, canvas.width, canvas.height)
      
      // Calculate dimensions for scaling
      const canvasAspect = canvas.width / canvas.height
      const imageAspect = currentImage.width / currentImage.height
      let drawWidth = canvas.width
      let drawHeight = canvas.height
      let x = 0
      let y = 0
      
      // Scale image to cover canvas while maintaining aspect ratio
      if (canvasAspect > imageAspect) {
        drawHeight = canvas.width / imageAspect
        y = (canvas.height - drawHeight) / 2
      } else {
        drawWidth = canvas.height * imageAspect
        x = (canvas.width - drawWidth) / 2
      }
      
      context.drawImage(currentImage, x, y, drawWidth, drawHeight)
    }
    
    // Handle window resize
    const handleResize = () => {
      updateCanvasSize()
      render()
    }
    
    window.addEventListener('resize', handleResize)
    
    // Initial animations for brand name and tagline
    gsap.fromTo(".brand-name", 
      { autoAlpha: 0, y: -50 }, // starting state
      { autoAlpha: 1, y: 0, duration: 1.5, delay: 0.5, ease: "power2.out" } // ending state
    );
    
    gsap.fromTo(".brand-tagline", 
      { autoAlpha: 0, y: 50 }, // starting state
      { autoAlpha: 1, y: 0, duration: 1.5, delay: 1, ease: "power2.out" } // ending state
    );
    
    gsap.fromTo(".get-started-btn", 
      { autoAlpha: 0, scale: 0.8 }, // starting state
      { autoAlpha: 1, scale: 1, duration: 1, delay: 1.5, ease: "back.out(1.7)" } // ending state
    );
    
    // Set initial state for feature cards (invisible)
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
          
          // Handle animation of the frame display
          gsap.set(faceRef.current, { frame: Math.floor(self.progress * (frameCount - 1)) });
          
          // Keep brand name visible longer by adjusting fadeout timing
          const brandOpacity = 1 - Math.max(0, (self.progress - 0.1) * 2.5);
          gsap.set(".landing-text-overlay", { opacity: brandOpacity });
          
          // Wider ranges for each card to have more screen time
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
    
    // Add frame animation to the timeline
    animationTimeline.to(faceRef.current, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      onUpdate: render,
    });
    
    // Create a separate ScrollTrigger for the transition between sections
    ScrollTrigger.create({
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
    
    // Initial render when first image loads
    imagesRef.current[0].onload = render
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [frameCount, imageFormat])
  
  // Add new useEffect for 3D model initialization
  useEffect(() => {
    // Female model setup
    if (femaleModelRef.current) {
      setupModel(femaleModelRef.current, './assets/models/female.fbx', [0, 0, 0], [0, Math.PI / 4, 0], 0.01);
      
      // Add hover animation for female model
      const femaleTl = gsap.timeline({ paused: true });
      femaleTl.to(femaleModelRef.current, { scale: 1.05, duration: 0.3, ease: "power2.out" });
      
      femaleModelRef.current.addEventListener('mouseenter', () => femaleTl.play());
      femaleModelRef.current.addEventListener('mouseleave', () => femaleTl.reverse());
    }
    
    // Male model setup
    if (maleModelRef.current) {
      setupModel(maleModelRef.current, './assets/models/male.fbx', [0, 0, 0], [0, -Math.PI / 4, 0], 0.01);
      
      // Add hover animation for male model
      const maleTl = gsap.timeline({ paused: true });
      maleTl.to(maleModelRef.current, { scale: 1.05, duration: 0.3, ease: "power2.out" });
      
      maleModelRef.current.addEventListener('mouseenter', () => maleTl.play());
      maleModelRef.current.addEventListener('mouseleave', () => maleTl.reverse());
    }
    
    // Add GSAP animations to the model containers
    gsap.fromTo(".model-container", 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.3, delay: 0.5, ease: "power3.out" }
    );
    
    return () => {
      // Cleanup for 3D scenes
      if (femaleModelRef.current?.scene) {
        cleanupScene(femaleModelRef.current.scene);
      }
      if (maleModelRef.current?.scene) {
        cleanupScene(maleModelRef.current.scene);
      }
    };
  }, []);
  
  // Function to setup a 3D model
  const setupModel = (container, modelPath, position, rotation, scale) => {
    // Create scene
    const scene = new THREE.Scene();
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;
    
          // Create renderer with better settings
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      preserveDrawingBuffer: true // Helps with visibility issues
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio); // Improve rendering quality
    
    // Make the canvas wrapper element
    const canvasWrapper = document.createElement('div');
    canvasWrapper.className = 'model-canvas-wrapper';
    canvasWrapper.appendChild(renderer.domElement);
    container.appendChild(canvasWrapper);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Add loading indicator
    const loadingEl = document.createElement('div');
    loadingEl.className = 'model-loading';
    loadingEl.innerHTML = '<div class="loading-spinner"></div><div>Loading Model...</div>';
    container.appendChild(loadingEl);
    
    // Load FBX model with better error handling
    const loader = new FBXLoader();
    loader.load(modelPath, (fbx) => {
      // Remove loading indicator
      container.removeChild(loadingEl);
      fbx.position.set(...position);
      fbx.rotation.set(...rotation);
      fbx.scale.set(scale, scale, scale);
      scene.add(fbx);
      
      // Initial rotation
      const initialRotation = [...rotation];
      
      // Track mouse position and hover state for rotation
      let mouseX = 0;
      let mouseY = 0;
      let isHovering = false;
      
      // Add mouse movement listener (only active when hovering over this specific container)
      const handleMouseMove = (event) => {
        if (!isHovering) return;
        
        // Calculate mouse position relative to the center of the container
        const rect = container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Normalize mouse position (-1 to 1 range)
        mouseX = (event.clientX - centerX) / (rect.width / 2);
        mouseY = (event.clientY - centerY) / (rect.height / 2);
      };
      
      // Add hover state detection
      const handleMouseEnter = () => {
        isHovering = true;
      };
      
      const handleMouseLeave = () => {
        isHovering = false;
        // Reset rotation to initial state gradually
        gsap.to(mouseX, { value: 0, duration: 0.5, onUpdate: () => mouseX = mouseX.value });
        gsap.to(mouseY, { value: 0, duration: 0.5, onUpdate: () => mouseY = mouseY.value });
      };
      
      // Add event listeners
      document.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
      
      // Start animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        
        // Apply rotation based on mouse position if hovering
        if (isHovering) {
          fbx.rotation.y = initialRotation[1] + (mouseX * 0.5); // horizontal rotation
          fbx.rotation.x = initialRotation[0] + (mouseY * 0.2); // vertical rotation (limited)
        } else {
          // Keep the model visible with a slight continuous rotation when not hovering
          fbx.rotation.y = initialRotation[1] + Math.sin(Date.now() * 0.001) * 0.1;
        }
        
        renderer.render(scene, camera);
      };
      animate();
      
      // Add to cleanup
      container.cleanupListeners = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      };
    });
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.render(scene, camera); // Force a render on resize
    };
    
    window.addEventListener('resize', handleResize);
    
    // Save scene and cleanup function to ref
    container.scene = scene;
    container.cleanup = () => {
      window.removeEventListener('resize', handleResize);
    };
  };
  
  // Function to clean up a scene
  const cleanupScene = (scene) => {
    scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    
    scene.cleanup && scene.cleanup();
    scene.cleanupListeners && scene.cleanupListeners();
  };
  
  return (
    <>
      <div className="scroll-animation-section">
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
          
          {/* Feature cards that appear during scroll */}
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
      
      {/* model section after the animation */}
      <div className="model-section">
        <div className="model-section-content">
          <h1>Discover Your Potential</h1>
          <p>At LookSci, we combine advanced technology with scientific research to help you understand and enhance your unique features.</p>
          
          {/* Replace card container with 3D models */}
          <div className="model-selection-container">
            <div className="model-container female-model" ref={femaleModelRef}>
              <div className="model-label">Female</div>
              <button className="model-select-btn">Select</button>
            </div>
            
            <div className="model-container male-model" ref={maleModelRef}>
              <div className="model-label">Male</div>
              <button className="model-select-btn">Select</button>
            </div>
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