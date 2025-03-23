import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { gsap } from 'gsap'

const FeatureContent = ({ description, isExiting = false }) => {
  const textRef = useRef(null)
  
  useEffect(() => {
    if (!textRef.current) return
    
    const textElement = textRef.current

    // Clear any existing GSAP animations
    gsap.killTweensOf(textElement.childNodes)

    if (isExiting) {
      // Quick fade-out for text when panel is exiting
      gsap.to(textElement.childNodes, {
        opacity: 0,
        stagger: 0.01,
        duration: 0.2
      })
      return
    }

    // Animate the text in, word by word
    const text = description
    textElement.textContent = ''

    // Split description into words
    const words = text.split(' ')

    // For each word, create a span with margin-right
    words.forEach((word, i) => {
      const span = document.createElement('span')
      span.style.opacity = '0'
      // Use inline-block so GSAP can fade each word
      span.style.display = 'inline-block'
      // Set the text of the span
      span.textContent = word
      // Add a small margin to separate words
      if (i < words.length - 1) {
        span.style.marginRight = '0.3em'
      }
      textElement.appendChild(span)

      // Animate each word's opacity with a slight stagger
      gsap.to(span, {
        opacity: 1,
        duration: 0.03,
        delay: 0.7 + i * 0.03,
        ease: "power1.inOut"
      })
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