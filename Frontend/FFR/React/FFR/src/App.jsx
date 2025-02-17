import React from 'react';
import ImageSequence from './components/ImageSequence';
import ScrollText from './components/ScrollText';
import './App.css';

function App() {
  return (
    <div className="app">
      {/* <ScrollText /> */}
      <ImageSequence frameCount={220} imageFormat="jpg" />
    </div>
  );
}

export default App;