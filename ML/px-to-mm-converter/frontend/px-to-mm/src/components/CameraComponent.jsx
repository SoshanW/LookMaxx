import { useState, useRef, useEffect } from 'react'
import { Camera } from 'lucide-react'

const CameraComponent = () => {
  const [hasPermission, setHasPermission] = useState(false)
  const [calibrated, setCalibrated] = useState(false)
  const [conversionRatio, setConversionRatio] = useState(null)
  const [measurement, setMeasurement] = useState(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 })
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const overlayCanvasRef = useRef(null)

  useEffect(() => {
    requestCameraPermission()
  }, [])

  useEffect(() => {
    if (overlayCanvasRef.current && hasPermission) {
      drawFaceOutline()
    }
  }, [hasPermission])

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      setHasPermission(true)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setHasPermission(false)
    }
  }

  const drawFaceOutline = () => {
    const canvas = overlayCanvasRef.current
    const ctx = canvas.getContext('2d')
    
    canvas.width = 1280
    canvas.height = 720
    
    ctx.strokeStyle = '#00ff00'
    ctx.lineWidth = 2
    
    // Face oval
    ctx.beginPath()
    ctx.ellipse(640, 360, 200, 250, 0, 0, 2 * Math.PI)
    ctx.stroke()
    
    // Reference line
    ctx.beginPath()
    ctx.moveTo(540, 610)
    ctx.lineTo(740, 610)
    ctx.stroke()
    
    // Label
    ctx.font = '16px Arial'
    ctx.fillStyle = '#ffffff'
    ctx.fillText('132.4mm', 610, 630)
  }

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = canvas.toDataURL('image/jpeg')

    try {
      const response = await fetch('http://localhost:5000/calibrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      })

      const data = await response.json()
      if (data.success) {
        setConversionRatio(data.conversion_ratio)
        setCalibrated(true)
      }
    } catch (err) {
      console.error('Error calibrating:', err)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-full max-w-4xl aspect-video">
        {hasPermission ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline 
              className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
            />
            <canvas
              ref={overlayCanvasRef}
              className="absolute top-0 left-0 w-full h-full"
              onMouseDown={(e) => {
                if (calibrated) {
                  const rect = e.target.getBoundingClientRect()
                  setStartPoint({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                  })
                  setIsDrawing(true)
                }
              }}
              onMouseMove={(e) => {
                if (isDrawing && calibrated) {
                  const rect = e.target.getBoundingClientRect()
                  const endX = e.clientX - rect.left
                  const endY = e.clientY - rect.top
                  
                  const ctx = overlayCanvasRef.current.getContext('2d')
                  ctx.clearRect(0, 0, canvas.width, canvas.height)
                  drawFaceOutline()
                  
                  // Draw measurement line
                  ctx.beginPath()
                  ctx.moveTo(startPoint.x, startPoint.y)
                  ctx.lineTo(endX, endY)
                  ctx.stroke()
                  
                  // Calculate distance in pixels
                  const pixels = Math.sqrt(Math.pow(endX - startPoint.x, 2) + Math.pow(endY - startPoint.y, 2))
                  const mm = pixels * conversionRatio
                  setMeasurement(mm)
                }
              }}
              onMouseUp={() => {
                setIsDrawing(false)
              }}
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <button
                onClick={captureImage}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 shadow-lg"
              >
                <Camera className="w-6 h-6" />
                <span className="text-lg">Capture</span>
              </button>
            </div>
          </>
        ) : (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
            Camera permission is required
          </div>
        )}
      </div>
      
      {calibrated && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg text-center">
          <p className="font-semibold">Camera calibrated!</p>
          <p>1 pixel = {conversionRatio.toFixed(4)} mm</p>
          {measurement && (
            <p>Measured distance: {measurement.toFixed(2)} mm</p>
          )}
        </div>
      )}
    </div>
  )
}

export default CameraComponent