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

        <div className='slider'>
         <h1></h1>
         <img src="kellyfelder.jpg" alt="carnage" className='store'/>
         <img src="r.jpg" className='store'/>
         <img src="a.png" className='store'/>
         <img src="" className='store'/>
       </div>
       
      </div>
 
     </>
   )
 }
 
 export default Retailpage