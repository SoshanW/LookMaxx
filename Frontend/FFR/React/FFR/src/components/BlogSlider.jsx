// ./src/components/BlogSlider.jsx
import React, { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import { gsap } from 'gsap';
import '../styles/BlogSlider.css'; // Import the CSS for the BlogSlider

const BlogSlider = ({ isVisible }) => {
  const blogSliderRef = useRef(null);

  const blogPosts = [
    {
      date: "26 December 2019",
      title: "Lorem Ipsum Dolor",
      text: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Recusandae voluptate repellendus magni illo ea animi?",
      imgSrc: "https://res.cloudinary.com/muhammederdem/image/upload/q_60/v1535759872/kuldar-kalvik-799168-unsplash.webp",
    },
    {
      date: "26 December 2019",
      title: "Lorem Ipsum Dolor2",
      text: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Recusandae voluptate repellendus magni illo ea animi?",
      imgSrc: "https://res.cloudinary.com/muhammederdem/image/upload/q_60/v1535759871/jason-leung-798979-unsplash.webp",
    },
    {
      date: "26 December 2019",
      title: "Lorem Ipsum Dolor3",
      text: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Recusandae voluptate repellendus magni illo ea animi?",
      imgSrc: "https://res.cloudinary.com/muhammederdem/image/upload/q_60/v1535759871/alessandro-capuzzi-799180-unsplash.webp",
    },
  ];

  useEffect(() => {
    if (isVisible) {
      gsap.fromTo(blogSliderRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 });
    } else {
      gsap.to(blogSliderRef.current, { opacity: 0, duration: 0.5 });
    }
  }, [isVisible]);

  return (
    <div className="blog-slider" ref={blogSliderRef}>
      <Swiper
        spaceBetween={30}
        effect="fade"
        loop={true}
        pagination={{
          el: '.blog-slider__pagination',
          clickable: true,
        }}
      >
        {blogPosts.map((post, index) => (
          <SwiperSlide key={index} className="blog-slider__item">
            <div className="blog-slider__img">
              <img src={post.imgSrc} alt={post.title} />
            </div>
            <div className="blog-slider__content">
              <span className="blog-slider__code">{post.date}</span>
              <div className="blog-slider__title">{post.title}</div>
              <div className="blog-slider__text">{post.text}</div>
              <a href="#" className="blog-slider__button">READ MORE</a>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="blog-slider__pagination"></div>
    </div>
  );
};

export default BlogSlider;