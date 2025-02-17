// App.jsx
import React from 'react';
import ImageSequence from './components/ImageSequence';
import ScrollText from './components/ScrollText';
import Navbar from './components/Navbar'; // Import the Navbar
import './App.css';

function App() {
  return (
    <div className="app">
      <Navbar /> 
      <ImageSequence frameCount={220} imageFormat="jpg" />
      <ScrollText />
    </div>
  );
}

export default App;