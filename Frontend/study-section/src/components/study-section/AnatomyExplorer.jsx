import React, { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Stars } from '@react-three/drei'
import HumanHeadModel from './HumanHeadModel'
import FeatureInfoPanel from './FeatureInfoPanel'
import WelcomePanel from './WelcomePanel'
import Navbar from './Navbar'
import SceneLighting from './SceneLighting'
import { featureData } from '../../data/FeatureData'
import {useRef} from 'react'
import '../../styles/study-section/AnatomyExplorer.css'

const AnatomyExplorer = () => {
  const [selectedFeature, setSelectedFeature] = useState(null)
  const [showInfo, setShowInfo] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [isExiting, setIsExiting] = useState(false)
  const [welcomeExiting, setWelcomeExiting] = useState(false)
  const [nextFeature, setNextFeature] = useState(null)
  const exitProcessed = useRef(false);

  const initialHeadPosition = { 
    position: [-3, -1, 0], 
    rotation: [0, 0.7, 0], 
    scale: 1 
  }

  const handleFeatureClick = (feature) => {
    if (isExiting || feature === selectedFeature) return;
  
    exitProcessed.current = false;
    if (selectedFeature) {
      setIsExiting(true);
      setNextFeature(feature);
    } else {
      setShowWelcome(false); 
      setSelectedFeature(feature); 
    }
  };  

  const handleCloseInfo = () => {
    if (nextFeature !== null) return;
    setIsExiting(true)
  }
  
  const handleExitComplete = () => {
    if (exitProcessed.current) return;
    exitProcessed.current = true;

    if (nextFeature) {
      setShowInfo(false); 
      setSelectedFeature(nextFeature);
      setNextFeature(null);
      setIsExiting(false);
      setShowWelcome(false); 
    } else {
      setShowInfo(false);
      setShowWelcome(true);
      setSelectedFeature(null);
      setIsExiting(false);
    }
  };  
  
  const handleWelcomeExitComplete = () => {
    setShowWelcome(false)
    setWelcomeExiting(false)
    setSelectedFeature(nextFeature)
    setNextFeature(null)
  }

  // Helper to split description for lips
  const renderLipsPanels = () => {
    const fullDescription = featureData[selectedFeature].description
    const midpoint = Math.ceil(fullDescription.length / 2)
    const firstHalf = fullDescription.substring(0, midpoint)
    const secondHalf = fullDescription.substring(midpoint)

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
          onExitComplete={handleExitComplete}
        />
      </>
    )
  }

  return (
    <div className="canvas-container">
      <Navbar />
      <Canvas camera={{ position: [0, 0, 5] }}>
        <SceneLighting />
        <Environment preset="city" />
        <Stars radius={50} depth={50} count={5000} factor={4} saturation={0} fade />
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
          {selectedFeature === 'lips' ? renderLipsPanels() : (
            <FeatureInfoPanel 
              feature={selectedFeature}
              description={featureData[selectedFeature].description}
              onClose={handleCloseInfo}
              style={
                (selectedFeature === 'nose' || selectedFeature === 'cheekbone') 
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