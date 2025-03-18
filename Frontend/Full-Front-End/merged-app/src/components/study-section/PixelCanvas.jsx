import React, { useRef, useEffect, useState } from 'react';

class Pixel {
  constructor(canvas, context, x, y, color, speed, delay) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = context;
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = this.getRandomValue(0.1, 0.9) * speed;
    this.size = 0;
    this.sizeStep = Math.random() * 0.4;
    this.minSize = 0.5;
    this.maxSizeInteger = 2.5; // Increased size for better visibility
    this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger);
    this.delay = delay;
    this.counter = 0;
    this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01;
    this.isIdle = false;
    this.isReverse = false;
    this.isShimmer = false;
  }

  getRandomValue(min, max) {
    return Math.random() * (max - min) + min;
  }

  draw() {
    const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;

    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(
      this.x + centerOffset,
      this.y + centerOffset,
      this.size,
      this.size
    );
  }

  appear() {
    this.isIdle = false;

    if (this.counter <= this.delay) {
      this.counter += this.counterStep;
      return;
    }

    if (this.size >= this.maxSize) {
      this.isShimmer = true;
    }

    if (this.isShimmer) {
      this.shimmer();
    } else {
      this.size += this.sizeStep;
    }

    this.draw();
  }

  disappear() {
    this.isShimmer = false;
    this.counter = 0;

    if (this.size <= 0) {
      this.isIdle = true;
      return;
    } else {
      this.size -= 0.1;
    }

    this.draw();
  }

  shimmer() {
    if (this.size >= this.maxSize) {
      this.isReverse = true;
    } else if (this.size <= this.minSize) {
      this.isReverse = false;
    }

    if (this.isReverse) {
      this.size -= this.speed;
    } else {
      this.size += this.speed;
    }
  }
}

const PixelCanvas = ({ colors = "#a94dff, #4d9bff, #ffffff", gap = 6, speed = 35 }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const pixelsRef = useRef([]);
  const animationRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  
  const colorArray = colors.split(',').map(color => color.trim());
  
  const getDistanceToCanvasCenter = (x, y, width, height) => {
    const dx = x - width / 2;
    const dy = y - height / 2;
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  const createPixels = (canvas, ctx) => {
    pixelsRef.current = [];
    
    // Use smaller gap for more pixels
    const actualGap = Math.max(gap, 4); 
    
    for (let x = 0; x < canvas.width; x += actualGap) {
      for (let y = 0; y < canvas.height; y += actualGap) {
        const color = colorArray[Math.floor(Math.random() * colorArray.length)];
        const delay = getDistanceToCanvasCenter(x, y, canvas.width, canvas.height);
        
        pixelsRef.current.push(
          new Pixel(canvas, ctx, x, y, color, speed * 0.001, delay)
        );
      }
    }
  };
  
  const animate = (fnName) => {
    if (!canvasRef.current) return;
    
    animationRef.current = requestAnimationFrame(() => animate(fnName));
    
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    let allIdle = true;
    for (let i = 0; i < pixelsRef.current.length; i++) {
      pixelsRef.current[i][fnName]();
      if (!pixelsRef.current[i].isIdle) {
        allIdle = false;
      }
    }
    
    if (allIdle && fnName === 'disappear') {
      cancelAnimationFrame(animationRef.current);
    }
  };
  
  const handleResize = () => {
    if (!canvasRef.current || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);
    
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    canvasRef.current.style.width = `${width}px`;
    canvasRef.current.style.height = `${height}px`;
    
    const ctx = canvasRef.current.getContext('2d');
    createPixels(canvasRef.current, ctx);
    
    // Force initial appearance for testing
    if (isActive) {
      cancelAnimationFrame(animationRef.current);
      animate('appear');
    }
  };
  
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    
    // Create a ResizeObserver
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);
    
    // Initial setup
    handleResize();
    
    // Find the parent element (feature-info-container or welcome-container)
    const parent = containerRef.current.closest('.feature-info-container') || 
                  containerRef.current.closest('.welcome-container');
    
    // Event handlers for mouse interaction
    const handleMouseEnter = () => {
      setIsActive(true);
      cancelAnimationFrame(animationRef.current);
      animate('appear');
    };
    
    const handleMouseLeave = () => {
      setIsActive(false);
      cancelAnimationFrame(animationRef.current);
      animate('disappear');
    };
    
    if (parent) {
      parent.addEventListener('mouseenter', handleMouseEnter);
      parent.addEventListener('mouseleave', handleMouseLeave);
    }
    
    // Clean up
    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationRef.current);
      
      if (parent) {
        parent.removeEventListener('mouseenter', handleMouseEnter);
        parent.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="pixel-canvas-container"
    >
      <canvas 
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default PixelCanvas;