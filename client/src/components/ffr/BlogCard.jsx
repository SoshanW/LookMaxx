import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom'; // Add this import
import '../../styles/ffr/BlogCard.css';

const BlogCard = ({ isVisible }) => {
  const navigate = useNavigate(); // Add this hook
  const blogCardRef = useRef(null);
  const codeRef = useRef(null);
  const titleRef = useRef(null);
  const textRef = useRef(null);

  const blogPost = {
    date: "26 December 2019",
    title: "Dive Deep in Facial Aesthetics",
    text: "Curious about the science behind facial analysis? Explore research-backed insights that reveal the fascinating connections between facial features and perception. Tap below to dive into the studies!",
    imgSrc: "https://media.britishmuseum.org/media/Repository/Documents/2014_10/9_16/53995c6c_992e_4003_ab68_a3bf010a99a1/preview_00526803_001.jpg", 
  };

  // Handle navigation to the Study section
  const handleReadMoreClick = (e) => {
    e.preventDefault(); // Prevent default anchor behavior
    navigate('/study'); // Navigate to the Study section
  };

  useEffect(() => {
    if (isVisible) {
      // Fade in the card
      gsap.to(blogCardRef.current, { opacity: 1, duration: 0.4 });
      // Fade in the text elements with delays
      gsap.to(codeRef.current, { opacity: 1, y: 0, duration: 0.4, delay: 0.2 });
      gsap.to(titleRef.current, { opacity: 1, y: 0, duration: 0.4, delay: 0.4 });
      gsap.to(textRef.current, { opacity: 1, y: 0, duration: 0.4, delay: 0.6 });
    } else {
      // Fade out the card
      gsap.to(blogCardRef.current, { opacity: 0, duration: 0.4 });
      // Fade out the text elements
      gsap.to(codeRef.current, { opacity: 0, y: 10, duration: 0.4 });
      gsap.to(titleRef.current, { opacity: 0, y: 10, duration: 0.4 });
      gsap.to(textRef.current, { opacity: 0, y: 10, duration: 0.4 });
    }
  }, [isVisible]);

  return (
    <div className="blog-card" ref={blogCardRef} style={{ opacity: 0 }}>
      <div className="blog-card__img">
        <img src={blogPost.imgSrc} alt="Blog Post" />
      </div>
      <div className="blog-card__content">
        <span className="blog-card__code" ref={codeRef} style={{ opacity: 0, transform: 'translateY(10px)' }}>{blogPost.date}</span>
        <h2 className="blog-card__title" ref={titleRef} style={{ opacity: 0, transform: 'translateY(10px)' }}>{blogPost.title}</h2>
        <p className="blog-card__text" ref={textRef} style={{ opacity: 0, transform: 'translateY(10px)' }}>{blogPost.text}</p>
        <a 
          href="#" 
          className="blog-card__button"
          onClick={handleReadMoreClick} // Add the click handler
        >
          Read More
        </a>
      </div>
    </div>
  );
};

export default BlogCard;