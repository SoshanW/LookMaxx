import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './components/signup/Signup'; 
import FaceModelPage from './components/signup/FaceModelPage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Make SignUp the default landing page */}
        <Route path="/" element={<SignUp />} />
        
       
        <Route path="/signup" element={<SignUp />} /> 
        
        {/* Face model page route */}
        <Route path="/face-model" element={<FaceModelPage />} />
        
        {/* Redirect any unknown routes to signup */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;