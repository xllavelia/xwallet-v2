import React from "react";
import { BrowserRouter, Routes, Route} from "react-router-dom";
import "./Main.css";
import Home from "./Home";
// import About from "./About";
import Send from "./Send";

const NavigationBar = () => {
  return (
    <nav>
    </nav>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <NavigationBar />
      <Routes>
        <Route  path="/" element={<Home />} />
        {/* <Route path="/about" element={<About />} /> */}
         <Route path="/send" element={<Send />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;