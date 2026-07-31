import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate
} from "react-router-dom";

import "./Main.css";
import "./Transfersystem.css";

import RootGate from "./RootGate";
import Home from "./Home";
import HomeLend from "./HomeLend";
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
import About from "./About";
import Emblem from "./Emblem";
// DENGER FILE ADS. regstr
import Ads from "./ads";
import Prime from "./Prime";
import PromoCode from "./PromoCode";
import SendCheck  from "./SendCheck";
import RequireAuth from "./RequireAuth";

import PageTransition from "./PageTransition";

// Оставляем в массиве только острова (без "/")
const islandRoutes = [
  { path: "send", element: <Send /> },
  { path: "homelend", element: <HomeLend /> },
  { path: "buy", element: <Buy /> },
  { path: "get", element: <Get /> },
  { path: "setting", element: <Setting /> },
  { path: "history", element: <History /> },
  { path: "state", element: <State /> },
  { path: "bonus", element: <Bonus /> },
  { path: "referral", element: <Referral /> },
  { path: "card", element: <Card /> },
  { path: "card2", element: <Card2 /> },
  { path: "trade", element: <Trade /> },
  { path: "order", element: <Order /> },
  { path: "battlepass", element: <BattlePass /> },
  { path: "emblem", element: <Emblem /> },
  { path: "about", element: <About /> },
  { path: "ads", element: <Ads /> },
  { path: "prime", element: <Prime /> },
  { path: "promocode", element: <PromoCode /> },
  { path: "sendcheck", element: <SendCheck /> },



];

const NavigationBar = () => {
  return <nav></nav>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* 
        Главный роут ("/").
        Компонент <Home /> рендерится один раз и навсегда остается в DOM.
        Компонент <Outlet /> работает как портал: роутер будет монтировать 
        острова прямо в него, не трогая фон.
      */}
      <Route
        path="/"
        element={
          <>
            <RootGate />
            <Outlet />
          </>
        }
      >
        {/* Все острова становятся дочерними маршрутами */}
        {islandRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <RequireAuth>
              <PageTransition>
                {route.element}
              </PageTransition>
              </RequireAuth>
            }
          />
        ))}
      </Route>

      {/* Fallback для неизвестных путей */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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


