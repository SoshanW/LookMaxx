import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import '../styles/BlogCard.css';

const BlogCard = ({ isVisible }) => {
  const blogCardRef = useRef(null);
  const codeRef = useRef(null);
  const titleRef = useRef(null);
  const textRef = useRef(null);

  const blogPost = {
    date: "26 December 2019",
    title: "Dive Deep in Facial Aesthetics",
    text: "Curious about the science behind facial analysis? Explore research-backed insights that reveal the fascinating connections between facial features and perception. Tap below to dive into the studies!",
    imgSrc: "https://res.cloudinary.com/muhammederdem/image/upload/q_60/v1535759872/kuldar-kalvik-799168-unsplash.webp", 
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
        <a href="#" className="blog-card__button">Read More</a>
      </div>
    </div>
  );
};

export default BlogCard;