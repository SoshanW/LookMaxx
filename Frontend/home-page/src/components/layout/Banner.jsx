import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Banner() {
  const [isHidden, setIsHidden] = useState(true);

  return (
    <>
      <section className="banner">
        <div className="banner-content">
          <h1 className="banner-title">Welcome to LookMaxx</h1>
          <div className="banner-buttons">
            <button className="btn btn-primary">Discover</button>
            <button className="btn btn-outline">Get Started</button>
          </div>
          <button
            onClick={() => setIsHidden(!isHidden)}
            className="banner-arrow"
          >
            <ChevronDown size={32} color="var(--primary-color)" />
            <ChevronDown 
              size={32} 
              color="var(--primary-color)" 
              style={{ marginTop: '-16px' }}
            />
          </button>
        </div>
      </section>

      <section className={`hidden-section ${!isHidden ? 'visible' : ''}`}>
        <h2 style={{ 
          fontSize: '1.875rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          Hidden Content Section
        </h2>
      </section>
    </>
  );
}