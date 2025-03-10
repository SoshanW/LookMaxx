import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CastingPage from "./components/CastingPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer"; // Import Footer component
import './App.css';

function App() {
  return (
    <>
      <Navbar />
      <CastingPage />
      <Footer />
    </>
  )
}

export default App;