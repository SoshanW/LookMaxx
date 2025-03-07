// src/components/AnatomyExplorer.jsx
import React, { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import HumanHeadModel from './HumanHeadModel'
import FeatureInfoPanel from './FeatureInfoPanel'
import WelcomePanel from './WelcomePanel'
import NavigationBar from './NavigationBar'
import SceneLighting from './SceneLighting'
import { featureData } from '../data/featureData'
import '../styles/AnatomyExplorer.css'

const AnatomyExplorer = () => {
  const [selectedFeature, setSelectedFeature] = useState(null)
  const [showInfo, setShowInfo] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)

  // Initial head position (left side of the screen facing forward)
  const initialHeadPosition = { 
    position: [-2, 0, 0], 
    rotation: [0, 0.5, 0], 
    scale: 1 
  }

  const handleFeatureClick = (feature) => {
    setShowInfo(false)
    setShowWelcome(false)
    setSelectedFeature(feature)
  }

  const handleCloseInfo = () => {
    setShowInfo(false)
    setShowWelcome(true)
    setSelectedFeature(null)
  }

  return (
    <div className="canvas-container">
      <NavigationBar />
      
      <Canvas camera={{ position: [0, 0, 5] }}>
        <SceneLighting />
        <Environment preset="city" />

        <HumanHeadModel 
          initialPosition={initialHeadPosition}
          selectedFeature={selectedFeature}
          featureData={featureData}
          onAnimationComplete={() => setShowInfo(true)}
          onFeatureClick={handleFeatureClick}
        />
        
        {/* FeatureSpheres component removed as it's now part of HumanHeadModel */}
      </Canvas>
      
      {showWelcome && <WelcomePanel />}
      
      {showInfo && selectedFeature && (
        <FeatureInfoPanel 
          feature={selectedFeature}
          description={featureData[selectedFeature].description}
          onClose={handleCloseInfo}
        />
      )}
    </div>
  )
}

export default AnatomyExplorer