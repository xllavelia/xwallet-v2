import React from "react";
import { Navigate } from "react-router-dom";

var SESSION_KEY = "xw_session";
var TOKEN_KEY = "xw_token";

function RequireAuth(props) {
  var hasSession = localStorage.getItem(SESSION_KEY) === "1";
  var hasToken = !!localStorage.getItem(TOKEN_KEY);

  if (!hasSession || !hasToken) {
    return <Navigate to="/" replace />;
  }
  return props.children;
}

export default RequireAuth;