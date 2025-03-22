import React, { useEffect } from 'react';
import '../../styles/retail/Hero.css';
import '../../styles/retail/Slider.css';
import { motion, useAnimation, useInView } from "framer-motion";
import FitOnSection from './FitOnSection';

const Retail = () => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

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

  // Slider data
  const slides = [
    {
      image: '/assets/retail/carnage.jpg',
      title: 'Threads',
      subtitle: 'Fashion',
      description: 'Trendy collections for you'
    },
    {
      image: '/assets/retail/kellyfelder.jpg',
      title: 'Sewed',
      subtitle: 'Clothing',
      description: 'Find your perfect style'
    },
    {
      image: '/assets/retail/kellyfelder.jpg',
      title: 'Drift & Stitch',
      subtitle: 'Accessories',
      description: 'Complete your look'
    }
  ];

  const changeSlide = (direction) => {
    const newIndex = (currentIndex + direction + slides.length) % slides.length;
    setCurrentIndex(newIndex);
  };

  const getSlideClass = (index) => {
    if (index === currentIndex) return 'slide current';
    if (index === (currentIndex + 1) % slides.length) return 'slide next';
    if (index === (currentIndex - 1 + slides.length) % slides.length) return 'slide previous';
    return 'slide';
  };

  const sliderControls = useAnimation();
  const sliderRef = React.useRef(null);
  const sliderInView = useInView(sliderRef, { once: true, amount: 0.3 });

  const featureSectionRef = React.useRef(null);
  const featureSectionInView = useInView(featureSectionRef, { once: true, amount: 0.2 });
  const featureSectionControls = useAnimation();

  // Trigger animations when elements come into view
  useEffect(() => {
    if (sliderInView) {
      sliderControls.start('visible');
    }
  }, [sliderInView, sliderControls]);

  useEffect(() => {
    if (featureSectionInView) {
      featureSectionControls.start('visible');
    }
  }, [featureSectionInView, featureSectionControls]);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const slideInContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const slideInFromRight = {
    hidden: { x: 100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { 
        type: "tween", 
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1.0] // cubic bezier easing
      }
    }
  };

  const slideInFromLeft = {
    hidden: { x: -100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { 
        type: "tween", 
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1.0] // cubic bezier easing
      }
    }
  };

  // Add body class for retail page
  useEffect(() => {
    // Add retail-page class to body
    document.body.classList.add('retail-page');
    
    return () => {
      // Remove retail-page class from body when component unmounts
      document.body.classList.remove('retail-page');
    };
  }, []);

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
          <img src="/assets/retail/left.jpg" alt="left image" />
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
          <img src="/assets/retail/right.jpg" alt="right image" />
        </motion.div>
      </div>

      {/* Slider Section */}
      <motion.div 
        className="slider-section"
        ref={sliderRef}
        variants={fadeInUp}
        initial="hidden"
        animate={sliderControls}
      >
        <motion.div 
          className='titlecontainer'
          variants={fadeInUp}
        >
          <div className='line'></div>
          <h2>Featured Stores</h2>
          <div className='line'></div>
        </motion.div>
        
        <div className="slider">
          <button 
            className="slider--btn slider--btn__prev" 
            onClick={() => changeSlide(-1)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
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

            <div 
              className="slide__bg" 
              style={{ 
                backgroundImage: `url(${slides[currentIndex].image})`,
                opacity: 1 
              }}
              data-current
            />
          </div>

          <button 
            className="slider--btn slider--btn__next" 
            onClick={() => changeSlide(1)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </motion.div>

      <motion.div
        ref={featureSectionRef}
        variants={slideInContainer}
        initial="hidden"
        animate={featureSectionControls}
        className="feature-section-wrapper"
      >
        <FitOnSection 
          childWrapperProps={{
            alternatingAnimation: true,
            animationVariants: {
              even: slideInFromLeft,
              odd: slideInFromRight
            }
          }}
        />
      </motion.div>
    </>
  );
};

export default Retail;