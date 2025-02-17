import React, { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import PropTypes from 'prop-types';
import '../styles/ImageSequence.css';

gsap.registerPlugin(ScrollTrigger);

const ImageSequence = ({ frameCount = 220, imageFormat = 'jpg' }) => {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const faceRef = useRef({ frame: 0 });
  const [loadingProgress, setLoadingProgress] = useState(0);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    let currentLoadingBatch = 0;
    const BATCH_SIZE = 20;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateCanvasSize();

    const currentFrame = (index) => `/assets/${(index + 1).toString()}.${imageFormat}`;

    imagesRef.current = new Array(frameCount).fill(null);

    const loadImageBatch = (startIdx) => {
      const endIdx = Math.min(startIdx + BATCH_SIZE, frameCount);
      const loadPromises = [];

      for (let i = startIdx; i < endIdx; i++) {
        loadPromises.push(new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            imagesRef.current[i] = img;
            setLoadingProgress(prev => prev + 1);
            resolve();
          };
          img.onerror = (e) => {
            console.error(`Failed to load image ${i + 1}`, e);
            reject(e);
          };
          img.src = currentFrame(i);
        }));
      }

      Promise.all(loadPromises)
        .then(() => {
          currentLoadingBatch++;
          if (currentLoadingBatch * BATCH_SIZE < frameCount) {
            loadImageBatch(currentLoadingBatch * BATCH_SIZE);
          }
        })
        .catch(error => {
          console.error('Error loading image batch:', error);
        });
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
    loadImageBatch(0);

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
      window.removeEventListener('resize', handleResize);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [frameCount, imageFormat]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="image-sequence-canvas" />
      {loadingProgress < frameCount && (
        <div className="fixed top-4 left-4 bg-white p-4 rounded shadow">
          Loading: {Math.round((loadingProgress / frameCount) * 100)}%
        </div>
      )}
    </div>
  );
};

ImageSequence.propTypes = {
  frameCount: PropTypes.number,
  imageFormat: PropTypes.string
};

export default ImageSequence;