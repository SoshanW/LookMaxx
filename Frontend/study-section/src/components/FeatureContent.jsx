import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { gsap } from 'gsap'

const FeatureContent = ({ description, isExiting = false }) => {
  const textRef = useRef(null)
  
  useEffect(() => {
    if (!textRef.current) return
    const textElement = textRef.current

    // Kill any existing animations on child nodes
    gsap.killTweensOf(textElement.childNodes)
    
    if (isExiting) {
      gsap.to(textElement.childNodes, {
        opacity: 0,
        stagger: 0.01,
        duration: 0.2
      })
      return
    }
    
    // Animate text character-by-character
    textElement.textContent = ''
    const words = description.split(' ')
    let charIndex = 0
    
    words.forEach((word, wordIndex) => {
      if (wordIndex > 0) {
        const spaceSpan = document.createElement('span')
        spaceSpan.innerHTML = '&nbsp;'
        spaceSpan.style.opacity = '0'
        textElement.appendChild(spaceSpan)
        gsap.to(spaceSpan, {
          opacity: 1,
          duration: 0.03,
          delay: 0.5 + charIndex * 0.015,
          ease: 'power1.inOut'
        })
        charIndex++
      }
      
      for (let i = 0; i < word.length; i++) {
        const span = document.createElement('span')
        span.textContent = word[i]
        span.style.opacity = '0'
        textElement.appendChild(span)
        gsap.to(span, {
          opacity: 1,
          duration: 0.03,
          delay: 0.7 + charIndex * 0.015,
          ease: 'power1.inOut'
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