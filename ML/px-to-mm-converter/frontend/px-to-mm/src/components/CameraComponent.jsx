import { useState, useRef, useEffect } from 'react'
import { Camera } from 'lucide-react'

const REFERENCE_WIDTH_MM = 132.4

const CameraComponent = () => {
  const [hasPermission, setHasPermission] = useState(false)
  const [calibrated, setCalibrated] = useState(false)
  const [conversionRatio, setConversionRatio] = useState(null)
  const [calibrationQuality, setCalibrationQuality] = useState(null)
  const [deviceInfo, setDeviceInfo] = useState(null)
  const [isFaceAligned, setIsFaceAligned] = useState(false)
  const [guidanceMessage, setGuidanceMessage] = useState('')
  const [capturedPhotos, setCapturedPhotos] = useState([])
  
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const overlayCanvasRef = useRef(null)

  const getRefWidth = (videoWidth) => videoWidth ? Math.round(videoWidth * 0.3) : null

  useEffect(() => {
    requestCameraPermission()
    startVideo()
  }, [])

  const startVideo = () => {
    if (overlayCanvasRef.current && hasPermission && videoRef.current) {
      const checkVideoReady = setInterval(() => {
        if (videoRef.current.videoWidth) {
          drawGuide()
          clearInterval(checkVideoReady)
        }
      }, 100)
      return () => clearInterval(checkVideoReady)
    }
  }

  const requestCameraPermission = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const cameras = devices.filter(device => device.kind === 'videoinput')
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          deviceId: cameras[0].deviceId
        } 
      })
      
      const track = stream.getVideoTracks()[0]
      setDeviceInfo({
        label: track.label,
        capabilities: track.getCapabilities()
      })
      
      setHasPermission(true)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        startFaceCheck()
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setHasPermission(false)
    }
  }

  const startFaceCheck = () => {
    const checkInterval = setInterval(() => {
      checkFacePosition()
    }, 100)
    return () => clearInterval(checkInterval)
  }

  const checkFacePosition = () => {
    if (!videoRef.current || !overlayCanvasRef.current) return

    const video = videoRef.current
    const canvas = document.createElement('canvas')
    const targetRegion = getRefWidth(video.videoWidth)
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)

    // Get center region matching the face outline
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const region = ctx.getImageData(
      centerX - targetRegion/2,
      centerY - targetRegion/2 * 1.25,
      targetRegion,
      targetRegion * 1.25
    )
    const data = region.data

    let skinPixels = 0
    let totalPixels = data.length / 4

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      
      // Improved skin detection
      const isSkin = r > 95 && 
                    g > 40 && g < 255 &&
                    b > 20 && 
                    r > g && r > b &&
                    Math.abs(r - g) > 15
      
      if (isSkin) {
        skinPixels++
      }
    }

    const ratio = skinPixels / totalPixels
    const aligned = ratio > 0.2 && ratio < 0.8 // Requires significant face presence

    setIsFaceAligned(aligned)
    updateGuidance(aligned)
    drawGuide(aligned)
    setIsFaceAligned(aligned)
    updateGuidance(aligned)
    drawGuide(aligned)
  }

  const updateGuidance = (aligned) => {
    if (!aligned) {
      const msg = []
      if (!videoRef.current) return
      
      const video = videoRef.current
      const centerX = video.videoWidth / 2
      const centerY = video.videoHeight / 2
      
      msg.push('Position your face in the outline')
      if (msg.length === 0) msg.push('Perfect! Stay still')
      
      setGuidanceMessage(msg.join('. '))
    } else {
      setGuidanceMessage('Perfect! Stay still')
    }
  }

  const drawGuide = (aligned = false) => {
    const canvas = overlayCanvasRef.current
    const video = videoRef.current
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const faceWidth = getRefWidth(video.videoWidth)
    const faceHeight = faceWidth * 1.25

    // Draw face outline
    ctx.strokeStyle = aligned ? '#00ff00' : '#ff0000'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.ellipse(centerX, centerY, faceWidth/2, faceHeight/2, 0, 0, 2 * Math.PI)
    ctx.stroke()

    // Draw guidance arrows if not aligned
    if (!aligned) {
      ctx.strokeStyle = '#ffffff'
      ctx.fillStyle = '#ffffff'
      ctx.font = '20px Arial'
      
      // Draw arrows pointing to center
      const arrowSize = 30
      const arrowOffset = faceWidth * 0.7
      
      // Left arrow
      ctx.beginPath()
      ctx.moveTo(centerX - arrowOffset, centerY)
      ctx.lineTo(centerX - arrowOffset + arrowSize, centerY)
      ctx.moveTo(centerX - arrowOffset + arrowSize, centerY - arrowSize/2)
      ctx.lineTo(centerX - arrowOffset + arrowSize, centerY + arrowSize/2)
      ctx.stroke()
      
      // Right arrow
      ctx.beginPath()
      ctx.moveTo(centerX + arrowOffset, centerY)
      ctx.lineTo(centerX + arrowOffset - arrowSize, centerY)
      ctx.moveTo(centerX + arrowOffset - arrowSize, centerY - arrowSize/2)
      ctx.lineTo(centerX + arrowOffset - arrowSize, centerY + arrowSize/2)
      ctx.stroke()
      
      // Top arrow
      ctx.beginPath()
      ctx.moveTo(centerX, centerY - arrowOffset)
      ctx.lineTo(centerX, centerY - arrowOffset + arrowSize)
      ctx.moveTo(centerX - arrowSize/2, centerY - arrowOffset + arrowSize)
      ctx.lineTo(centerX + arrowSize/2, centerY - arrowOffset + arrowSize)
      ctx.stroke()
      
      // Bottom arrow
      ctx.beginPath()
      ctx.moveTo(centerX, centerY + arrowOffset)
      ctx.lineTo(centerX, centerY + arrowOffset - arrowSize)
      ctx.moveTo(centerX - arrowSize/2, centerY + arrowOffset - arrowSize)
      ctx.lineTo(centerX + arrowSize/2, centerY + arrowOffset - arrowSize)
      ctx.stroke()
    }
  }

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current || !isFaceAligned) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    const imageData = canvas.toDataURL('image/jpeg')
    const refPixels = getRefWidth(video.videoWidth)
    
    setCapturedPhotos(prev => [...prev, {
      id: Date.now(),
      image: imageData,
      timestamp: new Date().toISOString()
    }])

    try {
      const response = await fetch('http://localhost:5000/calibrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: imageData,
          referenceWidth: REFERENCE_WIDTH_MM,
          referencePixels: refPixels,
          mmPerPixel: REFERENCE_WIDTH_MM / refPixels,
          deviceInfo
        }),
      })

      const data = await response.json()
      if (data.success) {
        setConversionRatio(data.conversion_ratio)
        setCalibrated(true)
        setCalibrationQuality({ 
          quality: 'good',
          message: 'Calibration successful'
        })
      }
    } catch (err) {
      console.error('Error calibrating:', err)
      setCalibrationQuality({
        quality: 'error',
        message: 'Calibration failed'
      })
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
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-2">
              <div className="bg-black bg-opacity-50 px-4 py-2 rounded-lg text-white">
                {guidanceMessage}
              </div>
              <button
                onClick={captureImage}
                disabled={!isFaceAligned}
                className={`${
                  isFaceAligned 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-gray-400 cursor-not-allowed'
                } text-white px-6 py-3 rounded-lg flex items-center space-x-2 shadow-lg`}
              >
                <Camera className="w-6 h-6" />
                <span>{isFaceAligned ? 'Capture' : 'Align Face with Guide'}</span>
              </button>
            </div>
          </>
        ) : (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
            Camera permission is required
          </div>
        )}
      </div>

      {capturedPhotos.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-6 w-full">
          {capturedPhotos.map(photo => (
            <div key={photo.id} className="relative">
              <img 
                src={photo.image} 
                alt={`Captured at ${photo.timestamp}`}
                className="w-full rounded-lg shadow-md"
              />
              <span className="block text-xs text-gray-500 mt-1">
                {new Date(photo.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {calibrated && (
        <div className="space-y-4 w-full">
          <div className={`border px-6 py-4 rounded-lg text-center ${
            calibrationQuality?.quality === 'good' 
              ? 'bg-green-100 border-green-400 text-green-700'
              : 'bg-yellow-100 border-yellow-400 text-yellow-700'
          }`}>
            <p className="font-semibold">Camera calibrated!</p>
            <p className="text-lg font-bold">
              Millimeters per pixel: {conversionRatio?.toFixed(6)} mm/px
            </p>
            <p className="mt-2">{calibrationQuality?.message}</p>
          </div>
          
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-6 py-4 rounded-lg">
            <p>Camera Resolution: {videoRef.current?.videoWidth} x {videoRef.current?.videoHeight}px</p>
            <p>Reference width: {REFERENCE_WIDTH_MM}mm</p>
            {deviceInfo && (
              <div className="mt-2">
                <p>Device: {deviceInfo.label}</p>
                <p>Zoom: {deviceInfo.capabilities.zoom ? 'Available' : 'Not available'}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CameraComponent