import React, { useEffect } from 'react';
import ImageSequence from './components/ImageSequence';
import ScrollText from './components/ScrollText';
import Navbar from './components/Navbar';
import CustomScrollbar from './components/CustomScrollbar';
import SectionIndicator from './components/SectionIndicator';
import DynamicScrollButton from './components/DynamicScrollButton';
import BottomNavBar from './components/BottomNavBar'; // Import the BottomNavBar
import './App.css';

function App() {
  useEffect(() => {
    // Force scroll to top on component mount
    window.scrollTo(0, 0);
    
    // Prevent any default scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  return (
    <div className="app">
      <Navbar />
      <ImageSequence frameCount={220} imageFormat="jpg" />
      <ScrollText />
      <CustomScrollbar />
      <SectionIndicator />
      <DynamicScrollButton />
      <BottomNavBar /> {/* Add the BottomNavBar here */}
    </div>
  );
}

export default App;