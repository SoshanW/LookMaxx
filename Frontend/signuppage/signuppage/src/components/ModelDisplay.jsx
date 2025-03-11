import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

const ModelDisplay = ({ gender }) => {
  const mountRef = useRef(null);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mountRef.current || !gender) return;

    // Debug info
    console.log("ModelDisplay mounted. Gender:", gender);
    setLoadingStatus('Setting up Three.js...');

    // Setup Three.js basics
    const scene = new THREE.Scene();
    
    // Camera
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(0, 100, 300);
    camera.lookAt(0, 0, 0);

    // Renderer - enable transparency
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true  // Enable transparency
    });
    renderer.setClearColor(0x000000, 0); // Set clear color with 0 alpha (fully transparent)
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 200, 100);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    //grid
    const gridHelper = new THREE.GridHelper(200, 20, 0xB045C3, 0xB045C3);
    gridHelper.material.opacity = 0.15;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
    
    // Temporary cube while model loads (with transparency)
    const geometry = new THREE.BoxGeometry(50, 50, 50);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xB045C3, 
      wireframe: true,
      opacity: 0.7,
      transparent: true
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    
    // Initial render
    renderer.render(scene, camera);
    
    setLoadingStatus('Loading model...');

    // Path to FBX models
    const modelPath = gender === 'male' ? '/models/male.fbx' : '/models/female.fbx';
    console.log("Loading model from path:", modelPath);
    
    // Load the FBX model
    const loader = new FBXLoader();
    
    loader.load(
      modelPath,
      (object) => {
        console.log("FBX model loaded successfully:", object);
        setLoadingStatus('Model loaded successfully!');
        
        // Remove placeholder cube
        scene.remove(cube);
        
        // Scaling and positioning the model
        object.scale.set(0.5, 0.5, 0.5);
        
        // Center the model
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        object.position.sub(center);
        
        // Slightly raised the model to be perfectly centered on the grid
        object.position.y += 5;
        
        scene.add(object);
        
        // Animation loop
        const animate = () => {
          requestAnimationFrame(animate);
          object.rotation.y += 0.01;
          renderer.render(scene, camera);
        };
        
        animate();
        
        // Hide loading status after a few seconds
        setTimeout(() => {
          setLoadingStatus('');
        }, 2000);
      },
      (xhr) => {
        const percentComplete = Math.round((xhr.loaded / xhr.total) * 100);
        setLoadingStatus(`Loading: ${percentComplete}%`);
        console.log(`${percentComplete}% loaded`);
      },
      (err) => {
        console.error('Error loading model:', err);
        setError(`Failed to load model: ${err.message}`);
        setLoadingStatus('Error loading model');
      }
    );

    // Handle window resize
    const handleResize = () => {
      if (mountRef.current) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        renderer.render(scene, camera);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      console.log("ModelDisplay unmounting, cleaning up");
      window.removeEventListener('resize', handleResize);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose resources
      renderer.dispose();
    };
  }, [gender]); // Re-run effect when gender changes

  return (
    <div className="model-container" style={{ position: 'relative', height: '100%', width: '100%' }}>
      <div 
        ref={mountRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          position: 'relative',
          backgroundColor: 'transparent' // Make container transparent
        }} 
      />
      
      {loadingStatus && (
        <div className="loading-status" style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(176, 69, 195, 0.8)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          zIndex: 100,
          backdropFilter: 'blur(5px)'
        }}>
          {loadingStatus}
        </div>
      )}
      
      {/* Error message*/}
      {error && (
        <div className="error-message" style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(220, 53, 69, 0.9)',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
          maxWidth: '80%',
          zIndex: 100
        }}>
          {error}
          <button 
            onClick={() => setError(null)}
            style={{
              background: 'white',
              color: '#dc3545',
              border: 'none',
              borderRadius: '4px',
              padding: '5px 10px',
              marginTop: '10px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default ModelDisplay;