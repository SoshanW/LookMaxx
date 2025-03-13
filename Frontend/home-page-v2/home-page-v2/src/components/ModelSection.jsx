// ModelSection.jsx with optimized event listeners and reduced lag
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import gsap from 'gsap';
import '../styles/ModelSection.css';

const ModelSection = () => {
  // Add refs for 3D model containers
  const femaleModelRef = useRef(null);
  const maleModelRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(0);
  
  // Add useEffect for 3D model initialization
  useEffect(() => {
    // Track models loading for better performance management
    let modelCount = 0;
    const totalModels = 2;
    
    // Female model setup with optimization
    if (femaleModelRef.current) {
      setupModel(
        femaleModelRef.current, 
        './assets/models/female.fbx', 
        [0, 0, 0], 
        [0, Math.PI / 4, 0], 
        0.01,
        () => {
          modelCount++;
          setModelsLoaded(modelCount);
          
          // Only animate UI when all models are loaded
          if (modelCount === totalModels) {
            animateUI();
          }
        }
      );
    }
    
    // Male model setup with optimization
    if (maleModelRef.current) {
      setupModel(
        maleModelRef.current, 
        './assets/models/male.fbx', 
        [0, 0, 0], 
        [0, -Math.PI / 4, 0], 
        0.01,
        () => {
          modelCount++;
          setModelsLoaded(modelCount);
          
          // Only animate UI when all models are loaded
          if (modelCount === totalModels) {
            animateUI();
          }
        }
      );
    }
    
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
  
  // Animate UI elements once models are loaded
  const animateUI = () => {
    // Add hover animations for models
    if (femaleModelRef.current) {
      const femaleTl = gsap.timeline({ paused: true });
      femaleTl.to(femaleModelRef.current, { scale: 1.05, duration: 0.3, ease: "power2.out" });
      
      femaleModelRef.current.addEventListener('mouseenter', () => femaleTl.play());
      femaleModelRef.current.addEventListener('mouseleave', () => femaleTl.reverse());
    }
    
    if (maleModelRef.current) {
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
  };
  
  // Function to setup a 3D model with optimizations
  const setupModel = (container, modelPath, position, rotation, scale, onLoaded) => {
    // Create loader instance inside the function scope
    const loader = new FBXLoader();
    
    // Create scene
    const scene = new THREE.Scene();
    
    // Create camera with optimized parameters
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 5;
    
    // Create renderer with performance-optimized settings
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance', // Request high-performance GPU
      precision: 'mediump' // Use medium precision for better performance
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(container.clientWidth, container.clientHeight);
    
    // Use a lower pixel ratio for better performance (but still decent quality)
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pixelRatio);
    
    // Make the canvas wrapper element
    const canvasWrapper = document.createElement('div');
    canvasWrapper.className = 'model-canvas-wrapper';
    canvasWrapper.appendChild(renderer.domElement);
    container.appendChild(canvasWrapper);
    
    // Add optimized lights - using fewer, more efficient lights
    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Add loading indicator
    const loadingEl = document.createElement('div');
    loadingEl.className = 'model-loading';
    loadingEl.innerHTML = '<div class="loading-spinner"></div><div>Loading Model...</div>';
    container.appendChild(loadingEl);
    
    // Set timeout to handle loading failures
    const loadTimeout = setTimeout(() => {
      console.warn(`Model loading timeout for ${modelPath}`);
      if (container.contains(loadingEl)) {
        container.removeChild(loadingEl);
      }
      
      // Create a simple placeholder geometry instead
      const geometry = new THREE.BoxGeometry(1, 2, 1);
      const material = new THREE.MeshBasicMaterial({ color: 0x808080, wireframe: true });
      const placeholder = new THREE.Mesh(geometry, material);
      placeholder.position.set(...position);
      placeholder.rotation.set(...rotation);
      placeholder.scale.set(scale * 10, scale * 10, scale * 10);
      scene.add(placeholder);
      
      // Start rendering
      startRendering(placeholder, container, scene, camera, renderer, rotation);
      
      // Notify that loading is complete (even if with placeholder)
      if (onLoaded) onLoaded();
    }, 10000); // 10 second timeout
    
    // Track if component is mounted to prevent memory leaks
    let isMounted = true;
    
    // Load the model
    loader.load(
      modelPath, 
      (fbx) => {
        // Clear timeout since loading succeeded
        clearTimeout(loadTimeout);
        
        // If component was unmounted during loading, clean up and exit
        if (!isMounted) {
          fbx.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
              } else {
                object.material.dispose();
              }
            }
          });
          return;
        }
        
        // Remove loading indicator
        if (container.contains(loadingEl)) {
          container.removeChild(loadingEl);
        }
        
        // Optimize the model
        fbx.traverse((object) => {
          // Turn off shadows for better performance
          if (object.isMesh) {
            object.castShadow = false;
            object.receiveShadow = false;
            
            // Optimize geometry
            if (object.geometry) {
              // Merge vertices to reduce draw calls
              if (object.geometry.attributes && object.geometry.attributes.uv2) {
                object.geometry.deleteAttribute('uv2');
              }
              
              // Use non-indexed buffers for static objects
              if (!object.morphTargetInfluences && !object.morphTargetDictionary) {
                if (object.geometry.index !== null) {
                  object.geometry.setIndex(null);
                }
              }
            }
            
            // Optimize materials
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach(material => {
                  material.fog = false;
                  material.flatShading = true;
                });
              } else {
                object.material.fog = false;
                object.material.flatShading = true;
              }
            }
          }
        });
        
        // Position and add the model
        fbx.position.set(...position);
        fbx.rotation.set(...rotation);
        fbx.scale.set(scale, scale, scale);
        scene.add(fbx);
        
        // Start rendering with the loaded model
        startRendering(fbx, container, scene, camera, renderer, rotation);
        
        // Notify that loading is complete
        if (onLoaded) onLoaded();
      },
      // Progress callback
      (xhr) => {
        if (xhr.total > 0) {
          const percentComplete = Math.round((xhr.loaded / xhr.total) * 100);
          if (loadingEl && loadingEl.querySelector('.loading-spinner')) {
            loadingEl.querySelector('.loading-spinner').style.background = 
              `conic-gradient(#4f8fe6 ${percentComplete}%, #2a2a2a ${percentComplete}%)`;
          }
        }
      },
      // Error callback
      (error) => {
        console.error('Error loading model:', error);
        clearTimeout(loadTimeout);
        
        // Remove loading indicator
        if (container.contains(loadingEl)) {
          container.removeChild(loadingEl);
        }
        
        // Create a placeholder if model fails to load
        const geometry = new THREE.BoxGeometry(1, 2, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x808080, wireframe: true });
        const placeholder = new THREE.Mesh(geometry, material);
        placeholder.position.set(...position);
        placeholder.rotation.set(...rotation);
        placeholder.scale.set(scale * 10, scale * 10, scale * 10);
        scene.add(placeholder);
        
        // Start rendering with placeholder
        startRendering(placeholder, container, scene, camera, renderer, rotation);
        
        // Notify that loading is complete (even if with error)
        if (onLoaded) onLoaded();
      }
    );
    
    // Handle window resize with requestAnimationFrame for better performance
    let resizeRequested = false;
    const handleResize = () => {
      if (resizeRequested) return;
      
      resizeRequested = true;
      requestAnimationFrame(() => {
        if (!container) return;
        
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
        // Maintain the lower pixel ratio on resize
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        resizeRequested = false;
      });
    };
    
    // Use passive event listener for better performance
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Save scene and cleanup function to ref
    container.scene = scene;
    container.cleanup = () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      
      // Stop animation loop explicitly
      if (container.animationFrameId) {
        cancelAnimationFrame(container.animationFrameId);
        container.animationFrameId = null;
      }
    };
  };
  
  // Function to start rendering with smooth movement - OPTIMIZED FOR PERFORMANCE
  const startRendering = (model, container, scene, camera, renderer, initialRotation) => {
    // Initial rotation
    const initialRotationValues = [...initialRotation];
    
    // Mouse movement state
    const mouseState = {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
      isHovering: false,
      // Use timestamp to throttle event processing
      lastProcessed: 0
    };
    
    // Constants for smooth easing
    const ease = 0.06; // Lowered for smoother transitions
    
    // Throttle interval in ms (16ms ≈ 60fps)
    const throttleInterval = 16;
    
    // Add throttled mouse movement listener
    const handleMouseMove = (event) => {
      // Skip processing if not hovering (big performance win)
      if (!mouseState.isHovering) return;
      
      // Skip if we processed an event too recently
      const now = performance.now();
      if (now - mouseState.lastProcessed < throttleInterval) return;
      mouseState.lastProcessed = now;
      
      // Calculate mouse position relative to the center of the container
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Normalize mouse position (-1 to 1 range)
      mouseState.targetX = (event.clientX - centerX) / (rect.width / 2);
      mouseState.targetY = (event.clientY - centerY) / (rect.height / 2);
      
      // Clamp values to prevent extreme rotations
      mouseState.targetX = Math.max(-1, Math.min(1, mouseState.targetX));
      mouseState.targetY = Math.max(-1, Math.min(1, mouseState.targetY));
    };
    
    // Add hover state detection - using a simple flag
    const handleMouseEnter = () => {
      mouseState.isHovering = true;
    };
    
    const handleMouseLeave = () => {
      mouseState.isHovering = false;
      // Gradually return to initial rotation when mouse leaves
      mouseState.targetX = 0;
      mouseState.targetY = 0;
    };
    
    // Use passive event listeners for better performance
    container.addEventListener('mousemove', handleMouseMove, { passive: true });
    container.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    container.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    
    // Animation variables
    const rotationSpeed = 0.0003; // Lower for smoother rotation
    let prevTime = 0;
    let animationActive = true;
    
    // Use visibility API to pause animation when tab is not visible
    document.addEventListener('visibilitychange', () => {
      animationActive = !document.hidden;
    }, { passive: true });
    
    // Start animation loop with time-based animation and RAF
    const animate = (time) => {
      // Skip frame if animation is paused or container is gone
      if (!animationActive || !container) {
        container.animationFrameId = requestAnimationFrame(animate);
        return;
      }
      
      // Check if this element is in viewport before doing expensive operations
      const rect = container.getBoundingClientRect();
      const isVisible = 
        rect.top < window.innerHeight &&
        rect.bottom > 0 &&
        rect.left < window.innerWidth &&
        rect.right > 0;
      
      // Only update and render when visible
      if (isVisible) {
        // Smooth interpolation between current and target mouse position
        mouseState.currentX += (mouseState.targetX - mouseState.currentX) * ease;
        mouseState.currentY += (mouseState.targetY - mouseState.currentY) * ease;
        
        // Apply rotation based on mouse position if hovering
        if (mouseState.isHovering) {
          model.rotation.y = initialRotationValues[1] + (mouseState.currentX * 0.4); 
          model.rotation.x = initialRotationValues[0] + (mouseState.currentY * 0.15); 
        } else {
          // Gentle automatic rotation when not hovering
          // Use time for smooth rotation regardless of framerate
          model.rotation.y = initialRotationValues[1] + Math.sin(time * rotationSpeed) * 0.1;
          model.rotation.x = initialRotationValues[0];
        }
        
        // Only render when changes are visible
        renderer.render(scene, camera);
      }
      
      // Store animation frame ID for cleanup
      container.animationFrameId = requestAnimationFrame(animate);
    };
    
    // Start animation loop
    container.animationFrameId = requestAnimationFrame(animate);
    
    // Add to cleanup
    container.cleanupListeners = () => {
      // Remove event listeners
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      
      // Cancel animation frame
      if (container.animationFrameId) {
        cancelAnimationFrame(container.animationFrameId);
        container.animationFrameId = null;
      }
    };
  };
  
  // Function to clean up a scene
  const cleanupScene = (scene) => {
    if (!scene) return;
    
    scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
      if (object.texture) object.texture.dispose();
    });
    
    // Clean up the scene itself
    if (scene.cleanup) scene.cleanup();
    if (scene.cleanupListeners) scene.cleanupListeners();
    
    // Force garbage collection
    scene.clear();
  };

  return (
    <div className="model-section">
      <div className="model-section-content">
        <h1>Discover Your Potential</h1>
        <p>At LookSci, we combine advanced technology with scientific research to help you understand and enhance your unique features.</p>
        
        {/* Loading indicator */}
        {modelsLoaded < 2 && (
          <div className="models-loading-indicator">
            <div className="loading-spinner"></div>
            <div>Loading 3D Models: {modelsLoaded}/2</div>
          </div>
        )}
        
        {/* 3D model container */}
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
  );
};

export default ModelSection;