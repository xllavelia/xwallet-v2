import React, { useEffect, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigationType,
} from "react-router-dom";

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
import BattlePass from "./BattlePass";

import PageTransition from "./PageTransition";

const routes = [
  { path: "/", element: <Home /> },
  { path: "/send", element: <Send /> },
  { path: "/buy", element: <Buy /> },
  { path: "/get", element: <Get /> },
  { path: "/setting", element: <Setting /> },
  { path: "/history", element: <History /> },
  { path: "/state", element: <State /> },
  { path: "/bonus", element: <Bonus /> },
  { path: "/referral", element: <Referral /> },
  { path: "/card", element: <Card /> },
  { path: "/card2", element: <Card2 /> },
  { path: "/trade", element: <Trade /> },
  { path: "/order", element: <Order /> },
  { path: "/battlepass", element: <BattlePass /> },
];

const NavigationBar = () => {
  return <nav></nav>;
};

const AppRoutes = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  const previousLocation = useRef(location);

  const isOpening =
    navigationType === "PUSH" &&
    previousLocation.current.key !== location.key && location.pathname !== "/";

  const backgroundLocation = previousLocation.current;

  useEffect(() => {
    previousLocation.current = location;
  }, [location]);

  return (
    <>
      <Routes location={isOpening ? backgroundLocation : location}>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
          />
        ))}
      </Routes>

<Routes>
</Routes>
      {isOpening && (
        <PageTransition>
          <Routes location={location}>
            {routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Routes>
        </PageTransition>
      )}
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <NavigationBar />
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
