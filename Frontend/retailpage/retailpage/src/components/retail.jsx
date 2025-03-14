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
           <div className="slides__wrapper">
             <div className="slides">
               {slides.map((slide, index) => (
                 <div 
                   key={index} 
                   className={getSlideClass(index)} 
                   data-current={index === currentIndex ? '' : null}
                   data-next={index === (currentIndex + 1) % slides.length ? '' : null}
                   data-previous={index === (currentIndex - 1 + slides.length) % slides.length ? '' : null}
                 >
                   <div className="slide__inner">
                     <div className="slide--image__wrapper">
                       <img 
                         className="slide--image" 
                         src={slide.image} 
                         alt={slide.title} 
                       />
                     </div>
                   </div>
                 </div>
               ))}
             </div>
 
             <div className="slides--infos">
               {slides.map((slide, index) => (
                 <div 
                   key={index} 
                   className="slide-info"
                   data-current={index === currentIndex ? '' : null}
                   data-next={index === (currentIndex + 1) % slides.length ? '' : null}
                   data-previous={index === (currentIndex - 1 + slides.length) % slides.length ? '' : null}
                 >
                   <div className="slide-info__inner">
                     <div className="slide-info--text__wrapper">
                       <div data-title className="slide-info--text">
                         <span>{slide.title}</span>
                       </div>
                       <div data-subtitle className="slide-info--text">
                         <span>{slide.subtitle}</span>
                       </div>
                       <div data-description className="slide-info--text">
                         <span>{slide.description}</span>
                       </div>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
 
 
     </>
   )
 }
 
 export default Retailpage