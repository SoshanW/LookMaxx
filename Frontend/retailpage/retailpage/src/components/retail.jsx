import React from 'react';
import '../app.css'
import { motion } from "framer-motion";
 
 const RetailpageWithSlider = () => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // Animations for hero section
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
       {/* Hero Section */}
      <div className="hero-content">
        <motion.div
          className='side-image left'
          variants={slideLeft}
          initial="hidden"
          animate="visible"
        >
          <img src="left.jpg" alt="left image" />
        </motion.div>

        <motion.div
          className='title'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1 }}
        >
          <button className='shopBtn'>Shop Now</button>
          <p className='bannertxt'>FIND YOUR FIT</p>
        </motion.div>

        <motion.div
          className='side-image right'
          variants={slideRight}
          initial="hidden"
          animate="visible"
        >
          <img src="right.jpg" alt="right image" />
        </motion.div>

        <h1 className='slider-header'>Featured Stores</h1>
         <div className='slider-wrapper'>
         <button className='slider-arrow prev' onClick={goToPrevSlide}>
             &lt;
           </button>
           <div className='slider-content'>
             {images.map((image, index) => (
               <div 
                 key={index} 
                 className={`slider-slide ${index === currentIndex ? 'active' : ''}`}
                 style={{ 
                   transform: `translateX(${100 * (index - currentIndex)}%)`,
                   opacity: index === currentIndex ? 1 : 0.5
                 }}
               >
                 <img src={image.src} alt={image.alt} className='store-image' />
               </div>
             ))}
           </div>
           <button className='slider-arrow next' onClick={goToNextSlide}>
             &gt;
           </button>
         </div>
         <div className='slider-dots'>
           {images.map((_, index) => (
             <span 
               key={index} 
               className={`slider-dot ${index === currentIndex ? 'active' : ''}`}
               onClick={() => goToSlide(index)}
             />
           ))}
         </div>

      </div>
 
     </>
   )
 }
 
 export default Retailpage