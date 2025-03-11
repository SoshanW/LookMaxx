import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './components/Signup.jsx'; 
import FaceModelPage from './components/FaceModelPage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Make SignUp the default landing page */}
        <Route path="/" element={<SignUp />} />
        
        {/* Keep the named route as well for explicit navigation */}
        <Route path="/signup" element={<SignUp />} /> {/* Fix this to use SignUp, not SignupPage */}
        
        {/* Face model page route */}
        <Route path="/face-model" element={<FaceModelPage />} />
        
        {/* Redirect any unknown routes to signup */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;