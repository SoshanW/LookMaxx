import React, { useRef, useEffect, useState } from 'react';
import { motion } from "framer-motion";
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const FitOnSection = () => {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized) return;
    
    // Initialize Three.js scene
    const initialize = () => {
      // Create scene
      sceneRef.current = new THREE.Scene();
      
      // Create camera
      cameraRef.current = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      cameraRef.current.position.set(0, 0, 3);
      
      // Create renderer
      rendererRef.current = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true, // Make background transparent to show the background image
        antialias: true
      });
      rendererRef.current.setSize(window.innerWidth * 0.6, window.innerHeight * 0.6);
      rendererRef.current.setPixelRatio(window.devicePixelRatio);
      rendererRef.current.shadowMap.enabled = true;
      
      // Add lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      sceneRef.current.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 5, 5);
      directionalLight.castShadow = true;
      sceneRef.current.add(directionalLight);
      
      const pointLight = new THREE.PointLight(0xffffff, 1);
      pointLight.position.set(-5, 0, 5);
      sceneRef.current.add(pointLight);
      
      // Add orbit controls
      controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
      controlsRef.current.enableDamping = true;
      controlsRef.current.dampingFactor = 0.05;
      
      // Load FBX model
      const loader = new FBXLoader();
      loader.load(
        '/JACKET.fbx', // Path to the model
        (fbx) => {
          // Debug the model structure to identify duplicates
          console.log('FBX structure loaded');
          
          // Count and list all meshes
          const meshNames = new Set();
          const duplicates = new Set();
          
          fbx.traverse((child) => {
            if (child.isMesh) {
              console.log(`Mesh found: ${child.name}`);
              
              // Check for duplicate mesh names
              if (meshNames.has(child.name)) {
                duplicates.add(child.name);
                child.visible = false; // Hide duplicate meshes
              } else {
                meshNames.add(child.name);
              }
            }
          });
          
          if (duplicates.size > 0) {
            console.log('Duplicate meshes found and hidden:', [...duplicates]);
          }
          
          // Scale and position the model
          fbx.scale.set(0.03, 0.03, 0.03); // Adjust scale as needed
          fbx.position.set(0, -1, 0); // Adjust position as needed
          fbx.rotation.set(0, Math.PI, 0); // Adjust rotation as needed
          
          // Clear any existing model before adding new one
          if (modelRef.current) {
            sceneRef.current.remove(modelRef.current);
          }
          
          // Add model to the scene
          sceneRef.current.add(fbx);
          modelRef.current = fbx;
          
          // Center camera on model
          const box = new THREE.Box3().setFromObject(fbx);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const fov = cameraRef.current.fov * (Math.PI / 180);
          let cameraDistance = maxDim / (2 * Math.tan(fov / 2));
          cameraDistance *= 1.5; // Add a little extra padding
          
          cameraRef.current.position.z = center.z + cameraDistance;
          controlsRef.current.target.copy(center);
        },
        (xhr) => {
          // Loading progress
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        },
        (error) => {
          // Error handling
          console.error('An error happened while loading the model:', error);
        }
      );
      
      // Handle window resize
      const handleResize = () => {
        if (cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = window.innerWidth / window.innerHeight;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(window.innerWidth * 0.6, window.innerHeight * 0.6);
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      // Animation loop - store animation frame ID for cleanup
      const animate = () => {
        animationFrameIdRef.current = requestAnimationFrame(animate);
        
        if (controlsRef.current) {
          controlsRef.current.update();
        }
        
        if (modelRef.current) {
          modelRef.current.rotation.y += 0.003; // Slow rotation for display
        }
        
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      };
      
      animate();
      setIsInitialized(true);
      
      // Cleanup function - more thorough cleanup to prevent memory leaks
      return () => {
        console.log('Cleaning up Three.js resources');
        
        // Cancel animation frame
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
          animationFrameIdRef.current = null;
        }
        
        window.removeEventListener('resize', handleResize);
        
        // Dispose of renderer
        if (rendererRef.current) {
          rendererRef.current.dispose();
          rendererRef.current.forceContextLoss();
          rendererRef.current.domElement = null;
        }
        
        // Dispose of model resources
        if (modelRef.current) {
          modelRef.current.traverse((child) => {
            if (child.isMesh) {
              if (child.geometry) child.geometry.dispose();
              
              if (child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach(material => material.dispose());
                } else {
                  child.material.dispose();
                }
              }
            }
          });
          
          sceneRef.current.remove(modelRef.current);
        }
        
        // Clear scene
        if (sceneRef.current) {
          while(sceneRef.current.children.length > 0) { 
            const object = sceneRef.current.children[0];
            sceneRef.current.remove(object);
          }
        }
        
        // Clear control references
        if (controlsRef.current) {
          controlsRef.current.dispose();
        }
        
        // Clear refs
        sceneRef.current = null;
        cameraRef.current = null;
        rendererRef.current = null;
        controlsRef.current = null;
        modelRef.current = null;
        
        setIsInitialized(false);
      };
    };
    
    initialize();
  }, [isInitialized]);

  return (
    <div 
      ref={sectionRef} 
      style={{
        backgroundImage: 'url(bg2.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '90vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem'
      }}
    >
      <h2 
        style={{
          fontFamily: 'Clash Display, sans-serif',
          fontSize: '2.5rem',
          fontWeight: 600,
          color: '#ffffff',
          textTransform: 'uppercase',
          marginBottom: '2rem'
        }}
      >
        Find Your Fit
      </h2>
      
      <div className="model-container" style={{ position: 'relative' }}>
        <canvas 
          ref={canvasRef} 
          style={{ 
            display: 'block',
            margin: '0 auto'
          }} 
        />
        
        <div 
          style={{
            position: 'absolute',
            bottom: '-60px',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            width: '100%'
          }}
        >

        </div>
      </div>
      
      <div 
        style={{
          marginTop: '80px',
          color: 'white',
          textAlign: 'center',
          maxWidth: '600px'
        }}
      >
        <h3 
          style={{
            fontFamily: 'Clash Display, sans-serif',
            fontSize: '1.8rem',
            marginBottom: '1rem'
          }}
        >
          Virtual Try-On Experience
        </h3>
        <p 
          style={{
            fontFamily: 'Archivo, sans-serif',
            fontSize: '1.1rem',
            lineHeight: '1.6',
            opacity: '0.9'
          }}
        >
          Explore our collection in 3D. Rotate, zoom, and see every detail before you buy. 
          Our virtual try-on technology lets you see how items will look on you.
        </p>
      </div>
    </div>
  );
};

export default FitOnSection;