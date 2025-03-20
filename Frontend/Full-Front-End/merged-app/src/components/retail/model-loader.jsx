import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export const useModelLoader = (canvasRef, selectedModel) => {
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Function to load a 3D model
  const loadModel = (modelPath) => {
    setIsLoading(true);
    
    // Clear any existing model completely
    if (modelRef.current && sceneRef.current) {
      // Properly dispose of geometry and materials
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
      modelRef.current = null;
    }
    
    // Loading FBX model
    const loader = new FBXLoader();
    loader.load(
      `/models/${modelPath}`, // Path to the model
      (fbx) => {
        console.log(`Loading model: ${modelPath}`);
        
        // Count and list all meshes
        const meshNames = new Set();
        const duplicates = new Set();
        
        fbx.traverse((child) => {
          if (child.isMesh) {
            console.log(`Mesh found: ${child.name}`);
            
            // Checking for duplicate mesh names
            if (meshNames.has(child.name)) {
              duplicates.add(child.name);
              child.visible = false; // Hiding duplicate meshes
            } else {
              meshNames.add(child.name);
            }
          }
        });
        
        if (duplicates.size > 0) {
          console.log('Duplicate meshes found and hidden:', [...duplicates]);
        }
        
        // Setting model-specific scaling and positioning
        switch(modelPath) {
         // In the switch statement in loadModel function
          case 'dress.fbx':
            fbx.scale.set(0.01, 0.01, 0.01); 
            fbx.position.set(0, 0, 0);
            break;
          case 'shirt.fbx':
            fbx.scale.set(0.01, 0.01, 0.01); 
            fbx.position.set(0, -0.5, 0);
            break;
          case 'JACKET.fbx':
            fbx.scale.set(0.1, 0.11, 0.1); 
            fbx.position.set(0, -0.3, 0);
            break;
          default:
            fbx.scale.set(0.02, 0.02, 0.02);
            fbx.position.set(0, -0.5, 0);
        }
        
        
        // Adding model to the scene
        sceneRef.current.add(fbx);
        modelRef.current = fbx;
        
        // Center camera on model
        const box = new THREE.Box3().setFromObject(fbx);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = cameraRef.current.fov * (Math.PI / 180);
        let cameraDistance = maxDim / (2 * Math.tan(fov / 2));
        cameraDistance *= 1.5; 
        cameraRef.current.position.z = center.z + cameraDistance;
        controlsRef.current.target.copy(center);
        controlsRef.current.update();
        
        setIsLoading(false);
      },
      (xhr) => {
        // Loading progress
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        // Error handling
        console.error('An error happened while loading the model:', error);
        setIsLoading(false);
      }
    );
  };

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
        alpha: true, 
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
      
      // orbit controls
      controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
      controlsRef.current.enableDamping = true;
      controlsRef.current.dampingFactor = 0.05;
      
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
      
      // Handle window resize
      const handleResize = () => {
        if (cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = window.innerWidth / window.innerHeight;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(window.innerWidth * 0.6, window.innerHeight * 0.6);
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      // Cleanup function
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
  }, []);

  // Load model when selection changes or scene initializes
  useEffect(() => {
    if (isInitialized && sceneRef.current) {
      // Only load model when scene is ready
      loadModel(selectedModel);
    }
  }, [selectedModel, isInitialized]);

  return { isInitialized, isLoading };
};