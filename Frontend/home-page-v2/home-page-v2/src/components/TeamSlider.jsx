import React, { useEffect, useRef } from 'react';
import { register } from 'swiper/element/bundle';
import '../styles/TeamSlider.css';

// Register Swiper web components
register();

const TeamSlider = () => {
  const swiperRef = useRef(null);

  // Team member data
  const teamMembers = [
    {
      id: 1,
      name: "Soshan",
      role: "AI Research Lead",
      image: "/team/soshan.jpg",
      bio: "PhD in Computer Vision with 8+ years of experience in facial recognition algorithms."
    },
    {
      id: 2,
      name: "Naflan",
      role: "3D Modeling Expert",
      image: "/team/naflan.jpg",
      bio: "Award-winning 3D artist specializing in anatomically-accurate facial reconstructions."
    },
    {
      id: 3,
      name: "Vinuki",
      role: "UX/UI Designer",
      image: "/team/vinuki.jpg",
      bio: "Human-centered design specialist with background in psychology and visual arts."
    },
    {
      id: 4,
      name: "Vonara",
      role: "Full Stack Developer",
      image: "/team/vonara.jpg",
      bio: "Tech innovator with expertise in React, Three.js, and WebGL implementations."
    },
    {
      id: 5,
      name: "Shemeshi",
      role: "Data Scientist",
      image: "/team/shemeshi.jpg",
      bio: "Statistical modeling expert focused on pattern recognition and feature extraction."
    },
    {
      id: 6,
      name: "Mariyam",
      role: "Business Development",
      image: "/team/mariyam.jpg",
      bio: "Former modeling agency director bridging the gap between tech and industry needs."
    }
  ];

  useEffect(() => {
    // Swiper parameters
    const swiperParams = {
      effect: 'coverflow',
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: 'auto',
      coverflowEffect: {
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true,
      },
      pagination: true,
      navigation: true,
      breakpoints: {
        320: { slidesPerView: 1, spaceBetween: 20 },
        640: { slidesPerView: 2, spaceBetween: 30 },
        1024: { slidesPerView: 3, spaceBetween: 40 },
      }
    };

    Object.assign(swiperRef.current, swiperParams);
    swiperRef.current.initialize();
  }, []);

  return (
    <section className="team-section">
      <div className="team-section-content">
        <h1 className="team-heading">Our Visionary Team</h1>
        <p className="team-subheading">
          Meet the experts behind LookSci, combining cutting-edge technology with 
          scientific research to redefine beauty standards.
        </p>

        <div className="team-slider-container">
          <button className="team-nav-btn prev-btn" onClick={() => swiperRef.current.swiper.slidePrev()}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="#e0ffff" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </button>

          <swiper-container ref={swiperRef} init="false" class="team-swiper">
            {teamMembers.map(member => (
              <swiper-slide key={member.id} class="team-slide">
                <div className="team-card">
                  <div className="team-img-container">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="team-img"
                      onError={(e) => e.target.style.display = 'none'} 
                    />
                  </div>
                  <div className="team-card-content">
                    <h3 className="team-member-name">{member.name}</h3>
                    <h4 className="team-member-role">{member.role}</h4>
                    <p className="team-member-bio">{member.bio}</p>
                  </div>
                </div>
              </swiper-slide>
            ))}
          </swiper-container>

          <button className="team-nav-btn next-btn" onClick={() => swiperRef.current.swiper.slideNext()}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="#e0ffff" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default TeamSlider;
