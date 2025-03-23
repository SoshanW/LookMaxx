import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import PropTypes from 'prop-types';
import '../../styles/ffr/ImageSequence.css';

gsap.registerPlugin(ScrollTrigger);

const ImageSequence = ({ frameCount = 225, imageFormat = 'jpg' }) => {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const faceRef = useRef({ frame: 0 });
  const loadingRef = useRef({
    inProgress: false,
    count: 0,
    currentBatch: 0
  });
  // Remove state update entirely - it's causing the infinite loop
  // const [loadingProgress, setLoadingProgress] = useState(0); 

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const mountedRef = { current: true };
    
    // Reset loading on each effect run
    loadingRef.current = {
      inProgress: false,
      count: 0,
      currentBatch: 0
    };
    
    imagesRef.current = new Array(frameCount).fill(null);

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateCanvasSize();

    const currentFrame = (index) => `/assets/ffr/${(index + 1).toString()}.${imageFormat}`;
    
    // Load images in batches without using setState
    const loadNextBatch = () => {
      if (!mountedRef.current || loadingRef.current.inProgress) return;
      
      const BATCH_SIZE = 20;
      const startIdx = loadingRef.current.currentBatch * BATCH_SIZE;
      
      // Check if we're done
      if (startIdx >= frameCount) return;
      
      const endIdx = Math.min(startIdx + BATCH_SIZE, frameCount);
      loadingRef.current.inProgress = true;
      
      let loadedInBatch = 0;
      
      // Load each image in the batch
      for (let i = startIdx; i < endIdx; i++) {
        const img = new Image();
        
        img.onload = () => {
          if (!mountedRef.current) return;
          
          imagesRef.current[i] = img;
          loadingRef.current.count++;
          loadedInBatch++;
          
          // When batch is complete, schedule next batch
          if (loadedInBatch === endIdx - startIdx) {
            loadingRef.current.inProgress = false;
            loadingRef.current.currentBatch++;
            
            // Schedule next batch with a small delay
            if (loadingRef.current.currentBatch * BATCH_SIZE < frameCount) {
              setTimeout(loadNextBatch, 50);
            }
          }
        };
        
        img.onerror = (e) => {
          if (!mountedRef.current) return;
          
          console.error(`Failed to load image ${i + 1}`, e);
          loadedInBatch++;
          
          // Continue to next batch even if there are errors
          if (loadedInBatch === endIdx - startIdx) {
            loadingRef.current.inProgress = false;
            loadingRef.current.currentBatch++;
            
            if (loadingRef.current.currentBatch * BATCH_SIZE < frameCount) {
              setTimeout(loadNextBatch, 50);
            }
          }
        };
        
        img.src = currentFrame(i);
      }
    };

    const render = () => {
      const frameIndex = Math.floor(faceRef.current.frame);
      const currentImage = imagesRef.current[frameIndex];

      if (!currentImage) {
        let lastLoadedIndex = frameIndex;
        while (lastLoadedIndex >= 0 && !imagesRef.current[lastLoadedIndex]) {
          lastLoadedIndex--;
        }
        if (lastLoadedIndex >= 0) {
          const fallbackImage = imagesRef.current[lastLoadedIndex];
          drawImage(fallbackImage);
        }
        return;
      }

      drawImage(currentImage);
    };

    const drawImage = (image) => {
      if (!image || !image.complete) return;

      context.clearRect(0, 0, canvas.width, canvas.height);

      const canvasAspect = canvas.width / canvas.height;
      const imageAspect = image.width / image.height;
      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let x = 0;
      let y = 0;

      if (canvasAspect > imageAspect) {
        drawHeight = canvas.width / imageAspect;
        y = (canvas.height - drawHeight) / 2;
      } else {
        drawWidth = canvas.height * imageAspect;
        x = (canvas.width - drawWidth) / 2;
      }

      context.drawImage(image, x, y, drawWidth, drawHeight);
    };

    const handleResize = () => {
      updateCanvasSize();
      render();
    };

    window.addEventListener('resize', handleResize);
    
    // Start loading the first batch
    loadNextBatch();

    // Image sequence animation
    gsap.to(faceRef.current, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        trigger: canvas,
        scrub: 0.5,
        pin: true,
        start: "top top",
        end: "500%",
      },
      onUpdate: render,
    });

    return () => {
      mountedRef.current = false;
      window.removeEventListener('resize', handleResize);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [frameCount, imageFormat]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="image-sequence-canvas" />
    </div>
  );
};

ImageSequence.propTypes = {
  frameCount: PropTypes.number,
  imageFormat: PropTypes.string
};

export default ImageSequence;