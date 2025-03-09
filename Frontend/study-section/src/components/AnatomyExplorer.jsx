// src/components/AnatomyExplorer.jsx
import React, { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import HumanHeadModel from './HumanHeadModel'
import FeatureInfoPanel from './FeatureInfoPanel'
import WelcomePanel from './WelcomePanel'
import NavigationBar from './NavigationBar'
import SceneLighting from './SceneLighting'
import { featureData } from '../data/FeatureData'
import '../styles/AnatomyExplorer.css'

const AnatomyExplorer = () => {
  const [selectedFeature, setSelectedFeature] = useState(null)
  const [showInfo, setShowInfo] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)

  // Initial head position (left side of the screen facing forward)
  const initialHeadPosition = { 
    position: [-3, -1, 0], 
    rotation: [0, 0.7, 0], 
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
      </Canvas>
      
      {showWelcome && <WelcomePanel />}
      
      {showInfo && selectedFeature && (
        <>
          {selectedFeature === 'lips' ? (
            <>
              {/* Split the description for lips into two parts */}
              {(() => {
                const fullDescription = featureData[selectedFeature].description;
                const midpoint = Math.ceil(fullDescription.length / 2);
                const firstHalf = fullDescription.substring(0, midpoint);
                const secondHalf = fullDescription.substring(midpoint);

                return (
                  <>
                    <FeatureInfoPanel 
                      feature={`${selectedFeature} (1/2)`}
                      description={firstHalf}
                      onClose={handleCloseInfo}
                      style={{ right: 'auto', left: '5%', width: '30%', maxWidth: '300px' }}
                    />
                    <FeatureInfoPanel 
                      feature={`${selectedFeature} (2/2)`}
                      description={secondHalf}
                      onClose={handleCloseInfo}
                      style={{ right: '5%', left: 'auto', width: '30%', maxWidth: '300px' }}
                    />
                  </>
                );
              })()}
            </>
          ) : (
            <FeatureInfoPanel 
              feature={selectedFeature}
              description={featureData[selectedFeature].description}
              onClose={handleCloseInfo}
              style={
                selectedFeature === 'nose' || selectedFeature === 'cheekbone' 
                  ? { right: 'auto', left: '5%' } 
                  : {}
              }
            />
          )}
        </>
      )}
    </div>
  )
}

export default AnatomyExplorer