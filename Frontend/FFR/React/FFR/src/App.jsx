// ./src/App.jsx
import React, { useEffect, useState } from 'react';
import ImageSequence from './components/ImageSequence';
import ScrollText from './components/ScrollText';
import Navbar from './components/Navbar';
import CustomScrollbar from './components/CustomScrollbar';
import SectionIndicator from './components/SectionIndicator';
import DynamicScrollButton from './components/DynamicScrollButton';
import DesignCard from './components/DesignCard';
import BlogSlider from './components/BlogSlider'; // Import BlogSlider
import './App.css';
import BottomNavBar from './components/BottomNavBar';

function App() {
  const [showDesignCard, setShowDesignCard] = useState(false);
  const [showBlogSlider, setShowBlogSlider] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const viewportHeight = window.innerHeight;

      // Show BlogSlider when scrolled past a certain point
      setShowBlogSlider(scrollPosition > viewportHeight * 0.5 && scrollPosition < viewportHeight * 1.5);
      
      // Show DesignCard when scrolled past a certain point
      setShowDesignCard(scrollPosition > viewportHeight * 1.5);
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
      <BlogSlider isVisible={showBlogSlider} /> {/* Pass visibility prop */}
      <DesignCard isVisible={showDesignCard} /> {/* Render DesignCard */}
    </div>
  );
}

export default App;