import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate
} from "react-router-dom";

import { AuthStatusProvider } from "./AuthStatusContext";

import "./Main.css";
import "./Transfersystem.css";

import RootGate from "./RootGate";
// import Home from "./Home";
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
import Trade from "./Trade";
import Order from "./Order";
import BattlePass from "./BattlePass";
import About from "./About";
import Emblem from "./Emblem";
import Ads from "./ads";
import Prime from "./Prime";
import PromoCode from "./PromoCode";
import SendCheck from "./SendCheck";
import RequireAuth from "./RequireAuth";
import TradeCoin from "./TradeCoin";
import Swap from "./Swap";
import RequireAdmin from "./RequireAdmin";
import AdminPanel from "./AdminPanel";
import LoadingGate from "./LoadingGate";
import Savings from "./Savings";
import Services from "./Services";
import BottomNav from "./BottomNav";

import PageTransition from "./PageTransition";

const islandRoutes = [
  { path: "send", element: <Send /> },
  { path: "homelend", element: <HomeLend /> }, //NOT
  { path: "buy", element: <Buy /> },
  { path: "get", element: <Get /> },
  { path: "setting", element: <Setting /> }, //NOT
  { path: "history", element: <History /> },
  { path: "state", element: <State /> },
  { path: "bonus", element: <Bonus /> },
  { path: "referral", element: <Referral /> },
  { path: "card", element: <Card /> },
  { path: "trade", element: <Trade /> },
  { path: "order", element: <Order /> },
  { path: "battlepass", element: <BattlePass /> },
  { path: "emblem", element: <Emblem /> },
  { path: "about", element: <About /> },
  { path: "ads", element: <Ads /> },
  { path: "prime", element: <Prime /> },
  { path: "promocode", element: <PromoCode /> },
  { path: "sendcheck", element: <SendCheck /> },
  { path: "tradecoin", element: <TradeCoin /> },
  { path: "swap", element: <Swap /> },
  { path: "savings", element: <Savings /> },
];

const NavigationBar = () => {
  return <nav></nav>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <RootGate />
            <LoadingGate>
              <Outlet />
            </LoadingGate>
          </>
        }
      >
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

      <Route path="/services" element={<RequireAuth><Services /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><Setting /></RequireAuth>} />

      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/admin" element={<RequireAuth><RequireAdmin><AdminPanel /></RequireAdmin></RequireAuth>} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthStatusProvider>
        <NavigationBar />
        <AppRoutes />
        <BottomNav />
      </AuthStatusProvider>
    </BrowserRouter>
  );
};

export default App;