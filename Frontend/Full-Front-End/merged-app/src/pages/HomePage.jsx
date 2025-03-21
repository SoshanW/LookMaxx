import React from 'react';
import ScrollAnimation from '../components/home/ScrollAnimation';
import ModelSection from '../components/home/ModelSection';
import TeamSlider from '../components/home/TeamSlider';
import '../styles/HomePage.css';

function HomePage() {
  return (
    <div className="app home-page">
      <ScrollAnimation frameCount={200} imageFormat="jpg" />
      <ModelSection />
      <TeamSlider />
    </div>
  );
}

export default HomePage;