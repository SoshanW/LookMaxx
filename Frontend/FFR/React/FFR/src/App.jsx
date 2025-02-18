// ./src/App.jsx
import React, { useEffect, useState } from 'react';
import ImageSequence from './components/ImageSequence';
import ScrollText from './components/ScrollText';
import Navbar from './components/Navbar';
import CustomScrollbar from './components/CustomScrollbar';
import SectionIndicator from './components/SectionIndicator';
import DynamicScrollButton from './components/DynamicScrollButton';
import DesignCard from './components/DesignCard';
import './App.css';
import BottomNavBar from './components/BottomNavBar';

function App() {
  const [showDesignCard, setShowDesignCard] = useState(false);

  useEffect(() => {
    // Force scroll to top on component mount
    window.scrollTo(0, 0);
    
    // Prevent any default scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // Show the DesignCard when scrolled past a certain point
      setShowDesignCard(scrollPosition > window.innerHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app">
      <Navbar />
      <ImageSequence frameCount={220} imageFormat="jpg" />
      <ScrollText />
      <CustomScrollbar />
      <SectionIndicator />
      <DynamicScrollButton />
      <BottomNavBar />
      <DesignCard isVisible={showDesignCard} /> 
    </div>
  );
}

export default App;