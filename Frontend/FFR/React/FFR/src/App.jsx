import React, { useEffect, useState } from 'react';
import ImageSequence from './components/ImageSequence';
import ScrollText from './components/ScrollText';
import Navbar from './components/Navbar';
import CustomScrollbar from './components/CustomScrollbar';
import SectionIndicator from './components/SectionIndicator';
import DynamicScrollButton from './components/DynamicScrollButton';
import DesignCard from './components/DesignCard';
import UploadPhoto from './components/UploadPhoto';
import BlogCard from './components/BlogCard';
import './App.css';
import BottomNavBar from './components/BottomNavBar';

function App() {
  const [showDesignCard, setShowDesignCard] = useState(false);
  const [showUploadPhoto, setShowUploadPhoto] = useState(false);
  const [showBlogCard, setShowBlogCard] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Track login status
  const [userName, setUserName] = useState('User'); // Fixed the typo in state setter

  useEffect(() => {
    window.scrollTo(0, 0);
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const viewportHeight = window.innerHeight;

      setShowBlogCard(scrollPosition > viewportHeight * 0.7 && scrollPosition < viewportHeight * 2.5);
      setShowDesignCard(scrollPosition > viewportHeight * 1.5);
      setShowUploadPhoto(scrollPosition > viewportHeight * 5);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app">
      <Navbar isLoggedIn={isLoggedIn} userName={userName} setIsLoggedIn={setIsLoggedIn} />
      
      <main>
        <ImageSequence frameCount={225} imageFormat="jpg" />
        <ScrollText />
        
        {showBlogCard && <BlogCard isVisible={showBlogCard} />}
        {showDesignCard && <DesignCard isVisible={showDesignCard} />}
        {showUploadPhoto && <UploadPhoto />}
      </main>
      
      <CustomScrollbar />
      <SectionIndicator />
      <DynamicScrollButton />
      <BottomNavBar />
    </div>
  );
}

export default App;