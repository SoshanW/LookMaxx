import { useState, useRef, useEffect } from 'react';
import { Camera } from 'lucide-react';

const CameraComponent = () => {

  const [hasPermission, setHasPermission] = useState(false);
  const [calibrated, setCalibrated] = useState(false);
  const [conversionRatio, setConversionRatio] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);

  useEffect(() => {
    requestCameraPersmission();
  }, []);

  useEffect(() => {
    if (overlayCanvasRef.current && hasPermission) {
      drawFaceOutline();
    }
  }, [hasPermission]);

  const requestCameraPersmission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        }
      });
      setHasPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasPermission(false);
    }
  }

  const drawFaceOutline = () => {
    
    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = 1280;
    canvas.height = 720;

    ctx.strokeStyle = '#00FF00';
    ctx.linewidth =2;

    //Face oval
    ctx.beginPath();
    ctx.ellipse(640, 360, 300, 400, 0, 0, 2 * Math.PI);
    ctx.stroke();

    //Reference Line
    ctx.beginPath()
    ctx.moveTo(540, 610)
    ctx.lineTo(740, 610)
    ctx.stroke()

    // Label
    ctx.font = '16px Arial'
    ctx.fillStyle = '#ffffff'
    ctx.fillText('132.4mm', 610, 630)
  }
  



};