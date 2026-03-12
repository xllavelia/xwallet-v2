import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./Main.css";
import Home from "./Home";
import About from "./About";
import Crypto from "./Crypto";

const NavigationBar = () => {
  return (
    <nav>
      {/* <Link to="/" className="Karta-home-link-home">Home</Link> */}
{/*      
      <Link to="/about" className="Karta-home-link-about">About
      <br />
      x
      <br />
      x
      </Link> */}
    </nav>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <NavigationBar />
      {console.log("app render")}
      <Routes>
        <Route  path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
         <Route path="/crypto" element={<Crypto />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;