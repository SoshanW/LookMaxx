import React from 'react';
import './App.css';
import { getCommunityData } from './api/community_api';
import HeroSection from './components/HeroSection';
import FeaturedSection from './components/FeaturedSection';
import ActivitySection from './components/ActivitySection';
import Footer from './components/Footer';
import CommunityPostsSection from './components/CommunityPostsSection';

function App() {
  useEffect(() => {
    // Test backend connection when component mounts
    getCommunityData()
      .then(data => console.log("Backend connected:", data))
      .catch(err => console.error("Connection error:", err));
  }, []);
  
  return (
    <div className="app">
      <main>
        <HeroSection />
        <CommunityPostsSection />
        <FeaturedSection />
        <ActivitySection />
        <Footer />
      </main>
    </div>
  );
}

export default App;