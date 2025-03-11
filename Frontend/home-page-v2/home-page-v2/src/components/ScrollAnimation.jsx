import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import PropTypes from 'prop-types'
import '../styles/ScrollAnimation.css'

gsap.registerPlugin(ScrollTrigger)

const ScrollAnimation = ({ frameCount = 40, imageFormat = 'jpg' }) => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const imagesRef = useRef([])
  const faceRef = useRef({ frame: 0 })
  const [scrollProgress, setScrollProgress] = useState(0)
  
  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    // Function to update canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    // Initial canvas setup
    updateCanvasSize()
    
    // Fixed the template string syntax - added backticks
    const currentFrame = (index) => `./assets/${(index + 1).toString()}.${imageFormat}`
    
    // Load images
    for (let i = 0; i < frameCount; i++) {
      const img = new Image()
      img.src = currentFrame(i)
      imagesRef.current.push(img)
    }
    
    // Render function with proper scaling
    const render = () => {
      const currentImage = imagesRef.current[faceRef.current.frame]
      if (!currentImage || !currentImage.complete) return
      
      context.clearRect(0, 0, canvas.width, canvas.height)
      
      // Calculate dimensions for scaling
      const canvasAspect = canvas.width / canvas.height
      const imageAspect = currentImage.width / currentImage.height
      let drawWidth = canvas.width
      let drawHeight = canvas.height
      let x = 0
      let y = 0
      
      // Scale image to cover canvas while maintaining aspect ratio
      if (canvasAspect > imageAspect) {
        drawHeight = canvas.width / imageAspect
        y = (canvas.height - drawHeight) / 2
      } else {
        drawWidth = canvas.height * imageAspect
        x = (canvas.width - drawWidth) / 2
      }
      
      context.drawImage(currentImage, x, y, drawWidth, drawHeight)
    }
    
    // Handle window resize
    const handleResize = () => {
      updateCanvasSize()
      render()
    }
    
    window.addEventListener('resize', handleResize)
    
    // GSAP animation
    gsap.to(faceRef.current, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        scrub: 0.5,
        pin: containerRef.current,
        end: "200%",
        onUpdate: (self) => {
          setScrollProgress(self.progress);
          
          // Dynamic content visibility based on scroll position
          if (self.progress > 0.25 && self.progress < 0.45) {
            gsap.to(".feature-card-1", { autoAlpha: 1, duration: 0.5 });
          } else {
            gsap.to(".feature-card-1", { autoAlpha: 0, duration: 0.5 });
          }
          
          if (self.progress > 0.45 && self.progress < 0.65) {
            gsap.to(".feature-card-2", { autoAlpha: 1, duration: 0.5 });
          } else {
            gsap.to(".feature-card-2", { autoAlpha: 0, duration: 0.5 });
          }
          
          if (self.progress > 0.65 && self.progress < 0.85) {
            gsap.to(".feature-card-3", { autoAlpha: 1, duration: 0.5 });
          } else {
            gsap.to(".feature-card-3", { autoAlpha: 0, duration: 0.5 });
          }
        }
      },
      onUpdate: render,
    })
    
    // Set initial state for feature cards (invisible)
    gsap.set(".feature-card", { autoAlpha: 0 });
    
    // Initial render when first image loads
    imagesRef.current[0].onload = render
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [frameCount, imageFormat])
  
  return (
    <div ref={containerRef} className="animation-container">
      <canvas ref={canvasRef} className="scroll-animation-canvas" />
      
      {/* Text overlay for landing area */}
      <div className="landing-text-overlay" style={{ opacity: 1 - scrollProgress * 2 }}>
        <div className="brand-name">LookSci</div>
        <div className="brand-tagline">
          <div>Beauty</div>
          <div>Redefined.</div>
        </div>
        <button className="get-started-btn">Get Started</button>
      </div>
      
      {/* Feature cards that appear during scroll */}
      <div className="feature-card feature-card-1">
        <div className="card-content">
          <h2>Interested about facial aesthetics?</h2>
          <button className="card-button">GET STARTED</button>
        </div>
      </div>
      
      <div className="feature-card feature-card-2">
        <div className="card-content">
          <h2>Looking for Modelling opportunities?</h2>
          <button className="card-button">GET STARTED</button>
        </div>
      </div>
      
      <div className="feature-card feature-card-3">
        <div className="card-content">
          <h2>Find your Style</h2>
          <button className="card-button">Learn More</button>
        </div>
      </div>
    </div>
  )
}

ScrollAnimation.propTypes = {
  frameCount: PropTypes.number,
  imageFormat: PropTypes.string
}

export default ScrollAnimation