import React, { useRef, useEffect, useState } from 'react';
import '../../styles/profile/AvatarSection.css';

const AvatarModel = ({ gender }) => {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const modelFile = gender === 'Male' ? '/models/male.fbx' : '/models/female.fbx';

  useEffect(() => {
    let scene, camera, renderer, model;
    let animationMixer, animationAction;
    let cleanup = null;

    const initThreeJs = async () => {
      try {
        // Dynamically import Three.js
        const THREE = await import('three');
        const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls');
        
        // Create scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x3a0077); // Match your purple background

        // Create camera with appropriate positioning for the model
        camera = new THREE.PerspectiveCamera(
          45, // Field of view
          1, // Aspect ratio (keeping it 1 for circle)
          0.1, // Near clipping plane
          1000 // Far clipping plane
        );
        camera.position.set(0, 1, 5); // Position camera to view the model
        camera.lookAt(0, 1, 0); // Look at the center of the model

        // Create renderer with proper size and settings
        renderer = new THREE.WebGLRenderer({ 
          antialias: true, 
          alpha: true 
        });
        renderer.setSize(200, 200);
        renderer.setPixelRatio(window.devicePixelRatio);
        
        // Clear any previous content
        if (mountRef.current) {
          while (mountRef.current.firstChild) {
            mountRef.current.removeChild(mountRef.current.firstChild);
          }
          mountRef.current.appendChild(renderer.domElement);
        }

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        // Optional: Add orbit controls for testing
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.rotateSpeed = 0.5;
        controls.update();

        // Load FBX model
        const loader = new FBXLoader();
        loader.load(
          modelFile,
          (fbx) => {
            model = fbx;
            
            // Scale model to fit container
            const scale = 0.017; 
            model.scale.set(scale, scale, scale);
            
            // Center model in view
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.x = -center.x;
            model.position.y = -center.y;
            model.position.z = -center.z;
            
            // Additional position adjustments if needed
            model.position.y = 0; 
            scene.add(model);
            
            // Set up animation if model has animations
            if (model.animations.length > 0) {
              animationMixer = new THREE.AnimationMixer(model);
              animationAction = animationMixer.clipAction(model.animations[0]);
              animationAction.play();
            }
            
            setLoading(false);
            
            // Animation loop
            const clock = new THREE.Clock();
            const animate = () => {
              const delta = clock.getDelta();
              
              if (animationMixer) {
                animationMixer.update(delta);
              } else {
                // If no animation, rotates the model slowly
                if (model) {
                  model.rotation.y += 0.01;
                }
              }
              
              renderer.render(scene, camera);
              
              cleanup = requestAnimationFrame(animate);
            };
            
            animate();
          },
          (xhr) => {
            // Loading progress
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
          },
          (err) => {
            console.error('Error loading model:', err);
            setError('Failed to load 3D model');
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('Three.js initialization error:', err);
        setError('Failed to initialize 3D renderer');
        setLoading(false);
      }
    };

    initThreeJs();

    // Cleanup function
    return () => {
      if (cleanup) {
        cancelAnimationFrame(cleanup);
      }
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [gender, modelFile]);

  return (
    <div className="avatar-model-container">
      {loading && (
        <div className="avatar-loading">
          <div className="loading-spinner"></div>
          <div className="avatar-loading-text">Loading {gender} Avatar</div>
        </div>
      )}
      {error && (
        <div className="model-label">
          {error}
        </div>
      )}
      <div 
        ref={mountRef} 
        className="avatar-model-viewer"
      />
    </div>
  );
};

export default AvatarModel;