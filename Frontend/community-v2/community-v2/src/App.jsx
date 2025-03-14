import React from 'react';
import './App.css';
import HeroSection from './components/HeroSection';
import FeaturedSection from './components/FeaturedSection';
import ActivitySection from './components/ActivitySection';
import Footer from './components/Footer';

function App() {
  return (
    <div className="app">
      <main>
        <HeroSection />
        <FeaturedSection />
        <ActivitySection />
        <Footer />
      </main>
    </div>
  );
}

export default App;