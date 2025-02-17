import React from 'react';
import ImageSequence from './components/ImageSequence';
import ScrollText from './components/ScrollText';
import Navbar from './components/Navbar';
import CustomScrollbar from './components/CustomScrollbar';
import SectionIndicator from './components/SectionIndicator';
import './App.css';

function App() {
  return (
    <div className="app">
      <Navbar />
      <ImageSequence frameCount={220} imageFormat="jpg" />
      <ScrollText />
      <CustomScrollbar />
      <SectionIndicator />
    </div>
  );
}

export default App;