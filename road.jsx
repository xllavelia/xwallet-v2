import React from "react";
import { BrowserRouter, Routes, Route} from "react-router-dom";
import "./Main.css";
import "./Transfersystem.css";
import Home from "./Home";
import Send from "./Send";
import Buy from "./Buy";
import Get from "./Get";
import Setting from "./Setting";
import History from "./History";
import State from "./State";
import Bonus from "./Bonus";
import Referral from "./Referral";
import Card from "./Card";
import Card2 from "./Card2";
import Trade from "./Trade";
import Order from "./Order";

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
         <Route path="/send" element={<Send />} />
         <Route path="/buy" element={<Buy />} />
         <Route path="/get" element={<Get />} />
         <Route path="/setting" element={<Setting />} />
         <Route path="/history" element={<History />} />
         <Route path="/state" element={<State />} />
         <Route path="/bonus" element={<Bonus />} />
         <Route path="/referral" element={<Referral />} />
         <Route path="/card" element={<Card />} />
         <Route path="/card2" element={<Card2 />} />
         <Route path="/trade" element={<Trade />} />
         <Route path="/order" element={<Order />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;