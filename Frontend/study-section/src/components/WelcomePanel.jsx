// src/components/WelcomePanel.jsx (renamed from WelcomeText.jsx)
import React, { useEffect, useRef } from 'react'
import '../styles/WelcomeText.css'
import { gsap } from 'gsap'

const WelcomePanel = () => {
  const containerRef = useRef(null)
  
  useEffect(() => {
    if (!containerRef.current) return
    
    const textElement = containerRef.current.querySelector('.welcome-text')
    const text = "Select one of the spheres to learn more about facial anatomy."
    
    // Clear the text first
    textElement.textContent = ''
    
    // Create a wrapper span that will contain all the characters
    const wrapper = document.createElement('div')
    wrapper.style.display = 'inline'
    textElement.appendChild(wrapper)
    
    // Process text character by character
    text.split('').forEach((char, index) => {
      const span = document.createElement('span')
      span.textContent = char
      span.style.opacity = 0
      
      // Use display: inline for spaces to preserve them
      if (char === ' ') {
        span.style.display = 'inline'
        span.innerHTML = '&nbsp;'
      } else {
        span.style.display = 'inline-block'
      }
      
      wrapper.appendChild(span)
      
      // Typewriter effect
      gsap.to(span, {
        opacity: 1,
        duration: 0.05,
        delay: 1 + index * 0.05,
        ease: "power1.inOut"
      })
    })
    
    // Animate the container
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, x: 50 },
      { opacity: 1, x: 0, duration: 0.8, ease: "power3.out", delay: 0.5 }
    )
  }, [])
  
  return (
    <div className="welcome-container" ref={containerRef}>
      <WelcomeHeader />
      <p className="welcome-text"></p>
      <WelcomeFooter />
    </div>
  )
}

const WelcomeHeader = () => (
  <div className="welcome-header">
    <div className="welcome-line"></div>
    <h2>Interactive 3D Anatomy</h2>
    <div className="welcome-line"></div>
  </div>
)

const WelcomeFooter = () => (
  <div className="welcome-footer">
    <div className="welcome-dot"></div>
    <div className="welcome-indicator"></div>
  </div>
)

export default WelcomePanel