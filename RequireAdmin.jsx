import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { authFetch } from "./apiClient";

function RequireAdmin(props) {
  var [status, setStatus] = useState("checking");

  useEffect(function () {
    authFetch("/auth/me")
      .then(function (data) { setStatus(data.isAdmin ? "allowed" : "denied"); })
      .catch(function () { setStatus("denied"); });
  }, []);

  if (status === "checking") return <div style={{ background: "#0a0a0a", minHeight: "100vh" }}></div>;
  if (status === "denied") return <Navigate to="/" replace />;
  return props.children;
}

export default RequireAdmin;