import React from 'react'
import ScrollAnimation from './components/ScrollAnimation'
import Navbar from './components/Navbar';
import './App.css'
import './styles/ScrollAnimation.css';


function App() {
  return (
    <div className="app">
      <ScrollAnimation frameCount={40} imageFormat="jpg" />
      <Navbar />
    </div>
  )
}

export default App