import React from 'react';
import '../app.css';
import '../styles/Slider.css';
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

  // Slider data
  const slides = [

    {
      image: 'carnage.jpg',
      title: 'Mimosa',
      subtitle: 'Fashion',
      description: 'Trendy collections for you'
    },
    
    {
      image: 'kellyfelder.jpg',
      title: 'Kelly Felder',
      subtitle: 'Clothing',
      description: 'Find your perfect style'
    },
    
    {
      image: 'kellyfelder.jpg',
      title: 'A Store',
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
      </div>

      {/* Slider Section */}
      <div className="slider-section">
        <div className='titlecontainer'>
          <div className='line'></div>
          <h2>Featured Stores</h2>
          <div className='line'></div>
        </div>
        
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
      </div>
      <div className='fit-on-section'>
              
      </div>
    </>
  );
};

export default RetailpageWithSlider;