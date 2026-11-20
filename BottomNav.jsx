import React from "react";
import { useLocation } from "react-router-dom";
import { useAuthStatus } from "./AuthStatusContext";

// Вкладки пока отключены: оставляем пустой контейнер, чтобы раскладка экранов не менялась.
var TAB_ROUTES = ["/", "/services", "/profile"];

function BottomNav() {
  var location = useLocation();
  var { status } = useAuthStatus();

  if (TAB_ROUTES.indexOf(location.pathname) === -1 || status !== "authed") {
    return null;
  }

  return <nav className="bnav-wrap" />;
}

export default BottomNav;
