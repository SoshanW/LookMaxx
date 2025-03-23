import React, { useEffect } from 'react';
import ProfileSection from '../components/profile/ProfileSection';
import '../styles/profile/profile-page.css';

function ProfilePage() {
  useEffect(() => {
    // Apply profile-specific class to body
    document.body.classList.add('profile-page');
    
    // Ensure proper scrolling
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflowY = 'auto';
    
    return () => {
      // Clean up when component unmounts
      document.body.classList.remove('profile-page');
    };
  }, []);

  return <ProfileSection />;
}

export default ProfilePage;