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

      <div id="content-section" className="content-section">
        <section className="content-block">
          <h2>Sign Up!</h2>
          <h3>Discover the features we have to offer</h3>
          <div className="features-container">
            <div className="feature-card">
              <div className="feature-image feature-one"></div>
              <div className="feature-text">
                <p>Interested in learning about facial features?</p>
                <button className="btn feature-button">Get Started</button>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-image feature-two"></div>
              <div className="feature-text">
                <p>Looking For Modelling Opportunities?</p>
                <button className="btn feature-button">Get Started</button>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-image feature-three"></div>
              <div className="feature-text">
                <p>Find Your Style...</p>
                <button className="btn feature-button">Get Started</button>
              </div>
            </div>
          </div>
        </section>

        <section className="content-block fun-facts">
          <h2>Fun Facts</h2>
          <div className="fun-facts-container">    
            <div className="fun-fact-box">
              <h3>Fun Fact!</h3>
              <p>According to research, the average male jaw angle is 124° ± 6° and the average female jaw angle is 122° ± 4°.</p>
            </div>
            <div className="fun-fact-box">
              <h3>The eyes are the gateway to the soul</h3>
              <p>The width of the eye can be used as a measurement to vertically divide the face into equal five parts called the “vertical fifths.”</p>
            </div>
            <div className="fun-fact-box">
              <h3>Did you know?</h3>
              <p>Studies have shown that the positioning of teeth can influence the appearance and shape of the lips due to the interrelated nature of facial structures.</p>
            </div>
          </div>
          <p className="fun-fact-note">Click on the head for more info</p>
        </section>

        <section className="content-block beauty-chat">
          <h2>Looking for a place</h2>
          <h2>to talk about <span className="beauty-text">beauty</span>?</h2>
            <p>Talk with industry experts and other like-minded people</p>
              <button className="btn start-chatting">Start Chatting</button>
      </section>

      </div>
    </div>
  );
}

export default HomePage;
