import React, { useEffect, useRef } from 'react';
import { register } from 'swiper/element/bundle';
import { FaGithub, FaLinkedin } from 'react-icons/fa'; // Import React Icons
import '../../styles/home/TeamSlider.css';

// Register Swiper web components
register();

const TeamSlider = () => {
  const swiperRef = useRef(null);

  // Team member data with added social links
  const teamMembers = [
    {
      id: 1,
      name: "Soshan",
      role: "Full Stack & AI Developer",
      image: "/assets/team/soshan.jpg",
      bio: "Developing intelligent and scalable applications by integrating AI with full-stack technologies. Passionate about problem-solving and innovation.",
      github: "https://github.com/SoshanW",
      linkedin: "https://www.linkedin.com/in/soshan-wijayarathne-94918b267/"
    },
    {
      id: 2,
      name: "Naflan",
      role: "AI & 3D Modeling Specialist",
      image: "/assets/team/naflan.jpg",
      bio: "Combining machine learning with 3D modeling to create precise and dynamic digital representations, pushing the boundaries of AI-driven design.",
      github: "https://github.com/Tefilicious",
      linkedin: "https://www.linkedin.com/in/naflan-nazar-tefilicious/"
    },
    {
      id: 3,
      name: "Vinuki",
      role: "Backend Engineer",
      image: "/assets/team/vinuki.jpg",
      bio: "Building and optimizing backend systems for performance and scalability. Experienced in database architecture and API development.",
      github: "https://github.com/Janvi-06",
      linkedin: "https://www.linkedin.com/in/vinuki-rathnayake-a2283b2a2/"
    },
    {
      id: 4,
      name: "Vonara",
      role: "UI/UX Developer",
      image: "/assets/team/vonara.jpg",
      bio: "Designing seamless and visually compelling user experiences with a focus on interactivity, accessibility, and modern web aesthetics.",
      github: "https://github.com/vonaraa",
      linkedin: "https://www.linkedin.com/in/vonara-perera/"
    },
    {
      id: 5,
      name: "Shemeshi",
      role: "Backend Developer",
      image: "/assets/team/shemeshi.jpg",
      bio: "Ensuring efficient server-side performance and system stability, with expertise in data processing and backend optimization.",
      github: "https://github.com/ShemeshiRobert",
      linkedin: "https://www.linkedin.com/in/shemeshi-neha-robert-7b1541292/"
    },
    {
      id: 6,
      name: "Mariyam",
      role: "UI/UX & 3D Design Engineer",
      image: "/assets/team/mariyam.jpg",
      bio: "Creating engaging user interfaces and detailed 3D models to enhance digital experiences, blending design principles with technical expertise.",
      github: "https://github.com/mariyamj",
      linkedin: "https://www.linkedin.com/in/mariyam-jameela-5000b5291/"
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
    <section className="team-section" id="about-us">
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
                    
                    {/* Social links */}
                    <div className="team-member-social">
                      <a href={member.github} target="_blank" rel="noopener noreferrer" className="team-social-link github">
                        <FaGithub />
                      </a>
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="team-social-link linkedin">
                        <FaLinkedin />
                      </a>
                    </div>
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