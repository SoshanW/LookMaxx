import React, { useEffect, useState } from 'react';
import ImageSequence from './components/ImageSequence';
import ScrollText from './components/ScrollText';
import Navbar from './components/Navbar';
import CustomScrollbar from './components/CustomScrollbar';
import SectionIndicator from './components/SectionIndicator';
import DynamicScrollButton from './components/DynamicScrollButton';
import DesignCard from './components/DesignCard';
import UploadPhoto from './components/UploadPhoto'; // Import the UploadPhoto component
import BlogCard from './components/BlogCard'; // Import BlogCard
import './App.css';
import BottomNavBar from './components/BottomNavBar';

function App() {
  const [showDesignCard, setShowDesignCard] = useState(false);
  const [showUploadPhoto, setShowUploadPhoto] = useState(false); // State for UploadPhoto visibility
  const [showBlogCard, setShowBlogCard] = useState(false); // State for BlogCard visibility

  useEffect(() => {
    // Force scroll to top on component mount
    window.scrollTo(0, 0);
    
    // Prevent any default scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const viewportHeight = window.innerHeight;

      // Show BlogCard when scrolled past a certain point
      setShowBlogCard(scrollPosition > viewportHeight * 0.7 && scrollPosition < viewportHeight * 2.5);
      
      // Show DesignCard when scrolled past a certain point
      setShowDesignCard(scrollPosition > viewportHeight * 1.5);
      
      // Show the UploadPhoto component after scrolling down a few ticks
      setShowUploadPhoto(scrollPosition > viewportHeight * 5); // Adjust this value for desired scroll position
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app">
      <Navbar />
      <ImageSequence frameCount={225} imageFormat="jpg" />
      <ScrollText />
      <CustomScrollbar />
      <SectionIndicator />
      <DynamicScrollButton />
      <BottomNavBar />
      {showBlogCard && <BlogCard isVisible={showBlogCard} />} {/* Conditionally render BlogCard */}
      {showDesignCard && <DesignCard isVisible={showDesignCard} />} {/* Conditionally render DesignCard */}
      {showUploadPhoto && <UploadPhoto />} {/* Conditionally render UploadPhoto */}
    </div>
  );
}

export default App;