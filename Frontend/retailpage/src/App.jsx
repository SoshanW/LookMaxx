import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Retailpage from "./components/retail";
import Navbar from "./components/Navbar";



function App() {
  return (
    <Router>
      <Navbar/>
      <Routes>
      <Route path="/" element={<Retailpage />} />
      <Route path="/retail" element={<Retailpage />} />
      </Routes>
    </Router>
  );
}

export default App;