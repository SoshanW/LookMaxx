import React from "react";
 import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
 import Retailpage from "./components/retail";
 import Header from "./components/Navbar";
 
 
 function App() {
   return (
     <Router>
       <Header />
       <Routes>
         <Route path="/retail" element={<Retailpage />} />
         {/* Add other routes here */}
       </Routes>
     </Router>
   );
 }
 
 export default App;