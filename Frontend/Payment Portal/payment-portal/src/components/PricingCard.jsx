import React, { useState, useEffect } from 'react';
import { motion, useAnimationControls } from 'framer-motion';

const PricingCard = ({ 
  title, 
  price, 
  originalPrice, 
  features, 
  buttonColor, 
  variant = 'pro', 
  buttonText = 'Get Started',
  showOriginalPrice = true,
  tagline
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Animation controls for each border
  const topControls = useAnimationControls();
  const rightControls = useAnimationControls();
  const bottomControls = useAnimationControls();
  const leftControls = useAnimationControls();
  
  // Color variations based on card type
  const borderColor = variant === 'pro' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(156, 163, 175, 0.4)';
  const glowColor = variant === 'pro' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(156, 163, 175, 0.2)';
  const gradientColor = variant === 'pro' ? '#3b82f6' : '#9CA3AF';
  
  // Start animations on component mount
  useEffect(() => {
    const startAnimations = async () => {
      topControls.start({
        left: ['-100%', '100%'],
        transition: { duration: 8, ease: "linear", repeat: Infinity }
      });
      
      rightControls.start({
        top: ['-100%', '100%'],
        transition: { duration: 8, ease: "linear", repeat: Infinity }
      });
      
      bottomControls.start({
        right: ['-100%', '100%'],
        transition: { duration: 8, ease: "linear", repeat: Infinity }
      });
      
      leftControls.start({
        bottom: ['-100%', '100%'],
        transition: { duration: 8, ease: "linear", repeat: Infinity }
      });
    };
    
    startAnimations();
  }, []);
  
  // Card entrance animation variants
  const cardVariants = {
    hidden: { 
      opacity: 0,
      y: 30,
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 400,
        duration: 0.3,
        delay: 0.1,
        delayChildren: 0.02,
        staggerChildren: 0.04
      }
    }
  };

  // Child elements animations variants
  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 15 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 30,
        stiffness: 500,
        duration: 0.5
      }
    }
  };
  
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <motion.div 
      className="relative w-96"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated neon border */}
      <div className="absolute inset-0 overflow-hidden rounded-lg z-10 pointer-events-none">
        {/* Top border */}
        <motion.div 
          className="absolute h-1 opacity-60 blur-[1px]"
          style={{ 
            width: '100%', 
            top: 0, 
            left: 0, 
            backgroundImage: `linear-gradient(90deg, transparent 0%, ${gradientColor} 50%, transparent 100%)`,
            boxShadow: `0 0 6px 0 ${borderColor}`
          }}
          initial={{ left: '-100%', opacity: 0 }}
          animate={{ left: '-100%', opacity: 1 }}
          transition={{ opacity: { duration: 0.4, delay: 0.15 } }}
        />
        
        {/* Right border */}
        <motion.div 
          className="absolute w-1 opacity-60 blur-[1px]"
          style={{ 
            height: '100%', 
            top: 0, 
            right: 0, 
            backgroundImage: `linear-gradient(180deg, transparent 0%, ${gradientColor} 50%, transparent 100%)`,
            boxShadow: `0 0 6px 0 ${borderColor}`
          }}
          initial={{ top: '-100%', opacity: 0 }}
          animate={{ top: '-100%', opacity: 1 }}
          transition={{ opacity: { duration: 0.4, delay: 0.2 } }}
        />
        
        {/* Bottom border */}
        <motion.div 
          className="absolute h-1 opacity-60 blur-[1px]"
          style={{ 
            width: '100%', 
            bottom: 0, 
            right: 0, 
            backgroundImage: `linear-gradient(90deg, transparent 0%, ${gradientColor} 50%, transparent 100%)`,
            boxShadow: `0 0 6px 0 ${borderColor}`
          }}
          initial={{ right: '-100%', opacity: 0 }}
          animate={{ right: '-100%', opacity: 1 }}
          transition={{ opacity: { duration: 0.4, delay: 0.25 } }}
        />
        
        {/* Left border */}
        <motion.div 
          className="absolute w-1 opacity-60 blur-[1px]"
          style={{ 
            height: '100%', 
            bottom: 0, 
            left: 0, 
            backgroundImage: `linear-gradient(180deg, transparent 0%, ${gradientColor} 50%, transparent 100%)`,
            boxShadow: `0 0 6px 0 ${borderColor}`
          }}
          initial={{ bottom: '-100%', opacity: 0 }}
          animate={{ bottom: '-100%', opacity: 1 }}
          transition={{ opacity: { duration: 0.4, delay: 0.3 } }}
        />
        
        {/* Subtle ambient glow effect */}
        <motion.div 
          className="absolute inset-0 rounded-lg opacity-20" 
          style={{ 
            boxShadow: `inset 0 0 15px 1px ${glowColor}`,
            background: `radial-gradient(circle at center, ${glowColor.replace(')', ', 0.03)')}, transparent 70%)`
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        whileHover={{ 
          scale: 1.02,
          boxShadow: variant === 'pro' ? '0 0 20px 2px rgba(59, 130, 246, 0.3)' : '0 0 20px 2px rgba(156, 163, 175, 0.2)'
        }}
        className="text-white rounded-lg p-6 w-full relative z-0"
        onMouseMove={handleMouseMove}
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: variant === 'pro' 
            ? 'linear-gradient(135deg, rgb(17, 1, 48) 0%, rgb(49, 35, 73) 100%)' 
            : 'linear-gradient(135deg, rgb(31, 41, 55) 0%, rgb(55, 65, 81) 100%)',
          boxShadow: variant === 'pro' 
            ? '0 0 10px 1px rgba(59, 130, 246, 0.15)' 
            : '0 0 10px 1px rgba(156, 163, 175, 0.15)'
        }}
      >
        {/* Gradient effect that follows mouse */}
        <div
          style={{
            position: 'absolute',
            background: `radial-gradient(circle 100px at ${mousePosition.x}px ${mousePosition.y}px, ${variant === 'pro' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(156, 163, 175, 0.2)'}, transparent)`,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0
          }}
        />

        {/* Card content with relative positioning to appear above gradient */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <motion.h2 
            className="text-2xl font-bold text-center mb-4"
            variants={itemVariants}
          >
            {title}
          </motion.h2>
          <motion.div 
            className="flex flex-col items-center mb-4"
            variants={itemVariants}
          >
            <div className="flex items-baseline">
              <motion.span 
                className="text-5xl font-bold"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.5,
                  delay: 0.2,
                  type: "spring",
                  stiffness: 200
                }}
              >
                {price === "0" && !showOriginalPrice ? "Free" : price}
              </motion.span>
              {showOriginalPrice && originalPrice && (
                <motion.span 
                  className="text-gray-400 text-lg line-through ml-2"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  ${originalPrice}
                </motion.span>
              )}
            </div>
            <motion.p 
              className="text-gray-400 mt-1"
              variants={itemVariants}
            >
              {tagline || (variant === 'pro' ? 'Pay once. Own forever!' : 'No payment required')}
            </motion.p>
          </motion.div>
          <motion.button 
            className={`font-bold py-3 px-4 rounded mb-6 w-full text-center relative overflow-hidden ${buttonColor}`}
            variants={itemVariants}
            whileHover={{ 
              scale: 1.03,
              boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)'
            }}
            whileTap={{ scale: 0.97 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 15
            }}
          >
            <motion.span
              className="absolute inset-0 bg-white opacity-10"
              initial={{ x: "-100%", opacity: 0.1 }}
              whileHover={{ x: "100%", opacity: 0.2 }}
              transition={{ duration: 0.8 }}
            />
            <span className="relative z-10">{buttonText}</span>
          </motion.button>
          <motion.ul 
            className="space-y-4"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.3
                }
              }
            }}
          >
            {features.map((feature, index) => (
              <motion.li 
                key={index} 
                className="flex items-center"
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  visible: { 
                    opacity: 1, 
                    x: 0,
                    transition: {
                      type: "spring",
                      damping: 30,
                      stiffness: 400,
                      duration: 0.4
                    }
                  }
                }}
              >
                {feature.included ? 
                  <motion.i 
                    className="fas fa-check text-white bg-blue-500 p-1 rounded-full mr-3 text-xs"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring",
                      damping: 20,
                      stiffness: 400,
                      duration: 0.4,
                      delay: 0.45 + (index * 0.08)
                    }}
                  ></motion.i> : 
                  <motion.i 
                    className="fas fa-times text-white bg-red-500 p-1 rounded-full mr-3 text-xs"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring",
                      damping: 20,
                      stiffness: 400,
                      duration: 0.4,
                      delay: 0.45 + (index * 0.08)
                    }}
                  ></motion.i>
                }
                <span>{feature.text}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PricingCard;