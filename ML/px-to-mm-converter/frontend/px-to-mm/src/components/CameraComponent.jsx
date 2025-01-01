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



};