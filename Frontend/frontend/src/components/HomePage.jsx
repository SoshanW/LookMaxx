import React from 'react';
import Header from './Header'; // Import the Header component

function HomePage() {
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* the Header */}
      <Header />

      {/* Hero Section */}
      <div
        className="hero-section d-flex flex-column justify-content-center align-items-center text-center"
        style={{
          backgroundColor: '#e6e6f7',
          color: '#000',
          height: '100vh',
          padding: '2rem',
        }}
      >
        <div className="hero-text mt-5">
          <h1 className="display-1 fw-bold">
            Welcome To <span style={{ color: '#5d65b3' }}>Look</span>
            <span style={{ color: '#000' }}>Maxx</span>
          </h1>
          <div className="d-flex justify-content-center gap-3 mt-4">
            <button
              className="btn btn-primary btn-lg"
              style={{ backgroundColor: '#5d65b3', borderColor: '#858bcb' }}
            >
              Discover
            </button>
            <button className="btn btn-dark btn-lg">Get Started</button>
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
        <section id="community" className="py-5">
          <h2>Community</h2>
          <p>Join our vibrant community and share your journey to self-discovery.</p>
        </section>
        <section id="study" className="py-5">
          <h2>Study</h2>
          <p>Learn about scientific insights into beauty standards and self-awareness.</p>
        </section>
        <section id="about" className="py-5">
          <h2>About</h2>
          <p>Discover the mission and vision of LookMaxx.</p>
        </section>
        <section id="ffr" className="py-5">
          <h2>FFR</h2>
          <p>Explore our Facial Feature Recognition (FFR) technology to gain scientific insights for your appearance.</p>
        </section>
      </div>

      {/* Footer */}
      <footer className="text-center py-3 bg-dark text-white">
        <p>&copy; 2025 LookMaxx. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;
