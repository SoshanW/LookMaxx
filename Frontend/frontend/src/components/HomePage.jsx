import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import '../styles.css'; // Import the separate CSS file
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome CSS
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Import Material Icon


function HomePage() {
  return (
    <div className="page-container">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-text">
          <h1 className="hero-title">
            Welcome To <span className="highlight">Look</span>
            <span className="white-text">Maxx</span>
          </h1>
          <div className="button-container">
            <button className="btn custom-button">Discover</button>
            <Link to="/signup" className="btn custom-button-dark">Get Started</Link>
          </div>
        </div>
        <div className="scroll-down">
          <ExpandMoreIcon style={{ fontSize: '5rem', color:'white'}} /> {/* Material Icon */} 
        </div>
      </div>

      {/* Scrollable Content Section */}
      <div id="content-section" className="content-section">
        <section id="home" className="content-block">
          <h2>Home</h2>
          <p>Explore the LookMaxx experience, connecting you to beauty and modeling opportunities.</p>
        </section>
        <section id="retail" className="content-block">
          <h2>Retail</h2>
          <p>Find the latest fashion trends tailored for you and try them on your avatar.</p>
        </section>
        <section id="community" className="content-block">
          <h2>Community</h2>
          <p>Join a community of like-minded individuals passionate about beauty and modeling.</p>
        </section>
        <section id="study" className="content-block">
          <h2>Study</h2>
          <p>Learn about beauty science, facial feature recognition, and the latest research.</p>
        </section>
        <section id="about" className="content-block">
          <h2>About</h2>
          <p>Discover the vision and mission behind LookMaxx and how we aim to revolutionize beauty.</p>
        </section>
        <section id="ffr" className="content-block">
          <h2>Facial Feature Recognition (FFR)</h2>
          <p>Explore how AI-driven facial feature recognition helps analyze beauty scientifically.</p>
        </section>
      </div>
    </div>
  );
}

export default HomePage;
