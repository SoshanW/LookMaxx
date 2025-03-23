import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ScrollAnimation from '../components/home/ScrollAnimation';
import ModelSection from '../components/home/ModelSection';
import TeamSlider from '../components/home/TeamSlider';
import Footer from '../components/common/Footer';
import '../styles/HomePage.css';

function HomePage() {
  const location = useLocation();

  useEffect(() => {
    // Check if we need to scroll to About Us section
    if (location.state && location.state.scrollToAboutUs) {
      // Small delay to ensure the page is fully loaded
      const timer = setTimeout(() => {
        const aboutUsElement = document.getElementById('about-us');
        if (aboutUsElement) {
          aboutUsElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <div className="app home-page">
      <ScrollAnimation frameCount={200} imageFormat="jpg" />
      <ModelSection />
      <TeamSlider />
      <Footer />
    </div>
  );
}

export default HomePage;