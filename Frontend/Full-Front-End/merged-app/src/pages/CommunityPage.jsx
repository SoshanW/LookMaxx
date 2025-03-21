import React, { useEffect } from 'react';
import HeroSection from '../components/community/HeroSection';
import FeaturedSection from '../components/community/FeaturedSection';
import ActivitySection from '../components/community/ActivitySection';
import CommunityPostsSection from '../components/community/CommunityPostsSection';
import Footer from '../components/common/Footer';

const CommunityPage = () => {
  // Handle page-specific setup on mount
  useEffect(() => {
    // Apply specific body class for community page
    document.body.classList.add('community-page');
    
    // Scroll to top on page load
    window.scrollTo(0, 0);
    
    // Setup page-specific behavior
    document.body.style.overflow = 'auto';
    
    // Cleanup function to remove class when unmounting
    return () => {
      document.body.classList.remove('community-page');
    };
  }, []);

  return (
    <div className="community-page-container">
      <main>
        <HeroSection />
        <CommunityPostsSection />
        <FeaturedSection />
        <ActivitySection />
      </main>
    </div>
  );
};

export default CommunityPage;