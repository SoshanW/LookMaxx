import React, { useRef, useEffect, useState } from 'react';
import '../styles/fiton.css';
import { useModelLoader } from "./model-loader.jsx";


const FitOnSection = () => {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const [selectedModel, setSelectedModel] = useState('shirt.fbx');
  
  // Defining available models with their thumbnail images
  const availableModels = [
    { name: 'T-Shirt', file: 'shirt.fbx', image: 'tshirt.png' },
    { name: 'Dress', file: 'dress.fbx', image: 'dress.png' },
    { name: 'Jacket', file: 'JACKET.fbx', image: 'jacket.png' },
  ];

  const { isInitialized, isLoading } = useModelLoader(canvasRef, selectedModel);

  return (
    <div ref={sectionRef} className="fiton-section">
      <div className='titlecontainer'>
        <div className='line'></div>
        <h2 className="fiton-title">Your Picks</h2>
        <div className='line'></div>
      </div>
      
      
      {/* Model Selector */}
      <div className="model-selector">
        {availableModels.map((model) => (
          <div 
            key={model.file}
            onClick={() => {
              if (selectedModel !== model.file) {
                setSelectedModel(model.file);
              }
            }}
            className={`model-item ${selectedModel === model.file ? 'selected' : ''}`}
          >
            <img 
              src={model.image} 
              alt={model.name}
              className="model-thumbnail"
            />
            <p className={`model-name ${selectedModel === model.file ? 'selected' : ''}`}>
              {model.name}
            </p>
          </div>
        ))}
      </div>
      
      <div className="model-container">
        {/* Loading indicator */}
        {isLoading && (
          <div className="loading-indicator">
            Loading model...
          </div>
        )}
        
        <canvas ref={canvasRef} className="model-canvas" />
        
        <div className="model-instructions">
          <p>Click and drag to rotate | Scroll to zoom</p>
        </div>
      </div>
      
      <div className="fiton-description">
        <h3>Virtual 3D Experience</h3>
        <p>
          Explore the collection in 3D. Rotate, zoom, and see every detail before you buy. 
          Our virtual 3D technology lets you see how items will look 360.
        </p>
      </div>
    </div>
  );
};

export default FitOnSection;