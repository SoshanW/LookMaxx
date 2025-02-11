import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import PropTypes from 'prop-types'

gsap.registerPlugin(ScrollTrigger)

const ScrollAnimation = ({ frameCount = 179, imageFormat = 'jpg' }) => {
  const canvasRef = useRef(null)
  const imagesRef = useRef([])
  const faceRef = useRef({ frame: 0 })
  
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
        scrub: true,
        pin: canvas,
        end: "500%",
      },
      onUpdate: render,
    })

    // Initial render when first image loads
    imagesRef.current[0].onload = render

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [frameCount, imageFormat])

  return (
    <canvas ref={canvasRef} className="scroll-animation-canvas" />
  )
}

ScrollAnimation.propTypes = {
  frameCount: PropTypes.number,
  imageFormat: PropTypes.string
}

export default ScrollAnimation

