import React from "react";
import { BrowserRouter, Routes, Route} from "react-router-dom";
import "./Main.css";
import Home from "./Home";
// import About from "./About";
import Send from "./Send";
import Buy from "./Buy";
import Get from "./Get";


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
         <Route path="/buy" element={<Buy />} />
         <Route path="/get" element={<Get />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;