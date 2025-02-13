import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CastingPage from "./CastingPage";
import Header from "./Header";
import Footer from "./Footer"; // Import Footer component

function App() {
  return (
    <>
      <Header />
      <CastingPage />
      <Footer />
    </>
  );
}

export default App;
