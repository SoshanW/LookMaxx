import React from "react";
 import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
 import Profile from "./components/profile";
 
 function App() {
   return (
     <Router>
       <Routes>
         <Route path="/" element={<Profile />} />
         <Route path="/profile" element={<Profile />} />
       </Routes>
     </Router>
   );
 }
 
 export default App;
