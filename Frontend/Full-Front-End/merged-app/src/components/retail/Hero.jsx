import React, { useState } from 'react';
import { motion } from "framer-motion";
import ComingSoonPopup from './ComingSoonPopup';

const Hero = () => {
  // State to manage popup visibility
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Function to handle shop now button click
  const handleShopNowClick = () => {
    setIsPopupOpen(true);
  };

  // Animation variants
  const slideLeft = {
    hidden: { x: 0, opacity: 0 },
    visible: {
      x: "-20%",
      opacity: 1,
      transition: { duration: 1.8, ease: "easeOut" }
    }
  };

  const slideRight = {
    hidden: { x: 0, opacity: 0 },
    visible: {
      x: "20%",
      opacity: 1,
      transition: { duration: 1.8, ease: "easeOut" }
    }
  };

  return (
    <>
      <div className="hero-content">
        <motion.div
          className='side-image left'
          variants={slideLeft}
          initial="hidden"
          animate="visible"
        >
          <img src="/assets/retail/left.jpg" alt="left image" />
        </motion.div>

        <motion.div
          className='title'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1 }}
        >
          <button 
            className='shopBtn' 
            onClick={handleShopNowClick} // Add click handler here
          >
            Shop Now
          </button>
          <p className='bannertxt'>FIND YOUR FIT</p>
        </motion.div>

        <motion.div
          className='side-image right'
          variants={slideRight}
          initial="hidden"
          animate="visible"
        >
          <img src="/assets/retail/right.jpg" alt="right image" />
        </motion.div>
      </div>

      {/* Coming Soon Popup */}
      <ComingSoonPopup 
        isOpen={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)} 
      />
    </>
  );
};

export default Hero;