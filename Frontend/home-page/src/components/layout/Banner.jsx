// src/components/layout/Banner.jsx
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useCallback } from 'react';

export default function Banner() {
  const [isHidden, setIsHidden] = useState(false);

  const toggleView = useCallback(() => {
    setIsHidden(prev => !prev);
  }, []);

  return (
    <div className="banner-wrapper">
      <section className={`banner ${isHidden ? 'slide-up' : ''}`}>
        <div className="banner-content">
          <h1 className="banner-title">
            Welcome to LookMaxx
          </h1>
          <div className="banner-buttons">
            <button className="btn btn-primary">
              Discover
            </button>
            <button className="btn btn-outline">
              Get Started
            </button>
          </div>
          <button
            onClick={toggleView}
            className="arrow-wrapper bounce"
            aria-label="View content"
          >
            <ChevronDown size={32} color="var(--primary-color)" />
            <ChevronDown 
              size={32} 
              color="var(--primary-color)" 
              style={{ marginTop: '-8px' }}
            />
          </button>
        </div>
      </section>

      <section className={`hidden-section ${isHidden ? 'slide-up' : ''}`}>
        <div className="arrow-up-container">
          <button
            onClick={toggleView}
            className="arrow-wrapper bounce"
            aria-label="Return to banner"
          >
            <ChevronUp size={32} color="var(--primary-color)" />
            <ChevronUp 
              size={32} 
              color="var(--primary-color)" 
              style={{ marginTop: '-8px' }}
            />
          </button>
        </div>
        <h2 style={{
          fontSize: '1.875rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginTop: '6rem'
        }}>
          Hidden Content Section
        </h2>
        {/* Add your hidden content here */}
      </section>
    </div>
  );
}