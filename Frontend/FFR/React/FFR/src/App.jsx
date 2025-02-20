// ./src/App.jsx
import React, { useEffect, useState } from 'react';
import ImageSequence from './components/ImageSequence';
import ScrollText from './components/ScrollText';
import Navbar from './components/Navbar';
import CustomScrollbar from './components/CustomScrollbar';
import SectionIndicator from './components/SectionIndicator';
import DynamicScrollButton from './components/DynamicScrollButton';
import DesignCard from './components/DesignCard';
import BlogCard from './components/BlogCard'; // Import BlogCard
import './App.css';
import BottomNavBar from './components/BottomNavBar';

function App() {
  const [showDesignCard, setShowDesignCard] = useState(false);
  const [showBlogCard, setShowBlogCard] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const viewportHeight = window.innerHeight;

      // Show BlogCard when scrolled past a certain point
      setShowBlogCard(scrollPosition > viewportHeight * 0.7 && scrollPosition < viewportHeight * 2.5);
      
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
      <BlogCard isVisible={showBlogCard} /> {/* Render BlogCard */}
      <DesignCard isVisible={showDesignCard} /> {/* Render DesignCard */}
    </div>
  );
}

export default App;