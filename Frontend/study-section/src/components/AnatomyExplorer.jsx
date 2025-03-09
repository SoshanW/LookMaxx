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
  const [isExiting, setIsExiting] = useState(false)
  const [welcomeExiting, setWelcomeExiting] = useState(false)
  const [nextFeature, setNextFeature] = useState(null)

  // Initial head position (left side of the screen facing forward)
  const initialHeadPosition = { 
    position: [-3, -1, 0], 
    rotation: [0, 0.7, 0], 
    scale: 1 
  }

  const handleFeatureClick = (feature) => {
    if (isExiting || feature === selectedFeature) return
    
    if (selectedFeature) {
      // Start exit animation and set the next feature
      setIsExiting(true)
      setNextFeature(feature)
    } else if (showWelcome) {
      // Exit the welcome panel first, then show the feature
      setWelcomeExiting(true)
      setNextFeature(feature)
    } else {
      // Directly set the feature if none is currently selected
      setShowWelcome(false)
      setSelectedFeature(feature)
    }
  }

  const handleCloseInfo = () => {
    setIsExiting(true)
    setNextFeature(null)
  }
  
  const handleExitComplete = () => {
    if (nextFeature) {
      // Transition to next feature
      setShowInfo(false)
      setSelectedFeature(nextFeature)
      setNextFeature(null)
      setIsExiting(false)
    } else {
      // Return to welcome state
      setShowInfo(false)
      setShowWelcome(true)
      setSelectedFeature(null)
      setIsExiting(false)
    }
  }
  
  const handleWelcomeExitComplete = () => {
    setShowWelcome(false)
    setWelcomeExiting(false)
    setSelectedFeature(nextFeature)
    setNextFeature(null)
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
          onAnimationComplete={() => !isExiting && setShowInfo(true)}
          onFeatureClick={handleFeatureClick}
        />
      </Canvas>
      
      {(showWelcome || welcomeExiting) && (
        <WelcomePanel 
          isExiting={welcomeExiting}
          onExitComplete={handleWelcomeExitComplete}
        />
      )}
      
      {(showInfo || isExiting) && selectedFeature && (
        <>
          {selectedFeature === 'lips' ? (
            <>
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
                      isExiting={isExiting}
                      onExitComplete={null} // Only the second panel triggers completion
                    />
                    <FeatureInfoPanel 
                      feature={`${selectedFeature} (2/2)`}
                      description={secondHalf}
                      onClose={handleCloseInfo}
                      style={{ right: '5%', left: 'auto', width: '30%', maxWidth: '300px' }}
                      isExiting={isExiting}
                      onExitComplete={handleExitComplete} // This one triggers the completion
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
              isExiting={isExiting}
              onExitComplete={handleExitComplete}
            />
          )}
        </>
      )}
    </div>
  )
}

export default AnatomyExplorer