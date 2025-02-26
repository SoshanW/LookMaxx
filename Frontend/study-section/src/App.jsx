// src/App.jsx
import React, { useState, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { gsap } from 'gsap'
import HumanHead from './HumanHead'
import FeatureInfo from './FeatureInfo'
import './App.css'

function App() {
  // State to track which feature is selected and its view state (0=center, 1=left, 2=right)
  const [selectedFeature, setSelectedFeature] = useState({ feature: null, view: 0 })
  const [showInfo, setShowInfo] = useState(false)
  // Ref for the head group to animate it with GSAP
  const headRef = useRef()

  // Data mapping each facial feature to:
  // - a sphere position (where the clickable sphere will appear)
  // - an array of view settings (target position, rotation and scale for the head model)
  // - description text for the feature
  const featureData = {
    nose: {
      spherePos: [0, 1.1, 1.4],
      views: [
        { position: [0, 0, 0], rotation: [0, 0, 0], scale: 1 },          // center view
        { position: [-1.5, 0, -0.5], rotation: [0, -0.5, 0], scale: 1.5 },  // left view
        { position: [1.5, 0, -0.5], rotation: [0, 0.5, 0], scale: 1.5 }     // right view
      ],
      description: "The human nose contains complex nasal passages that filter and warm inhaled air. It houses approximately 400 types of scent receptors that can detect up to 1 trillion different odors."
    },
    eye: {
      spherePos: [0.35, 1.34, 1],
      views: [
        { position: [0, 0, 0], rotation: [0, 0, 0], scale: 1 },
        { position: [-1.2, 0.3, -0.2], rotation: [0.1, -0.7, 0], scale: 1.7 },
        { position: [1.2, 0.3, -0.2], rotation: [0.1, 0.7, 0], scale: 1.7 }
      ],
      description: "The human eye can distinguish approximately 10 million different colors and has the equivalent resolution of a 576-megapixel camera. The eye's focusing muscles move an estimated 100,000 times per day."
    },
    lips: {
      spherePos: [0, 0.6, 1.1],
      views: [
        { position: [0, 0, 0], rotation: [0, 0, 0], scale: 1 },
        { position: [-1, -0.4, 0], rotation: [0.2, -0.5, 0], scale: 1.8 },
        { position: [1, -0.4, 0], rotation: [0.2, 0.5, 0], scale: 1.8 }
      ],
      description: "The lips contain more nerve endings than any other part of the body, making them extremely sensitive to touch. They're composed of specialized muscles that enable precise movements for speech and expression."
    },
    cheekbone: {
      spherePos: [0.8, 1, 0.65],
      views: [
        { position: [0, 0, 0], rotation: [0, 0, 0], scale: 1 },
        { position: [-1.4, 0, -0.3], rotation: [-0.1, -0.8, 0.1], scale: 1.6 },
        { position: [1.4, 0, -0.3], rotation: [-0.1, 0.8, 0.1], scale: 1.6 }
      ],
      description: "The cheekbones (zygomatic bones) provide structural support to the face and protect the eye sockets. They're one of the most defining features of facial appearance across different ethnicities."
    },
    jaw: {
      spherePos: [0.73, 0.45, 0.3],
      views: [
        { position: [0, 0, 0], rotation: [0, 0, 0], scale: 1 },
        { position: [-1.2, -0.5, -0.4], rotation: [0.2, -0.7, 0.1], scale: 1.6 },
        { position: [1.2, -0.5, -0.4], rotation: [0.2, 0.7, 0.1], scale: 1.6 }
      ],
      description: "The human jaw (mandible) is the strongest bone in the face, capable of exerting up to 171 pounds of force when chewing. It's the only movable bone in the skull and contains the temporomandibular joint (TMJ)."
    }
  }

  // Handler for sphere clicks. If the same feature is clicked, cycle through the three views.
  const handleFeatureClick = (feature) => {
    setShowInfo(false) // Hide info before starting new animation
    
    setSelectedFeature((prev) => {
      let newView = 0
      if (prev.feature === feature) {
        newView = (prev.view + 1) % 3
      }
      return { feature, view: newView }
    })
  }

  // When selectedFeature changes, animate the head model group to the target position and scale.
  useEffect(() => {
    if (selectedFeature.feature && headRef.current) {
      const { views } = featureData[selectedFeature.feature]
      const target = views[selectedFeature.view]
      
      // Create a timeline for sequential animations
      const tl = gsap.timeline({
        onComplete: () => {
          // Show the info box after animation completes
          if (selectedFeature.view !== 0) {
            setShowInfo(true)
          }
        }
      })
      
      // Animate position, rotation, and scale
      tl.to(headRef.current.position, {
        duration: 1,
        x: target.position[0],
        y: target.position[1],
        z: target.position[2],
        ease: "power3.inOut"
      }, 0)
      
      tl.to(headRef.current.rotation, {
        duration: 1,
        x: target.rotation[0],
        y: target.rotation[1],
        z: target.rotation[2],
        ease: "power3.inOut"
      }, 0)
      
      tl.to(headRef.current.scale, {
        duration: 1,
        x: target.scale,
        y: target.scale,
        z: target.scale,
        ease: "power3.inOut"
      }, 0)
    }
  }, [selectedFeature, featureData])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
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
              <meshStandardMaterial color="hotpink" emissive="hotpink" emissiveIntensity={0.2} />
            </mesh>
          ))}
        </group>
        <OrbitControls enabled={!showInfo} />
      </Canvas>
      
      {/* Info box that appears after animation */}
      {showInfo && selectedFeature.feature && (
        <FeatureInfo 
          feature={selectedFeature.feature}
          description={featureData[selectedFeature.feature].description}
          onClose={() => {
            setShowInfo(false)
            // Reset view to center
            setSelectedFeature(prev => ({ ...prev, view: 0 }))
          }}
        />
      )}
    </div>
  )
}

export default App