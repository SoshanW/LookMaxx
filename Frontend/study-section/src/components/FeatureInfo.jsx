// src/FeatureInfo.jsx
import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import '../styles/FeatureInfo.css'

const FeatureInfo = ({ feature, description, onClose }) => {
  const containerRef = useRef(null)
  const textRef = useRef(null)
  
  // Apply futuristic animation when component mounts
  useEffect(() => {
    if (containerRef.current && textRef.current) {
      // Container animation - slide in with glow effect
      const tl = gsap.timeline()
      
      tl.fromTo(
        containerRef.current,
        { 
          y: 100, 
          opacity: 0,
          boxShadow: '0 0 0 rgba(77, 155, 255, 0)'
        },
        { 
          y: 0, 
          opacity: 1, 
          boxShadow: '0 0 20px rgba(77, 155, 255, 0.3), inset 0 0 10px rgba(77, 155, 255, 0.1)',
          duration: 0.5, 
          ease: "power3.out" 
        }
      )
      
      // Add a pulse effect to the border
      tl.to(
        containerRef.current,
        {
          boxShadow: '0 0 30px rgba(77, 155, 255, 0.5), inset 0 0 15px rgba(77, 155, 255, 0.2)',
          duration: 0.3,
          repeat: 1,
          yoyo: true
        }
      )
      
      // Text animation - fixed to preserve spaces
      const textContent = textRef.current
      const text = textContent.textContent
      textContent.innerHTML = ''
      
      // Process text character by character
      const words = text.split(' ')
      let charIndex = 0
      
      words.forEach((word, wordIndex) => {
        // Add space between words (except before first word)
        if (wordIndex > 0) {
          const spaceSpan = document.createElement('span')
          spaceSpan.innerHTML = '&nbsp;'
          spaceSpan.style.opacity = '0'
          spaceSpan.style.display = 'inline'
          textContent.appendChild(spaceSpan)
          
          // Animate space
          gsap.to(spaceSpan, {
            opacity: 1,
            duration: 0.03,
            delay: 0.5 + charIndex * 0.015,
            ease: "power1.inOut"
          })
          
          charIndex++
        }
        
        // Process each character in the word
        for (let i = 0; i < word.length; i++) {
          const char = word[i]
          const span = document.createElement('span')
          span.textContent = char
          span.style.opacity = '0'
          span.style.display = 'inline'
          textContent.appendChild(span)
          
          // Animate each character with a slight delay
          gsap.to(span, {
            opacity: 1,
            duration: 0.03,
            delay: 0.5 + charIndex * 0.015,
            ease: "power1.inOut"
          })
          
          charIndex++
        }
      })
    }
  }, [])
  
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }
  
  return (
    <div className="feature-info-container" ref={containerRef}>
      <button className="close-button" onClick={onClose}>×</button>
      <div className="feature-header">
        <div className="feature-line"></div>
        <h2 className="feature-title">{capitalizeFirstLetter(feature)}</h2>
        <div className="feature-line"></div>
      </div>
      <div className="feature-description">
        <p ref={textRef}>{description}</p>
      </div>
      <div className="feature-footer">
        <div className="feature-dot"></div>
      </div>
    </div>
  )
}

export default FeatureInfo