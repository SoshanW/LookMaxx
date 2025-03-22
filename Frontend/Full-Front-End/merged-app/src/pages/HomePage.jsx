import React from 'react';
import ScrollAnimation from '../components/home/ScrollAnimation';
import ModelSection from '../components/home/ModelSection';
import TeamSlider from '../components/home/TeamSlider';
import Footer from '../components/common/Footer'; // Import the common Footer
import '../styles/HomePage.css';

function HomePage() {
  return (
    <div className="app home-page">
      <ScrollAnimation frameCount={200} imageFormat="jpg" />
      <ModelSection />
      <TeamSlider />
      <Footer /> {/* Add the Footer component here */}
    </div>
  );
}

export default HomePage;