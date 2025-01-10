import React from 'react';

function Header() {
  return (
    <header
      className="d-flex align-items-center w-100 px-4 py-3"
      style={{ backgroundColor: '#e6e6f7' }}
    >
      {/* Logo Section */}
      <div
        className="logo"
        style={{
          fontSize: '2rem', // Adjust this for larger text
          fontWeight: 'bold',
          color: '#5d65b3',
          marginLeft: '30px',
        }}
      >
        <span>Look</span><span style={{ color: '#000' }}>Maxx</span>
        <p style={{ fontSize: '1rem', marginTop: '-5px', color: '#5d65b3' }}>Beauty Redefined</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-grow-1">
      <ul
        className="list-unstyled d-flex justify-content-evenly align-items-center mb-0"
        style={{ margin: '0 20px' }}
      >
        <li>
          <a href="#home" className="text-dark text-decoration-none" style={{ fontSize: '1.5rem' }}>Home</a>
        </li>
        <li>
          <a href="#retail" className="text-dark text-decoration-none" style={{ fontSize: '1.5rem' }}>Retail</a>
        </li>
        <li>
          <a href="#community" className="text-dark text-decoration-none" style={{ fontSize: '1.5rem' }}>Community</a>
        </li>
        <li>
          <a href="#study" className="text-dark text-decoration-none" style={{ fontSize: '1.5rem' }}>Study</a>
        </li>
        <li>
          <a href="#about" className="text-dark text-decoration-none" style={{ fontSize: '1.5rem' }}>About</a>
        </li>
        <li>
          <a href="#ffr" className="text-dark text-decoration-none" style={{ fontSize: '1.5rem' }}>FFR</a>
        </li>
      </ul>
      </nav>

      {/* Search Bar */}
      <div style={{ marginRight: '30px' }}>
        <input
          type="search"
          className="form-control form-control-sm"
          placeholder="Search"
          style={{ width: '250px' }}
        />
      </div>
    </header>
  );
}

export default Header;
