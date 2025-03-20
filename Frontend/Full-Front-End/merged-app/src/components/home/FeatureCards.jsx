import { useEffect } from 'react';
import PropTypes from 'prop-types';
import gsap from 'gsap';
import '../../styles/home/FeatureCards.css';

const FeatureCards = ({ scrollProgress }) => {
  // Frame calculations
  // Total frames = 190 (from parent component)
  // We want to map scroll progress (0-1) to frame numbers
  
  useEffect(() => {
    // Calculate current frame based on scroll progress (0-1) * total frames (190)
    const currentFrame = Math.floor(scrollProgress * 190);
    
    // stays until frame 70 (30 frames of full visibility), disappears by frame 79
    const card1Opacity = calculateOpacity(currentFrame, 25, 40, 70, 79);
    
    // stays until frame 124 (30 frames of full visibility), disappears by frame 133
    const card2Opacity = calculateOpacity(currentFrame, 79, 94, 124, 133);
    
    // stays until frame 178 (30 frames of full visibility), disappears by frame 187
    const card3Opacity = calculateOpacity(currentFrame, 140, 150, 180, 190);
    
    // stays until frame 178 (30 frames of full visibility), disappears by frame 187
    const card4Opacity = calculateOpacity(currentFrame, 158, 168, 180, 190);
    
    // Apply opacity values with minimal GSAP calls for performance
    gsap.set(".feature-card-1", { autoAlpha: card1Opacity });
    gsap.set(".feature-card-2", { autoAlpha: card2Opacity });
    gsap.set(".feature-card-3", { autoAlpha: card3Opacity });
    gsap.set(".feature-card-4", { autoAlpha: card4Opacity });
    
    
  }, [scrollProgress]);
  
  // Helper function to calculate opacity based on current frame and transition points
  const calculateOpacity = (currentFrame, startAppear, fullyVisible, startDisappear, fullyGone) => {
    // Appearing phase
    if (currentFrame >= startAppear && currentFrame < fullyVisible) {
      // Linear interpolation from 0 to 1
      return (currentFrame - startAppear) / (fullyVisible - startAppear);
    }
    
    // Fully visible phase
    if (currentFrame >= fullyVisible && currentFrame < startDisappear) {
      return 1;
    }
    
    // Disappearing phase
    if (currentFrame >= startDisappear && currentFrame < fullyGone) {
      // Linear interpolation from 1 to 0
      return 1 - (currentFrame - startDisappear) / (fullyGone - startDisappear);
    }
    
    // Not visible
    return 0;
  };

  return (
    <>
      {/* Feature cards that appear during scroll */}
      <div className="feature-card feature-card-1">
        <div className="card-content">
          <h2>Interested about facial aesthetics?</h2>
          <p>Let's dive into the actual science behind your looks!</p>
          <button className="card-button">GET STARTED</button>
        </div>
      </div>
      
      <div className="feature-card feature-card-2">
        <div className="card-content">
          <h2>Looking for Modelling opportunities?</h2>
          <p>Feel like you have the potential? This is the right place!</p>
          <button className="card-button">GET STARTED</button>
        </div>
      </div>
      
      <div className="feature-card feature-card-3">
        <div className="card-content">
          <h2>Find your Style</h2>
          <p>Discover the latest fashion trends tailored for you </p>
          <button className="card-button">Learn More</button>
        </div>
      </div>
      
      <div className="feature-card feature-card-4">
        <div className="card-content">
          <h2>Join our community</h2>
          <p>Connect with like-minded individuals and share your experiences</p>
          <button className="card-button">Join</button>
        </div>
      </div>
    </>
  );
};

FeatureCards.propTypes = {
  scrollProgress: PropTypes.number.isRequired
};

export default FeatureCards;