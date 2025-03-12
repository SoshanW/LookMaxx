import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PaymentPopup from "./PaymentPopup";

const PricingCard = ({ 
  title, 
  price, 
  originalPrice, 
  features, 
  buttonColor, 
  variant = 'pro', 
  buttonText = 'Get PRO',
  showOriginalPrice = true,
  tagline
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { hovered, ref } = useHover();
  const [isPopupOpen, setIsPopupOpen] = useState(false); // State to manage popup visibility
  
  // Color variations based on card type
  const borderColor = variant === 'pro' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(156, 163, 175, 0.4)';
  const glowColor = variant === 'pro' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(156, 163, 175, 0.2)';
  const gradientColor = variant === 'pro' ? '#3b82f6' : '#9CA3AF';
  
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleButtonClick = () => {
    if (buttonText === "Get Started") {
      // Redirect to home page for the free plan
      window.location.href = '/';
    } else {
      // Open the payment popup for the pro plan
      setIsPopupOpen(true);
    }
  };

  const closePopup = () => {
    setIsPopupOpen(false); // Close the payment popup
  };

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
        delay: 0.1, // Small delay to ensure content animates together with card
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
        duration: 0.5  // Slower duration for text animations
      }
    }
  };

  return (
    <motion.div 
      ref={ref} 
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
            backgroundImage: `linear-gradient(90deg, transparent 0%, ${gradientColor} 50%, transparent 100%)`,
            boxShadow: `0 0 6px 0 ${borderColor}`
          }}
          animate={{
            left: ['-100%', '100%']
          }}
          transition={{ 
            duration: 8, 
            ease: "linear", 
            repeat: Infinity,
            repeatType: "loop"
          }}
        />
        
        {/* Right border */}
        <motion.div 
          className="absolute w-1 opacity-60 blur-[1px]"
          style={{ 
            height: '100%', 
            right: 0,
            backgroundImage: `linear-gradient(180deg, transparent 0%, ${gradientColor} 50%, transparent 100%)`,
            boxShadow: `0 0 6px 0 ${borderColor}`
          }}
          animate={{
            top: ['-100%', '100%']
          }}
          transition={{ 
            duration: 8, 
            ease: "linear", 
            repeat: Infinity,
            repeatType: "loop"
          }}
        />
        
        {/* Bottom border */}
        <motion.div 
          className="absolute h-1 opacity-60 blur-[1px]"
          style={{ 
            width: '100%', 
            bottom: 0,
            backgroundImage: `linear-gradient(90deg, transparent 0%, ${gradientColor} 50%, transparent 100%)`,
            boxShadow: `0 0 6px 0 ${borderColor}`
          }}
          animate={{
            right: ['100%', '-100%']
          }}
          transition={{ 
            duration: 8, 
            ease: "linear", 
            repeat: Infinity,
            repeatType: "loop"
          }}
        />
        
        {/* Left border */}
        <motion.div 
          className="absolute w-1 opacity-60 blur-[1px]"
          style={{ 
            height: '100%', 
            left: 0,
            backgroundImage: `linear-gradient(180deg, transparent 0%, ${gradientColor} 50%, transparent 100%)`,
            boxShadow: `0 0 6px 0 ${borderColor}`
          }}
          animate={{
            bottom: ['100%', '-100%']
          }}
          transition={{ 
            duration: 8, 
            ease: "linear", 
            repeat: Infinity,
            repeatType: "loop"
          }}
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
                  duration: 0.5,  // Slower duration
                  delay: 0.2,
                  type: "spring",
                  stiffness: 200  // Lower stiffness for smoother motion
                }}
              >
                {price === "0" && !showOriginalPrice ? "Free" : price}
              </motion.span>
              {showOriginalPrice && originalPrice && (
                <motion.span 
                  className="text-gray-400 text-lg line-through ml-2"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}  // Slower duration
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
            onClick={handleButtonClick} // Open the payment popup on click
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
                  staggerChildren: 0.05,  // Slightly longer stagger delay
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
                      stiffness: 400,  // Lower stiffness for smoother motion
                      duration: 0.4    // Slower duration
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
                      duration: 0.4,   // Slower duration
                      delay: 0.45 + (index * 0.08)  // Longer delays between items
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
                      duration: 0.4,   // Slower duration
                      delay: 0.45 + (index * 0.08)  // Longer delays between items
                    }}
                  ></motion.i>
                }
                <span>{feature.text}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </motion.div>
      {isPopupOpen && 
      <PaymentPopup
       onClose={closePopup}
       planId="1" />
       planName={title}
       planPrice={price.replace('$','Rs')} 
    </motion.div>
  );
};

// Add useHover hook directly in this file to avoid dependency
const useHover = () => {
  const [hovered, setHovered] = useState(false);
  const ref = React.useRef(null);
  
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    const handleMouseOver = () => setHovered(true);
    const handleMouseOut = () => setHovered(false);
    
    el.addEventListener('mouseover', handleMouseOver);
    el.addEventListener('mouseout', handleMouseOut);
    
    return () => {
      el.removeEventListener('mouseover', handleMouseOver);
      el.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);
  
  return { hovered, ref };
};

export default PricingCard;