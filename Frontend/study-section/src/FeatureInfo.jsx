// src/FeatureInfo.jsx
import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import './FeatureInfo.css'

const FeatureInfo = ({ feature, description, onClose }) => {
  const containerRef = useRef(null)
  const textRef = useRef(null)
  
  // Apply futuristic animation when component mounts
  useEffect(() => {
    if (containerRef.current && textRef.current) {
      // Container animation - slide in from bottom
      gsap.fromTo(
        containerRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
      )
      
      // Text animation - letter by letter reveal
      const textContent = textRef.current
      const text = textContent.textContent
      textContent.textContent = ''
      
      // Split text into characters
      const chars = text.split('')
      
      // Create individual spans for each character
      chars.forEach((char, index) => {
        const span = document.createElement('span')
        span.textContent = char
        span.style.opacity = '0'
        span.style.display = 'inline-block'
        textContent.appendChild(span)
        
        // Animate each character
        gsap.to(span, {
          opacity: 1,
          duration: 0.03,
          delay: 0.5 + index * 0.015,
          ease: "power1.inOut"
        })
      })
    }
  }, [])
  
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }
  
  return (
    <div className="feature-info-container" ref={containerRef}>
      <button className="close-button" onClick={onClose}>×</button>
      <h2 className="feature-title">{capitalizeFirstLetter(feature)}</h2>
      <div className="feature-description">
        <p ref={textRef}>{description}</p>
      </div>
    </div>
  )
}

export default FeatureInfo