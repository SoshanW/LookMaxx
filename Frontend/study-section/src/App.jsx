// src/App.jsx
import React, { useState, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { gsap } from 'gsap'
import HumanHead from './HumanHead'
import FeatureInfo from './FeatureInfo'
import WelcomeText from './WelcomeText'
import './App.css'

function App() {
  // State to track which feature is selected
  const [selectedFeature, setSelectedFeature] = useState(null)
  const [showInfo, setShowInfo] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  // Ref for the head group to animate it with GSAP
  const headRef = useRef()

  // Data mapping each facial feature to:
  // - a sphere position (where the clickable sphere will appear)
  // - view settings (target position, rotation and scale for the head model)
  // - description text for the feature
  const featureData = {
    nose: {
      spherePos: [0, 1.1, 1.4],
      view: { position: [-0.5, 0, -0.5], rotation: [0, -0.3, 0], scale: 1.5 },
      description: "The human nose contains complex nasal passages that filter and warm inhaled air. It houses approximately 400 types of scent receptors that can detect up to 1 trillion different odors."
    },
    eye: {
      spherePos: [0.35, 1.34, 1],
      view: { position: [-0.6, 0.3, -0.2], rotation: [0.1, -0.5, 0], scale: 1.7 },
      description: "The human eye can distinguish approximately 10 million different colors and has the equivalent resolution of a 576-megapixel camera. The eye's focusing muscles move an estimated 100,000 times per day."
    },
    lips: {
      spherePos: [0, 0.6, 1.1],
      view: { position: [-0.5, -0.4, 0], rotation: [0.2, -0.3, 0], scale: 1.8 },
      description: "The lips contain more nerve endings than any other part of the body, making them extremely sensitive to touch. They're composed of specialized muscles that enable precise movements for speech and expression."
    },
    cheekbone: {
      spherePos: [0.8, 1, 0.65],
      view: { position: [-0.7, 0, -0.3], rotation: [-0.1, -0.6, 0.1], scale: 1.6 },
      description: "The cheekbones (zygomatic bones) provide structural support to the face and protect the eye sockets. They're one of the most defining features of facial appearance across different ethnicities."
    },
    jaw: {
      spherePos: [0.73, 0.45, 0.3],
      view: { position: [-0.6, -0.5, -0.4], rotation: [0.2, -0.5, 0.1], scale: 1.6 },
      description: "The human jaw (mandible) is the strongest bone in the face, capable of exerting up to 171 pounds of force when chewing. It's the only movable bone in the skull and contains the temporomandibular joint (TMJ).(My rant starts here) The jaw is also the most important when it comes to a lot of features. A ton of features rely on the development of the jaw. Basically if the jaw isn't fully developed properly what is the point in being alive at that point. Everyone wants to be pretty and cute and sexy. This is me adding more and more content to just test out the scroll effect but for some reason the text box is just going down. A bit more texts cmon less go test this baby for a spin shall we. I wanna show all the finer things in life so lets forget about the world we young tonight I'm coming for ya I'm coming for ya. Cause All I need when the music makes you move baby do me like you doooo oo ooo. Take a bow you on the hottest ticket now aye aye we gonna party like its 3012 tonight I wanna show you all the finer things in life so just forget about the world we young tonight Im coming for ya I'm coming for ya"
    }
  }

  // Initial head position (left side of the screen facing forward)
  const initialHeadPosition = { position: [-2, 0, 0], rotation: [0, 0.5, 0], scale: 1 }

  // Reset position for when no feature is selected
  const resetHeadPosition = () => {
    if (headRef.current) {
      gsap.to(headRef.current.position, {
        duration: 1,
        x: initialHeadPosition.position[0],
        y: initialHeadPosition.position[1],
        z: initialHeadPosition.position[2],
        ease: "power3.inOut"
      })
      
      gsap.to(headRef.current.rotation, {
        duration: 1,
        x: initialHeadPosition.rotation[0],
        y: initialHeadPosition.rotation[1],
        z: initialHeadPosition.rotation[2],
        ease: "power3.inOut"
      })
      
      gsap.to(headRef.current.scale, {
        duration: 1,
        x: initialHeadPosition.scale,
        y: initialHeadPosition.scale,
        z: initialHeadPosition.scale,
        ease: "power3.inOut"
      })
    }
  }

  // Set initial head position immediately and on component mount
  useEffect(() => {
    // Apply initial position immediately
    resetHeadPosition()
    
    // Also ensure it's set after the model is loaded
    const timer = setTimeout(() => {
      if (headRef.current) {
        headRef.current.position.set(
          initialHeadPosition.position[0],
          initialHeadPosition.position[1],
          initialHeadPosition.position[2]
        )
        headRef.current.rotation.set(
          initialHeadPosition.rotation[0],
          initialHeadPosition.rotation[1],
          initialHeadPosition.rotation[2]
        )
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  // Handler for sphere clicks
  const handleFeatureClick = (feature) => {
    setShowInfo(false) // Hide info before starting new animation
    setShowWelcome(false) // Hide welcome text
    setSelectedFeature(feature)
  }

  // When selectedFeature changes, animate the head model
  useEffect(() => {
    if (selectedFeature && headRef.current) {
      const { view } = featureData[selectedFeature]
      
      // Create a timeline for sequential animations
      const tl = gsap.timeline({
        onComplete: () => {
          // Show the info box after animation completes
          setShowInfo(true)
        }
      })
      
      // Animate position, rotation, and scale with a more futuristic feel
      tl.to(headRef.current.position, {
        duration: 0.8,
        x: view.position[0],
        y: view.position[1],
        z: view.position[2],
        ease: "power4.out"
      }, 0)
      
      tl.to(headRef.current.rotation, {
        duration: 0.8,
        x: view.rotation[0],
        y: view.rotation[1],
        z: view.rotation[2],
        ease: "power4.out"
      }, 0)
      
      tl.to(headRef.current.scale, {
        duration: 0.8,
        x: view.scale,
        y: view.scale,
        z: view.scale,
        ease: "back.out(1.2)"
      }, 0)
    }
  }, [selectedFeature, featureData])

  return (
    <div className="canvas-container">
      <Canvas camera={{ position: [0, 0, 5] }} style={{ background: 'linear-gradient(to bottom, #0f1025 0%, #1a1150 100%)' }}>
        <ambientLight intensity={0.2} color="#b8c6ff" />
        <directionalLight position={[10, 10, 5]} intensity={0.8} color="#ffffff" />
        {/* Main accent light for blue highlights */}
        <pointLight position={[-5, 2, 2]} intensity={2} color="#4d9bff" distance={15} />
        {/* Purple rim light for contrast */}
        <spotLight position={[5, -2, -2]} intensity={1.5} color="#a94dff" distance={20} angle={0.5} />
        
        {/* Wrap the head model in a group so we can animate it */}
        <group ref={headRef}>
          <HumanHead />
          
          {/* Render a sphere for each facial feature */}
          {Object.entries(featureData).map(([feature, data]) => (
            <mesh
              key={feature}
              position={data.spherePos}
              onClick={() => handleFeatureClick(feature)}
              // Optional: make the sphere "hoverable" by increasing its scale on pointer over
              onPointerOver={(e) => (e.object.scale.set(1.2, 1.2, 1.2))}
              onPointerOut={(e) => (e.object.scale.set(1, 1, 1))}
            >
              <sphereGeometry args={[0.1, 32, 32]} />
              <meshStandardMaterial 
                color="#a94dff" 
                emissive="#a94dff" 
                emissiveIntensity={selectedFeature === feature ? 0.8 : 0.3} 
              />
            </mesh>
          ))}
        </group>
        {/* No OrbitControls as requested */}
      </Canvas>
      
      {/* Welcome text that appears on the right side */}
      {showWelcome && (
        <WelcomeText />
      )}
      
      {/* Info box that appears after animation */}
      {showInfo && selectedFeature && (
        <FeatureInfo 
          feature={selectedFeature}
          description={featureData[selectedFeature].description}
          onClose={() => {
            setShowInfo(false)
            setShowWelcome(true)
            setSelectedFeature(null)
            resetHeadPosition()
          }}
        />
      )}
    </div>
  )
}

export default App