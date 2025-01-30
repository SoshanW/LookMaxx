import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import '../styles.css'; // Import the CSS file

function HomePage() {
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* the Header */}
      <Header />

      {/* Hero Section */}
      <div
        className="hero-section d-flex flex-column justify-content-center align-items-center text-center"
        style={{
          backgroundImage: `url('/public/images/hero.jpeg')`, // Replace with your image path
          backgroundSize: 'cover', // Ensures the image covers the entire section
          backgroundPosition: 'center', // Centers the image
          backgroundRepeat: 'no-repeat', // Prevents tiling
          color: '#000',
          height: '100vh',
          padding: '2rem',
        }}
      >
        <div className="hero-text mt-5">
          <h1
            className="display-1 fw-bold animate-text" // Add the animation class
            style={{
              color: '#ffffff',
              textShadow: '10px 10px 10px rgba(144, 144, 144, 0.7)',
              fontSize: '5rem',
            }}
          >
            Welcome To <span style={{ color: '#5d65b3' }}>Look</span>
            <span style={{ color: '#ffffff' }}>Maxx</span>
          </h1>
          <div className="d-flex justify-content-center gap-4 mt-4">
            <button className="btn custom-button">
              Discover
            </button>
            <Link to="/signup" className="btn custom-button-dark">
              Get Started
            </Link>
          </div>
        </div>
        <div className="scroll-down mt-5">
          <span className="fs-3">&#8595;</span>
        </div>
      </div>

      {/* Scrollable Content Section */}
      <div id="content-section" className="content-section" style={{ backgroundColor: '#f9f9f9', padding: '2rem' }}>
        <section id="home" className="py-5">
          <h2>Home</h2>
          <p>Explore the LookMaxx experience, connecting you to beauty and modeling opportunities.</p>
        </section>
        <section id="retail" className="py-5">
          <h2>Retail</h2>
          <p>Find the latest fashion trends tailored for you and try them on your avatar. </p>
        </section>
      </div>
    </div>
  );
}

export default HomePage;