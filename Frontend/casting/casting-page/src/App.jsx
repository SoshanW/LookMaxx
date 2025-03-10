import React from "react";
import { Routes, Route } from "react-router-dom";
import CastingPage from "./components/CastingPage";
import CastingApplicationForm from "./components/CastingApplicationForm";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import './App.css';

function App() {
  return (
    <>
      
      <Navbar />
      <Routes>
        <Route path="/" element={<CastingPage />} />
        <Route path="/apply" element={<CastingApplicationForm />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;