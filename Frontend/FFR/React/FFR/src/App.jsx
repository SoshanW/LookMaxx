import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import './App.css'

gsap.registerPlugin(ScrollTrigger)

function App() {
  const canvasRef = useRef(null)
  const imagesRef = useRef([])
  const faceRef = useRef({ frame: 0 })
  
  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const frameCount = 179

    // Function to update canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    // Initial canvas setup
    updateCanvasSize()

    const currentFrame = (index) => `./assets/${(index + 1).toString()}.jpg`

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
    window.addEventListener('resize', () => {
      updateCanvasSize()
      render()
    })

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
      window.removeEventListener('resize', updateCanvasSize)
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <canvas ref={canvasRef} className="canvas" />
  )
}

export default App