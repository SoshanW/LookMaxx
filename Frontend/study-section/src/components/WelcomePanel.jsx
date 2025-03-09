import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import '../styles/WelcomeText.css'

const WelcomePanel = ({ isExiting = false, onExitComplete = null }) => {
  const containerRef = useRef(null)
  const textRef = useRef(null)
  const welcomeText = "Select one of the spheres to learn more about facial anatomy."
  
  useEffect(() => {
    if (!containerRef.current) return
    const textElement = textRef.current

    if (!isExiting) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, x: 50, scale: 0.9, rotationY: 15, transformOrigin: 'right center' },
        { opacity: 1, x: 0, scale: 1, rotationY: 0, duration: 0.8, ease: 'power3.out', delay: 0.5 }
      )

      const flashTl = gsap.timeline({ delay: 1.3 })
      flashTl.to(containerRef.current, {
        boxShadow: "0 0 30px rgba(77, 155, 255, 0.8), inset 0 0 15px rgba(77, 155, 255, 0.4)",
        duration: 0.3,
      })
      flashTl.to(containerRef.current, {
        boxShadow: "0 0 20px rgba(77, 155, 255, 0.3), inset 0 0 10px rgba(77, 155, 255, 0.1)",
        duration: 0.5,
      })

      // Typewriter effect
      if (textElement) {
        textElement.textContent = ''
        const wrapper = document.createElement('div')
        wrapper.style.display = 'inline'
        textElement.appendChild(wrapper)
        
        welcomeText.split('').forEach((char, index) => {
          const span = document.createElement('span')
          span.textContent = char === ' ' ? '\u00A0' : char
          span.style.opacity = 0
          span.style.display = char === ' ' ? 'inline' : 'inline-block'
          wrapper.appendChild(span)
          gsap.to(span, {
            opacity: 1,
            duration: 0.05,
            delay: 1.5 + index * 0.05,
            ease: 'power1.inOut'
          })
        })
      }
    } else if (onExitComplete) {
      gsap.to(containerRef.current, {
        opacity: 0,
        x: 50,
        scale: 0.9,
        rotationY: 15,
        duration: 0.6,
        ease: 'power2.in',
        onComplete: onExitComplete
      })
    }
  }, [isExiting, onExitComplete])
  
  return (
    <div className="welcome-container" ref={containerRef}>
      <WelcomeHeader />
      <p className="welcome-text" ref={textRef}></p>
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