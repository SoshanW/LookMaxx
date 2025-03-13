import React from 'react'
import ScrollAnimation from './components/ScrollAnimation'
import Navbar from './components/Navbar'
import TeamSlider from './components/TeamSlider' // Import the new TeamSlider component
import './App.css'
import './styles/ScrollAnimation.css'
import ModelSection from './components/ModelSection'

function App() {
  return (
    <div className="app">
      <Navbar />
      <ScrollAnimation frameCount={40} imageFormat="jpg" />
      <ModelSection />
      <TeamSlider /> 
    </div>
  )
}

export default App