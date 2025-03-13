import React from 'react'
import ScrollAnimation from './components/ScrollAnimation'
import Navbar from './components/Navbar'
import TeamSlider from './components/TeamSlider' // Import the new TeamSlider component
import './App.css'
import './styles/ScrollAnimation.css'

function App() {
  return (
    <div className="app">
      <Navbar />
      <ScrollAnimation frameCount={40} imageFormat="jpg" />
      <TeamSlider /> {/* Add the TeamSlider component here */}
    </div>
  )
}

export default App