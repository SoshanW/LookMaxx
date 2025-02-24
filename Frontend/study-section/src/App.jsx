// src/App.jsx
import React, { useState, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { gsap } from 'gsap'
import HumanHead from './HumanHead'
import './App.css'

function App() {
  // State to track which feature is selected and its view state (0=center, 1=left, 2=right)
  const [selectedFeature, setSelectedFeature] = useState({ feature: null, view: 0 })
  // Ref for the head group to animate it with GSAP
  const headRef = useRef()

  // Data mapping each facial feature to:
  // - a sphere position (where the clickable sphere will appear)
  // - an array of view settings (target position and scale for the head model)
  const featureData = {
    nose: {
      spherePos: [0, 1.5, 0.5],
      views: [
        { position: [0, 0, 0], scale: 1 },       // center view
        { position: [-1, 0, 0], scale: 1.2 },      // left view
        { position: [1, 0, 0], scale: 1.2 }        // right view
      ]
    },
    eye: {
      spherePos: [0.5, 2, 0.3],
      views: [
        { position: [0, 0, 0], scale: 1 },
        { position: [-1, 0, 0], scale: 1.2 },
        { position: [1, 0, 0], scale: 1.2 }
      ]
    },
    lips: {
      spherePos: [0, 1, 0.5],
      views: [
        { position: [0, 0, 0], scale: 1 },
        { position: [-1, 0, 0], scale: 1.2 },
        { position: [1, 0, 0], scale: 1.2 }
      ]
    },
    cheekbone: {
      spherePos: [1, 2, 0.3],
      views: [
        { position: [0, 0, 0], scale: 1 },
        { position: [-1, 0, 0], scale: 1.2 },
        { position: [1, 0, 0], scale: 1.2 }
      ]
    },
    jaw: {
      spherePos: [0, 0.5, 0.5],
      views: [
        { position: [0, 0, 0], scale: 1 },
        { position: [-1, 0, 0], scale: 1.2 },
        { position: [1, 0, 0], scale: 1.2 }
      ]
    }
  }

  // Handler for sphere clicks. If the same feature is clicked, cycle through the three views.
  const handleFeatureClick = (feature) => {
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
      gsap.to(headRef.current.position, {
        duration: 1,
        x: target.position[0],
        y: target.position[1],
        z: target.position[2],
        ease: "power3.inOut"
      })
      gsap.to(headRef.current.scale, {
        duration: 1,
        x: target.scale,
        y: target.scale,
        z: target.scale,
        ease: "power3.inOut"
      })
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
        </group>

        {/* Render a sphere for each facial feature */}
        {Object.entries(featureData).map(([feature, data]) => (
          <mesh
            key={feature}
            position={data.spherePos}
            onClick={() => handleFeatureClick(feature)}
            // Optional: make the sphere “hoverable” by increasing its scale on pointer over
            onPointerOver={(e) => (e.object.scale.set(1.2, 1.2, 1.2))}
            onPointerOut={(e) => (e.object.scale.set(1, 1, 1))}
          >
            <sphereGeometry args={[0.1, 32, 32]} />
            <meshStandardMaterial color="hotpink" />
          </mesh>
        ))}
        <OrbitControls />
      </Canvas>
    </div>
  )
}

export default App
