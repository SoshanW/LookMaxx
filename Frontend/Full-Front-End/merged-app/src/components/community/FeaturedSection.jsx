import React from 'react';
import '../../styles/community/FeaturedSection.css';

const FeaturedSection = () => {
  const featuredItems = [
    { 
      id: 1, 
      title: "Facial Aesthetics", 
      members: "2.4k members", 
      active: "150 online",
      image: "/assets/community/community-images/facial-aesthetics.png"
    },
    { 
      id: 2, 
      title: "Beauty Experts", 
      members: "1.8k members", 
      active: "95 online",
      image: "/assets/community//community-images/beauty-experts.png" 
    },
    { 
      id: 3, 
      title: "LookSci experience", 
      members: "3.2k members", 
      active: "210 online",
      image: "/assets/community//community-images/looksci-experience.png" 
    }
  ];

  // Handle image loading errors by falling back to a default image
  const handleImageError = (e) => {
    console.log(`Failed to load image: ${e.target.src}`);
    e.target.src = '/community-images/default-community.jpg';
  };

  return (
    <section className="featured-section">
      <div className="section-header">
        <h2>Featured Communities</h2>
        <button className="view-all">View All</button>
      </div>
      
      <div className="featured-grid">
        {featuredItems.map(item => (
          <div className="featured-card" key={item.id}>
            <div className="card-visual">
              <img 
                src={item.image} 
                alt={item.title} 
                onError={handleImageError} 
              />
            </div>
            <div className="card-content">
              <h3>{item.title}</h3>
              <div className="card-stats">
                <span>{item.members}</span>
                <span className="active-now">{item.active}</span>
              </div>
              <button className="join-button">Join</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedSection;