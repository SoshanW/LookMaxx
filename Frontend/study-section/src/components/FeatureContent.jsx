// src/components/FeatureContent.jsx
import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { gsap } from 'gsap'

const FeatureContent = ({ description, isExiting = false }) => {
  const textRef = useRef(null)
  
  useEffect(() => {
    if (!textRef.current) return
    
    const textElement = textRef.current
    
    // Clear any existing animations
    gsap.killTweensOf(textElement.childNodes)
    
    if (isExiting) {
      // Quick fade out for text when panel is exiting
      gsap.to(textElement.childNodes, {
        opacity: 0,
        stagger: 0.01,
        duration: 0.2
      })
      return
    }
    
    // Animate text char by char only if not exiting
    const text = description
    
    // Clear the text first
    textElement.textContent = ''
    
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
        textElement.appendChild(spaceSpan)
        
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
        textElement.appendChild(span)
        
        // Animate each character with a slight delay
        gsap.to(span, {
          opacity: 1,
          duration: 0.03,
          delay: 0.7 + charIndex * 0.015, // Slightly delayed to match panel animation
          ease: "power1.inOut"
        })
        
        charIndex++
      }
    })
  }, [description, isExiting])

  return (
    <div className="feature-description">
      <p ref={textRef}>{description}</p>
    </div>
  )
}

FeatureContent.propTypes = {
  description: PropTypes.string.isRequired,
  isExiting: PropTypes.bool
}

export default FeatureContent